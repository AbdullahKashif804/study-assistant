import ModuleForm from "../ui/ModuleForm";


function QuizForm({
  form,
  error,
  confirmDiscard,
  handleChange,
  handleSubmit,
  editId,
  submitting,
  handleCancel,
  isFormOpen,
  formSectionRef,
  titleInputRef,
  setIsFormOpen,
  courses,
}) {
  return (
    <>
      <ModuleForm
        title={editId ? "Edit Quiz" : "Create Quiz"}
        description={editId ? "Update your quiz details." : "Add a quiz to your study plan."}
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
          {/* Header */}


          {/* Form Controls */}
            {/* Title Field */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Quiz Title <span className="text-red-500">*</span>
              </label>
              <input
                ref={titleInputRef}
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter quiz title"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:ring-indigo-500"
              />
            </div>

            {/* Course Select Field */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                name="course"
                value={form.course}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-500"
              >
                <option value="" className="dark:bg-slate-900 dark:text-slate-400">
                  Select a course
                </option>
                {courses.map((course) => (
                  <option
                    key={course._id}
                    value={course._id}
                    className="dark:bg-slate-900 dark:text-white"
                  >
                    {course.title} ({course.courseCode})
                  </option>
                ))}
              </select>
            </div>

            {/* Due Date Field */}
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
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-500 dark:[color-scheme:dark]"
              />
            </div>

            {/* Marks Grid */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Total Marks <span className="text-red-500">*</span>
                </label>
                <input
                  name="totalMark"
                  type="number"
                  min="1"
                  value={form.totalMark}
                  onChange={handleChange}
                  placeholder="20"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Obtained Marks
                </label>
                <input
                  name="obtainedMark"
                  type="number"
                  min="0"
                  value={form.obtainedMark}
                  onChange={handleChange}
                  placeholder="Optional"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Status Banner */}
            <div className="rounded-xl bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              Quiz status is calculated automatically from the due date and obtained marks.
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary min-w-0 flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Saving..."
                  : editId
                    ? "Update Quiz"
                    : "Save Quiz"}
              </button>
              <button
                type="button"
                data-reset-form disabled={submitting} onClick={handleCancel}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Clear Form
              </button>
            </div>
        </form>
      </ModuleForm>
    </>
  );
}

export default QuizForm;