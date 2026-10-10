const noteModel =
    require("../models/Notes");

const {
    generateNoteSummary,
    generateNoteQuiz,
    answerFromNotes,
} = require("../services/aiService");

const {
    retrieveRelevantNoteChunks,
} = require("../services/ragService");
const {
    runStudyAgent,
} = require("../services/studyAgentService");

const MAX_NOTE_CHARACTERS = 12000;

const generateFromNote =
    async (req, res) => {
        try {
            const { action } = req.body;

            if (
                ![
                    "summary",
                    "quiz",
                ].includes(action)
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,

                        message:
                            "Action must be summary or quiz",
                    });
            }

            const note =
                await noteModel.findOne({
                    _id: req.params.id,
                    user: req.user._id,
                });

            if (!note) {
                return res
                    .status(404)
                    .json({
                        success: false,
                        message:
                            "Note not found",
                    });
            }

            const content = String(
                note.content || ""
            ).trim();

            if (!content) {
                return res
                    .status(400)
                    .json({
                        success: false,

                        message:
                            "This note has no text content for AI processing",
                    });
            }

            const aiInput = {
                title: note.title,

                content:
                    content.slice(
                        0,
                        MAX_NOTE_CHARACTERS
                    ),
            };

            let result;

            if (action === "summary") {
                result =
                    await generateNoteSummary(
                        aiInput
                    );

                note.aiSummary = {
                    summary:
                        result.summary,

                    keyPoints:
                        result.keyPoints || [],

                    quickRevision:
                        result.quickRevision ||
                        [],

                    generatedAt:
                        new Date(),
                };
            }

            if (action === "quiz") {
                result =
                    await generateNoteQuiz(
                        aiInput
                    );

                note.aiQuiz = {
                    title:
                        result.title,

                    questions:
                        result.questions || [],

                    generatedAt:
                        new Date(),
                };
            }

            await note.save();

            const savedResult =
                action === "summary"
                    ? note.aiSummary
                    : note.aiQuiz;

            return res
                .status(200)
                .json({
                    success: true,

                    message:
                        action === "summary"
                            ? "AI summary generated and saved successfully"
                            : "AI quiz generated and saved successfully",

                    type: action,

                    data:
                        savedResult,
                });
        } catch (error) {
            return res
                .status(
                    error.statusCode || 500
                )
                .json({
                    success: false,

                    message:
                        error.message ||
                        "Failed to generate AI response",
                });
        }
    };

const askNotes =
    async (req, res) => {
        try {
            const question =
                String(
                    req.body.question || ""
                ).trim();

            if (!question) {
                return res
                    .status(400)
                    .json({
                        success: false,

                        message:
                            "Question is required",
                    });
            }

            if (
                question.length > 1000
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,

                        message:
                            "Question is too long",
                    });
            }

            const retrievedChunks =
                await retrieveRelevantNoteChunks(
                    {
                        userId:
                            req.user._id,

                        question,
                    }
                );

            if (
                retrievedChunks.length === 0
            ) {
                return res
                    .status(200)
                    .json({
                        success: true,

                        data: {
                            answer:
                                "I could not find relevant information in your notes or supported study documents.",

                            grounded: false,

                            sources: [],
                        },
                    });
            }

            const aiResult =
                await answerFromNotes({
                    question,
                    retrievedChunks,
                });

            const uniqueSources = [];

            const seenSources =
                new Set();

            for (
                const chunk of
                retrievedChunks
            ) {
                const sourceKey = [
                    chunk.noteId,
                    chunk.sourceType,
                    chunk.sourceName,
                ].join(":");

                if (
                    !seenSources.has(
                        sourceKey
                    )
                ) {
                    seenSources.add(
                        sourceKey
                    );

                    uniqueSources.push({
                        noteId:
                            chunk.noteId,

                        noteTitle:
                            chunk.title,

                        sourceType:
                            chunk.sourceType,

                        sourceName:
                            chunk.sourceName,
                    });
                }
            }

            return res
                .status(200)
                .json({
                    success: true,

                    data: {
                        answer:
                            aiResult.answer,

                        grounded:
                            aiResult.grounded,

                        sources:
                            uniqueSources,
                    },
                });
        } catch (error) {
            return res
                .status(
                    error.statusCode || 500
                )
                .json({
                    success: false,

                    message:
                        error.message ||
                        "Failed to answer from study material",
                });
        }
    };

const askStudyAgent =
    async (req, res) => {
        try {
            const question =
                String(
                    req.body.question || ""
                ).trim();

            if (!question) {
                return res
                    .status(400)
                    .json({
                        success: false,

                        message:
                            "Question is required",
                    });
            }

            if (
                question.length > 1500
            ) {
                return res
                    .status(400)
                    .json({
                        success: false,

                        message:
                            "Question is too long",
                    });
            }

            const result =
                await runStudyAgent({
                    userId:
                        req.user._id,

                    question,
                });

            return res
                .status(200)
                .json({
                    success: true,

                    data: result,
                });
        } catch (error) {
            return res
                .status(
                    error.statusCode || 500
                )
                .json({
                    success: false,

                    message:
                        error.message ||
                        "Failed to run study agent",
                });
        }
    };

module.exports = {
  generateFromNote,
  askNotes,
  askStudyAgent,
};