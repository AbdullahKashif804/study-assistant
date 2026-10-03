import { LoaderCircle, FileText } from "lucide-react";
import NoteCard from "./NoteCard";

function NotesList({
  loading,
  search,
  notes = [],
  openCreateForm,
  getCardStyle,
  openMenuId,
  setOpenMenuId,
  deletingId,
  handleEdit,
  handleDelete,
  formatDate,
}) {
  if (loading) {
    return (
      <div className="flex min-h-72 items-center justify-center rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading notes...</p>
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center dark:border-slate-700 dark:bg-slate-900">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-slate-800">
  <FileText className="h-7 w-7 text-blue-600" />
</div>
        <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
          {search ? "No matching notes found" : "No notes found"}
        </h3>
        <p className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {search
            ? "Try searching with another title or keyword"
            : "Create your first note to start organizing your study material."}
        </p>

        {!search && (
          <button
            type="button"
            onClick={openCreateForm}
            className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 focus:ring-offset-2 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:focus:ring-indigo-950/50 dark:focus:ring-offset-slate-900"
          >
            Create First Note
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {notes.map((note, index) => (
        <NoteCard
          key={note._id || index}
          note={note}
          cardStyle={getCardStyle ? getCardStyle(index) : undefined}
          openMenuId={openMenuId}
          setOpenMenuId={setOpenMenuId}
          deletingId={deletingId}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
}

export default NotesList;