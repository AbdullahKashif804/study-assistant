import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect } from "react";

export default function Pagination({ currentPage = 1, totalPages = 1,
  totalItems = 0, setCurrentPage, itemLabel = "record" }) {
  const pages = Math.max(1, totalPages);
  const page = Math.max(1, Math.min(currentPage, pages));
  useEffect(() => {
    if (setCurrentPage && currentPage !== page) setCurrentPage(page);
  }, [currentPage, page, setCurrentPage]);
  return (
    <nav aria-label={`${itemLabel} pagination`} className="module-pagination">
      <p className="text-sm text-slate-500 dark:text-slate-400" aria-live="polite">
        {totalItems === 0 ? `No ${itemLabel}s to display` :
          `Page ${page} of ${pages} · ${totalItems} ${itemLabel}${totalItems === 1 ? "" : "s"}`}
      </p>
      {setCurrentPage && pages > 1 && (
        <div className="flex items-center justify-between gap-2 sm:justify-start">
          <button type="button" className="pagination-button" disabled={page <= 1}
            onClick={() => setCurrentPage(page - 1)}>
            <ChevronLeft size={16} aria-hidden="true" /> Previous
          </button>
          <span aria-current="page" className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white">{page}</span>
          <button type="button" className="pagination-button" disabled={page >= pages}
            onClick={() => setCurrentPage(page + 1)}>
            Next <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}
    </nav>
  );
}
