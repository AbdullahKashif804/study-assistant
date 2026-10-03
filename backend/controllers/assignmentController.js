const assignmentModel = require('../models/Assignments')
const courseModel = require('../models/Courses')
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { deleteFromCloudinary } = require('../utils/cloudinaryDelete');

const addAssignment = async(req,res)=>{
    try{
        const {title, description, course, dueDate, totalMark, obtainedMark} =req.body;

    if(!title || !description || !course || !dueDate || !totalMark ){
        return res.status(400).json({
            success:false,
            message:"fields are required"
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
    let attachmentData = null;
        if(req.file){
            const cloudResult = await uploadToCloudinary(req.file.path,'assignment_attachments')
            if(cloudResult){
                attachmentData = {
                    url:cloudResult.secure_url,
                    publicId:cloudResult.public_id,
                    originalName: req.file.originalname,
                    format:cloudResult.format || req.file.originalname.split('.').pop(),
                    resourceType:cloudResult.resource_type,
                    size:cloudResult.bytes || req.file.size
                };
            }
        }
    const assignment = new assignmentModel({
        title,
        description,
        course,
        dueDate,
        totalMark,
        obtainedMark,
        user:req.user._id,
        attachment:attachmentData
    })
    const result = await assignment.save()
    return res.status(201).json({
        success:true,
        message:"Assignment added successfully",
        data:result
    })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const getAssignment  = async (req,res)=>{
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
                {
                    description: {
                        $regex: search.trim(),
                        $options: "i",
                    },
                },
            ];
        }
        if(course){
            filter.course = course;
        }
        if(status){
            filter.status = status;
        }
        const sortOption = {}
        if(sort == "newest"){
            sortOption.createdAt =-1
        }else if(sort == "oldest"){
            sortOption.createdAt = 1
        }else if(sort == "title"){
            sortOption.title = 1
        }else if(sort === "due-soon"){
            sortOption.dueDate = 1
        }
        
        const fetch = await assignmentModel
        .find(filter)
       .populate('course')  
       .sort(sortOption)
        return res.status(200).json({
            success:true,
            message:"Assignment fetched successfully",
            data:fetch
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const getoneAssignment = async (req,res) => {
    try{
        const assignment = await assignmentModel.findOne({
            _id:req.params.id,
            user:req.user._id
        }).populate('course');
        if(!assignment){
            return res.status(400).json({
                success:false,
                message:"User has no Assignment"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Assignment fetched successfully",
            data:assignment
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const updateAssignment =  async (req,res) => {
    try{
        const {
            title,
            description,
            course,
            dueDate,
            status,
            totalMark,
            obtainedMark
        } = req.body;

        if (!title || !description || !course || !dueDate || !totalMark) {
            return res.status(400).json({
                success: false,
                message: "Fields are required"
            });
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
        const assignment = await assignmentModel.findOne({
            _id:req.params.id,
            user:req.user._id
        })
    if(!assignment){
        return res.status(404).json({
            success:false,
            message:"assignment not found"
        })
    }

    assignment.title = title;
        assignment.description = description;
        assignment.course = course;
        assignment.dueDate = dueDate;
        assignment.status = status;
        assignment.totalMark = totalMark;
        assignment.obtainedMark = obtainedMark !== undefined && obtainedMark !== "" ? obtainedMark : null;

        if (req.file) {
            if (assignment.attachment && assignment.attachment.publicId) {
                await deleteFromCloudinary(
                    assignment.attachment.publicId,
                    assignment.attachment.resourceType
                );
            }

            const cloudResult = await uploadToCloudinary(req.file.path, 'assignment_attachments');
            if (cloudResult) {
                assignment.attachment = {
                    url: cloudResult.secure_url,
                    publicId: cloudResult.public_id,
                    originalName: req.file.originalname,
                    format: cloudResult.format || req.file.originalname.split('.').pop(),
                    resourceType: cloudResult.resource_type,
                    size: cloudResult.bytes || req.file.size
                };
            }
        }

        await assignment.save();
        await assignment.populate('course');
    return res.status(200).json({
        success:true,
        message:"Assignment updated successfully",
        data:assignment
    })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const deleteAssignment = async (req,res) => {
    try{
        const assignment = await assignmentModel.findOne({
            _id:req.params.id,
            user:req.user._id
        })
        if(!assignment){
            return res.status(404).json({
                success:false,
                message:"Assignment not found"
            })
        }
        if (assignment.attachment && assignment.attachment.publicId) {
                    await deleteFromCloudinary(
                        assignment.attachment.publicId,
                        assignment.attachment.resourceType
                    );
                }
                await assignmentModel.deleteOne({ _id: assignment._id });
        return res.status(200).json({
            success:true,
            message:"Assignment deleted successfully"
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
module.exports={
    addAssignment,
    getAssignment,
    getoneAssignment,
    updateAssignment,
    deleteAssignment
}