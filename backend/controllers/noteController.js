const noteModel =
  require("../models/Notes.js");

const courseModel =
  require("../models/Courses");

const {
  uploadToCloudinary,
} = require(
  "../utils/cloudinaryUpload"
);

const {
  deleteFromCloudinary,
} = require(
  "../utils/cloudinaryDelete"
);

const addNote =
  async (req, res) => {
    try {
      const {
        title,
        content,
        course,
      } = req.body;

      if (
        !title ||
        !content
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Require the things",
          });
      }

      if (course) {
        const selectedCourse =
          await courseModel.findOne({
            _id: course,

            user:
              req.user._id,
          });

        if (
          !selectedCourse
        ) {
          return res
            .status(404)
            .json({
              success: false,

              message:
                "course not found or does not belong to you",
            });
        }
      }

      let attachmentData = null;

      if (req.file) {
        const cloudResult =
          await uploadToCloudinary(
            req.file.path,
            "notes_attachments"
          );

        if (cloudResult) {
          attachmentData = {
            url:
              cloudResult.secure_url,

            publicId:
              cloudResult.public_id,

            originalName:
              req.file
                .originalname,

            format:
              cloudResult.format ||
              req.file.originalname
                .split(".")
                .pop(),

            resourceType:
              cloudResult.resource_type,

            size:
              cloudResult.bytes ||
              req.file.size,
          };
        }
      }

      const notes =
        new noteModel({
          title,
          content,

          course:
            course || null,

          user:
            req.user._id,

          attachment:
            attachmentData,
        });

      const result =
        await notes.save();

      res
        .status(201)
        .json({
          success: true,

          message:
            "Note added successfully",

          data: result,
        });
    } catch (error) {
      res
        .status(500)
        .send({
          success: false,
          message:
            error.message,
        });
    }
  };

const getNote =
  async (req, res) => {
    try {
      const userId =
        req.user._id;

      const {
        search = "",
        course,
        sort = "newest",
        page = 1,
        limit = 10,
      } = req.query;

      const filter = {
        user: userId,
      };

      if (search.trim()) {
        filter.$or = [
          {
            title: {
              $regex:
                search.trim(),

              $options: "i",
            },
          },

          {
            content: {
              $regex:
                search.trim(),

              $options: "i",
            },
          },
        ];
      }

      if (course) {
        filter.course =
          course;
      }

      const sortOption = {};

      if (
        sort === "newest"
      ) {
        sortOption.createdAt =
          -1;
      } else if (
        sort === "oldest"
      ) {
        sortOption.createdAt =
          1;
      } else if (
        sort === "title"
      ) {
        sortOption.title = 1;
      }

      const pageNumber =
        Math.max(
          Number(page) || 1,
          1
        );

      const limitNumber =
        Math.min(
          Math.max(
            Number(limit) || 10,
            1
          ),
          50
        );

      const skip =
        (pageNumber - 1) *
        limitNumber;

      const totalItems =
        await noteModel
          .countDocuments(
            filter
          );

      const fetch =
        await noteModel
          .find(filter)
          .populate("course")
          .sort(sortOption)
          .skip(skip)
          .limit(
            limitNumber
          );

      const totalPages =
        Math.ceil(
          totalItems /
            limitNumber
        );

      res
        .status(200)
        .json({
          success: true,

          message:
            fetch.length === 0
              ? "No notes found"
              : "Notes fetched successfully",

          data: fetch,

          pagination: {
            currentPage:
              pageNumber,

            totalPages,

            totalItems,

            limit:
              limitNumber,
          },
        });
    } catch (error) {
      res
        .status(500)
        .send({
          success: false,
          message:
            error.message,
        });
    }
  };

const getoneNote =
  async (req, res) => {
    try {
      const note =
        await noteModel
          .findOne({
            _id:
              req.params.id,

            user:
              req.user._id,
          })
          .populate(
            "course"
          );

      if (!note) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "User has no note",
          });
      }

      res
        .status(200)
        .json({
          success: true,

          message:
            "Note fetched successfully",

          data: note,
        });
    } catch (error) {
      res
        .status(500)
        .send({
          success: false,
          message:
            error.message,
        });
    }
  };

const updateNote =
  async (req, res) => {
    try {
      const {
        title,
        content,
        course,
      } = req.body;

      if (
        !title ||
        !content
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Require the things",
          });
      }

      if (course) {
        const selectedCourse =
          await courseModel.findOne({
            _id: course,

            user:
              req.user._id,
          });

        if (
          !selectedCourse
        ) {
          return res
            .status(404)
            .json({
              success: false,

              message:
                "course not found or does not belong to you",
            });
        }
      }

      const note =
        await noteModel
          .findOne({
            _id:
              req.params.id,

            user:
              req.user._id,
          })
          .select(
            "+ragChunks " +
              "+ragIndexedAt " +
              "+attachmentRagChunks " +
              "+attachmentRagIndexedAt " +
              "+attachmentRagPublicId"
          );

      if (!note) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "not found",
          });
      }

      const noteContentChanged =
        note.title !== title ||
        note.content !==
          content;

      note.title = title;
      note.content =
        content;

      note.course =
        course || null;

      if (
        noteContentChanged
      ) {
        // Phase 1
        note.aiSummary =
          null;

        note.aiQuiz =
          null;

        // Phase 2
        note.ragChunks =
          [];

        note.ragIndexedAt =
          null;
      }

      if (req.file) {
        if (
          note.attachment &&
          note.attachment
            .publicId
        ) {
          await deleteFromCloudinary(
            note.attachment
              .publicId,

            note.attachment
              .resourceType
          );
        }

        const cloudResult =
          await uploadToCloudinary(
            req.file.path,
            "notes_attachments"
          );

        if (cloudResult) {
          const attachmentData =
            {
              url:
                cloudResult
                  .secure_url,

              publicId:
                cloudResult
                  .public_id,

              originalName:
                req.file
                  .originalname,

              format:
                cloudResult
                  .format ||
                req.file
                  .originalname
                  .split(".")
                  .pop(),

              resourceType:
                cloudResult
                  .resource_type,

              size:
                cloudResult
                  .bytes ||
                req.file.size,
            };

          note.attachment =
            attachmentData;

          // Phase 3:
          // file changed, therefore
          // old extracted text /
          // embeddings are stale.
          note.attachmentRagChunks =
            [];

          note.attachmentRagIndexedAt =
            null;

          note.attachmentRagPublicId =
            null;
        }
      }

      await note.save();

      await note.populate(
        "course"
      );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "note updated successfully",

          data: note,
        });
    } catch (error) {
      res
        .status(500)
        .send({
          success: false,
          message:
            error.message,
        });
    }
  };

const deleteNote =
  async (req, res) => {
    try {
      const note =
        await noteModel.findOne(
          {
            _id:
              req.params.id,

            user:
              req.user._id,
          }
        );

      if (!note) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Note not found",
          });
      }

      if (
        note.attachment &&
        note.attachment.publicId
      ) {
        await deleteFromCloudinary(
          note.attachment
            .publicId,

          note.attachment
            .resourceType
        );
      }

      await noteModel.deleteOne(
        {
          _id: note._id,
        }
      );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Note deleted successfully",
        });
    } catch (error) {
      return res
        .status(500)
        .send({
          success: false,
          message:
            error.message,
        });
    }
  };

module.exports = {
  addNote,
  getNote,
  getoneNote,
  updateNote,
  deleteNote,
};