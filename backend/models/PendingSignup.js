const mongoose = require("mongoose");
const PendingSignupSchema = new mongoose.Schema(
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
    verificationCode:{
        type:String,
        required:true

    },
    verificationCodeExpiresAt:{
        type:Date,
        required:true,
    }

  },
  {
    timestamps: true,
  }
)
module.exports = mongoose.model("PendingSignup", PendingSignupSchema);