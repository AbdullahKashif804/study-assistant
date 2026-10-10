import {
    House,
    LayoutDashboard,
    FileText,
    ClipboardList,
    FolderKanban,
    BookOpen,
    CircleHelp,
    CalendarDays,
    CheckSquare,
    UserCircle,
    Settings,
    ShieldCheck,
    X
} from 'lucide-react';

import { NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useLayoutEffect, useRef } from "react";
import useResponsiveDialog from "../../hooks/useResponsiveDialog";

const dashboard_items = [
    {
        id: 1,
        label: "Home",
        icon: House,
        path: '/'
    },
    {
        id: 2,
        label: "Dashboard",
        icon: LayoutDashboard,
        path: '/dashboard'
    },
    {
        id: 3,
        label: "Notes",
        icon: FileText,
        path: '/notes'
    },
    {
        id: 4,
        label: "Assignment",
        icon: ClipboardList,
        path: '/assignment'
    },
    {
        id: 5,
        label: "Projects",
        icon: FolderKanban,
        path: '/project'
    },
    {
        id: 6,
        label: "Quiz",
        icon: CircleHelp,
        path: '/quiz'
    },
    {
        id: 7,
        label: "Course",
        icon: BookOpen,
        path: '/course'
    },
    {
        id: 8,
        label: "Daily Tasks",
        icon: CalendarDays,
        path: '/dailytask'
    },
    {
        id: 9,
        label: "To Do Task",
        icon: CheckSquare,
        path: '/todotask'
    },
    {
        id: 10,
        label: "Profile",
        icon: UserCircle,
        path: '/profile'
    },
    {
        id: 11,
        label: "Settings",
        icon: Settings,
        path: '/settings'
    },
];

function DashboardSidebar({
    isSidebarOpen,
    setIsSidebarOpen
}) {
    const user = JSON.parse(localStorage.getItem("user"));

    const initials = `${user?.first_name?.[0] ?? ""}${user?.last_name?.[0] ?? ""}`.toUpperCase();

    const navigate = useNavigate();
    const location = useLocation();
    const navigationRef = useRef(null);
    const drawerRef = useRef(null);
    const compact = useResponsiveDialog(drawerRef, isSidebarOpen);

    useLayoutEffect(() => {
        const navigation = navigationRef.current;
        const activeItem = navigation?.querySelector('[aria-current="page"]');

        if (!navigation || !activeItem) return;

        const navigationBounds = navigation.getBoundingClientRect();
        const activeBounds = activeItem.getBoundingClientRect();
        const visibleInset = 8;

        if (activeBounds.top < navigationBounds.top + visibleInset) {
            navigation.scrollTop -=
                navigationBounds.top + visibleInset - activeBounds.top;
        } else if (activeBounds.bottom > navigationBounds.bottom - visibleInset) {
            navigation.scrollTop +=
                activeBounds.bottom - (navigationBounds.bottom - visibleInset);
        }
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <>
            <dialog
                ref={drawerRef}
                role={compact ? "dialog" : "complementary"}
                aria-label="Main navigation"
                aria-modal={compact && isSidebarOpen ? true : undefined}
                onCancel={(event) => { event.preventDefault(); setIsSidebarOpen(false); }}
                onClick={(event) => {
                    if (compact && event.target === event.currentTarget &&
                        event.clientX > event.currentTarget.getBoundingClientRect().right) {
                        setIsSidebarOpen(false);
                    }
                }}
                className={`
                    navigation-drawer fixed left-0 top-0 z-50 m-0 max-h-none max-w-none
                    h-dvh w-64 shrink-0 flex-col
                    border-r border-slate-200
                    bg-white
                    px-4 py-6
                    transition-transform duration-300 ease-in-out
                    dark:border-slate-800
                    dark:bg-slate-950
                    ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    lg:translate-x-0
                `}
            >

                {/* Logo */}
                <div className="mb-4 flex items-center gap-3 px-2">
                    <Link
                        to="/"
                        className="flex items-center"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <img
                            src="/images/Logo.png"
                            alt="Study Assistant"
                            className="h-8 w-40 rounded-xl object-cover"
                        />
                    </Link>

                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen(false)}
                        className="
                            rounded-lg p-1.5
                            text-slate-400
                            hover:bg-slate-100 hover:text-slate-900
                            dark:text-slate-400
                            dark:hover:bg-slate-800 dark:hover:text-white
                            lg:hidden
                        "
                        aria-label="Close Sidebar Menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Divider */}
                <div className="my-4 border-b border-slate-200 dark:border-slate-800"></div>

                {/* Navigation */}
                <div ref={navigationRef} className="flex-1 space-y-1 overflow-y-auto pb-2">
                    {dashboard_items.map((item) => {
                        const Icon = item.icon;

                        return (
                            <NavLink
                                key={item.id}
                                to={item.path}
                                onClick={() => setIsSidebarOpen(false)}
                                className={({ isActive }) =>
                                    `flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                                        isActive
                                            ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-50/50 dark:bg-indigo-950/50 dark:text-indigo-400 dark:shadow-none"
                                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <Icon
                                            className={`h-5 w-5 ${
                                                isActive
                                                    ? "text-indigo-600 dark:text-indigo-400"
                                                    : "text-slate-400 dark:text-slate-500"
                                            }`}
                                        />

                                        <span>{item.label}</span>
                                    </>
                                )}
                            </NavLink>
                        );
                    })}

                    {/* Admin Panel */}
                    {user?.role === "admin" && (
                        <NavLink
                            to="/admin"
                            onClick={() => setIsSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                                    isActive
                                        ? "bg-indigo-50 text-indigo-600 shadow-sm shadow-indigo-50/50 dark:bg-indigo-950/50 dark:text-indigo-400 dark:shadow-none"
                                        : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                                }`
                            }
                        >
                            {({ isActive }) => (
                                <>
                                    <ShieldCheck
                                        className={`h-5 w-5 ${
                                            isActive
                                                ? "text-indigo-600 dark:text-indigo-400"
                                                : "text-slate-400 dark:text-slate-500"
                                        }`}
                                    />

                                    <span>Admin Panel</span>
                                </>
                            )}
                        </NavLink>
                    )}
                </div>

                {/* User Section */}
                <div className="border-t border-slate-200 pt-4 dark:border-slate-800">

                    <div className="mb-4 flex items-center gap-3">
                        <div
                            className="
                                flex h-10 w-10
                                items-center justify-center
                                rounded-full
                                bg-indigo-50
                                font-semibold text-indigo-600
                                dark:bg-indigo-900/30
                                dark:text-indigo-400
                            "
                        >
                            {initials}
                        </div>

                        <div>
                            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {user?.first_name} {user?.last_name}
                            </h3>

                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {user?.role}
                            </p>
                        </div>
                    </div>

                    {/* Logout */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="
                            w-full rounded-lg
                            bg-red-50 py-2
                            text-sm font-medium text-red-600
                            hover:bg-red-100
                            dark:bg-red-950/40
                            dark:text-red-400
                            dark:hover:bg-red-950/70
                        "
                    >
                        Logout
                    </button>
                </div>
            </dialog>
        </>
    );
}

export default DashboardSidebar;
