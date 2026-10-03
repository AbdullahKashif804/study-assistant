import { Award, X } from "lucide-react";

function QuizForm({
  form,
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
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-100 p-2 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
                <Award size={21} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {editId ? "Edit Quiz" : "Create New Quiz"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 xl:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Controls */}
          <div className="space-y-4 p-5">
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
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:ring-indigo-950/50"
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
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-950/50"
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
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-950/50 dark:[color-scheme:dark]"
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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:ring-indigo-950/50"
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
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:ring-indigo-950/50"
                />
              </div>
            </div>

            {/* Status Banner */}
            <div className="rounded-xl bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
              Quiz status is calculated automatically from the due date and obtained marks.
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:focus:ring-indigo-950/50"
              >
                {submitting
                  ? "Saving..."
                  : editId
                    ? "Update Quiz"
                    : "Save Quiz"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
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

export default QuizForm;