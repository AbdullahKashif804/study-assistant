import React, { useEffect, useRef } from "react";
import {
  CalendarDays,
  ClipboardCheck,
  MoreVertical,
  Pencil,
  Trash2,
  LoaderCircle,
} from "lucide-react";

// Individual Task Item
const TaskItem = ({
  task,
  updatingTaskId,
  handleToggleComplete,
  priorityStyles = {},
  openMenuId,
  setOpenMenuId,
  handleEdit,
  deletingId,
  handleDelete,
  formatDate,
}) => {
  const menuRef = useRef(null);
  const isMenuOpen = openMenuId === task._id;
  const isCompleted = task.status === "Completed";
  const isUpdating = updatingTaskId === task._id;
  const isDeleting = deletingId === task._id;

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        if (isMenuOpen) setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen, setOpenMenuId]);

  return (
    <article className="relative border-b border-slate-100 p-4 last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 sm:p-5 transition-colors">
      <div className="flex items-start gap-4">
        <input
          id={`task-${task._id}`}
          type="checkbox"
          checked={isCompleted}
          disabled={isUpdating}
          onChange={() => handleToggleComplete(task)}
          className="mt-1 h-5 w-5 cursor-pointer accent-indigo-600 dark:accent-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <label
                htmlFor={`task-${task._id}`}
                className={`cursor-pointer text-base font-semibold transition-colors ${
                  isCompleted
                    ? "text-slate-400 line-through dark:text-slate-500"
                    : "text-slate-900 dark:text-slate-100"
                }`}
              >
                {task.title}
              </label>

              {task.description && (
                <p
                  className={`mt-1 text-sm ${
                    isCompleted
                      ? "text-slate-400 line-through dark:text-slate-500"
                      : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {task.description}
                </p>
              )}

              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <CalendarDays size={15} />
                <span>
                  {formatDate ? formatDate(task.taskDate) : task.taskDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                  priorityStyles[task.priority] ||
                  priorityStyles.Medium ||
                  "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"
                }`}
              >
                {task.priority || "Medium"}
              </span>

              {/* Action Menu Dropdown */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenuId((currentId) =>
                      currentId === task._id ? null : task._id
                    )
                  }
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                  aria-label="Task options"
                >
                  <MoreVertical size={19} />
                </button>

                {isMenuOpen && (
                  <div className="absolute right-0 top-10 z-30 w-36 rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800 dark:shadow-slate-950/50">
                    <button
                      type="button"
                      onClick={() => {
                        setOpenMenuId(null);
                        handleEdit(task);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/60 transition-colors"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={() => handleDelete(task._id)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
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
};

// Main List Component
function DailyTaskList({
  tasks = [],
  fetching = false,
  updatingTaskId = null,
  handleToggleComplete,
  priorityStyles = {},
  openMenuId = null,
  setOpenMenuId,
  handleEdit,
  deletingId = null,
  handleDelete,
  formatDate,
}) {
  if (fetching) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-3">
        <LoaderCircle className="h-7 w-7 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Loading daily tasks...
        </p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
        <div className="mb-4 rounded-2xl bg-violet-50 p-4 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400">
          <ClipboardCheck size={30} />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          No tasks found
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Create your first daily task or change the filters.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          updatingTaskId={updatingTaskId}
          handleToggleComplete={handleToggleComplete}
          priorityStyles={priorityStyles}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          handleEdit={handleEdit}
          deletingId={deletingId}
          handleDelete={handleDelete}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
}

export default DailyTaskList;