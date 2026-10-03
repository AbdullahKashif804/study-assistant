
const noteModel = require("../models/Notes");
const assignmentModel = require("../models/Assignments");
const projectModel = require("../models/Projects");
const courseModel = require("../models/Courses");
const quizModel = require("../models/Quizzes");
const dailyTaskModel = require("../models/DailyTasks");
const todoTaskModel = require("../models/todoTask");

const globalSearch = async (req, res) => {
    try {
        const userId = req.user._id;
        const search = req.query.q?.trim();

        if (!search) {
            return res.status(200).json({
                success: true,
                message: "Search query is empty",
                data: []
            });
        }

        const searchRegex = {
            $regex: search,
            $options: "i"
        };

        const [
            notes,
            assignments,
            projects,
            courses,
            quizzes,
            dailyTasks,
            todoTasks
        ] = await Promise.all([

            noteModel.find({
                user: userId,
                $or: [
                    { title: searchRegex },
                    { content: searchRegex }
                ]
            }).select("_id title"),

            assignmentModel.find({
                user: userId,
                $or: [
                    { title: searchRegex },
                    { description: searchRegex }
                ]
            }).select("_id title"),

            projectModel.find({
                user: userId,
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                    { technologies: searchRegex }
                ]
            }).select("_id title"),

            courseModel.find({
                user: userId,
                $or: [
                    { title: searchRegex },
                    { courseCode: searchRegex },
                    { instructor: searchRegex },
                    { description: searchRegex }
                ]
            }).select("_id title"),

            quizModel.find({
                user: userId,
                title: searchRegex
            }).select("_id title"),

            dailyTaskModel.find({
                user: userId,
                $or: [
                    { title: searchRegex },
                    { description: searchRegex }
                ]
            }).select("_id title"),

            todoTaskModel.find({
                user: userId,
                $or: [
                    { title: searchRegex },
                    { description: searchRegex }
                ]
            }).select("_id title")
        ]);

        const results = [

            ...notes.map((item) => ({
                id: item._id,
                title: item.title,
                type: "Note",
                path: "/notes"
            })),

            ...assignments.map((item) => ({
                id: item._id,
                title: item.title,
                type: "Assignment",
                path: "/assignment"
            })),

            ...projects.map((item) => ({
                id: item._id,
                title: item.title,
                type: "Project",
                path: "/project"
            })),

            ...courses.map((item) => ({
                id: item._id,
                title: item.title,
                type: "Course",
                path: "/course"
            })),

            ...quizzes.map((item) => ({
                id: item._id,
                title: item.title,
                type: "Quiz",
                path: "/quiz"
            })),

            ...dailyTasks.map((item) => ({
                id: item._id,
                title: item.title,
                type: "Daily Task",
                path: "/dailytask"
            })),

            ...todoTasks.map((item) => ({
                id: item._id,
                title: item.title,
                type: "To-do Task",
                path: "/todotask"
            }))
        ];

        return res.status(200).json({
            success: true,
            message: results.length === 0
                ? "No results found"
                : "Search results fetched successfully",
            data: results
        });

    } catch (error) {
    console.error(error);

    return res.status(500).json({
        success: false,
        message: "Internal server error"
    });
}
};

module.exports = globalSearch;

