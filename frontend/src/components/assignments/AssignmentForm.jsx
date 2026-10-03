import { X, Plus, Edit3, LoaderCircle } from "lucide-react";

function AssignmentForm({
  form,
  handleChange,
  handleSubmit,
  handleAttachmentChange,
  attachment,
  editId,
  submitting,
  handleCancel,
  isFormOpen,
  formSectionRef,
  titleInputRef,
  setIsFormOpen,
  courses = [],
}) {
  return (
    <section
      ref={formSectionRef}
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-md transform overflow-y-auto overscroll-contain bg-white p-6 shadow-2xl transition-transform duration-300 ease-in-out dark:bg-slate-900 xl:static xl:z-0 xl:w-auto xl:max-w-none xl:transform-none xl:overflow-visible xl:overscroll-auto xl:rounded-2xl xl:border xl:border-slate-200 xl:shadow-sm dark:xl:border-slate-800 ${
        isFormOpen ? "translate-x-0" : "translate-x-full xl:translate-x-0"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {editId ? "Edit Assignment" : "Create Assignment"}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {editId
              ? "Update assignment details and marks."
              : "Add a new assignment to track your progress."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsFormOpen(false)}
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 xl:hidden dark:hover:bg-slate-800 dark:hover:text-slate-300"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            ref={titleInputRef}
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Calculus Midterm Prep"
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:focus:ring-indigo-950/50"
          />
        </div>

        {/* Course Select */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Course <span className="text-red-500">*</span>
          </label>
          <select
            name="course"
            value={form.course}
            onChange={handleChange}
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:focus:ring-indigo-950/50"
          >
            <option value="" className="dark:bg-slate-900">
              Select a Course
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
        </div>

        {/* Due Date & Status Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Due Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dueDate"
              value={form.dueDate}
              onChange={handleChange}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:focus:ring-indigo-950/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              disabled={!editId}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition disabled:opacity-60 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:focus:ring-indigo-950/50"
            >
              <option value="Pending" className="dark:bg-slate-900">
                Pending
              </option>
              <option value="Submitted" className="dark:bg-slate-900">
                Submitted
              </option>
              <option value="Completed" className="dark:bg-slate-900">
                Completed
              </option>
              <option value="Graded" className="dark:bg-slate-900">
                Graded
              </option>
            </select>
          </div>
        </div>

        {/* Total & Obtained Marks Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Total Marks <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="totalMark"
              value={form.totalMark}
              onChange={handleChange}
              placeholder="100"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:focus:ring-indigo-950/50"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Obtained Marks
            </label>
            <input
              type="number"
              name="obtainedMark"
              value={form.obtainedMark}
              onChange={handleChange}
              placeholder="Optional"
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:focus:ring-indigo-950/50"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={3}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Add task specifications or submission notes..."
            className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:focus:ring-indigo-950/50"
          />
        </div>

        {/* File Attachment */}
        <div>
          <label
            htmlFor="assignment-attachment"
            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Attachment
          </label>
          <input
            type="file"
            id="assignment-attachment"
            onChange={handleAttachmentChange}
            className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-slate-100 file:px-4 file:py-2.5 file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-slate-200 dark:hover:file:bg-slate-700"
          />

          {attachment && (
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Selected: {attachment.name}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:focus:ring-indigo-950/50"
          >
            {submitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : editId ? (
              <>
                <Edit3 className="h-4 w-4" />
                Update
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Create
              </>
            )}
          </button>

          {isFormOpen && (
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default AssignmentForm;