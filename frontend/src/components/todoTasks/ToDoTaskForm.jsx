import { ClipboardList, X } from "lucide-react";

function ToDoTaskForm({
  form,
  setForm,
  handleChange,
  handleSubmit,
  editId,
  submitting,
  handleCancel,
  isFormOpen,
  formSectionRef,
  titleInputRef,
  setIsFormOpen,
}) {
  return (
    <>
      <aside
        ref={formSectionRef}
        className={`${
          isFormOpen
            ? "fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-100 p-4 dark:bg-slate-950"
            : "hidden"
        } xl:sticky xl:top-6 xl:z-auto xl:block xl:max-h-[calc(100vh-3rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain xl:bg-transparent xl:p-0`}
      >
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:max-w-none"
        >
          <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-100 p-2 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
                <ClipboardList size={21} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editId ? "Edit Task" : "Create New Task"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-200 xl:hidden"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                ref={titleInputRef}
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter task title"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-indigo-950"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Description
              </label>
              <textarea
                name="description"
                rows="5"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter task description (optional)"
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-indigo-950"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Due Date <span className="text-red-500">*</span>
                </label>
                <input
                  name="dueDate"
                  type="date"
                  value={form.dueDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-950 [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Priority
                </label>
                <select
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-950"
                >
                  <option value="Low" className="dark:bg-slate-900">
                    Low
                  </option>
                  <option value="Medium" className="dark:bg-slate-900">
                    Medium
                  </option>
                  <option value="High" className="dark:bg-slate-900">
                    High
                  </option>
                </select>
              </div>
            </div>
            {editId && (
              <label className="flex items-center gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <input
                  type="checkbox"
                  checked={form.status === "Completed"}
                  onChange={(event) =>
                    setForm((previousForm) => ({
                      ...previousForm,
                      status: event.target.checked ? "Completed" : "Pending",
                    }))
                  }
                  className="h-5 w-5 accent-indigo-600 dark:accent-indigo-500"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Mark task as completed
                </span>
              </label>
            )}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:focus:ring-indigo-950/50"
              >
                {submitting
                  ? "Saving..."
                  : editId
                  ? "Update Task"
                  : "Save Task"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Clear Form
              </button>
            </div>
          </div>
        </form>
      </aside>
    </>
  );
}

export default ToDoTaskForm;