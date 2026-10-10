import { Plus, Search, X } from "lucide-react";

function QuizToolbar({
  busy = false,
  search = "",
  setSearch,
  courseFilter = "",
  setCourseFilter,
  statusFilter = "",
  setStatusFilter,
  sortBy = "newest",
  setSortBy,
  courses = [],
  handleNewQuiz,
}) {

  return (
    <>
      {/* Top Header & Action */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            Quizzes
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your quizzes and track your scores.
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={handleNewQuiz}
          className="btn-primary w-full shrink-0 md:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-4"
        >
          <Plus size={18} />
          <span>New Quiz</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="module-toolbar">
        {/* Search Input */}
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none dark:text-slate-500"
          />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search quizzes..."
            aria-label="Search quizzes"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-9 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown Filters Group */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:flex lg:items-center">
          {/* Course Filter */}
          <select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            aria-label="Filter by course"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-500 lg:w-auto"
          >
            <option value="" className="dark:bg-slate-900 dark:text-slate-300">
              All Courses
            </option>
            {courses.map((course) => (
              <option
                key={course._id}
                value={course._id}
                className="dark:bg-slate-900 dark:text-white"
              >
                {course.title} {course.courseCode ? `(${course.courseCode})` : ""}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            aria-label="Filter by status"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-500 lg:w-auto"
          >
            <option value="" className="dark:bg-slate-900 dark:text-slate-300">
              All Statuses
            </option>
            <option value="Upcoming" className="dark:bg-slate-900 dark:text-white">
              Upcoming
            </option>
            <option value="Completed" className="dark:bg-slate-900 dark:text-white">
              Completed
            </option>
            <option value="Overdue" className="dark:bg-slate-900 dark:text-white">
              Overdue
            </option>
          </select>

          {/* Sorting */}
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
            aria-label="Sort quizzes"
            className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-500 lg:w-auto"
          >
            <option value="newest" className="dark:bg-slate-900 dark:text-white">
              Sort: Newest
            </option>
            <option value="oldest" className="dark:bg-slate-900 dark:text-white">
              Sort: Oldest
            </option>
            <option value="due-date" className="dark:bg-slate-900 dark:text-white">
              Sort: Due Date
            </option>
          </select>
        </div>
      </div>
    </>
  );
}

export default QuizToolbar;