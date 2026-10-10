const mongoose = require("mongoose");

const attachmentSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
      trim: true,
    },
    format: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    resourceType: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

// AI Summary
const aiSummarySchema = new mongoose.Schema(
  {
    summary: {
      type: String,
      required: true,
    },
    keyPoints: [
      {
        type: String,
      },
    ],
    quickRevision: [
      {
        type: String,
      },
    ],
    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Individual AI quiz question
const aiQuizQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },

    options: [
      {
        type: String,
      },
    ],

    correctOption: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },

    explanation: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

// Saved AI Quiz
const aiQuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    questions: [aiQuizQuestionSchema],

    generatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const ragChunkSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },

    embedding: [
      {
        type: Number,
      },
    ],
  },
  { _id: false }
);


const attachmentRagChunkSchema =
  new mongoose.Schema(
    {
      text: {
        type: String,
        required: true,
      },

      embedding: [
        {
          type: Number,
        },
      ],
    },
    { _id: false }
  );


const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    content: {
      type: String,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    attachment: {
      type: attachmentSchema,
      default: null,
    },

    // Saved AI-generated summary
    aiSummary: {
      type: aiSummarySchema,
      default: null,
    },

    // Saved AI-generated quiz
    aiQuiz: {
      type: aiQuizSchema,
      default: null,
    },
    ragChunks: {
      type: [ragChunkSchema],
      default: [],
      select: false,
    },

    ragIndexedAt: {
      type: Date,
      default: null,
      select: false,
    },
    attachmentRagChunks: {
      type: [attachmentRagChunkSchema],
      default: [],
      select: false,
    },

    attachmentRagIndexedAt: {
      type: Date,
      default: null,
      select: false,
    },

    attachmentRagPublicId: {
      type: String,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);