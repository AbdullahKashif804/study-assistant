import {
    FilePlus,
    PlusSquare,
    FolderPlus,
    CircleHelp
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function DashboardQuickActions() {
    const navigate = useNavigate();

    const actions = [
        {
            label: "Create Note",
            description: "Add new study material",
            icon: FilePlus,
            color: "text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100/50 dark:text-blue-400 dark:bg-blue-950/40 dark:border-blue-900/50",
            path: "/notes"
        },
        {
            label: "Add Assignment",
            description: "Track a new deadline",
            icon: PlusSquare,
            color: "text-emerald-600 bg-emerald-50 border-emerald-100 hover:bg-emerald-100/50 dark:text-emerald-400 dark:bg-emerald-950/40 dark:border-emerald-900/50",
            path: "/assignment"
        },
        {
            label: "New Project",
            description: "Initialize workspace",
            icon: FolderPlus,
            color: "text-purple-600 bg-purple-50 border-purple-100 hover:bg-purple-100/50 dark:text-purple-400 dark:bg-purple-950/40 dark:border-purple-900/50",
            path: "/project"
        },
        {
            label: "Add Quiz",
            description: "Create a new quiz",
            icon: CircleHelp,
            color: "text-orange-600 bg-orange-50 border-orange-100 hover:bg-orange-100/50 dark:text-orange-400 dark:bg-orange-950/40 dark:border-orange-900/50",
            path: "/quiz"
        }
    ];

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <div className="mb-5">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Quick Actions
                </h2>

                <div className="mt-3 w-full border-b border-slate-100 dark:border-slate-800" />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {actions.map((action) => {
                    const Icon = action.icon;

                    return (
                        <button
                            key={action.label}
                            type="button"
                            onClick={() => navigate(action.path)}
                            className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:focus:ring-indigo-500"
                        >
                            <div
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${action.color}`}
                            >
                                <Icon className="h-5 w-5" />
                            </div>

                            <div className="min-w-0">
                                <h3 className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                    {action.label}
                                </h3>

                                <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                                    {action.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}

export default DashboardQuickActions;