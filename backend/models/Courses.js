const mongoose = require ('mongoose')

const attachmentSchema = new mongoose.Schema({
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
  originalName: {
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
const courseSchema = mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    courseCode:{
        type:String,
        required:true
    },
    semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
    },
    instructor:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    status: {
    type: String,
    enum: ["Active", "Completed"],
    default: "Active"
},

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    attachment: {
    type: attachmentSchema,
    default: null
  }
},{ timestamps: true })

module.exports= mongoose.model('Course',courseSchema)