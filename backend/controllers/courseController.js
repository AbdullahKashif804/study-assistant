const courseModel = require('../models/Courses')
const { uploadToCloudinary } = require('../utils/cloudinaryUpload');
const { deleteFromCloudinary } = require('../utils/cloudinaryDelete');

const addCourse = async (req,res)=>{
    try{
        const {title , courseCode , semester , instructor , description , status}=req.body;
    if(!title || !courseCode || !semester || !instructor || !description){
        return res.status(400).json({
            success:false,
            message:"Fields are required"
        })
    }
    if (!Number.isInteger(Number(semester)) || Number(semester) < 1 || Number(semester) > 8) {
    return res.status(400).json({
        success: false,
        message: "Semester must be a number between 1 and 8"
    });
}

let attachmentData = null;
    if(req.file){
        const cloudResult = await uploadToCloudinary(req.file.path,'course_attachments')
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
    const course = new courseModel({
        title,
        courseCode,
        semester,
        instructor,
        description,
        status,
        user:req.user._id,
        attachment:attachmentData
    })
    const result = await course.save()
        return res.status(201).json({
            success:true,
            message:"Course added successfully",
            data:result
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

const getCourse = async (req,res) => {
    try{
        const {search, semester, status , sort} = req.query;
        const query = {
            user:req.user._id
        }
        if(search){
            query.$or = [
                {title : {$regex:search,$options:'i'}},
                {courseCode : {$regex:search,$options:'i'}},
                {instructor : {$regex:search,$options:'i'}},
            ]
        }
        if(semester){
            query.semester = Number(semester)
        }
        if(status){
            query.status = status
        }
        const sortOption = {}
        if(sort == "newest"){
            sortOption.createdAt =-1
        }else if(sort == "oldest"){
            sortOption.createdAt = 1
        }else if(sort == "title"){
            sortOption.title = 1
        }
        const fetch = await courseModel.find(query).sort(sortOption)
        
        return res.status(200).json({
            success:true,
            message:"Course fetched successfully",
            data:fetch
        })
        
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const getoneCourse = async (req,res) => {
    try{
        const course = await courseModel.findOne({
            _id:req.params.id,
            user:req.user._id
        })
        if(!course){
            return res.status(404).json({
                success:false,
                message:"Course not found"
            })
        }
        return res.status(200).json({
            success:true,
            message:"Course fetched successfully",
            data:course
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const updateCourse = async (req,res)=>{
    try{
        const {title , courseCode , semester , instructor , description , status}=req.body;
        if (!title || !courseCode || !semester || !instructor || !description) {
            return res.status(400).json({
                success: false,
                message: "Fields are required"
            });
        }
        if (
            !Number.isInteger(Number(semester)) ||
            Number(semester) < 1 ||
            Number(semester) > 8
        ) {
            return res.status(400).json({
                success: false,
                message: "Semester must be a number between 1 and 8"
            });
        }
        const course = await courseModel.findOne({
            _id:req.params.id,
            user:req.user._id
        })
    if(!course){
        return res.status(404).json({
                success:false,
                message:"Course not found"
            })
    }
    course.title = title;
        course.courseCode = courseCode;
        course.semester = semester;
        course.instructor = instructor;
        course.description = description;
        course.status = status;

        if (req.file) {
            if (course.attachment && course.attachment.publicId) {
                await deleteFromCloudinary(
                    course.attachment.publicId,
                    course.attachment.resourceType
                );
            }

            const cloudResult = await uploadToCloudinary(req.file.path, 'course_attachments');
            if (cloudResult) {
                course.attachment = {
                    url: cloudResult.secure_url,
                    publicId: cloudResult.public_id,
                    originalName: req.file.originalname,
                    format: cloudResult.format || req.file.originalname.split('.').pop(),
                    resourceType: cloudResult.resource_type,
                    size: cloudResult.bytes || req.file.size
                };
            }
        }
        await course.save();
    
    return res.status(200).json({
        success:true,
        message:"Course updated successfully",
        data:course
    })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
const deleteCourse = async (req,res) => {
    try{
        const course = await courseModel.findOne({
            _id:req.params.id,
            user:req.user._id
        })
        if(!course){
            return res.status(404).json({
                success:false,
                message:"Course not found"
            })
        }
        if (course.attachment && course.attachment.publicId) {
                    await deleteFromCloudinary(
                        course.attachment.publicId,
                        course.attachment.resourceType
                    );
                }
                await courseModel.deleteOne({ _id: course._id });
        return res.status(200).json({
            success:true,
            message:"Course deleted successfully"
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}
module.exports = {
    addCourse,
    getCourse,
    getoneCourse,
    updateCourse,
    deleteCourse
}