import { useState, useEffect } from "react";
import { LoaderCircle } from "lucide-react";

import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardWelcome from "../../components/dashboard/DashboardWelcome";
import DashboardStats from "../../components/dashboard/DashboardStats";
import DashboardRecentActivity from "../../components/dashboard/DashboardRecentActivity";
import DashboardQuickActions from "../../components/dashboard/DashboardQuickActions";
import DeadlinePopup from "../../components/dashboard/DeadlinePopup";

function Dashboard() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [dashboardData, setDashboardData] = useState({});
    const [deadlineReminders, setDeadlineReminders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    
const [deadlineNotificationsEnabled, setDeadlineNotificationsEnabled] = useState(() => {
    return localStorage.getItem("deadlineNotifications") !== "false";
});

useEffect(() => {
    fetchDashboard();

    if (deadlineNotificationsEnabled) {
        fetchDeadlineReminders();
    }
}, [deadlineNotificationsEnabled]);

    const fetchDashboard = async () => {
        try {
            setIsLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/dashboard/get",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            setDashboardData(data.data);
        } catch (error) {
            setError(error.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const getTodayKey = () => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    };

const fetchDeadlineReminders = async () => {
    try {
        if (localStorage.getItem("deadlineNotifications") === "false") {
            setDeadlineReminders([]);
            return;
        }
            const todayKey = `deadlinePopupDismissed_${getTodayKey()}`;

            if (sessionStorage.getItem(todayKey) === "true") {
                return;
            }

            const token = localStorage.getItem("token");

            const response = await fetch(
                "http://localhost:5000/api/dashboard/deadline-reminders",
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const reminders = [
                ...(data.data.assignments?.map((item) => ({
                    id: item._id,
                    title: item.title,
                    type: "Assignment"
                })) || []),

                ...(data.data.projects?.map((item) => ({
                    id: item._id,
                    title: item.title,
                    type: "Project"
                })) || []),

                ...(data.data.quizzes?.map((item) => ({
                    id: item._id,
                    title: item.title,
                    type: "Quiz"
                })) || []),

                ...(data.data.todoTasks?.map((item) => ({
                    id: item._id,
                    title: item.title,
                    type: "To-do"
                })) || [])
            ];

            setDeadlineReminders(reminders);
        } catch (error) {
            console.error("Deadline reminder error:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                    <p className="mt-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                        Loading...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 dark:bg-slate-950">
                <p className="max-w-xl rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                    {error}
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-100 dark:bg-slate-950">
            {/* Sidebar */}
            <DashboardSidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            {/* Header */}
            <DashboardHeader setIsSidebarOpen={setIsSidebarOpen} />

            {/* Deadline Popup */}
            <DeadlinePopup
                reminders={deadlineReminders}
                onClose={() => {
                    const todayKey = `deadlinePopupDismissed_${getTodayKey()}`;
                    sessionStorage.setItem(todayKey, "true");
                    setDeadlineReminders([]);
                }}
            />

            {/* Main Dashboard */}
            <main className="min-h-screen px-4 pb-6 pt-20 sm:px-6 lg:pl-68 lg:pt-20">
                <div className="mx-auto max-w-7xl space-y-6">
                    {/* Welcome + Stats */}
                    <DashboardWelcome />

                    <DashboardStats dashboardData={dashboardData} />

                    {/* Recent Activity + Quick Actions */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                        <div>
                            <DashboardRecentActivity
                                dashboardData={dashboardData}
                            />
                        </div>

                        <div>
                            <DashboardQuickActions />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard;