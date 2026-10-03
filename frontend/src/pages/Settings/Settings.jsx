import { useState } from "react";
import {
  ArrowLeft,
  Bell,
  Lock,
  Moon,
  ShieldCheck,
  Trash2,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DashboardHeader from "../../components/dashboard/DashboardHeader";

function Settings() {
    const { theme, toggleTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
const [showChangePassword, setShowChangePassword] = useState(false);

const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");

const [passwordMessage, setPasswordMessage] = useState("");
const [passwordMessageType, setPasswordMessageType] = useState("");
const [changingPassword, setChangingPassword] = useState(false);

const [showDeleteAccount, setShowDeleteAccount] = useState(false);
const [deleteConfirmation, setDeleteConfirmation] = useState("");
const [deleteMessage, setDeleteMessage] = useState("");
const [deleteMessageType, setDeleteMessageType] = useState("");
const [deletingAccount, setDeletingAccount] = useState(false);

    const [deadlineNotificationsEnabled, setDeadlineNotificationsEnabled] = useState(() => {
        return localStorage.getItem("deadlineNotifications") !== "false";
    });
const toggleDeadlineNotifications = () => {
    setDeadlineNotificationsEnabled((previousValue) => {
        const newValue = !previousValue;

        localStorage.setItem(
            "deadlineNotifications",
            String(newValue)
        );

        return newValue;
    });
};
const handleChangePassword = async (event) => {
    event.preventDefault();

    try {
        setChangingPassword(true);
        setPasswordMessage("");
        setPasswordMessageType("");

        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:5000/api/user/change-password",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                    confirmPassword,
                }),
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to change password"
            );
        }

        setPasswordMessage(data.message);
        setPasswordMessageType("success");

        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");

    } catch (error) {
        setPasswordMessage(error.message);
        setPasswordMessageType("error");
    } finally {
        setChangingPassword(false);
    }
};
const handleDeleteAccount = async (event) => {
    event.preventDefault();

    if (deleteConfirmation !== "DELETE") {
        setDeleteMessage("Please type DELETE to confirm account deletion");
        setDeleteMessageType("error");
        return;
    }

    try {
        setDeletingAccount(true);
        setDeleteMessage("");
        setDeleteMessageType("");

        const token = localStorage.getItem("token");

        const response = await fetch(
            "http://localhost:5000/api/user/delete-account",
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Failed to delete account"
            );
        }

        setDeleteMessage(data.message);
        setDeleteMessageType("success");

        localStorage.removeItem("token");

        setTimeout(() => {
            window.location.href = "/login";
        }, 1500);

    } catch (error) {
        setDeleteMessage(error.message);
        setDeleteMessageType("error");
    } finally {
        setDeletingAccount(false);
    }
};


  return (
    <div className="min-h-screen bg-slate-100 transition-colors dark:bg-slate-950 lg:flex">
      <DashboardSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="min-w-0 flex-1">
        <DashboardHeader setIsSidebarOpen={setIsSidebarOpen} />
      <main className="mx-auto mt-20 max-w-7xl px-4 py-6 sm:px-6 lg:pl-68">
        <div className="max-w-4xl">
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                Settings
              </h1>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                Manage your account, appearance, notifications, and privacy.
              </p>
            </div>
            <Link
              to="/dashboard"
              className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:focus:ring-blue-950/50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </div>

          {/* APPEARANCE */}
          <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Moon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-slate-100">
                  Appearance
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Customize how Study Assistant looks.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-5 dark:border-slate-800">
              <div>
                <p className="font-medium text-gray-800 dark:text-slate-200">
                  Dark Mode
                </p>

                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Use dark mode throughout the application.
                </p>
              </div>

<button
  type="button"
  onClick={toggleTheme}
  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
    theme === "dark"
      ? "bg-blue-600"
      : "bg-gray-300 dark:bg-slate-700"
  }`}
  aria-label="Toggle dark mode"
>
  <span
    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
      theme === "dark"
        ? "translate-x-6"
        : "translate-x-1"
    }`}
  />
</button>


            </div>
          </section>

          {/* NOTIFICATIONS */}
          <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900 dark:text-slate-100">
                  Notifications
                </h2>

                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Manage your study reminders and notifications.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-100 pt-5 dark:border-slate-800">
              <div>
                <p className="font-medium text-gray-800 dark:text-slate-200">
                  Deadline Notifications
                </p>

                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Receive reminders for upcoming deadlines.
                </p>
              </div>

              
<button
    type="button"
    onClick={toggleDeadlineNotifications}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        deadlineNotificationsEnabled
            ? "bg-blue-600"
            : "bg-gray-300 dark:bg-slate-700"
    }`}
    aria-label="Toggle deadline notifications"
>
    <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            deadlineNotificationsEnabled
                ? "translate-x-6"
                : "translate-x-1"
        }`}
    />
