import {
  CircleCheckBig,
  Clock3,
  ListTodo,
} from "lucide-react";

function DashboardChart({ dashboardData }) {
  const taskStatus = dashboardData?.taskStatus || {
    pending: 0,
    inProgress: 0,
    completed: 0,
  };

  const pending = Number(taskStatus.pending) || 0;
  const inProgress = Number(taskStatus.inProgress) || 0;
  const completed = Number(taskStatus.completed) || 0;

  const total = pending + inProgress + completed;

  const radius = 70;
  const circumference = 2 * Math.PI * radius;

  const completedLength =
    total > 0 ? (completed / total) * circumference : 0;

  const inProgressLength =
    total > 0 ? (inProgress / total) * circumference : 0;

  const pendingLength =
    total > 0 ? (pending / total) * circumference : 0;

  const completedOffset = 0;
  const inProgressOffset = -completedLength;
  const pendingOffset = -(completedLength + inProgressLength);

  const completedPercent =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  const items = [
    {
      label: "Pending",
      value: pending,
      icon: ListTodo,
      dotClass: "bg-amber-500",
    },
    {
      label: "In Progress",
      value: inProgress,
      icon: Clock3,
      dotClass: "bg-indigo-500",
    },
    {
      label: "Completed",
      value: completed,
      icon: CircleCheckBig,
      dotClass: "bg-emerald-500",
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          Task Progress
        </h2>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Daily tasks and to-do tasks by status
        </p>
      </div>

      {total === 0 ? (
        <div className="flex min-h-72 items-center justify-center">
          <div className="text-center">
            <ListTodo className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />

            <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
              No task data available yet
            </p>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid items-center gap-6 md:grid-cols-2">
          <div className="flex justify-center">
            <div className="relative">
              <svg
                width="190"
                height="190"
                viewBox="0 0 190 190"
                className="-rotate-90"
              >
                <circle
                  cx="95"
                  cy="95"
                  r={radius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="24"
                  className="text-slate-100 dark:text-slate-800"
                />

                <circle
                  cx="95"
                  cy="95"
                  r={radius}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="24"
                  strokeDasharray={`${completedLength} ${
                    circumference - completedLength
                  }`}
                  strokeDashoffset={completedOffset}
                />

                <circle
                  cx="95"
                  cy="95"
                  r={radius}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="24"
                  strokeDasharray={`${inProgressLength} ${
                    circumference - inProgressLength
                  }`}
                  strokeDashoffset={inProgressOffset}
                />

                <circle
                  cx="95"
                  cy="95"
                  r={radius}
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="24"
                  strokeDasharray={`${pendingLength} ${
                    circumference - pendingLength
                  }`}
                  strokeDashoffset={pendingOffset}
                />
              </svg>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {completedPercent}%
                  </p>

                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    completed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const Icon = item.icon;

              const percent =
                total > 0
                  ? Math.round((item.value / total) * 100)
                  : 0;

              return (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${item.dotClass}`}
                    />

                    <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />

                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {item.label}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.value}
                    </p>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {percent}%
                    </p>
                  </div>
                </div>
              );
            })}

            <div className="pt-2 text-sm text-slate-500 dark:text-slate-400">
              Total tasks:{" "}
              <span className="font-bold text-slate-900 dark:text-slate-100">
                {total}
              </span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default DashboardChart;