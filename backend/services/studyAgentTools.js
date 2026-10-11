const { AIError, requireText } = require("../utils/aiSafety");
const assignmentModel = require("../models/Assignments");
const projectModel = require("../models/Projects");
const quizModel = require("../models/Quizzes");
const dailyTaskModel = require("../models/DailyTasks");
const todoTaskModel = require("../models/todoTask");

const {
  retrieveRelevantNoteChunks,
} = require("./ragService");

function boundedText(value, max = 1000) { return typeof value === "string" ? value.slice(0, max) : ""; }

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
    .maxTimeMS(5000).lean();

  return assignments.map((item) => ({
    id: item._id,
    title: boundedText(item.title, 500),
    description: boundedText(item.description),
    course: item.course
      ? {
          title: boundedText(item.course.title, 500),
          courseCode: boundedText(item.course.courseCode, 100),
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
    .maxTimeMS(5000).lean();

  return projects.map((item) => ({
    id: item._id,
    title: boundedText(item.title, 500),
    description: boundedText(item.description),
    course: item.course
      ? {
          title: boundedText(item.course.title, 500),
          courseCode: boundedText(item.course.courseCode, 100),
        }
      : null,
    technologies: (item.technologies || []).slice(0, 20).map(value => boundedText(value, 100)),
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
    .maxTimeMS(5000).lean();

  return quizzes.map((item) => ({
    id: item._id,
    title: boundedText(item.title, 500),
    course: item.course
      ? {
          title: boundedText(item.course.title, 500),
          courseCode: boundedText(item.course.courseCode, 100),
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
    .maxTimeMS(5000).lean();

  return tasks.map((item) => ({
    id: item._id,
    title: boundedText(item.title, 500),
    description: boundedText(item.description),
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
    .maxTimeMS(5000).lean();

  return tasks.map((item) => ({
    id: item._id,
    title: boundedText(item.title, 500),
    description: boundedText(item.description),
    dueDate: item.dueDate,
    priority: item.priority,
    status: item.status,
  }));
}

async function searchStudyMaterial(userId, args = {}) {
  const question = requireText(args.question, 1000, "Question");

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
  if (!args || typeof args !== "object" || Array.isArray(args)) throw new AIError(400, "Invalid study planner tool input");
  for (const field of ["status", "priority"]) {
    if (args[field] !== undefined && (typeof args[field] !== "string" || args[field].length > 30)) throw new AIError(400, "Invalid study planner filter");
  }
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