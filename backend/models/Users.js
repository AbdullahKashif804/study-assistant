const mongoose = require("mongoose");


const profileImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    trim: true
  },
  publicId: {
    type: String,
    required: true,
    trim: true
  },
  format: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  resourceType: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  size: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },

    last_name: {
      type: String,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    currentSemester: {
      type: Number,
      required: true,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    university: {
      type: String,
      trim: true,
      default: "",
    },

    program: {
      type: String,
      trim: true,
      default: "",
    },

    bio: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    termsAcceptedAt: {
      type: Date,
      default: null,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    profileImage: {
    type: profileImageSchema,
    default: null
  }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);