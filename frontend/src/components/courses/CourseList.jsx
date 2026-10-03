import React, { useEffect, useRef } from "react";
import {
  BookOpen,
  GraduationCap,
  MoreVertical,
  Pencil,
  Trash2,
  Paperclip,
  LoaderCircle,
} from "lucide-react";

const statusStyles = {
  Active:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/50 dark:text-emerald-400 dark:ring-emerald-500/30",
  Completed:
    "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/50 dark:text-blue-400 dark:ring-blue-500/30",
};

function CourseList({
  courses = [],
  fetching,
  openMenuId,
  setOpenMenuId,
  deletingId,
  handleEdit,
  handleDelete,
}) {
  const menuRef = useRef(null);

  // Close open dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    if (openMenuId !== null) {
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
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading courses...
        </p>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
        <div className="mb-4 rounded-2xl bg-violet-50 p-4 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
          <GraduationCap size={30} />
        </div>
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          No courses found
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Create your first course or change your search filters.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
      {courses.map((course) => (
        <article
          key={course._id}
          className="relative p-4 transition hover:bg-slate-50 dark:hover:bg-slate-800/40 sm:p-5"
        >
          <div className="flex items-start gap-4">
            {/* Course Icon */}
            <div className="hidden rounded-full bg-violet-100 p-3 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400 sm:block">
              <BookOpen size={22} />
            </div>

            {/* Course Details */}
            <div className="min-w-0 flex-1">
              {/* Header: Title & Actions */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
                    {course.title}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-medium text-slate-700 dark:text-slate-300">
                      {course.courseCode}
                    </span>
                    <span>•</span>
                    <span>Instructor: {course.instructor}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>Semester {course.semester}</span>
                  </div>
                </div>

                {/* Status Badge (Desktop) & Menu */}
                <div className="flex items-center gap-3">
                  <span
                    className={`hidden rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset sm:inline-flex ${
                      statusStyles[course.status] || statusStyles.Active
                    }`}
                  >
                    {course.status || "Active"}
                  </span>

                  <div
                    className="relative"
                    ref={openMenuId === course._id ? menuRef : null}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenuId((currentId) =>
                          currentId === course._id ? null : course._id
                        )
                      }
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                      aria-label="Options"
                    >
                      <MoreVertical size={19} />
                    </button>

                    {openMenuId === course._id && (
                      <div className="absolute right-0 top-10 z-30 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:shadow-slate-950/50">
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            handleEdit(course);
                          }}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/60"
                        >
                          <Pencil size={16} />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === course._id}
                          onClick={() => handleDelete(course._id)}
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        >
                          <Trash2 size={16} />
                          {deletingId === course._id
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Badge (Mobile) */}
              <span
                className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset sm:hidden ${
                  statusStyles[course.status] || statusStyles.Active
                }`}
              >
                {course.status || "Active"}
              </span>

              {/* Description */}
              {course.description && (
                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {course.description}
                </p>
              )}

              {/* Attachment Section */}
              {course.attachment && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-violet-100 p-2 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
                      <Paperclip size={17} />
                    </div>
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
                      {course.attachment.originalName}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      window.open(
                        course.attachment.url,
                        "_blank",
                        "noopener,noreferrer"
                      )
                    }
                    className="shrink-0 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    View
                  </button>
                </div>
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

export default CourseList;