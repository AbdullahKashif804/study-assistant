import { useEffect, useState } from "react";

import Modal from "../ui/Modal";
import {
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
  LoaderCircle,
  CalendarDays,
  Paperclip,
  Sparkles,
  BrainCircuit,
  X,
} from "lucide-react";

const AI_API_URL = "http://localhost:5000/api/ai";

function NoteCard({
  note,
  cardStyle,
  openMenuId,
  setOpenMenuId,
  deletingId,
  handleEdit,
  handleDelete,
  formatDate,
}) {
  const [aiLoading, setAiLoading] = useState("");
  const [aiError, setAiError] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [aiType, setAiType] = useState("");
  const [savedSummary, setSavedSummary] = useState(
    note.aiSummary || null
  );


  const [savedQuiz, setSavedQuiz] = useState(
    note.aiQuiz || null
  );

  useEffect(() => {
  setSavedSummary(note.aiSummary || null);
  setSavedQuiz(note.aiQuiz || null);
}, [note.aiSummary, note.aiQuiz]);

  async function generateAI(action) {
    try {
      setAiLoading(action);
      setAiError("");
      setAiResult(null);
      setAiType("");

      const token = localStorage.getItem("token");

      const response = await fetch(
        `${AI_API_URL}/note/${note._id}/generate`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to generate AI response"
        );
      }
      setAiType(data.type);
      setAiResult(data.data);

      if (data.type === "summary") {
        setSavedSummary(data.data);
      }

      if (data.type === "quiz") {
        setSavedQuiz(data.data);
      }
    } catch (error) {
      setAiError(error.message);
    } finally {
      setAiLoading("");
    }
  }

  function closeAIModal() {
    setAiResult(null);
    setAiType("");
    setAiError("");
  }

  return (
    <>
      <article
        className="module-card"
      >
        <div className="flex items-start gap-4">
          <div
            className={`hidden shrink-0 rounded-xl p-3 sm:block ${cardStyle?.icon || "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"}`}
          >
            <FileText className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">{note.title}</h3>
                {note.course?.title && <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">{note.course.title}</p>}
              </div>
          <div className="relative">
            <button
              type="button"
              onClick={() =>
                setOpenMenuId(
                  openMenuId === note._id
                    ? null
                    : note._id
                )
              }
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label={`Open actions for ${note.title}`}

                          aria-expanded={openMenuId === note._id}
                        >
              <MoreVertical className="h-5 w-5" />
            </button>

            {openMenuId === note._id && (
              <div className="absolute right-0 top-10 z-30 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                <button
                  type="button"
                  onClick={() => handleEdit(note)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>

                <button
                  type="button"
                  disabled={
                    deletingId === note._id
                  }
                  onClick={() =>
                    handleDelete(note._id)
                  }
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  {deletingId === note._id ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}

                  {deletingId === note._id
                    ? "Deleting"
                    : "Delete"}
                </button>
              </div>
            )}
          </div>
            </div>

        <p className="mt-3 line-clamp-2 wrap-break-word text-sm leading-6 text-slate-600 dark:text-slate-400">
          {(note.content || "").length > 160
            ? `${note.content.slice(0, 160)}...`
            : note.content}
        </p>

        {note.attachment && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
            <div className="flex min-w-0 items-center gap-3">
              <div className="rounded-lg bg-violet-100 p-2 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
                <Paperclip size={17} />
              </div>

              <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                {note.attachment.originalName ||
                  "Attachment"}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                window.open(
                  note.attachment.url,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
              className="btn-primary shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition"
            >
              View
            </button>
          </div>
        )}

        {/* AI Actions */}
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={Boolean(aiLoading)}
            onClick={() => {
              if (savedSummary) {
                setAiType("summary");
                setAiResult(savedSummary);
                setAiError("");
              } else {
                generateAI("summary");
              }
            }}

            className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/70"
          >
            {aiLoading === "summary" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}

            {aiLoading === "summary"
              ? "Generating..."
              : savedSummary
                ? "View Summary"
                : "AI Summary"}
          </button>

          <button
            type="button"
            disabled={Boolean(aiLoading)}
            onClick={() => {
              if (savedQuiz) {
                setAiType("quiz");
                setAiResult(savedQuiz);
                setAiError("");
              } else {
                generateAI("quiz");
              }
            }}
            className="flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-950/70"
          >
            {aiLoading === "quiz" ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <BrainCircuit className="h-4 w-4" />
            )}

            {aiLoading === "quiz"
              ? "Generating..."
              : savedQuiz
                ? "View Quiz"
                : "AI Quiz"}
          </button>
        </div>

        {aiError && (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
            {aiError}
          </div>
        )}

        <div className="mt-3 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <CalendarDays className="h-4 w-4" />
          created {formatDate(note.createdAt)}
        </div>
          </div>
        </div>
      </article>

      {/* AI Result Modal */}
      {aiResult && (
        <Modal title={aiType === "summary" ? "Note Summary" : "Generated Quiz"} onClose={closeAIModal}>
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                  {aiType === "summary" ? (
                    <Sparkles className="h-5 w-5" />
                  ) : (
                    <BrainCircuit className="h-5 w-5" />
                  )}
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    AI Study Assistant
                  </p>

                  <h2 className="font-bold text-slate-900 dark:text-slate-100">
                    {aiType === "summary"
                      ? "Note Summary"
                      : "Generated Quiz"}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                onClick={closeAIModal}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Close AI result"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              {aiType === "summary" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Summary
                    </h3>

                    <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-600 dark:text-slate-300">
                      {aiResult.summary}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Key Points
                    </h3>

                    <ul className="mt-3 space-y-2">
                      {(aiResult.keyPoints || []).map(
                        (point, index) => (
                          <li
                            key={index}
                            className="flex gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
                          >
                            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                            <span>{point}</span>
                          </li>
                        )
                      )}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Quick Revision
                    </h3>

                    <div className="mt-3 space-y-2">
                      {(
                        aiResult.quickRevision || []
                      ).map((point, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300"
                        >
                          {point}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {aiType === "quiz" && (
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                    {aiResult.title ||
                      `${note.title} Quiz`}
                  </h3>

                  <div className="mt-5 space-y-6">
                    {(aiResult.questions || []).map(
                      (question, questionIndex) => (
                        <div
                          key={questionIndex}
                          className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800"
                        >
                          <p className="font-semibold leading-6 text-slate-900 dark:text-slate-100">
                            {questionIndex + 1}.{" "}
                            {question.question}
                          </p>

                          <div className="mt-4 space-y-2">
                            {(
                              question.options || []
                            ).map(
                              (
                                option,
                                optionIndex
                              ) => {
                                const isCorrect =
                                  optionIndex ===
                                  question.correctOption;

                                return (
                                  <div
                                    key={
                                      optionIndex
                                    }
                                    className={`rounded-xl border px-4 py-3 text-sm ${isCorrect
                                      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                                      : "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300"
                                      }`}
                                  >
                                    {String.fromCharCode(
                                      65 +
                                      optionIndex
                                    )}
                                    . {option}

                                    {isCorrect && (
                                      <span className="ml-2 font-semibold">
                                        ✓ Correct
                                      </span>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>

                          {question.explanation && (
                            <div className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
                              <span className="font-semibold">
                                Explanation:
                              </span>{" "}
                              {
                                question.explanation
                              }
                            </div>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}
            </div>
        </Modal>
      )}
    </>
  );
}

export default NoteCard;
