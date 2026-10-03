import { ChevronLeft, ChevronRight } from "lucide-react";

function DailyTaskPagination({
  currentPage,
  totalPages,
  totalItems = 0,
  setCurrentPage,
}) {
  if (totalPages <= 1 && totalItems <= 0) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Showing page {currentPage} of {totalPages}
        {totalItems > 0 &&
          ` • ${totalItems} total task${totalItems === 1 ? "" : "s"}`}
      </p>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (currentPage > 1) {
                setCurrentPage(currentPage - 1);
              }
            }}
            disabled={currentPage === 1}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:focus:ring-indigo-950/50"
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <span className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white">
            {currentPage}
          </span>

          <button
            type="button"
            onClick={() => {
              if (currentPage < totalPages) {
                setCurrentPage(currentPage + 1);
              }
            }}
            disabled={currentPage === totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:focus:ring-indigo-950/50"
          >
            Next
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

export default DailyTaskPagination;