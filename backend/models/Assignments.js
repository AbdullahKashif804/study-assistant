const mongoose = require('mongoose')

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
const assignmentSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:true,
    },
    dueDate:{
        type:Date,
    },
    status:{
        type:String,
        enum:["Pending","Completed","Submitted","Graded"],
        default:"Pending"
    },
    totalMark:{
        type:Number,
        required:true,  
    },
    obtainedMark:{
        type:Number,
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
},{timestamps:true})

module.exports=mongoose.model("Assignment",assignmentSchema)