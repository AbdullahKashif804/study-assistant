const jwt = require("jsonwebtoken")
const userModel=require("../models/Users")

const authMiddleware=async (req,res,next)=>{
    const authHeader=req.headers.authorization
    if(!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).json({
            success:false,
            message:"Unauthorized User"
        })
    }
    const token=authHeader.split(" ")[1]
    try{
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const user= await userModel.findById(decoded.id).select("-password")
        if(!user){
             return res.status(401).json({
        success: false,
        message: "User not found"
    });
        }
        const isDeletionRetry = req.method === "DELETE" &&
            req.baseUrl === "/api/user" && req.path === "/delete-account";
        if (user.accountDeletionPending && !isDeletionRetry) {
            return res.status(409).json({
                success: false,
                message: "Account deletion is pending. Retry permanent deletion in Settings."
            });
        }
        req.user=user;
        next()
    }catch(error){
    console.error(error);

    return res.status(401).json({
        success: false,
        message: "Unauthorized User"
    });
}
}

module.exports=authMiddleware
