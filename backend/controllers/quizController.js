const quizModel = require('../models/Quizzes')
const courseModel = require('../models/Courses')

const addQuiz = async (req, res) =>{
    try{

        const {title , course , dueDate , totalMark , obtainedMark} = req.body;
    if(!title ||!course || !dueDate || !totalMark){
        return res.status(400).json({
            success:false,
            message:"Fields are required"
        })
    }
    if(obtainedMark !==undefined && obtainedMark !== null){
                    if(obtainedMark < 0 || obtainedMark > totalMark){
                        return res.status(400).json({
                            success:false,
                            message: "Obtained marks cannot be less than 0 or greater than total marks"
                        })
                    }
                }
                const selectedCourse = await courseModel.findOne({
                    _id:course,
                    user: req.user._id
                })
                if(!selectedCourse){
                    return res.status(404).json({
                        success:false,
                        message:"course not found or does not belong to you"
                    })
                }
    const quiz = new quizModel({
            title,
            course,
            dueDate,
            totalMark,
            obtainedMark,
            user:req.user._id
        })
        const result = await quiz.save()
        return res.status(201).json({
            success:true,
            message:"Quiz added successfully",
            data:result
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const getQuiz = async (req,res) => {
    try{
        const userId = req.user._id;
        const {
            search = "",
            course,
            status,
            sort = "newest",
        }=req.query

        const filter = {
            user: userId
        }
        if(search.trim()){
            filter.$or = [
                {
                    title:{
                        $regex : search.trim(),
                        $options:'i'
                    },
                },
            ];
        }
        if(course){
            filter.course = course;
        }
        if (status) {
            if (status === "Completed") {
                filter.obtainedMark = { $ne: null };
            } else if (status === "Overdue") {
                filter.obtainedMark = null;
                filter.dueDate = { $lt: new Date() };
            } else if (status === "Upcoming") {
                filter.obtainedMark = null;
                filter.dueDate = { $gte: new Date() };
            }
        }
        
        const sortOption = {}
        if(sort == "newest"){
            sortOption.createdAt =-1
        }else if(sort == "oldest"){
            sortOption.createdAt = 1
        }else if(sort === "due-date"){
            sortOption.dueDate = 1
        }
        const fetch = await quizModel
        .find(filter)
        .populate('course')  
        .sort(sortOption)
        return res.status(200).json({
            success:true,
            message:"Quiz fetched successfully",
            data:fetch
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const getoneQuiz = async (req,res)=>{
    try{
        const quiz = await quizModel.findOne({
            _id:req.params.id,
            user:req.user._id
        }).populate('course');
        if(!quiz){
            return res.status(404).json({
                success:false,
                message:"Quiz not found"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Quiz fetched successfully",
            data:quiz
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const updateQuiz = async (req,res) => {
    try{
        const {title , course , dueDate , totalMark , obtainedMark} = req.body;
        if(!title ||!course || !dueDate || !totalMark){
        return res.status(400).json({
            success:false,
            message:"Fields are required"
        })
    }
    if(obtainedMark !==undefined && obtainedMark !== null){
                    if(obtainedMark < 0 || obtainedMark > totalMark){
                        return res.status(400).json({
                            success:false,
                            message: "Obtained marks cannot be less than 0 or greater than total marks"
                        })
                    }
                }
                const selectedCourse = await courseModel.findOne({
                    _id:course,
                    user: req.user._id
                })
                if(!selectedCourse){
                    return res.status(404).json({
                        success:false,
                        message:"course not found or does not belong to you"
                    })
                }
        const quiz = await quizModel.findOneAndUpdate({
            _id:req.params.id,
            user:req.user._id
        },
        {
            title,
            course,
            dueDate,
            totalMark,
            obtainedMark
        },
        { 
            returnDocument: "after",
            runValidators: true
        }
    )
    if(!quiz){
        return res.status(404).json({
            success:false,
            message:"QUiz not found"
        })
    }
    return res.status(200).json({
        success:true,
        message:"Quiz updated successfully",
        data:quiz
    })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const deleteQuiz = async (req,res) => {
    try{
        const quiz = await quizModel.findOneAndDelete({
            _id:req.params.id,
            user:req.user._id
        })
        if(!quiz){
            return res.status(404).json({
                success:false,
                message:"Quiz not found"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Quiz deleted successfully"
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
module.exports={
    addQuiz,
    getQuiz,
    getoneQuiz,
    updateQuiz,
    deleteQuiz
}