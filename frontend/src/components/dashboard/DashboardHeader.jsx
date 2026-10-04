import {
    Menu,
    Moon,
    Sun,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import GlobalSearch from "../../components/dashboard/GlobalSearch";

function DashboardHeader({ setIsSidebarOpen }) {
    const { theme, toggleTheme } = useTheme();

    const user = JSON.parse(localStorage.getItem("user"));

    const initials = `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase();

    return (
        <header
            className="
                fixed top-0 right-0 left-0 lg:left-64 z-30
                flex h-16 items-center justify-between
                border-b border-slate-200 bg-slate-50/90 px-4 backdrop-blur-sm sm:px-6 lg:px-8
                dark:border-slate-800 dark:bg-slate-950/95
            "
        >
            {/* Left Section */}
            <div className="flex items-center gap-3">

                {/* Mobile Menu */}
                <button
                    type="button"
                    onClick={() => setIsSidebarOpen(true)}
                    className="
                        rounded-lg p-2
                        text-slate-500
                        hover:bg-slate-100 hover:text-slate-900
                        dark:text-slate-400
                        dark:hover:bg-slate-800 dark:hover:text-white
                        lg:hidden
                    "
                    aria-label="Open sidebar menu"
                >
                    <Menu className="h-6 w-6" />
                </button>

                {/* Search */}
                <GlobalSearch />
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-3">

                {/* Dark Mode */}
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="
                        rounded-lg p-2
                        text-slate-500
                        transition
                        hover:bg-slate-100 hover:text-slate-900
                        dark:text-slate-400
                        dark:hover:bg-slate-800 dark:hover:text-white
                    "
                    aria-label="Toggle dark mode"
                >
                    {theme === "dark" ? (
    <Sun className="h-5 w-5" />
) : (
    <Moon className="h-5 w-5" />
)}
                </button>

                {/* Avatar */}
                <div
                    className="
                        flex h-10 w-10
                        items-center justify-center
                        rounded-full
                        bg-blue-50
                        font-semibold text-blue-600
                        dark:bg-blue-900/30
                        dark:text-blue-400
                    "
                >
                    {initials}
                </div>

                {/* User Info */}
                <div className="hidden sm:block">
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {user?.first_name} {user?.last_name}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {user?.role}
                    </p>
                </div>
            </div>
        </header>
    );
}

export default DashboardHeader;