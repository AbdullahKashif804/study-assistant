import { Plus, Search } from "lucide-react";

function NotesToolbar({
  search,
  setSearch,
  sortOrder,
  setSortOrder,
  courseFilter,
  setCourseFilter,
  courses = [],
  notes = [],
  OpenCreateForm,
}) {
  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100">
            My Notes
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Create, edit and organize all your study notes.
          </p>
        </div>
        <button
          type="button"
          onClick={OpenCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:focus:ring-indigo-950/50"
        >
          <Plus className="h-5 w-5" />
          New Note
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="relative w-full sm:max-w-xl">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search notes by title or content..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
          />
        </div>

        <select
          value={courseFilter}
          onChange={(event) => setCourseFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
        >
          <option value="" className="dark:bg-slate-900">
            All Courses
          </option>

          {courses.map((course) => (
            <option
              key={course._id}
              value={course._id}
              className="dark:bg-slate-900"
            >
              {course.title}
            </option>
          ))}
        </select>

        <select
          value={sortOrder}
          onChange={(event) => setSortOrder(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
        >
          <option value="newest" className="dark:bg-slate-900">
            Newest first
          </option>
          <option value="oldest" className="dark:bg-slate-900">
            Oldest first
          </option>
        </select>
      </div>

      <div className="mb-4 mt-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            All Notes
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Showing {notes.length} of {notes.length} notes
          </p>
        </div>
      </div>
    </>
  );
}

export default NotesToolbar;