const noteModel = require('../models/Notes')
const assignmentModel = require('../models/Assignments')
const projectModel = require('../models/Projects')
const quizModel = require('../models/Quizzes')
const courseModel = require('../models/Courses')
const dailyTaskModel = require('../models/DailyTasks')
const todoTaskModel = require('../models/todoTask')


const showDashboard = async (req,res) => {
    try{
        const [
    totalNotes,
    recentNotes,
    totalAssignment,
    upcomingAssignment,
    totalProjects,
    upComingProject,
    totalQuiz,
    upcomingQuiz,
    totalCourse,
    totalDailyTask,
    todaysDailyTask,
    totalToDoTask,
pendingToDoTask,
dailyTaskStatus,
todoTaskStatus
] = await Promise.all([
    noteModel.countDocuments({
        user: req.user._id
    }),

    noteModel.find({
        user: req.user._id
    }).sort({ createdAt: -1 }).limit(5),

    assignmentModel.countDocuments({
        user: req.user._id
    }),

    assignmentModel.find({
        user: req.user._id,
        dueDate: { $gte: new Date() }
    }).sort({ dueDate: 1 }).limit(5),

    projectModel.countDocuments({
        user: req.user._id
    }),

    projectModel.find({
        user: req.user._id,
        dueDate: { $gte: new Date() }
    }).sort({ dueDate: 1 }).limit(5),

    quizModel.countDocuments({
        user: req.user._id
    }),

    quizModel.find({
        user: req.user._id,
        dueDate: { $gte: new Date() }
    }).sort({ dueDate: 1 }).limit(5),

    courseModel.countDocuments({
        user: req.user._id
    }),

    dailyTaskModel.countDocuments({
        user: req.user._id
    }),

    dailyTaskModel.find({
        user: req.user._id,
        taskDate: { $gte: new Date() }
    }).sort({ taskDate: 1 }).limit(5),

    todoTaskModel.countDocuments({
        user: req.user._id
    }),

    todoTaskModel.find({
    user: req.user._id,
    status: "Pending",
    dueDate: { $gte: new Date() }
}).sort({ dueDate: 1 }).limit(5),

dailyTaskModel.aggregate([
    {
        $match: {
            user: req.user._id
        }
    },
    {
        $group: {
            _id: "$status",
            count: { $sum: 1 }
        }
    }
]),

todoTaskModel.aggregate([
    {
        $match: {
            user: req.user._id
        }
    },
    {
        $group: {
            _id: "$status",
            count: { $sum: 1 }
        }
    }
])
]);

const taskStatus = {
    pending: 0,
    inProgress: 0,
    completed: 0
};


const addStatusCounts = (items) => {
    items.forEach((item) => {
        if (item._id === "Pending") {
            taskStatus.pending += item.count;
        }

        if (item._id === "In Progress") {
            taskStatus.inProgress += item.count;
        }

        if (item._id === "Completed") {
            taskStatus.completed += item.count;
        }
    });
};

addStatusCounts(dailyTaskStatus);
addStatusCounts(todoTaskStatus);
        return res.status(200).json({
            success:true,
            data:{
                totalNotes,
                recentNotes,
                totalAssignment,
                upcomingAssignment,
                totalProjects,
                upComingProject,
                totalQuiz,
                upcomingQuiz,
                totalCourse,
                totalDailyTask,
                todaysDailyTask,
                totalToDoTask,
pendingToDoTask,
taskStatus
            }
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:error.message
        })

    }
}




module.exports = {
    showDashboard
}