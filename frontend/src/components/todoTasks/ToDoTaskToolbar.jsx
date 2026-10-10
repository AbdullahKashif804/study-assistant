import { Plus, Search } from "lucide-react";

function ToDoTaskToolbar({
  busy = false,
  search,
  setSearch,
  dateFilter,
  setDateFilter,
  priorityFilter,
  setPriorityFilter,
  sortBy,
  setSortBy,
  handleNewTask,
}) {
  return (
    <>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
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
          disabled={busy}
          onClick={handleNewTask}
          className="btn-primary w-full shrink-0 md:w-auto inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition focus:ring-4"
        >
          <Plus size={18} />
          New Task
        </button>
      </div>

      <div className="module-toolbar">
        <div className="relative min-w-0 flex-1">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
          />
          <input aria-label="Search todotasks"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500"
          />
        </div>

        <input aria-label="date"
          type="date"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-500"
        />

        <select aria-label="priority"
          value={priorityFilter}
          onChange={(event) => setPriorityFilter(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-500"
        >
          <option value="">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select aria-label="Sort records"
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-500"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="due-date">Due Date</option>
        </select>
      </div>
    </>
  );
}

export default ToDoTaskToolbar;