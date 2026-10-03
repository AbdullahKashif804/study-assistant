import {
    X,
    Bell,
    BookOpen,
    ClipboardList,
    FolderKanban,
    CheckSquare
} from "lucide-react";

function DeadlinePopup({ reminders, onClose }) {

    if (!reminders || reminders.length === 0) {
        return null;
    }

    const getIcon = (type) => {
        if (type === "Assignment") {
            return <ClipboardList className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
        }

        if (type === "Project") {
            return <FolderKanban className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
        }

        if (type === "Quiz") {
            return <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />;
        }

        if (type === "To-do") {
            return <CheckSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
        }

        return <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm dark:bg-black/70">

            <div
                className="
                    relative w-full max-w-lg
                    rounded-2xl
                    bg-white
                    shadow-2xl
                    dark:border
                    dark:border-slate-800
                    dark:bg-slate-900
                    dark:shadow-black/50
                "
            >

                {/* Header */}
                <div
                    className="
                        flex items-start justify-between
                        border-b border-slate-200
                        p-5
                        dark:border-slate-800
                    "
                >

                    <div className="flex items-center gap-3">

                        <div
                            className="
                                flex h-11 w-11
                                items-center justify-center
                                rounded-full
                                bg-blue-100
                                dark:bg-blue-900/30
                            "
                        >
                            <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>

                        <div>

                            <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                                Today's Deadlines
                            </h2>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                You have {reminders.length} task{reminders.length > 1 ? "s" : ""} scheduled for today.
                            </p>

                        </div>

                    </div>

                    <button
                        onClick={onClose}
                        className="
                            rounded-lg p-1.5
                            text-slate-400 transition-colors
                            hover:bg-slate-100 hover:text-slate-600
                            dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white
                        "
                    >
                        <X className="h-5 w-5" />
                    </button>

                </div>

                {/* Reminders List */}
                <div className="max-h-80 space-y-3 overflow-y-auto p-5">
                    {reminders.map((reminder, idx) => (
                        <div
                            key={reminder.id || idx}
                            className="
                                flex items-center justify-between
                                rounded-xl border border-slate-100
                                bg-slate-50/50 p-3.5
                                dark:border-slate-800 dark:bg-slate-800/50
                            "
                        >
                                <div className="flex min-w-0 items-center gap-3.5">
                                <div
                                    className="
                                        flex h-10 w-10 items-center justify-center
                                        rounded-lg bg-white shadow-sm
                                        dark:bg-slate-900
                                    "
                                >
                                    {getIcon(reminder.type)}
                                </div>

                                <div>
                                    <h3 className="truncate font-medium text-slate-800 dark:text-slate-100">
                                        {reminder.title}
                                    </h3>
                                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                                        {reminder.type} {reminder.subject ? `• ${reminder.subject}` : ""}
                                    </p>
                                </div>
                            </div>

                            {reminder.time && (
                                <span
                                    className="
                                        rounded-full bg-slate-200/60 px-2.5 py-1
                                        text-xs font-medium text-slate-600
                                        dark:bg-slate-700 dark:text-slate-200
                                    "
                                >
                                    {reminder.time}
                                </span>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div
                    className="
                        flex justify-end
                        border-t border-slate-200
                        p-4
                        dark:border-slate-800
                    "
                >
                    <button
                        onClick={onClose}
                        className="
                            rounded-xl bg-blue-600 px-4 py-2
                            text-sm font-medium text-white
                            transition-colors hover:bg-blue-700
                            dark:bg-blue-600 dark:hover:bg-blue-500
                        "
                    >
                        Got it
                    </button>
                </div>

            </div>

        </div>
    );
}

export default DeadlinePopup;