import {
  CalendarDays,
  ClipboardList,
  MoreVertical,
  Pencil,
  Trash2,
  LoaderCircle,
} from "lucide-react";

function ToDoTaskList({
  tasks = [],
  fetching = false,
  updatingTaskId,
  handleToggleComplete,
  isOverdue,
  formatDate,
  priorityStyles = {},
  openMenuId,
  setOpenMenuId,
  handleEdit,
  deletingId,
  handleDelete,
}) {
  if (fetching) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-3">
        <LoaderCircle className="h-7 w-7 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading todo tasks...</p>
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
        <div className="mb-4 rounded-2xl bg-violet-50 p-4 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
          <ClipboardList size={30} />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">No tasks found</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Create your first task or change the filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const isCompleted = task.status === "Completed";
        const isTaskOverdue = isOverdue ? isOverdue(task) : false;
        const priority = task.priority || "Medium";

        return (
          <article
            key={task._id}
            className="module-card"
          >
            <div className="flex items-start gap-4">
              <input
                aria-label={`Mark ${task.title} as ${isCompleted ? "pending" : "completed"}`}
                type="checkbox"
                checked={isCompleted}
                disabled={updatingTaskId === task._id}
                onChange={() => handleToggleComplete(task)}
                className="mt-1 h-5 w-5 cursor-pointer accent-indigo-600 disabled:cursor-not-allowed"
              />

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2
                      className={`text-base font-semibold ${
                        isCompleted
                          ? "text-slate-400 line-through dark:text-slate-500"
                          : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {task.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">

                    <div className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenuId((currentId) =>
                            currentId === task._id ? null : task._id
                          )
                        }
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"

                          aria-label="task options"
                          aria-expanded={openMenuId === task._id}
                        >
                        <MoreVertical size={19} />
                      </button>

                      {openMenuId === task._id && (
                        <div className="absolute right-0 top-10 z-30 w-36 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                          <button
                            type="button"
                            onClick={() => {
                              handleEdit(task);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
                          >
                            <Pencil size={16} />
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === task._id}
                            onClick={() => handleDelete(task._id)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
                          >
                            <Trash2 size={16} />
                            {deletingId === task._id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>


                    {task.description && (
                      <p
                        className={`mt-3 line-clamp-2 text-sm leading-6 ${
                          isCompleted
                            ? "text-slate-400 line-through dark:text-slate-500"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {task.description}
                      </p>
                    )}
<div className="mt-4 flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                        priorityStyles[priority] || priorityStyles.Medium || "bg-slate-100 text-slate-700 ring-slate-200"
                      }`}
                    >
                      {priority}
                    </span>

                    <div
                      className={`flex flex-wrap items-center gap-2 text-xs ${
                        isTaskOverdue
                          ? "font-medium text-red-600 dark:text-red-400"
                          : "text-slate-500 dark:text-slate-400"
                      }`}
                    >
                      <CalendarDays size={15} />
                      Due {formatDate ? formatDate(task.dueDate) : task.dueDate}
                      {isTaskOverdue && <span>• Overdue</span>}
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

export default ToDoTaskList;