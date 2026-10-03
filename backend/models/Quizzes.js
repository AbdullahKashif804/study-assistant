const mongoose = require('mongoose')

const quizSchema= mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true
    },
    dueDate:{
        type:Date
    },
    totalMark:{
        type:Number,
        required:true
    },
    obtainedMark:{
        type:Number
    },
    status:{
        type:String,
        enum:["Pending", "Submitted", "Graded"],
        default:"Pending"
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true})

module.exports=mongoose.model('Quiz',quizSchema)