const projectModel = require('../models/Projects')
const courseModel = require('../models/Courses')
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { deleteFromCloudinary } = require('../utils/cloudinaryDelete');

const addProject = async (req,res)=>{
    try{
        const {title, description , course , technologies , dueDate , totalMark , obtainedMark} = req.body;
       
        if(!title || !description || !course || !technologies || !dueDate || !totalMark){
            return res.status(400).json({
                success:false,
                message:"Fields are required"
            })
        }
         let parsedTechnologies;
        try {
            parsedTechnologies = JSON.parse(technologies);
        } catch {
            return res.status(400).json({
                success:false,
                message:"Technologies must be a valid list"
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
                        const cloudResult = await uploadToCloudinary(req.file.path,'project_attachments')
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
        const project = new projectModel({
            title,
            description,
            course,
            technologies: parsedTechnologies,
            dueDate, 
            totalMark, 
            obtainedMark,
            user:req.user._id,
            attachment:attachmentData
        })
        const result = await project.save()
        return res.status(201).json({
            success:true,
            message:"Project added successfully",
            data:result
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const getProject= async (req,res)=>{
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
        }else if(sort === "due-soon"){
            sortOption.dueDate = 1
        }
        const fetch=await projectModel
        .find(filter)
        .populate('course')  
        .sort(sortOption)
        return res.status(200).json({
            success:true,
            message:"Project fetched successfully",
            data:fetch
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const getoneProject = async (req,res)=>{
    try{
        const project=await projectModel.findOne({
            _id:req.params.id,
            user:req.user._id
        }).populate('course');
        if(!project){
            return res.status(404).json({
                success:false,
                message:"Project not found"
            })
        }
        res.status(200).json({
            success:true,
            message:"Project fetched successfully",
            data:project
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const updateProject =async (req,res)=>{
    try{
        const {title, description , course , technologies , dueDate , status, totalMark , obtainedMark} = req.body;


        if(!title || !description || !course || !technologies || !dueDate || !totalMark){
            return res.status(400).json({
                success:false,
                message:"Fields are required"
            })
        }
         let parsedTechnologies;
        try {
            parsedTechnologies = JSON.parse(technologies);
        } catch {
            return res.status(400).json({
                success:false,
                message:"Technologies must be a valid list"
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
        
        const project = await projectModel.findOne({
            _id:req.params.id,
            user:req.user._id
        })
    if(!project){
        return res.status(404).json({
            success:false,
            message:"Project not found"
        })
    }
    project.title = title;
        project.description = description;
        project.course = course;
        project.technologies = parsedTechnologies;
        project.dueDate = dueDate;
        project.status = status;
        project.totalMark = totalMark;
        project.obtainedMark = obtainedMark !== undefined && obtainedMark !== "" ? obtainedMark : null;

        if (req.file) {
                    if (project.attachment && project.attachment.publicId) {
                        await deleteFromCloudinary(
                            project.attachment.publicId,
                            project.attachment.resourceType
                        );
                    }
        
                    const cloudResult = await uploadToCloudinary(req.file.path, 'project_attachments');
                    if (cloudResult) {
                        project.attachment = {
                            url: cloudResult.secure_url,
                            publicId: cloudResult.public_id,
                            originalName: req.file.originalname,
                            format: cloudResult.format || req.file.originalname.split('.').pop(),
                            resourceType: cloudResult.resource_type,
                            size: cloudResult.bytes || req.file.size
                        };
                    }
                }
                await project.save();
        await project.populate('course');
    return res.status(200).json({
        success:true,
        message:"Project updated successfully",
        data:project
    })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const deleteProject =async (req,res)=>{
    try{
        const project = await projectModel.findOne({
        _id:req.params.id,
        user:req.user._id
    })
    if(!project){
        return res.status(404).json({
            success:false,
            message:"Project not found"
        })
    }
    if (project.attachment && project.attachment.publicId) {
                        await deleteFromCloudinary(
                            project.attachment.publicId,
                            project.attachment.resourceType
                        );
                    }
                    await projectModel.deleteOne({ _id: project._id });
    return res.status(200).json({
        success:true,
        message:"Project deleted successfully",
    })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
module.exports={
    addProject,
    getProject,
    getoneProject,
    updateProject,
    deleteProject
}

