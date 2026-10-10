import ModuleForm from "../ui/ModuleForm";
import { Save, LoaderCircle } from "lucide-react";

function NoteForm({
  form,
  error,
  confirmDiscard,
  handleChange,
  handleSubmit,
  attachment,
  handleAttachmentChange,
  editId,
  submitting,
  resetForm,
  isFormOpen,
  setIsFormOpen,
  formSectionRef,
  titleInputRef,
  courses,
}) {
  return (
    <>
      <ModuleForm
        title={editId ? "Edit Note" : "Create Note"}
        description={editId ? "Update your note details." : "Add a note to your study plan."}
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
            <label
              htmlFor="note-title"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Note Title <span className="text-red-600">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="note-title"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter note title"
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
              required
            />
          </div>

          <div>
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
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
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

          <div>
            <label
              htmlFor="note-content"
              className="text-sm font-semibold text-slate-700 dark:text-slate-300"
            >
              Note Content <span className="text-red-600">*</span>
            </label>
            <textarea
              id="note-content"
              name="content"
              value={form.content}
              onChange={handleChange}
              placeholder="Write your note here..."
              rows="8"
              className="mt-2 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder-slate-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-500"
              required
            />
          </div>

          <div>
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

          <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition focus:outline-none focus:ring-4 disabled:cursor-not-allowed"
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

            <button
              type="button"
              data-reset-form disabled={submitting} onClick={resetForm}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/60"
            >
              {editId ? "Cancel Edit" : isFormOpen ? "Cancel" : "Clear Form"}
            </button>
          </div>
        </form>
      </ModuleForm>
    </>
  );
}

export default NoteForm;
