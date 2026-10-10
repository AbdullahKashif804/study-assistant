const mongoose=require('mongoose')

const connectDB=async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Mongoo DB connected")
    }catch(error){
        console.log("MongoDB Error:", error.message);

if (error.reason?.servers) {
    for (const [server, details] of error.reason.servers) {
        console.log("Server:", server);
        console.log("Error:", details.error?.message || "No detailed error");
    }
}
    }
}

module.exports=connectDB