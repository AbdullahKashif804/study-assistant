import {
    FileText,
    ClipboardList,
    FolderKanban,
    CircleHelp,
    CalendarDays,
    CheckSquare,
    Clock
} from "lucide-react";

function DashboardRecentActivity({ dashboardData }) {
    const {
        recentNotes = [],
        upcomingAssignment = [],
        upComingProject = [],
        upcomingQuiz = [],
        todaysDailyTask = [],
        pendingToDoTask = []
    } = dashboardData || {};

    const Activities = [
        ...recentNotes.map((item) => ({
            id: `note-${item._id || item.id}`,
            title: item.title,
            meta: "Recent Note",
            type: "Notes",
            icon: FileText,
            badgeStyles:
                "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-900/60"
        })),

        ...upcomingAssignment.map((item) => ({
            id: `assign-${item._id || item.id}`,
            title: item.title,
            date: item.dueDate,
            meta: item.dueDate
                ? `Due ${new Date(item.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric"
                  })}`
                : "Due Tomorrow",
            type: "Assignment",
            icon: ClipboardList,
            badgeStyles:
                "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-900/60"
        })),

        ...upComingProject.map((item) => ({
            id: `project-${item._id || item.id}`,
            title: item.title,
            meta: item.dueDate
                ? `Project • ${new Date(item.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric"
                  })}`
                : "Project Track",
            type: "Project",
            icon: FolderKanban,
            badgeStyles:
                "bg-purple-50 text-purple-700 border-purple-100 dark:bg-purple-950/50 dark:text-purple-400 dark:border-purple-900/60"
        })),

        ...upcomingQuiz.map((item) => ({
            id: `quiz-${item._id || item.id}`,
            title: item.title,
            meta: item.dueDate
                ? `Due ${new Date(item.dueDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric"
                  })}`
                : "Quiz Coming Up",
            type: "Quiz",
            icon: CircleHelp,
            badgeStyles:
                "bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/50 dark:text-orange-400 dark:border-orange-900/60"
        })),

        ...todaysDailyTask.map((item) => ({
            id: `daily-${item._id || item.id}`,
            title: item.title,
            meta: "Today's Task",
            type: "Daily Task",
            icon: CalendarDays,
            badgeStyles:
                "bg-indigo-50 text-indigo-700 border-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-900/60"
        })),

        ...pendingToDoTask.map((item) => ({
            id: `todo-${item._id || item.id}`,
            title: item.title,
            meta: "To-Do",
            type: "To-Do",
            icon: CheckSquare,
            badgeStyles:
                "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/50 dark:text-red-400 dark:border-red-900/60"
        }))
    ];

    const priorityTypes = [
    "Assignment",
    "Project",
    "Quiz",
    "Daily Task",
    "To-Do"
];

const sortedActivities = [...Activities].sort((a, b) => {
    const aPriority = priorityTypes.includes(a.type) ? 0 : 1;
    const bPriority = priorityTypes.includes(b.type) ? 0 : 1;

    if (aPriority !== bPriority) {
        return aPriority - bPriority;
    }

    const aDate = a.date ? new Date(a.date).getTime() : Infinity;
    const bDate = b.date ? new Date(b.date).getTime() : Infinity;

    if (aPriority === 0) {
        return aDate - bDate;
    }

    return bDate - aDate;
});

    return (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
            <div className="mb-5">
                <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                    Recent & Upcoming
                </h2>

                <div className="mt-3 w-full border-b border-slate-100 dark:border-slate-800" />
            </div>

            {Activities.length === 0 ? (
                <div className="py-8 text-center">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        No active tracking items found for today.
                    </p>
                </div>
            ) : (
                <div className="space-y-3.5">
                    {Activities.slice(0, 5).map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.id}
                                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/50 dark:hover:border-slate-700 dark:hover:bg-slate-800"
                            >
                                <div className="flex min-w-0 items-center gap-3.5">
                                    {/* Activity Icon */}
                                    <div
                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-white dark:bg-slate-900 ${item.badgeStyles}`}
                                    >
                                        <Icon className="h-4 w-4" />
                                    </div>

                                    {/* Activity Details */}
                                    <div className="min-w-0">
                                        <h3 className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                            {item.title || "Untitled"}
                                        </h3>

                                        <div className="mt-0.5 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
                                            <Clock className="h-3 w-3 shrink-0 text-slate-400 dark:text-slate-500" />

                                            <span className="truncate">
                                                {item.meta}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Type Badge */}
                                <span
                                    className={`shrink-0 rounded-md border px-2.5 py-1 text-xs font-bold tracking-wide shadow-3xs ${item.badgeStyles}`}
                                >
                                    {item.type}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

export default DashboardRecentActivity;