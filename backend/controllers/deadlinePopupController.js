const assignmentModel = require("../models/Assignments");
const projectModel = require("../models/Projects");
const quizModel = require("../models/Quizzes");
const todoTaskModel = require("../models/todoTask");

const getDeadlineReminders = async (req, res) => {
  try {
    const userId = req.user._id;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const dateFilter = {
      $gte: startOfToday,
      $lte: endOfToday,
    };

    const assignments = await assignmentModel.find({
      user: userId,
      dueDate: dateFilter,
      status: { $in: ["Pending", "Submitted"] },
    }).sort({ dueDate: 1 });

    const projects = await projectModel.find({
      user: userId,
      dueDate: dateFilter,
      status: "In Progress",
    }).sort({ dueDate: 1 });

    const quizzes = await quizModel.find({
      user: userId,
      dueDate: dateFilter,
      status: { $in: ["Pending", "Submitted"] },
    }).sort({ dueDate: 1 });

    const todoTasks = await todoTaskModel.find({
      user: userId,
      dueDate: dateFilter,
      status: { $in: ["Pending", "In Progress"] },
    }).sort({ dueDate: 1 });

    return res.status(200).json({
      success: true,
      data: {
        assignments,
        projects,
        quizzes,
        todoTasks,
      },
    });
  } catch (error) {
  console.error(error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
}
};

module.exports = {
  getDeadlineReminders,
};