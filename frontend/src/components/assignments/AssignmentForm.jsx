import ModuleForm from "../ui/ModuleForm";
import { Plus, Edit3, LoaderCircle } from "lucide-react";

function AssignmentForm({
  form,
  error,
  confirmDiscard,
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
    <ModuleForm
        title={editId ? "Edit Assignment" : "Create Assignment"}
        description={editId ? "Update your assignment details." : "Add a assignment to your study plan."}
        isFormOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        formSectionRef={formSectionRef}
        titleInputRef={titleInputRef}
        submitting={submitting}
        error={error}
        confirmDiscard={confirmDiscard}
        attachment={attachment}
      >
      <form onSubmit={handleSubmit} className="module-fields space-y-4 p-5">
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
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:focus:ring-indigo-500"
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
            className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:focus:ring-indigo-500"
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
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:focus:ring-indigo-500"
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
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition disabled:opacity-60 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:focus:ring-indigo-500"
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
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:focus:ring-indigo-500"
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
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:focus:ring-indigo-500"
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
            className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-950 dark:focus:ring-indigo-500"
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
            className="btn-primary flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold shadow-sm transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed"
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

            <button
              type="button"
              data-reset-form disabled={submitting} onClick={handleCancel}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              {editId || isFormOpen ? "Cancel" : "Clear Form"}
            </button>
        </div>
      </form>
    </ModuleForm>
  );
}

export default AssignmentForm;
