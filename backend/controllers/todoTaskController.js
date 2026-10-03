const todoTaskModel = require('../models/todoTask')

const addTodoTask = async (req,res) => {
    try{
        const {title , description , dueDate , priority} = req.body;
        if(!title || !dueDate){
        return res.status(400).json({
            success:false,
            message:"All fields are required"
        })
    }
    const todoTask = new todoTaskModel({
        title,
        description,
        dueDate,
        priority,
        user:req.user._id
    })
    const result = await todoTask.save()
        return res.status(201).json({
            success:true,
            message:"ToDoTask added successfully",
            data:result
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const getTodoTask = async (req,res) => {
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
                    filter.dueDate = {
                        $gte: startDate,
                        $lt: endDate,
                    };
                }
                const sortOption = {}
                if(sort == "newest"){
                    sortOption.createdAt =-1
                }else if(sort == "oldest"){
                    sortOption.createdAt = 1
                }else if(sort == "due-date"){
                    sortOption.dueDate = 1
                }
                const pageNumber = Math.max(Number(page) || 1, 1);
                const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 50);
                const skip = (pageNumber - 1 ) * limitNumber
                const totalItems = await todoTaskModel.countDocuments(filter);
                const fetch = await todoTaskModel
                .find(filter)
               .sort(sortOption)
               .skip(skip)
               .limit(limitNumber)
               const totalPages = Math.ceil(totalItems / limitNumber);
                return res.status(200).json({
                    success:true,
                    message: fetch.length === 0
                    ? "No ToDoTasks found"
                    : "ToDoTasks fetched successfully",
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

const getoneTodoTask = async (req,res) => {
    try{
        const todoTask  = await todoTaskModel.findOne({
            _id:req.params.id,
            user:req.user._id
        })
        if(!todoTask){
            return res.status(404).json({
                success:false,
                message:"ToDoTask not found"
            })
        }
        return res.status(200).json({
            success:true,
            message:"ToDoTask fetched successfully",
            data:todoTask
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const updateTodoTask = async (req,res) => {
    try{
        const {title , description , dueDate , priority , status} = req.body;
        if (!title || !dueDate) {
            return res.status(400).json({
                success: false,
                message: "Title and due date are required"
            })
        }
        const todoTask = await todoTaskModel.findOneAndUpdate({
            _id:req.params.id,
            user:req.user._id
        },
        {
          title,
          description,
          dueDate,
          priority,
          status
        },
        { 
            returnDocument: "after",
            runValidators: true
        }
    )
    if(!todoTask){
        return res.status(404).json({
            success:false,
            message:"ToDoTask not found"
        })
    }
    return res.status(200).json({
            success:true,
            message:"ToDoTask updated successfully",
            data:todoTask
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const deleteTodoTask = async (req,res) => {
    try{
        const todoTask = await todoTaskModel.findOneAndDelete({
            _id:req.params.id,
            user:req.user._id
        })
        if(!todoTask){
            return res.status(404).json({
                success:false,
                message:"ToDoTask not found"
            })
        }
        return res.status(200).json({
            success:true,
            message:"ToDoTask deleted successfully"
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

module.exports = {
    addTodoTask,
    getTodoTask,
    getoneTodoTask,
    updateTodoTask,
    deleteTodoTask
}