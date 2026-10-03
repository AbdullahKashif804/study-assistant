import {
  FileText,
  MoreVertical,
  Pencil,
  Trash2,
  LoaderCircle,
  CalendarDays,
  Paperclip,
} from "lucide-react";

function NoteCard({
  note,
  cardStyle,
  openMenuId,
  setOpenMenuId,
  deletingId,
  handleEdit,
  handleDelete,
  formatDate,
}) {
  return (
    <article
      className={`relative rounded-2xl border border-t-4 border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 ${cardStyle.border}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${cardStyle.icon}`}
        >
          <FileText className="h-5 w-5" />
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenuId(openMenuId === note._id ? null : note._id)
            }
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            aria-label={`Open actions for ${note.title}`}
          >
            <MoreVertical className="h-5 w-5" />
          </button>
          {openMenuId === note._id && (
            <div className="absolute right-0 top-10 z-30 w-36 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <button
                type="button"
                onClick={() => handleEdit(note)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-slate-700 transition-colors hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              <button
                type="button"
                disabled={deletingId === note._id}
                onClick={() => handleDelete(note._id)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-red-950/40"
              >
                {deletingId === note._id ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {deletingId === note._id ? "Deleting" : "Delete"}
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="mt-5 wrap-break-word text-lg font-bold text-slate-900 dark:text-slate-100">
        {note.title}
      </h3>

      <p className="mt-3 min-h-24 wrap-break-word text-sm leading-6 text-slate-600 dark:text-slate-400">
        {(note.content || "").length > 160
          ? `${note.content.slice(0, 160)}...`
          : note.content}
      </p>

      {note.attachment && (
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg bg-violet-100 p-2 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400">
              <Paperclip size={17} />
            </div>

            <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-300">
              {note.attachment.originalName || "Attachment"}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              window.open(
                note.attachment.url,
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="shrink-0 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-700 dark:bg-violet-600 dark:hover:bg-violet-500"
          >
            View
          </button>
        </div>
      )}

      <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400">
        <CalendarDays className="h-4 w-4" />
        created {formatDate(note.createdAt)}
      </div>
    </article>
  );
}

export default NoteCard;