const bcrypt = require("bcrypt");
const userModel = require("../models/Users.js");

const noteModel = require("../models/Notes");
const assignmentModel = require("../models/Assignments");
const projectModel = require("../models/Projects");
const quizModel = require("../models/Quizzes");
const courseModel = require("../models/Courses");
const dailyTaskModel = require("../models/DailyTasks");
const todoTaskModel = require("../models/todoTask");

const jwt = require("jsonwebtoken");
const path = require("path");
const crypto = require("crypto");
const { uploadToCloudinary } = require("../utils/cloudinaryUpload");
const { deleteFromCloudinary } = require("../utils/cloudinaryDelete");
const pendingSignupModel = require("../models/PendingSignup");
const sendEmail = require("../utils/sendEmail");

function generateVerificationCode() {
  const randomValue = crypto.randomInt(0, 1000000);
  return String(randomValue).padStart(6, "0");
}

const SignUp = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      currentSemester,
      agreedToTerms,
    } = req.body;

    if (
      !first_name ||
      !last_name ||
      !email ||
      !password ||
      !currentSemester
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (!agreedToTerms) {
      return res.status(400).json({
        success: false,
        message:
          "You must agree to the Terms & Conditions and Privacy Policy",
      });
    }

    const existingUser = await userModel.findOne({
      email,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already has an account with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 6);

    const verificationCode = generateVerificationCode();

    const verificationCodeExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    const pendingSignup = new pendingSignupModel({
      first_name,
      last_name,
      email,
      password: hashedPassword,
      currentSemester,
      termsAcceptedAt: new Date(),
      verificationCode,
      verificationCodeExpiresAt,
    });

    await pendingSignup.save();

    await sendEmail(
      email,
      "Study Assistant Email Verification",
      `Your Study Assistant verification code is: ${verificationCode}

This code will expire in 10 minutes.

If you did not create an account, you can ignore this email.`
    );

    return res.status(201).json({
      success: true,
      message: "Verification code generated successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const VerifyEmail = async (req, res) => {
  try {
    const { email, verificationCode } = req.body;

    if (!email || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    const pendingSignup = await pendingSignupModel.findOne({
      email,
    });

    if (!pendingSignup) {
      return res.status(404).json({
        success: false,
        message: "No pending signup found for this email",
      });
    }

    if (pendingSignup.verificationCode !== verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code",
      });
    }

    if (new Date() > pendingSignup.verificationCodeExpiresAt) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired",
      });
    }

    const user = new userModel({
      first_name: pendingSignup.first_name,
      last_name: pendingSignup.last_name,
      email: pendingSignup.email,
      password: pendingSignup.password,
      currentSemester: pendingSignup.currentSemester,
      dateOfBirth: pendingSignup.dateOfBirth,
      university: pendingSignup.university,
      program: pendingSignup.program,
      bio: pendingSignup.bio,
      termsAcceptedAt: pendingSignup.termsAcceptedAt,
    });

    await user.save();

    await pendingSignupModel.deleteOne({
      _id: pendingSignup._id,
    });

    return res.status(201).json({
      success: true,
      message: "Email verified and account created successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const ResendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const pendingSignup = await pendingSignupModel.findOne({
      email,
    });

    if (!pendingSignup) {
      return res.status(404).json({
        success: false,
        message: "No pending signup found for this email",
      });
    }

    const verificationCode = generateVerificationCode();

    const verificationCodeExpiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    pendingSignup.verificationCode = verificationCode;
    pendingSignup.verificationCodeExpiresAt =
      verificationCodeExpiresAt;

    await pendingSignup.save();

    await sendEmail(
      email,
      "Study Assistant Email Verification",
      `Your new Study Assistant verification code is: ${verificationCode}

This code will expire in 10 minutes.

If you did not create an account, you can ignore this email.`
    );

    return res.status(200).json({
      success: true,
      message: "A new verification code has been sent to your email",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const SignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const user = await userModel.findOne({
      email,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const Matched = await bcrypt.compare(
      password,
      user.password
    );

    if (!Matched) {
      return res.status(400).json({
        success: false,
        message: "Password doesn't match",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "User logged in successfully",
      token,
      user: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        role: user.role,
        currentSemester: user.currentSemester,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await userModel
      .findById(req.user._id)
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      dateOfBirth,
      university,
      program,
      currentSemester,
      bio,
    } = req.body;

    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (first_name !== undefined) {
      user.first_name = first_name;
    }

    if (last_name !== undefined) {
      user.last_name = last_name;
    }

    if (dateOfBirth !== undefined) {
      user.dateOfBirth = dateOfBirth;
    }

    if (university !== undefined) {
      user.university = university;
    }

    if (program !== undefined) {
      user.program = program;
    }

    if (currentSemester !== undefined) {
      user.currentSemester = currentSemester;
    }

    if (bio !== undefined) {
      user.bio = bio;
    }

    if (req.file) {
      if (user.profileImage && user.profileImage.publicId) {
        await deleteFromCloudinary(
          user.profileImage.publicId,
          user.profileImage.resourceType || "image"
        );
      }

      const cloudinaryResult = await uploadToCloudinary(
        req.file.path,
        "profile_images"
      );

      user.profileImage = {
        url: cloudinaryResult.secure_url,
        publicId: cloudinaryResult.public_id,
        format:
          cloudinaryResult.format ||
          path.extname(req.file.originalname).replace(".", ""),
        resourceType:
          cloudinaryResult.resource_type || "image",
        size: cloudinaryResult.bytes || req.file.size,
      };
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        dateOfBirth: user.dateOfBirth,
        university: user.university,
        program: user.program,
        currentSemester: user.currentSemester,
        bio: user.bio,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const deleteProfileImage = async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.profileImage || !user.profileImage.publicId) {
      return res.status(400).json({
        success: false,
        message: "No profile image found",
      });
    }

    await deleteFromCloudinary(
      user.profileImage.publicId,
      user.profileImage.resourceType || "image"
    );

    user.profileImage = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile image deleted successfully",
      data: {
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const {
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match",
      });
    }

    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatched = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatched) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedPassword = await bcrypt.hash(
      newPassword,
      6
    );

    user.password = hashedPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const DeleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    const notes = await noteModel.find({
      user: userId,
    });

    for (const note of notes) {
      if (note.attachment?.publicId) {
        await deleteFromCloudinary(
          note.attachment.publicId,
          note.attachment.resourceType || "raw"
        );
      }
    }

    await noteModel.deleteMany({
      user: userId,
    });

    const assignments = await assignmentModel.find({
      user: userId,
    });

    for (const assignment of assignments) {
      if (assignment.attachment?.publicId) {
        await deleteFromCloudinary(
          assignment.attachment.publicId,
          assignment.attachment.resourceType || "raw"
        );
      }
    }

    await assignmentModel.deleteMany({
      user: userId,
    });

    const projects = await projectModel.find({
      user: userId,
    });

    for (const project of projects) {
      if (project.attachment?.publicId) {
        await deleteFromCloudinary(
          project.attachment.publicId,
          project.attachment.resourceType || "raw"
        );
      }
    }

    await projectModel.deleteMany({
      user: userId,
    });

    const courses = await courseModel.find({
      user: userId,
    });

    for (const course of courses) {
      if (course.attachment?.publicId) {
        await deleteFromCloudinary(
          course.attachment.publicId,
          course.attachment.resourceType || "raw"
        );
      }
    }

    await courseModel.deleteMany({
      user: userId,
    });

    const quizzes = await quizModel.find({
      user: userId,
    });

    for (const quiz of quizzes) {
      if (quiz.attachment?.publicId) {
        await deleteFromCloudinary(
          quiz.attachment.publicId,
          quiz.attachment.resourceType || "raw"
        );
      }
    }

    await quizModel.deleteMany({
      user: userId,
    });

    await dailyTaskModel.deleteMany({
      user: userId,
    });

    await todoTaskModel.deleteMany({
      user: userId,
    });

    const user = await userModel.findById(userId);

    if (user?.profileImage?.publicId) {
      await deleteFromCloudinary(
        user.profileImage.publicId,
        user.profileImage.resourceType || "image"
      );
    }

    await userModel.findByIdAndDelete(userId);

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  SignUp,
  VerifyEmail,
  SignIn,
  getProfile,
  updateProfile,
  deleteProfileImage,
  changePassword,
  DeleteAccount,
  ResendVerificationCode,
};

