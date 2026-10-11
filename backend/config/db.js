const mongoose=require('mongoose')

const connectDB=async()=>{
    await mongoose.connect(process.env.MONGODB_URL, { serverSelectionTimeoutMS: 10000 })
    console.log("MongoDB connected")
}

module.exports=connectDB
