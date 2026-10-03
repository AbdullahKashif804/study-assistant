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

const noteSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    content:{
        type:String,

    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    course:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        default:null
    },
    attachment: {
    type: attachmentSchema,
    default: null
  }
},{timestamps: true})



module.exports=mongoose.model('Note',noteSchema)