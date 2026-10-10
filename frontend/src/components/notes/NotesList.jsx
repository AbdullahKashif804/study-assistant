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
      <div className="flex min-h-72 items-center justify-center">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Loading notes...</p>
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center px-5 text-center">
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
          <button type="button" onClick={openCreateForm}
            className="btn-primary mt-4 rounded-xl px-4 py-2.5 text-sm font-semibold">
            Create Note
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
