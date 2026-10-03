import { Plus, Search } from "lucide-react";

function ToDoTaskToolbar({
  search,
  setSearch,
  dateFilter,
  setDateFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  tasks,
  handleNewTask,
}) {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            To-Do Tasks
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your personal tasks and stay productive.
          </p>
        </div>
        <button
          type="button"
          onClick={handleNewTask}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900/50"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-950"
          />
        </div>

        <input
          type="date"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-950"
        />

        <select
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-950"
        >
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-950"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="due-date">Due Date</option>
        </select>
      </div>

      <div className="mb-4 mt-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            All To-Do Tasks
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Showing {tasks.length} of {tasks.length} tasks
          </p>
        </div>
      </div>
    </>
  );
}

export default ToDoTaskToolbar;