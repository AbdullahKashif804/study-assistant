import DashboardHeader from "../dashboard/DashboardHeader";
import DashboardSidebar from "../dashboard/DashboardSidebar";

export default function ModuleLayout({ children, isSidebarOpen, setIsSidebarOpen }) {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
      <DashboardSidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      <DashboardHeader setIsSidebarOpen={setIsSidebarOpen} />
      <main className="workspace-content">{children}</main>
    </div>
  );
}

export function ModuleColumns({ children }) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.85fr)] xl:grid-cols-[minmax(0,1fr)_400px]">
      {children}
    </div>
  );
}

export function ModuleRecords({ title, children, pagination }) {
  return (
    <section aria-label={title} className="module-records overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="border-b border-slate-200 px-5 py-4 text-lg font-bold text-slate-900 dark:border-slate-800 dark:text-slate-100">All {title}</h2>
      <div className="p-4 sm:p-5">{children}</div>
      {pagination}
    </section>
  );
}
