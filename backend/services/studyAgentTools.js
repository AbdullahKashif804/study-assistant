const assignmentModel = require("../models/Assignments");
const projectModel = require("../models/Projects");
const quizModel = require("../models/Quizzes");
const dailyTaskModel = require("../models/DailyTasks");
const todoTaskModel = require("../models/todoTask");

const {
  retrieveRelevantNoteChunks,
} = require("./ragService");

function normalizeLimit(value, fallback = 20) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(
    Math.max(Math.floor(number), 1),
    30
  );
}

async function getAssignments(userId, args = {}) {
  const limit = normalizeLimit(args.limit);

  const filter = {
    user: userId,
  };

  if (args.status) {
    filter.status = args.status;
  }

  const assignments = await assignmentModel
    .find(filter)
    .populate("course", "title courseCode")
    .sort({
      dueDate: 1,
      createdAt: -1,
    })
    .limit(limit)
    .lean();

  return assignments.map((item) => ({
    id: item._id,
    title: item.title,
    description: item.description,
    course: item.course
      ? {
          title: item.course.title,
          courseCode: item.course.courseCode,
        }
      : null,
    dueDate: item.dueDate,
    status: item.status,
    totalMark: item.totalMark,
    obtainedMark: item.obtainedMark ?? null,
  }));
}

async function getProjects(userId, args = {}) {
  const limit = normalizeLimit(args.limit);

  const filter = {
    user: userId,
  };

  if (args.status) {
    filter.status = args.status;
  }

  const projects = await projectModel
    .find(filter)
    .populate("course", "title courseCode")
    .sort({
      dueDate: 1,
      createdAt: -1,
    })
    .limit(limit)
    .lean();

  return projects.map((item) => ({
    id: item._id,
    title: item.title,
    description: item.description || "",
    course: item.course
      ? {
          title: item.course.title,
          courseCode: item.course.courseCode,
        }
      : null,
    technologies: item.technologies || [],
    dueDate: item.dueDate,
    status: item.status,
    totalMark: item.totalMark,
    obtainedMark: item.obtainedMark ?? null,
  }));
}

async function getQuizzes(userId, args = {}) {
  const limit = normalizeLimit(args.limit);

  const filter = {
    user: userId,
  };

  if (args.status) {
    filter.status = args.status;
  }

  const quizzes = await quizModel
    .find(filter)
    .populate("course", "title courseCode")
    .sort({
      dueDate: 1,
      createdAt: -1,
    })
    .limit(limit)
    .lean();

  return quizzes.map((item) => ({
    id: item._id,
    title: item.title,
    course: item.course
      ? {
          title: item.course.title,
          courseCode: item.course.courseCode,
        }
      : null,
    dueDate: item.dueDate,
    status: item.status,
    totalMark: item.totalMark,
    obtainedMark: item.obtainedMark ?? null,
  }));
}

async function getDailyTasks(userId, args = {}) {
  const limit = normalizeLimit(args.limit);

  const filter = {
    user: userId,
  };

  if (args.status) {
    filter.status = args.status;
  }

  if (args.priority) {
    filter.priority = args.priority;
  }

  const tasks = await dailyTaskModel
    .find(filter)
    .sort({
      taskDate: 1,
      createdAt: -1,
    })
    .limit(limit)
    .lean();

  return tasks.map((item) => ({
    id: item._id,
    title: item.title,
    description: item.description || "",
    taskDate: item.taskDate,
    priority: item.priority,
    status: item.status,
  }));
}

async function getTodoTasks(userId, args = {}) {
  const limit = normalizeLimit(args.limit);

  const filter = {
    user: userId,
  };

  if (args.status) {
    filter.status = args.status;
  }

  if (args.priority) {
    filter.priority = args.priority;
  }

  const tasks = await todoTaskModel
    .find(filter)
    .sort({
      dueDate: 1,
      createdAt: -1,
    })
    .limit(limit)
    .lean();

  return tasks.map((item) => ({
    id: item._id,
    title: item.title,
    description: item.description || "",
    dueDate: item.dueDate,
    priority: item.priority,
    status: item.status,
  }));
}

async function searchStudyMaterial(userId, args = {}) {
  const question = String(
    args.question || ""
  ).trim();

  if (!question) {
    return [];
  }

  const chunks =
    await retrieveRelevantNoteChunks({
      userId,
      question,
    });

  return chunks.map((chunk) => ({
    noteId: chunk.noteId,
    noteTitle: chunk.title,
    sourceType: chunk.sourceType,
    sourceName: chunk.sourceName,
    text: chunk.text,
    score: chunk.score,
  }));
}

async function executeStudyAgentTool({
  toolName,
  userId,
  arguments: args = {},
}) {
  switch (toolName) {
    case "get_assignments":
      return getAssignments(userId, args);

    case "get_projects":
      return getProjects(userId, args);

    case "get_quizzes":
      return getQuizzes(userId, args);

    case "get_daily_tasks":
      return getDailyTasks(userId, args);

    case "get_todo_tasks":
      return getTodoTasks(userId, args);

    case "search_study_material":
      return searchStudyMaterial(
        userId,
        args
      );

    default:
      throw new Error(
        `Unknown study-agent tool: ${toolName}`
      );
  }
}

module.exports = {
  executeStudyAgentTool,
};