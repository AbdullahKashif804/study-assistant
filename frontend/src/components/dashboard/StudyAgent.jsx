import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import {
  BrainCircuit,
  LoaderCircle,
  Send,
  Sparkles,
} from "lucide-react";

const AI_API_URL =
  "http://localhost:5000/api/ai";

function StudyAgent() {
  const [
    question,
    setQuestion,
  ] = useState("");

  const [
    answer,
    setAnswer,
  ] = useState("");

  const [
    toolsUsed,
    setToolsUsed,
  ] = useState([]);

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

      setToolsUsed([]);

      const token =
        localStorage.getItem(
          "token"
        );

      const response =
        await fetch(
          `${AI_API_URL}/study-agent`,
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
            "Failed to run study agent"
        );
      }

      setAnswer(
        data.data?.answer ||
          ""
      );

      setToolsUsed(
        data.data?.toolsUsed ||
          []
      );
    } catch (error) {
      setError(
        error.message
      );
    } finally {
      setLoading(false);
    }
  }

  const suggestions = [
    "What should I study today?",
    "What work is most urgent this week?",
    "Do I have any overdue work?",
    "Help me plan my academic workload.",
  ];

  return (
    <section className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-indigo-50 p-5 shadow-sm dark:border-indigo-900/60 dark:from-indigo-950/30 dark:via-slate-900 dark:to-indigo-950/20">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white">
          <BrainCircuit className="h-5 w-5" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              AI Study Planner
            </h2>

            <span className="rounded-full bg-indigo-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              Agent
            </span>
          </div>

          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
            Ask about your workload,
            deadlines, tasks, quizzes,
            projects, or study material.
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map(
          (suggestion) => (
            <button
              key={suggestion}
              type="button"

              onClick={() =>
                setQuestion(
                  suggestion
                )
              }

              className="rounded-full border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-50 dark:border-indigo-900/60 dark:bg-slate-900 dark:text-indigo-300 dark:hover:bg-indigo-950/40"
            >
              {suggestion}
            </button>
          )
        )}
      </div>

      <form
        onSubmit={handleAsk}
        className="mt-5"
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <textarea
            value={question}

            onChange={(
              event
            ) =>
              setQuestion(
                event.target
                  .value
              )
            }

            placeholder="Example: What should I focus on today based on my deadlines?"

            maxLength={1500}

            rows={3}

            className="min-h-24 min-w-0 flex-1 resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          />

          <button
            type="submit"

            disabled={loading}

            className="btn-primary flex items-center justify-center gap-2 self-stretch rounded-xl px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed sm:self-end"
          >
            {loading ? (
              <LoaderCircle className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}

            {loading
              ? "Planning..."
              : "Ask Agent"}
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
            <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />

            <h3 className="font-bold text-slate-900 dark:text-slate-100">
              Recommended Plan
            </h3>
          </div>

          <div className="mt-4 min-w-0 overflow-hidden text-sm leading-7 text-slate-700 dark:text-slate-300">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      h1: ({ children }) => (
        <h1 className="mb-4 mt-5 text-xl font-bold text-slate-900 first:mt-0 dark:text-white">
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2 className="mb-3 mt-5 text-lg font-bold text-indigo-700 first:mt-0 dark:text-indigo-300">
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3 className="mb-2 mt-4 text-base font-semibold text-slate-900 first:mt-0 dark:text-slate-100">
          {children}
        </h3>
      ),
      h4: ({ children }) => (
        <h4 className="mb-2 mt-3 font-semibold text-slate-900 dark:text-slate-100">
          {children}
        </h4>
      ),
      p: ({ children }) => (
        <p className="mb-3 leading-7 last:mb-0">
          {children}
        </p>
      ),
      strong: ({ children }) => (
        <strong className="font-bold text-slate-900 dark:text-slate-100">
          {children}
        </strong>
      ),
      ul: ({ children }) => (
        <ul className="mb-4 list-disc space-y-1 pl-6 marker:text-indigo-500">
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol className="mb-4 list-decimal space-y-1 pl-6 marker:text-indigo-500">
          {children}
        </ol>
      ),
      li: ({ children }) => (
        <li className="pl-1 leading-7">
          {children}
        </li>
      ),
      blockquote: ({ children }) => (
        <blockquote className="my-4 border-l-4 border-indigo-400 bg-indigo-50 px-4 py-2 italic dark:bg-indigo-950/30">
          {children}
        </blockquote>
      ),
      hr: () => (
        <hr className="my-5 border-slate-200 dark:border-slate-700" />
      ),
      table: ({ children }) => (
        <div className="my-4 w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
          <table className="w-full min-w-max border-collapse text-left text-sm">
            {children}
          </table>
        </div>
      ),
      thead: ({ children }) => (
        <thead className="bg-indigo-50 text-indigo-900 dark:bg-indigo-950/50 dark:text-indigo-200">
          {children}
        </thead>
      ),
      th: ({ children }) => (
        <th className="border-b border-r border-slate-200 px-4 py-3 font-semibold last:border-r-0 dark:border-slate-700">
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td className="border-b border-r border-slate-200 px-4 py-3 align-top last:border-r-0 dark:border-slate-700">
          {children}
        </td>
      ),
      a: ({ href, children }) => (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-blue-600 underline hover:text-blue-800 dark:text-blue-400"
        >
          {children}
        </a>
      ),
      code: ({ children, className }) => (
        <code
          className={`break-words rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-indigo-700 dark:bg-slate-800 dark:text-indigo-300 ${className || ""}`}
        >
          {children}
        </code>
      ),
      pre: ({ children }) => (
        <pre className="my-4 overflow-x-auto rounded-xl bg-slate-100 p-4 text-xs leading-6 dark:bg-slate-950">
          {children}
        </pre>
      ),
    }}
  >
    {answer}
  </ReactMarkdown>
</div>

          {toolsUsed.length >
            0 && (
            <div className="mt-5 border-t border-slate-200 pt-4 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Data checked
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {[
                  ...new Set(
                    toolsUsed
                  ),
                ].map((tool) => (
                  <span
                    key={tool}

                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  >
                    {tool
                      .replace(
                        /^get_/,
                        ""
                      )
                      .replace(
                        /^search_/,
                        ""
                      )
                      .replaceAll(
                        "_",
                        " "
                      )}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export default StudyAgent;