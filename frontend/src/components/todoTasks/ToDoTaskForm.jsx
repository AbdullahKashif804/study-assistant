import ModuleForm from "../ui/ModuleForm";


function ToDoTaskForm({
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
        title={editId ? "Edit To-Do Task" : "Create To-Do Task"}
        description={editId ? "Update your to-do task details." : "Add a to-do task to your study plan."}
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
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-indigo-500"
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
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:ring-indigo-500"
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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-500 [color-scheme:light] dark:[color-scheme:dark]"
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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-indigo-500"
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
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
              >
                Clear Form
              </button>
            </div>
        </form>
      </ModuleForm>
    </>
  );
}

export default ToDoTaskForm;