const userModel = require('../models/Users')
const noteModel = require('../models/Notes')
const assignmentModel = require('../models/Assignments')
const projectModel = require('../models/Projects')
const quizModel = require('../models/Quizzes')
const courseModel = require('../models/Courses')
const dailyTaskModel = require('../models/DailyTasks')
const todoTaskModel = require('../models/todoTask')

const getAdminStats = async (req, res) => {
    try {

        const [
            totalUsers,
            totalNotes,
            totalAssignments,
            totalProjects,
            totalCourses,
            totalQuizzes,
            totalDailyTasks,
            totalTodoTasks
        ] = await Promise.all([

            userModel.countDocuments(),

            noteModel.countDocuments(),

            assignmentModel.countDocuments(),

            projectModel.countDocuments(),

            courseModel.countDocuments(),

            quizModel.countDocuments(),

            dailyTaskModel.countDocuments(),

            todoTaskModel.countDocuments()
        ]);

        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                totalNotes,
                totalAssignments,
                totalProjects,
                totalCourses,
                totalQuizzes,
                totalDailyTasks,
                totalTodoTasks
            }
        });

    } catch (error) {
    console.error(error);

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}
};

module.exports = {
    getAdminStats
};