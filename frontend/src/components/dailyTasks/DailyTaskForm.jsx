import ModuleForm from "../ui/ModuleForm";


function DailyTaskForm({
  form,
  error,
  confirmDiscard,
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
      <ModuleForm
        title={editId ? "Edit Daily Task" : "Create Daily Task"}
        description={editId ? "Update your daily task details." : "Add a daily task to your study plan."}
        isFormOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        formSectionRef={formSectionRef}
        titleInputRef={titleInputRef}
        submitting={submitting}
        error={error}
        confirmDiscard={confirmDiscard}
      >
        <form
          onSubmit={handleSubmit}
          className="module-fields space-y-4 p-5"
        >


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
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-indigo-500"
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
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-indigo-500"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Task Date <span className="text-red-500">*</span>
                </label>
                <input
                  name="taskDate"
                  type="date"
                  value={form.taskDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-500 dark:[color-scheme:dark]"
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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-500"
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
              <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={form.status === "Completed"}
                  onChange={(event) =>
                    setForm((previousForm) => ({
                      ...previousForm,
                      status: event.target.checked ? "Completed" : "Pending",
                    }))
                  }
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950"
                />
                Mark task as completed
              </label>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary min-w-0 flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Saving..."
                  : editId
                  ? "Update Task"
                  : "Save Task"}
              </button>
              <button
                type="button"
                data-reset-form disabled={submitting} onClick={handleCancel}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/60"
              >
                Clear Form
              </button>
            </div>
        </form>
      </ModuleForm>
    </>
  );
}

export default DailyTaskForm;