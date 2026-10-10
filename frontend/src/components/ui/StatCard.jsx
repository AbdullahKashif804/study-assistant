export default function StatCard({ title, value, subtitle, icon, iconClass }) {
  return (
    <article className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium leading-5 text-slate-500 dark:text-slate-400 sm:text-sm">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">{value}</p>
        </div>
        <div className={`shrink-0 rounded-xl p-2 sm:p-3 ${iconClass}`}>{icon}</div>
      </div>
      {subtitle && <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">{subtitle}</p>}
    </article>
  );
}
