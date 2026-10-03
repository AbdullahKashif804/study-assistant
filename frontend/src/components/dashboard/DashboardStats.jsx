import {
    FileText,
    ClipboardList,
    FolderKanban,
    CircleHelp
} from "lucide-react";

function DashboardStats({ dashboardData }) {
    const statCards = [
        {
            title: "Notes",
            value: dashboardData?.totalNotes ?? 0,
            icon: FileText,
            description: "Saved notes",
            color: "border-blue-100 bg-blue-50 text-blue-600 dark:border-blue-900/60 dark:bg-blue-950/50 dark:text-blue-400"
        },
        {
            title: "Assignments",
            value: dashboardData?.totalAssignment ?? 0,
            icon: ClipboardList,
            description: "Total assignments",
            color: "border-green-100 bg-green-50 text-green-600 dark:border-green-900/60 dark:bg-green-950/50 dark:text-green-400"
        },
        {
            title: "Projects",
            value: dashboardData?.totalProjects ?? 0,
            icon: FolderKanban,
            description: "Active projects",
            color: "border-purple-100 bg-purple-50 text-purple-600 dark:border-purple-900/60 dark:bg-purple-950/50 dark:text-purple-400"
        },
        {
            title: "Quizzes",
            value: dashboardData?.totalQuiz ?? 0,
            icon: CircleHelp,
            description: "Quizzes created",
            color: "border-orange-100 bg-orange-50 text-orange-600 dark:border-orange-900/60 dark:bg-orange-950/50 dark:text-orange-400"
        }
    ];

    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => {
                const Icon = card.icon;

                return (
                    <div
                        key={card.title}
                        className="group relative flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:shadow-none dark:hover:border-slate-700 dark:hover:bg-slate-900"
                    >
                        {/* Top Section */}
                        <div className="flex items-start justify-between">
                            <div className="space-y-1">
                                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                    {card.title}
                                </h2>

                                <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                                    {card.value}
                                </h3>
                            </div>

                            {/* Icon */}
                            <div
                                className={`flex h-10 w-10 items-center justify-center rounded-xl border ${card.color}`}
                            >
                                <Icon className="h-5 w-5" />
                            </div>
                        </div>

                        {/* Bottom Section */}
                        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                {card.description}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default DashboardStats;