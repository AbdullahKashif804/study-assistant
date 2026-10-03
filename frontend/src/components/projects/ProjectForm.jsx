import { Folder, X } from "lucide-react";

function ProjectForm({
  form,
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
          className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white shadow-sm xl:max-w-none dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-center justify-between border-b border-slate-200 p-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-100 p-2 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
                <Folder size={21} />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editId ? "Edit Project" : "Create New Project"}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 xl:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4 p-5">
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
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-indigo-950/50"
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
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none transition focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-indigo-950/50"
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
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-indigo-950/50"
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
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-indigo-950/50"
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
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:focus:ring-indigo-950/50 [color-scheme:light] dark:[color-scheme:dark]"
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
                  className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-indigo-950/50"
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
                className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder-slate-500 dark:focus:ring-indigo-950/50"
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
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-indigo-950/50 dark:disabled:bg-slate-800/40 dark:disabled:text-slate-500"
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
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:focus:ring-indigo-950/50"
              >
                {submitting
                  ? "Saving..."
                  : editId
                  ? "Update Project"
                  : "Save Project"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"
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

export default ProjectForm;