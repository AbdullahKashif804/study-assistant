import { useEffect, useRef } from "react";
import {
  CalendarDays,
  ClipboardCheck,
  MoreVertical,
  Pencil,
  Trash2,
  LoaderCircle,
} from "lucide-react";

function QuizList({
  quizzes = [],
  fetching,
  getQuizStatus,
  formatDate,
  statusStyles = {},
  openMenuId,
  setOpenMenuId,
  handleEdit,
  deletingId,
  handleDelete,
}) {
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }

    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuId, setOpenMenuId]);

  if (fetching) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-3">
        <LoaderCircle className="h-7 w-7 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading quizzes...</p>
      </div>
    );
  }

  if (!quizzes.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
        <div className="mb-4 rounded-2xl bg-violet-50 p-4 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
          <ClipboardCheck size={30} />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No quizzes found</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Create your first quiz or change your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {quizzes.map((quiz) => {
        const status = getQuizStatus ? getQuizStatus(quiz) : quiz.status;
        const isMenuOpen = openMenuId === quiz._id;
        const isDeleting = deletingId === quiz._id;

        return (
          <article
            key={quiz._id}
            className="relative p-4 transition-colors hover:bg-slate-50/80 sm:p-5 dark:hover:bg-slate-800/40"
          >
            <div className="flex items-start gap-4">
              <div className="hidden rounded-full bg-violet-50 p-3 text-violet-600 sm:block dark:bg-violet-950/50 dark:text-violet-400">
                <ClipboardCheck size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                      {quiz.title}
                    </h2>

                    {quiz.course && (
                      <p className="mt-1 truncate text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {quiz.course.title}
                        {quiz.course.courseCode && ` (${quiz.course.courseCode})`}
                      </p>
                    )}

                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <CalendarDays size={15} />
                      <span>
                        Due {formatDate ? formatDate(quiz.dueDate) : quiz.dueDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="text-right">
                      <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                            statusStyles[status] || "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
                        }`}
                      >
                        {status}
                      </span>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                        Score: {quiz.obtainedMark ?? "—"}/{quiz.totalMark}
                      </p>
                    </div>

                    <div className="relative" ref={isMenuOpen ? menuRef : null}>
                      <button
                        type="button"
                        aria-label="Quiz options"
                        aria-expanded={isMenuOpen}
                        aria-haspopup="true"
                        onClick={() =>
                          setOpenMenuId((currentId) =>
                            currentId === quiz._id ? null : quiz._id
                          )
                        }
                        className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:hover:bg-slate-800 dark:hover:text-slate-200 dark:focus:ring-offset-slate-900"
                      >
                        <MoreVertical size={19} />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-10 z-30 w-36 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                          <button
                            type="button"
                            onClick={() => {
                              setOpenMenuId(null);
                              handleEdit(quiz);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <Pencil size={16} />
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => {
                              setOpenMenuId(null);
                              handleDelete(quiz._id);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                          >
                            <Trash2 size={16} />
                            {isDeleting ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export default QuizList;