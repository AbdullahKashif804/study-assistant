const limits = require("../config/aiLimits");
const { AIError, requireText, requestAI } = require("../utils/aiSafety");
const GROQ_API_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const GROQ_MODEL =
  "openai/gpt-oss-20b";

async function callGroq({
  messages,
  responseFormat,
}) {
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
        temperature: 0.2,
        reasoning_effort: "low",
        response_format:
          responseFormat,
      }),
    }
  );

  const content =
    data?.choices?.[0]
      ?.message?.content;

  if (!content) {
    const error =
      new AIError(502,
        "AI service returned an empty response"
      );

    error.statusCode = 502;

    throw error;
  }

  try {
    return JSON.parse(content);
  } catch {
    const error =
      new AIError(502,
        "AI service returned an invalid response"
      );

    error.statusCode = 502;

    throw error;
  }
}

async function generateNoteSummary({
  title,
  content,
}) {
  requireText(title, limits.MAX_TITLE_CHARS, "Note title");
  requireText(content, limits.MAX_NOTE_CHARS, "Note content");
  return callGroq({
    messages: [
      {
        role: "system",

        content:
          "You are an academic study assistant. Summarize only the study note provided by the user. Do not invent information that is not present in the note. Keep the result concise, clear, and useful for revision.",
      },

      {
        role: "user",

        content:
          `Note title: ${title}\n\n` +
          `Note content:\n${content}`,
      },
    ],

    responseFormat: {
      type: "json_schema",

      json_schema: {
        name: "note_summary",

        strict: true,

        schema: {
          type: "object",

          properties: {
            summary: {
              type: "string",
            },

            keyPoints: {
              type: "array",

              items: {
                type: "string",
              },
            },

            quickRevision: {
              type: "array",

              items: {
                type: "string",
              },
            },
          },

          required: [
            "summary",
            "keyPoints",
            "quickRevision",
          ],

          additionalProperties:
            false,
        },
      },
    },
  });
}

async function generateNoteQuiz({
  title,
  content,
}) {
  requireText(title, limits.MAX_TITLE_CHARS, "Note title");
  requireText(content, limits.MAX_NOTE_CHARS, "Note content");
  return callGroq({
    messages: [
      {
        role: "system",

        content:
          "You are an academic study assistant. Create exactly 5 multiple-choice questions using only the study note provided by the user. Each question must have exactly 4 options. Do not introduce facts that are not supported by the note.",
      },

      {
        role: "user",

        content:
          `Note title: ${title}\n\n` +
          `Note content:\n${content}`,
      },
    ],

    responseFormat: {
      type: "json_schema",

      json_schema: {
        name: "note_quiz",

        strict: true,

        schema: {
          type: "object",

          properties: {
            title: {
              type: "string",
            },

            questions: {
              type: "array",

              minItems: 5,
              maxItems: 5,

              items: {
                type: "object",

                properties: {
                  question: {
                    type: "string",
                  },

                  options: {
                    type: "array",

                    minItems: 4,
                    maxItems: 4,

                    items: {
                      type: "string",
                    },
                  },

                  correctOption: {
                    type: "integer",
                    minimum: 0,
                    maximum: 3,
                  },

                  explanation: {
                    type: "string",
                  },
                },

                required: [
                  "question",
                  "options",
                  "correctOption",
                  "explanation",
                ],

                additionalProperties:
                  false,
              },
            },
          },

          required: [
            "title",
            "questions",
          ],

          additionalProperties:
            false,
        },
      },
    },
  });
}

async function answerFromNotes({
  question,
  retrievedChunks,
}) {
  requireText(question, 1000, "Question");
  if (!Array.isArray(retrievedChunks) || retrievedChunks.length > 5) throw new AIError(413, "Too many retrieved sources");
  const context =
    retrievedChunks
      .map(
        (chunk, index) =>
          `[Source ${index + 1}]
Source type: ${chunk.sourceType}
Source: ${chunk.sourceName}
Note: ${chunk.title}
Content: ${chunk.text}`
      )
      .join("\n\n");

  return callGroq({
    messages: [
      {
        role: "system",

        content:
          "You are an academic study assistant. Answer the student's question using only the supplied study context. The context may come from the student's written notes or uploaded study documents. If the supplied context does not contain enough information to answer, clearly say that the answer was not found in the student's study material. Do not invent unsupported information.",
      },

      {
        role: "user",

        content:
          `Student question:\n${question}\n\n` +
          `Relevant study context:\n${context}`,
      },
    ],

    responseFormat: {
      type: "json_schema",

      json_schema: {
        name:
          "rag_note_answer",

        strict: true,

        schema: {
          type: "object",

          properties: {
            answer: {
              type: "string",
            },

            grounded: {
              type: "boolean",
            },
          },

          required: [
            "answer",
            "grounded",
          ],

          additionalProperties:
            false,
        },
      },
    },
  });
}

module.exports = {
  generateNoteSummary,
  generateNoteQuiz,
  answerFromNotes,
};