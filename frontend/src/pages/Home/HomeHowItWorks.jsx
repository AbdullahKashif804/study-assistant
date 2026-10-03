import {
    ChevronRight,
    GraduationCap,
    TrendingUp,
    UserPlus
} from 'lucide-react'

function HomeHowItWorks(){
    return(
        <section id="how-it-works" className="w-full bg-gray-50 px-6 py-20 dark:bg-slate-900 lg:px-20">
            <div className="mx-auto max-w-6xl">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                        Organize Your Studies in Three Simple Steps
                    </h2>
                </div>
                <div className="mt-12 grid grid-cols-1 items-start gap-8 lg:grid-cols-5 lg:gap-4">
                    <div className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                            <UserPlus className="h-9 w-9 text-blue-600 dark:text-blue-400"/>
                        </div>
                        <h3 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
                            Create Your Account
                        </h3>
                        <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">
                            Register your account and securely sign in to access your
                            personal Study Assistant dashboard.
                        </p>
                    </div>
                    <div className="hidden items-center justify-center self-start pt-10 lg:flex">
                        <div className="w-20 border-t-2 border-dashed border-gray-400 dark:border-gray-600"/>
                        <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-600"
                            strokeWidth={2}
                        />
                    </div>
                    <div className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                            <GraduationCap className="h-9 w-9 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
                            Add Your Study Information
                        </h3>
                        <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">
                            Create notes, assignments, quizzes, projects, courses, daily
                            tasks, and todo tasks.
                        </p>
                    </div>
                    <div className="hidden items-center justify-center self-start pt-10 lg:flex">
                        <div className="w-20 border-t-2 border-dashed border-gray-400 dark:border-gray-600"/>
                        <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-600"
                            strokeWidth={2}
                        />
                    </div>
                    <div className="text-center">
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950">
                            <TrendingUp className="h-9 w-9 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">
                            Track Your Progress
                        </h3>
                        <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">
                            Use your dashboard to view important information, upcoming
                            deadlines, and pending study work.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HomeHowItWorks