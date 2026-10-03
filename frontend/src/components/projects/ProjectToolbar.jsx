import { Plus, Search } from "lucide-react";

function ProjectToolbar({
  search,
  setSearch,
  courseFilter,
  setCourseFilter,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  courses,
  projects,
  handleNewProject,
}) {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl dark:text-slate-100">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your academic and personal projects.
          </p>
        </div>
        <button
          type="button"
          onClick={handleNewProject}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:focus:ring-indigo-950/50"
        >
          <Plus size={18} />
          New Project
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title or description..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-indigo-950/50"
          />
        </div>

        <select
          value={courseFilter}
          onChange={(event) => setCourseFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-indigo-950/50"
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
              {course.title} ({course.courseCode})
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-indigo-950/50"
        >
          <option value="" className="dark:bg-slate-900">
            All Status
          </option>
          <option value="In Progress" className="dark:bg-slate-900">
            In Progress
          </option>
          <option value="Completed" className="dark:bg-slate-900">
            Completed
          </option>
          <option value="Graded" className="dark:bg-slate-900">
            Graded
          </option>
        </select>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-indigo-950/50"
        >
          <option value="newest" className="dark:bg-slate-900">
            Newest
          </option>
          <option value="oldest" className="dark:bg-slate-900">
            Oldest
          </option>
          <option value="due-soon" className="dark:bg-slate-900">
            Due Date
          </option>
        </select>
      </div>

      <div className="mb-4 mt-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            All Projects
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Showing {projects.length} of {projects.length} projects
          </p>
        </div>
      </div>
    </>
  );
}

export default ProjectToolbar;