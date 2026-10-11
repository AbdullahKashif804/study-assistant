const limits = require("../config/aiLimits");
const { AIError, requireText, checkDeadline, requestAI } = require("../utils/aiSafety");
const {
  executeStudyAgentTool,
} = require("./studyAgentTools");

const GROQ_API_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const GROQ_MODEL =
  "openai/gpt-oss-20b";

const MAX_AGENT_STEPS = 6;

const STUDY_AGENT_TOOLS = [
  {
    type: "function",

    function: {
      name: "get_assignments",

      description:
        "Read the student's assignments, deadlines, marks, course information, and completion status.",

      parameters: {
        type: "object",

        properties: {
          status: {
            type: "string",

            enum: [
              "Pending",
              "Completed",
              "Submitted",
              "Graded",
            ],
          },

          limit: {
            type: "integer",
            minimum: 1,
            maximum: 30,
          },
        },

        additionalProperties: false,
      },
    },
  },

  {
    type: "function",

    function: {
      name: "get_projects",

      description:
        "Read the student's academic projects, deadlines, technologies, course, marks, and status.",

      parameters: {
        type: "object",

        properties: {
          status: {
            type: "string",

            enum: [
              "In Progress",
              "Completed",
              "Graded",
            ],
          },

          limit: {
            type: "integer",
            minimum: 1,
            maximum: 30,
          },
        },

        additionalProperties: false,
      },
    },
  },

  {
    type: "function",

    function: {
      name: "get_quizzes",

      description:
        "Read upcoming and previous quizzes, their course, deadline, status, and marks.",

      parameters: {
        type: "object",

        properties: {
          status: {
            type: "string",

            enum: [
              "Pending",
              "Submitted",
              "Graded",
            ],
          },

          limit: {
            type: "integer",
            minimum: 1,
            maximum: 30,
          },
        },

        additionalProperties: false,
      },
    },
  },

  {
    type: "function",

    function: {
      name: "get_daily_tasks",

      description:
        "Read the student's daily tasks including task date, priority, status, title, and description.",

      parameters: {
        type: "object",

        properties: {
          status: {
            type: "string",

            enum: [
              "Pending",
              "In Progress",
              "Completed",
            ],
          },

          priority: {
            type: "string",

            enum: [
              "High",
              "Medium",
              "Low",
            ],
          },

          limit: {
            type: "integer",
            minimum: 1,
            maximum: 30,
          },
        },

        additionalProperties: false,
      },
    },
  },

  {
    type: "function",

    function: {
      name: "get_todo_tasks",

      description:
        "Read the student's to-do tasks including due date, priority, status, title, and description.",

      parameters: {
        type: "object",

        properties: {
          status: {
            type: "string",

            enum: [
              "Pending",
              "In Progress",
              "Completed",
            ],
          },

          priority: {
            type: "string",

            enum: [
              "High",
              "Medium",
              "Low",
            ],
          },

          limit: {
            type: "integer",
            minimum: 1,
            maximum: 30,
          },
        },

        additionalProperties: false,
      },
    },
  },

  {
    type: "function",

    function: {
      name: "search_study_material",

      description:
        "Search the student's notes and supported uploaded study documents using RAG. Use this when the question asks about study content, a subject, concept, or material inside notes/files.",

      parameters: {
        type: "object",

        properties: {
          question: {
            type: "string",
          },
        },

        required: [
          "question",
        ],

        additionalProperties: false,
      },
    },
  },
];

