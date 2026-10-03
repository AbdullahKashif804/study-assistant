function DashboardWelcome() {
    const user = JSON.parse(localStorage.getItem("user"));
    const firstName = user?.first_name || "User";

    return (
        <section className="space-y-1.5 py-4">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white md:text-3xl">
                Welcome back, {firstName}! 👋
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-gray-500 dark:text-gray-400 md:text-base">
                Stay organized, keep track of your progress, manage assignments,
                and continue achieving your academic goals with your AI Study Assistant.
            </p>
        </section>
    );
}

export default DashboardWelcome;