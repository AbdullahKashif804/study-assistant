import {
  ClipboardList,
  BookOpen,
  MoreVertical,
  Pencil,
  Trash2,
  CalendarDays,
  Paperclip,
  LoaderCircle,
} from "lucide-react";

function AssignmentList({
  assignments,
  fetching,
  openMenuId,
  setOpenMenuId,
  deletingId,
  handleEdit,
  handleDelete,
  statusStyles,
  isOverdue,
  formatDate,
}) {
  return (
    <>
      {fetching ? (
        <div className="flex min-h-72 flex-col items-center justify-center gap-3">
          <LoaderCircle className="h-7 w-7 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading assignments...
          </p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
          <div className="mb-4 rounded-2xl bg-indigo-50 p-4 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <ClipboardList size={30} />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            No assignments found
          </h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Create your first assignment or change the current search and filter
            options.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => (
            <article
              key={assignment._id}
              className="module-card"
            >
              <div className="flex items-start gap-4">
                <div className="hidden rounded-xl bg-indigo-50 p-3 text-indigo-600 sm:block dark:bg-indigo-950/60 dark:text-indigo-400">
                  <BookOpen size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                        {assignment.title}
                      </h2>
                      <p className="mt-1 text-sm font-medium text-indigo-600 dark:text-indigo-400">
                        {assignment.course?.title} ({assignment.course?.courseCode})
                      </p>
                    </div>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId((currentId) =>
                            currentId === assignment._id ? null : assignment._id
                          )
                        }
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        aria-label="Assignment options"

                          aria-expanded={openMenuId === assignment._id}
                        >
                        <MoreVertical size={19} />
                      </button>

                      {openMenuId === assignment._id && (
                        <div className="absolute right-0 top-10 z-20 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-800 dark:bg-slate-900">
                          <button
                            type="button"
                            onClick={() => handleEdit(assignment)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <Pencil size={16} />
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === assignment._id}
                            onClick={() => handleDelete(assignment._id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:text-red-400 dark:hover:bg-red-950/40"
                          >
                            <Trash2 size={16} />
                            {deletingId === assignment._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {assignment.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                        statusStyles[assignment.status] || statusStyles.Pending
                      }`}
                    >
                      {assignment.status}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        isOverdue(assignment)
                          ? "text-red-600 dark:text-red-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <CalendarDays size={15} />
                      Due {formatDate(assignment.dueDate)}
                    </span>

                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      Marks: {assignment.obtainedMark ?? "—"} /{" "}
                      {assignment.totalMark}
                    </span>
                  </div>
                </div>
              </div>

              {assignment.attachment && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-violet-100 p-2 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
                      <Paperclip size={17} />
                    </div>

                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                      {assignment.attachment.originalName || "Attachment"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        assignment.attachment.url,
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
            </article>
          ))}
        </div>
      )}
    </>
  );
}

export default AssignmentList;