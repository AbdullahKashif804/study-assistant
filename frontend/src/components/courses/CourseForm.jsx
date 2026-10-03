import { BookOpen, X } from "lucide-react";

function CourseForm({
  form,
  handleChange,
  handleSubmit,
  attachment,
  handleAttachmentChange,
  editId,
  submitting,
  resetForm,
  isFormOpen,
  formSectionRef,
  titleInputRef,
  setIsFormOpen,
}) {
  return (
    <>
      {isFormOpen && (
        <button
          type="button"
          aria-label="Close course form"
          onClick={() => setIsFormOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 dark:bg-slate-950/70 xl:hidden"
        />
      )}
      <aside
        ref={formSectionRef}
        className={`${
          isFormOpen
            ? "fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-100 dark:bg-slate-950 p-4"
            : "hidden"
        } xl:sticky xl:top-6 xl:z-auto xl:block xl:max-h-[calc(100vh-3rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain xl:bg-transparent xl:p-0`}
      >
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:max-w-none"
        >
          {/* FORM HEADER */}
          <div className="flex items-start justify-between border-b border-slate-200 p-5 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-violet-100 p-2 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                <BookOpen size={21} />
              </div>

              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                  {editId ? "Edit Course" : "Create New Course"}
                </h2>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {editId
                    ? "Update your course information."
                    : "Add a course to your study plan."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300 xl:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* FORM BODY */}
          <div className="space-y-4 p-5">
            {/* TITLE */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Course Title <span className="text-red-500">*</span>
              </label>

              <input
                ref={titleInputRef}
                name="title"
                type="text"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter course title"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
              />
            </div>

            {/* CODE */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Course Code <span className="text-red-500">*</span>
              </label>

              <input
                name="courseCode"
                type="text"
                value={form.courseCode}
                onChange={handleChange}
                placeholder="Example: CS101"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
              />
            </div>

            {/* SEMESTER + INSTRUCTOR */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Semester <span className="text-red-500">*</span>
                </label>

                <select
                  name="semester"
                  value={form.semester}
                  onChange={handleChange}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
                >
                  <option value="" className="dark:bg-slate-900 dark:text-slate-400">
                    Select semester
                  </option>
                  <option value="1" className="dark:bg-slate-900 dark:text-white">
                    Semester 1
                  </option>
                  <option value="2" className="dark:bg-slate-900 dark:text-white">
                    Semester 2
                  </option>
                  <option value="3" className="dark:bg-slate-900 dark:text-white">
                    Semester 3
                  </option>
                  <option value="4" className="dark:bg-slate-900 dark:text-white">
                    Semester 4
                  </option>
                  <option value="5" className="dark:bg-slate-900 dark:text-white">
                    Semester 5
                  </option>
                  <option value="6" className="dark:bg-slate-900 dark:text-white">
                    Semester 6
                  </option>
                  <option value="7" className="dark:bg-slate-900 dark:text-white">
                    Semester 7
                  </option>
                  <option value="8" className="dark:bg-slate-900 dark:text-white">
                    Semester 8
                  </option>
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Instructor <span className="text-red-500">*</span>
                </label>

                <input
                  name="instructor"
                  type="text"
                  value={form.instructor}
                  onChange={handleChange}
                  placeholder="Instructor name"
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
                />
              </div>
            </div>

            {/* STATUS */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Status
              </label>

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                disabled={!editId}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50 dark:disabled:bg-slate-900 dark:disabled:text-slate-500"
              >
                <option value="Active" className="dark:bg-slate-900 dark:text-white">
                  Active
                </option>
                <option value="Completed" className="dark:bg-slate-900 dark:text-white">
                  Completed
                </option>
              </select>

              {!editId && (
                <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                  New courses automatically start as Active.
                </p>
              )}
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                Description <span className="text-red-500">*</span>
              </label>

              <textarea
                name="description"
                rows="5"
                value={form.description}
                onChange={handleChange}
                placeholder="Enter course description..."
                className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
              />
            </div>

            {/* ATTACHMENT */}
            <div>
              <label
                htmlFor="course-attachment"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Attachment
              </label>

              <input
                type="file"
                id="course-attachment"
                accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png,.webp"
                onChange={handleAttachmentChange}
                className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm text-slate-600 file:mr-4 file:border-0 file:bg-slate-100 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-slate-700 hover:file:bg-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-slate-200 dark:hover:file:bg-slate-700"
              />

              {attachment && (
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Selected: {attachment.name}
                </p>
              )}
            </div>

            {/* BUTTONS */}
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:focus:ring-indigo-950/50"
              >
                {submitting
                  ? "Saving..."
                  : editId
                  ? "Update Course"
                  : "Save Course"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/60"
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

export default CourseForm;