</button>


            </div>
          </section>

          {/* ACCOUNT */}
          <section className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900 dark:text-slate-100">
                  Account
                </h2>

                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Manage your account security.
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-gray-100 pt-5 dark:border-slate-800">

              {/* CHANGE PASSWORD */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-gray-500 dark:text-slate-400" />

                  <div>
                    <p className="font-medium text-gray-800 dark:text-slate-200">
                      Change Password
                    </p>

                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Update your account password.
                    </p>
                  </div>
                </div>

<button
    type="button"
    onClick={() => {
        setShowChangePassword(true);
        setPasswordMessage("");
    }}
    className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-blue-950/50"
>
    Change
</button>

              </div>
{showChangePassword && (
    <form
        onSubmit={handleChangePassword}
        className="rounded-xl border border-gray-100 bg-gray-50 p-5 dark:border-slate-800 dark:bg-slate-950"
    >
        <div className="space-y-4">

            {/* CURRENT PASSWORD */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Current Password
                </label>

                <input
                    type="password"
                    value={currentPassword}
                    onChange={(event) =>
                        setCurrentPassword(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950/50"
                    placeholder="Enter current password"
                />
            </div>

            {/* NEW PASSWORD */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    New Password
                </label>

                <input
                    type="password"
                    value={newPassword}
                    onChange={(event) =>
                        setNewPassword(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950/50"
                    placeholder="Enter new password"
                />
            </div>

            {/* CONFIRM PASSWORD */}
            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Confirm New Password
                </label>

                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) =>
                        setConfirmPassword(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:ring-blue-950/50"
                    placeholder="Confirm new password"
                />
            </div>

            {/* MESSAGE */}
            {passwordMessage && (
                <p
                    className={`text-sm ${
                        passwordMessageType === "success"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                    }`}
                >
                    {passwordMessage}
                </p>
            )}

            {/* ACTIONS */}
            <div className="flex justify-end gap-3">

                <button
                    type="button"
                    onClick={() => {
                        setShowChangePassword(false);
                        setPasswordMessage("");
                        setCurrentPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                    }}
                    className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-blue-950/50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={changingPassword}
                    className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500 dark:focus:ring-blue-950/50"
                >
                    {changingPassword
                        ? "Changing..."
                        : "Change Password"}
                </button>

            </div>

        </div>
    </form>
)}


              {/* DELETE ACCOUNT */}
              <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <Trash2 className="h-5 w-5 text-red-500" />

                  <div>
                    <p className="font-medium text-gray-800 dark:text-slate-200">
                      Delete Account
                    </p>

                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      Permanently delete your account and data.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
    setShowDeleteAccount(true);
    setDeleteMessage("");
}}
                  className="rounded-xl border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950/30 dark:focus:ring-red-950/50"
                >
                  Delete
                </button>
              </div>
              {showDeleteAccount && (
    <form
        onSubmit={handleDeleteAccount}
        className="rounded-xl border border-red-200 bg-red-50 p-5 dark:border-red-900/50 dark:bg-red-950/20"
    >
        <div className="space-y-4">

            <div>
                <h3 className="text-sm font-semibold text-red-700 dark:text-red-400">
                    Delete your account?
                </h3>

                <p className="mt-1 text-sm text-red-600 dark:text-red-300">
                    This will permanently delete your account and all your
                    study data. This action cannot be undone.
                </p>
            </div>

            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
                    Type DELETE to confirm
                </label>

                <input
                    type="text"
                    value={deleteConfirmation}
                    onChange={(event) =>
                        setDeleteConfirmation(event.target.value)
                    }
                    className="w-full rounded-xl border border-red-300 bg-white px-3.5 py-2.5 text-sm text-gray-900 outline-none transition-colors focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:border-red-900 dark:bg-slate-900 dark:text-white dark:focus:ring-red-950/50"
                    placeholder="DELETE"
                />
            </div>

            {deleteMessage && (
                <p
                    className={`text-sm ${
                        deleteMessageType === "success"
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                    }`}
                >
                    {deleteMessage}
                </p>
            )}

            <div className="flex justify-end gap-3">

                <button
                    type="button"
                    onClick={() => {
                        setShowDeleteAccount(false);
                        setDeleteConfirmation("");
                        setDeleteMessage("");
                    }}
                    className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-blue-950/50"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    disabled={
                        deletingAccount ||
                        deleteConfirmation !== "DELETE"
                    }
                    className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60 dark:focus:ring-red-950/50"
                >
                    {deletingAccount
                        ? "Deleting..."
                        : "Delete Account"}
                </button>

            </div>

        </div>
    </form>
)}
            </div>
          </section>




          {/* PRIVACY */}
          <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <h2 className="font-semibold text-gray-900 dark:text-slate-100">
                  Privacy
                </h2>

                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Review your privacy information.
                </p>
              </div>
            </div>
<div className="border-t border-gray-100 pt-5 dark:border-slate-800">
  <div className="flex items-center justify-between gap-4">
    <p className="text-sm text-gray-600 dark:text-slate-400">
      Review the Study Assistant Privacy Policy to understand how
      your information is handled.
    </p>

    <Link
      to="/privacy-policy"
      className="shrink-0 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-blue-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:focus:ring-blue-950/50"
    >
      View Policy
    </Link>
  </div>
</div>

          </section>

        </div>
      </main>
      </div>
    </div>
  );
}

export default Settings;