async function callAgent(messages) {
  if (!process.env.GROQ_API_KEY) {
    const error =
      new AIError(502,
        "AI service is currently unavailable"
      );

    error.statusCode = 503;

    throw error;
  }

  const data = await requestAI(
    GROQ_API_URL,
    {
      method: "POST",

      headers: {
        Authorization:
          `Bearer ${process.env.GROQ_API_KEY}`,

        "Content-Type":
          "application/json",
      },

      body: JSON.stringify({
        model: GROQ_MODEL,
        max_completion_tokens: limits.MAX_COMPLETION_TOKENS,

        messages,

        tools:
          STUDY_AGENT_TOOLS,

        tool_choice: "auto",

        parallel_tool_calls:
          true,

        temperature: 0.2,

        reasoning_effort:
          "low",
      }),
    }
  );

  const message =
    data?.choices?.[0]
      ?.message;

  if (!message) {
    const error =
      new AIError(502,
        "Study agent returned an empty response"
      );

    error.statusCode = 502;

    throw error;
  }

  return message;
}

function safeParseArguments(rawArguments) {
  try {
    if (!rawArguments) {
      return {};
    }

    if (typeof rawArguments !== "string" || rawArguments.length > 4000) throw new AIError(502, );
    const args = JSON.parse(rawArguments);
    if (!args || typeof args !== "object" || Array.isArray(args)) throw new AIError(502, );
    return args;
  } catch {
    return {};
  }
}

async function runStudyAgent({
  userId,
  question,
}) {
  requireText(question, 1500, "Question");
  const deadline = Date.now() + limits.WORK_TIMEOUT_MS;
  let toolCount = 0;
  const messages = [
    {
      role: "system",

      content:
        `You are the AI Study Planner inside a student's private Study Assistant application.

Your role is to help the student decide what to study or work on by using the available tools.

Important rules:
- Use tools whenever application data is needed.
- Never invent assignments, quizzes, projects, tasks, deadlines, marks, notes, or study material.
- All tool results belong only to the currently authenticated student.
- Prioritize overdue and near-deadline work.
- Consider priority fields where they exist.
- Consider incomplete work before completed work.
- Use study-material search only when the user's question needs information from notes/files.
- You are read-only. Never claim that you created, completed, updated, deleted, submitted, or graded anything.
- Give practical recommendations.
- If there is not enough data, clearly say so.
- Keep plans realistic and concise.
- Dates from tools are authoritative.
- Current server time is ${new Date().toISOString()}.`,
    },

    {
      role: "user",

      content: question,
    },
  ];

  const toolsUsed = [];

  for (
    let step = 0;
    step < MAX_AGENT_STEPS;
    step += 1
  ) {
    checkDeadline(deadline);
    const assistantMessage =
      await callAgent(messages);
    checkDeadline(deadline);

    messages.push({
      role: "assistant",

      content:
        assistantMessage.content ||
        null,

      tool_calls:
        assistantMessage.tool_calls ||
        undefined,
    });

    const toolCalls =
      assistantMessage.tool_calls ||
      [];

    if (!Array.isArray(toolCalls) || toolCount + toolCalls.length > limits.MAX_TOOL_CALLS) throw new AIError(413, "Study planner tool workload exceeds the limit");
    toolCount += toolCalls.length;
    if (
      toolCalls.length === 0
    ) {
      return {
        answer:
          assistantMessage.content ||
          "I could not generate a study recommendation.",

        toolsUsed,
      };
    }

    for (
      const toolCall of toolCalls
    ) {
      checkDeadline(deadline);
      const toolName =
        toolCall?.function?.name;

      const args =
        safeParseArguments(
          toolCall?.function
            ?.arguments
        );

      const toolResult =
        await executeStudyAgentTool({
          toolName,

          userId,

          arguments: args,
        });

      checkDeadline(deadline);
      if (JSON.stringify(toolResult).length > limits.MAX_TOOL_RESULT_CHARS) throw new AIError(413, "Study planner results exceed the context limit. Request fewer records.");
      toolsUsed.push(
        toolName
      );

      messages.push({
        role: "tool",

        tool_call_id:
          toolCall.id,

        content:
          JSON.stringify(
            toolResult
          ),
      });
    }
  }

  const error =
    new AIError(502,
      "Study agent exceeded the maximum number of reasoning steps"
    );

  error.statusCode = 502;

  throw error;
}

module.exports = {
  runStudyAgent,
};
