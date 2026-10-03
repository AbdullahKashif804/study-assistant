import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import {
  Users,
  FileText,
  ClipboardList,
  FolderKanban,
  BookOpen,
  CircleHelp,
  CalendarDays,
  CheckSquare,
} from "lucide-react";
import { useEffect, useState } from "react";

function AdminDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalNotes: 0,
    totalAssignments: 0,
    totalProjects: 0,
    totalCourses: 0,
    totalQuizzes: 0,
    totalDailyTasks: 0,
    totalTodoTasks: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  const fetchAdminStats = async () => {
    try {
      setIsLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await fetch("http://localhost:5000/api/admin/stats", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 403) {
        setAccessDenied(true);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setStats(data.data);
    } catch (error) {
      setError(error.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600 dark:border-slate-800 dark:border-t-blue-500"></div>
          <p className="mt-4 text-sm font-medium text-gray-600 dark:text-slate-400">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6 dark:bg-slate-950">
        <div className="w-full max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm dark:border-red-900/40 dark:bg-slate-900">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/50">
            <span className="text-xl font-bold text-red-600 dark:text-red-400">
              !
            </span>
          </div>
          <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-slate-100">
            Something went wrong
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            {error}
          </p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Registered users",
    },
    {
      title: "Notes",
      value: stats.totalNotes,
      icon: FileText,
      description: "Total notes",
    },
    {
      title: "Assignments",
      value: stats.totalAssignments,
      icon: ClipboardList,
      description: "Total assignments",
    },
    {
      title: "Projects",
      value: stats.totalProjects,
      icon: FolderKanban,
      description: "Total projects",
    },
    {
      title: "Courses",
      value: stats.totalCourses,
      icon: BookOpen,
      description: "Total courses",
    },
    {
      title: "Quizzes",
      value: stats.totalQuizzes,
      icon: CircleHelp,
      description: "Total quizzes",
    },
    {
      title: "Daily Tasks",
      value: stats.totalDailyTasks,
      icon: CalendarDays,
      description: "Total daily tasks",
    },
    {
      title: "To-Do Tasks",
      value: stats.totalTodoTasks,
      icon: CheckSquare,
      description: "Total to-do tasks",
    },
  ];

  return (
    <>
      <DashboardSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <DashboardHeader setIsSidebarOpen={setIsSidebarOpen} />

      {accessDenied ? (
        <div className="mx-auto mt-20 min-h-screen max-w-7xl bg-slate-50 px-4 py-6 transition-colors dark:bg-slate-950 sm:px-6 lg:pl-68">
          <div className="flex min-h-[80vh] items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">
                Access Denied
              </h1>
              <p className="mt-2 text-gray-600 dark:text-slate-400">
                You do not have permission to view the admin dashboard.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-20 min-h-screen max-w-7xl bg-slate-50 px-4 py-6 transition-colors dark:bg-slate-950 sm:px-6 lg:pl-68">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                  Admin Dashboard
                </h1>

                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                  Admin
                </span>
              </div>

              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                Overview of Study Assistant platform activity
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {statCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div
                    key={card.title}
                    className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800/80 dark:bg-slate-900 dark:shadow-none"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
                          {card.title}
                        </h2>

                        <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
                          {card.value}
                        </p>
                      </div>

                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <p className="mt-5 border-t border-gray-100 pt-4 text-xs font-medium text-gray-500 dark:border-slate-800 dark:text-slate-400">
                      {card.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDashboard;