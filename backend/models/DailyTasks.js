const mongoose= require('mongoose')

const dailyTaskSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    taskDate:{
        type:Date,
        required:true
    },
    priority:{
        type:String,
        enum:["High" , "Medium" , "Low"],
        default:"Medium"
    },
    status:{
        type:String,
        enum:["Pending" , "In Progress" , "Completed"],
        default:"Pending"
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
},{timestamps:true})

module.exports = mongoose.model("DailyTask",dailyTaskSchema)