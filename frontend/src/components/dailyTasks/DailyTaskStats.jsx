function StatCard({
  title,
  value,
  subtitle,
  icon,
  iconClass,
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-4">
        <div className={`rounded-full p-4 ${iconClass}`}>
          {icon}
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {title}
          </p>

          <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>
    </article>
  );
}

export default StatCard;