import { Link } from "react-router-dom";
import { useState } from "react";

function HomeCTA() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <section className="w-full px-6 pb-20 mt-12 lg:px-10">
      <div className="mx-auto max-w-7xl rounded-3xl bg-blue-50 px-8 py-14 text-center transition-colors dark:bg-slate-900 dark:border dark:border-slate-800">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
          Take Control of Your Studies Today
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-gray-600 dark:text-slate-400">
          Start organizing your notes, assignments, quizzes, projects, courses,
          and daily tasks in one place. Create your free account today and make
          your study journey simpler and more productive.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-5">
          {isLoggedIn ? (
            <>
              <Link
                to="/dashboard"
                className="btn-primary rounded-lg px-6 py-3 font-medium shadow-sm transition-colors"
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
                className="btn-primary rounded-lg px-6 py-3 font-medium shadow-sm transition-colors"
              >
                Get Started
              </Link>

              <Link
                to="/login"
                className="rounded-lg border border-indigo-600 px-6 py-3 font-medium text-indigo-600 transition-colors hover:bg-indigo-600 hover:text-white dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

export default HomeCTA;