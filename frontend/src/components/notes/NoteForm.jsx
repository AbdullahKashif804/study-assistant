import { X, Save, LoaderCircle } from "lucide-react";

function NoteForm({
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
  courses,
}) {
  return (
    <>
      <aside
        ref={formSectionRef}
        className={`${
          isFormOpen
            ? "fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-slate-50 p-4 dark:bg-slate-950"
            : "hidden"
        } xl:static xl:z-auto xl:block xl:overflow-visible xl:bg-transparent xl:p-0`}
      >
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div className="flex items-start justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {editId ? "Edit Note" : "Create Note"}
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {editId
                  ? "Update the title or content of this note."
                  : "Write and save a new study note."}
              </p>
            </div>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 xl:hidden dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              aria-label="Close form"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-5">
            <label
              htmlFor="note-title"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Note Title
            </label>
            <input
              ref={titleInputRef}
              id="note-title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter note title"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
              required
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="note-course"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Course
            </label>
            <select
              id="note-course"
              name="course"
              value={form.course}
              onChange={handleChange}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
            >
              <option value="" className="dark:bg-slate-900">
                No Course
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

          <div className="mt-5">
            <label
              htmlFor="note-content"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Note Content
            </label>
            <textarea
              id="note-content"
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Write your note here..."
              rows="13"
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-950/50"
              required
            />
          </div>

          <div className="mt-5">
            <label
              htmlFor="note-attachment"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Attachment
            </label>
            <input
              type="file"
              id="note-attachment"
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

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:focus:ring-indigo-950/50"
          >
            {submitting ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin" />
                {editId ? "Updating Note..." : "Saving Note..."}
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                {editId ? "Update Note" : "Save Note"}
              </>
            )}
          </button>

          {editId && (
            <button
              type="button"
              onClick={resetForm}
              className="mt-3 w-full rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/60"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </aside>
    </>
  );
}

export default NoteForm;