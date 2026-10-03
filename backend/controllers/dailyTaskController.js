const dailyTaskModel = require('../models/DailyTasks')

const addDailyTask = async (req,res) => {
    try{
        const {title , description , taskDate , priority} = req.body;
        if(!title || !taskDate){
        return res.status(400).json({
            success:false,
            message:"All fields are required"
        })
    }
    const dailyTask = new dailyTaskModel({
        title,
        description,
        taskDate,
        priority,
        user:req.user._id
    })
    const result = await dailyTask.save()
        return res.status(201).json({
            success:true,
            message:"DailyTask added successfully",
            data:result
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const getDailyTask = async (req,res) => {
    try{
        const userId = req.user._id;
        const {
            search = "",
            priority,
            status,
            date,
            sort = "newest",
            page = 1,
            limit = 10,
        }=req.query;
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
                {
                    description: {
                        $regex: search.trim(),
                        $options: "i",
                    },
                },
            ];
        }
        if(priority){
            filter.priority = priority;
        }
        if(status){
            filter.status = status;
        }
        if (date) {
            const startDate = new Date(date);
            const endDate = new Date(date);
            endDate.setDate(endDate.getDate() + 1);
            filter.taskDate = {
                $gte: startDate,
                $lt: endDate,
            };
        }
        const sortOption = {}
        if(sort ==="newest"){
            sortOption.createdAt =-1
        }else if(sort === "oldest"){
            sortOption.createdAt = 1
        }else if (sort === "date") {
            sortOption.taskDate = 1;
        }
        const pageNumber = Math.max(Number(page) || 1, 1);
        const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 50);
        const skip = (pageNumber - 1 ) * limitNumber
        const totalItems = await dailyTaskModel.countDocuments(filter);
        const fetch = await dailyTaskModel
        .find(filter)
       .sort(sortOption)
       .skip(skip)
       .limit(limitNumber)
       const totalPages = Math.ceil(totalItems / limitNumber);
        return res.status(200).json({
            success:true,
            message: fetch.length === 0
            ? "No DailyTasks found"
            : "DailyTasks fetched successfully",
            data:fetch,
            pagination :{
        currentPage: pageNumber,
        totalPages,
        totalItems,
        limit:limitNumber
            }
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const getoneDailyTask = async (req,res) => {
    try{
        const dailyTask  = await dailyTaskModel.findOne({
            _id:req.params.id,
            user:req.user._id
        })
        if(!dailyTask){
            return res.status(404).json({
                success:false,
                message:"DailyTask not found"
            })
        }
        return res.status(200).json({
            success:true,
            message:"DailyTask fetched successfully",
            data:dailyTask
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const updateDailyTask = async (req,res) => {
    try{
        const { title, description, taskDate, priority, status } = req.body;
        if (!title || !taskDate) {
            return res.status(400).json({
                success: false,
                message: "Title and task date are required"
            })
        }
        const dailyTask = await dailyTaskModel.findOneAndUpdate({
            _id:req.params.id,
            user:req.user._id
        },
        {
            title,
            description,
            taskDate,
            priority, 
            status 
        },
        { 
            returnDocument: "after" ,
            runValidators: true
        }
    )
    if(!dailyTask){
        return res.status(404).json({
            success:false,
            message:"DailyTask not found"
        })
    }
    return res.status(200).json({
            success:true,
            message:"DailyTask updated successfully",
            data:dailyTask
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const deleteDailyTask = async (req,res) => {
    try{
        const dailyTask = await dailyTaskModel.findOneAndDelete({
            _id:req.params.id,
            user:req.user._id
        })
        if(!dailyTask){
            return res.status(404).json({
                success:false,
                message:"DailyTask not found"
            })
        }
        return res.status(200).json({
            success:true,
            message:"DailyTask deleted successfully"
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

module.exports = {
    addDailyTask,
    getDailyTask,
    getoneDailyTask,
    updateDailyTask,
    deleteDailyTask
}