import {
  ClipboardList,
  BookOpen,
  MoreVertical,
  Pencil,
  Trash2,
  CalendarDays,
  Paperclip,
  Folder,
  Code2,
  LoaderCircle,
} from "lucide-react";

function ProjectList({
  projects,
  fetching,
  openMenuId,
  setOpenMenuId,
  deletingId,
  handleEdit,
  handleDelete,
  statusStyles,
  formatDate,
  formatTechnologies,
}) {
  return (
    <>
      {fetching ? (
        <div className="flex min-h-72 flex-col items-center justify-center gap-3">
          <LoaderCircle className="h-7 w-7 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Loading projects...
          </p>
        </div>
      ) : projects.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
          <div className="mb-4 rounded-2xl bg-violet-50 p-4 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
            <Folder size={30} />
          </div>
          <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            No projects found
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Create your first project or change the filters.
          </p>
        </div>
      ) : (
        <div>
          {projects.map((project) => (
            <article
              key={project._id}
              className="relative border-b border-slate-100 p-5 transition-colors hover:bg-slate-50 sm:p-6 dark:border-slate-800 dark:hover:bg-slate-800/40"
            >
              <div className="flex items-start gap-4">
                <div className="hidden rounded-full bg-blue-50 p-3 text-blue-600 sm:block dark:bg-blue-950/60 dark:text-blue-400">
                  <Code2 size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                        {project.title}
                      </h2>
                      <p className="mt-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                        {project.course?.title} ({project.course?.courseCode})
                      </p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="text-right">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                            statusStyles[project.status] ||
                            statusStyles["In Progress"]
                          }`}
                        >
                          {project.status || "In Progress"}
                        </span>
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMenuId((currentId) =>
                              currentId === project._id ? null : project._id
                            )
                          }
                          className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        >
                          <MoreVertical size={19} />
                        </button>
                        {openMenuId === project._id && (
                          <div className="absolute right-0 top-10 z-30 w-36 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                            <button
                              type="button"
                              onClick={() => handleEdit(project)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
                            >
                              <Pencil size={16} />
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={deletingId === project._id}
                              onClick={() => handleDelete(project._id)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                            >
                              <Trash2 size={16} />
                              {deletingId === project._id
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {project.description}
                  </p>

                  {project.technologies && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {formatTechnologies(project.technologies)
                        .split(",")
                        .map((technology, index) => (
                          <span
                            key={index}
                            className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {technology.trim()}
                          </span>
                        ))}
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2">
                      <CalendarDays size={15} />
                      <span>Due {formatDate(project.dueDate)}</span>
                    </div>

                    <div>
                      Marks:{" "}
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {project.obtainedMark ?? "—"}/{project.totalMark}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {project.attachment && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-violet-100 p-2 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
                      <Paperclip size={17} />
                    </div>

                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                      {project.attachment.originalName || "Attachment"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        project.attachment.url,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    className="shrink-0 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500"
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

export default ProjectList;