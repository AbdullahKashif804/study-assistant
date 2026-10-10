import { useState } from "react";

import {
  BrainCircuit,
  LoaderCircle,
  Send,
  BookOpen,
  FileText,
} from "lucide-react";

const AI_API_URL =
  "http://localhost:5000/api/ai";

function NotesAI() {
  const [
    question,
    setQuestion,
  ] = useState("");

  const [
    answer,
    setAnswer,
  ] = useState("");

  const [
    sources,
    setSources,
  ] = useState([]);

  const [
    grounded,
    setGrounded,
  ] = useState(false);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  async function handleAsk(
    event
  ) {
    event.preventDefault();

    const cleanQuestion =
      question.trim();

    if (!cleanQuestion) {
      setError(
        "Please enter a question"
      );

      return;
    }

    try {
      setLoading(true);

      setError("");

      setAnswer("");

      setSources([]);

      setGrounded(false);

      const token =
        localStorage.getItem(
          "token"
        );

      const response =
        await fetch(
          `${AI_API_URL}/notes/ask`,
          {
            method: "POST",

            headers: {
              Authorization:
                `Bearer ${token}`,

              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                question:
                  cleanQuestion,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to ask AI"
        );
      }

      setAnswer(
        data.data?.answer || ""
      );

      setSources(
        data.data?.sources ||
          []
      );

      setGrounded(
        Boolean(
          data.data?.grounded
        )
      );
    } catch (error) {
      setError(
        error.message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-violet-50 p-5 shadow-sm dark:border-indigo-900/60 dark:from-indigo-950/30 dark:to-violet-950/20">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <BrainCircuit className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Ask Your Study Material
          </h2>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Ask a question and AI
            will search your notes
            and supported uploaded
            study documents.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleAsk}
        className="mt-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"

            value={question}

            onChange={(
              event
            ) =>
              setQuestion(
                event.target
                  .value
              )
            }

            placeholder="Example: What does my material say about normalization?"

            maxLength={1000}

            className="min-w-0 flex-1 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          />

          <button
            type="submit"

            disabled={loading}

            className="btn-primary flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed"
          >
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}

            {loading
              ? "Searching..."
              : "Ask AI"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
          {error}
        </div>
      )}

      {answer && (
        <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />

            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              AI Answer
            </h3>

            <span
              className={`ml-auto rounded-full px-2.5 py-1 text-xs font-semibold ${
                grounded
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                  : "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
              }`}
            >
              {grounded
                ? "From your material"
                : "Not found"}
            </span>
          </div>

          <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-700 dark:text-slate-300">
            {answer}
          </p>

          {sources.length >
            0 && (
            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Sources
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {sources.map(
                  (
                    source,
                    index
                  ) => {
                    const isFile =
                      source.sourceType ===
                      "attachment";

                    return (
                      <span
                        key={`${source.noteId}-${source.sourceType}-${source.sourceName}-${index}`}
                        className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300"
                      >
                        {isFile ? (
                          <FileText className="h-3.5 w-3.5" />
                        ) : (
                          <BookOpen className="h-3.5 w-3.5" />
                        )}

                        {source.sourceName ||
                          source.noteTitle}
                      </span>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default NotesAI;