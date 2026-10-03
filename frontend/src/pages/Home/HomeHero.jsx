import { Link } from "react-router-dom";
import { useState } from "react";

function HomeHero() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <section className="w-full bg-gray-100 px-6 py-16 transition-colors dark:bg-slate-950 md:px-10 md:py-24">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 md:grid-cols-2">
        <div>
          <h1 className="text-3xl font-extrabold leading-tight text-gray-950 dark:text-slate-100 md:text-4xl lg:text-5xl">
            Study Smarter,
            <span className="block text-blue-600 dark:text-blue-400">
              Stay Organized
            </span>
          </h1>

          <div className="mt-6 max-w-xl space-y-3 text-sm leading-8 text-gray-700 dark:text-slate-400 md:text-lg">
            <p>
              Manage your notes, assignments, quizzes, projects, courses, daily
              tasks, and todo tasks from one simple dashboard.
            </p>
            <p>
              Study Assistant helps you organize your academic work, track
              upcoming deadlines, and focus on the tasks that matter most.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-5">
            {isLoggedIn ? (
              <>
                <Link
                  to="/dashboard"
                  className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Dashboard
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-lg border border-red-600 px-6 py-3 font-medium text-red-600 transition-colors hover:bg-red-600 hover:text-white dark:border-red-500 dark:text-red-400 dark:hover:bg-red-600 dark:hover:text-white"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signup"
                  className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white shadow-sm transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Get Started
                </Link>

                <Link
                  to="/login"
                  className="rounded-lg border border-blue-600 px-6 py-3 font-medium text-blue-600 transition-colors hover:bg-blue-600 hover:text-white dark:border-blue-500 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white"
                >
                  Login
                </Link>
              </>
            )}
          </div>
        </div>

        <div>
          <img
            src="/images/dashboard.png"
            alt="dashboard preview"
            className="flex w-full rounded-2xl border border-gray-200 shadow-xl dark:border-slate-800 dark:shadow-slate-900/50"
          />
        </div>
      </div>
    </section>
  );
}

export default HomeHero;