import ModuleForm from "../ui/ModuleForm";


function ProjectForm({
  form,
  error,
  confirmDiscard,
  handleChange,
  handleSubmit,
  attachment,
  handleAttachmentChange,
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
        title={editId ? "Edit Project" : "Create Project"}
        description={editId ? "Update your project details." : "Add a project to your study plan."}
        isFormOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        formSectionRef={formSectionRef}
        titleInputRef={titleInputRef}
        submitting={submitting}
        error={error}
        confirmDiscard={confirmDiscard}
        attachment={attachment}
      >
        <form
          onSubmit={handleSubmit}
          className="module-fields space-y-4 p-5"
        >

            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                ref={titleInputRef}
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter project title"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                rows="4"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter project description..."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                name="course"
                value={form.course}
                onChange={handleChange}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-indigo-500"
              >
                <option value="" className="dark:bg-slate-900">
                  Select a course
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
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Technologies <span className="text-red-500">*</span>
              </label>
              <input
                name="technologies"
                type="text"
                value={form.technologies}
                onChange={handleChange}
                placeholder="React, Node.js, MongoDB"
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-indigo-500"
              />
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Separate multiple technologies with commas.
              </p>
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
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:ring-indigo-500 [color-scheme:light] dark:[color-scheme:dark]"
                />
              </div>
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
                  placeholder="100"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-indigo-500"
                />
              </div>
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
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                disabled={!editId}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-indigo-500 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-indigo-500 dark:disabled:bg-slate-800/40 dark:disabled:text-slate-500"
              >
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
              {!editId && (
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  New projects automatically start as In Progress.
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="project-attachment"
                className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
              >
                Attachment
              </label>

              <input
                type="file"
                id="project-attachment"
                accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png,.webp"
                onChange={handleAttachmentChange}
                className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-slate-100 file:px-4 file:py-2.5 file:font-medium file:text-slate-700 hover:file:bg-slate-200 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-slate-200 dark:hover:file:bg-slate-700"
              />

              {attachment && (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Selected: {attachment.name}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary min-w-0 flex-1 rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed"
              >
                {submitting
                  ? "Saving..."
                  : editId
                  ? "Update Project"
                  : "Save Project"}
              </button>
              <button
                type="button"
                data-reset-form disabled={submitting} onClick={handleCancel}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Clear Form
              </button>
            </div>
        </form>
      </ModuleForm>
    </>
  );
}

export default ProjectForm;
