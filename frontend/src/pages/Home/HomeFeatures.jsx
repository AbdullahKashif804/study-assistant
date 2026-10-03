import {
    FileText,
    ClipboardList,
    FolderHeart,
    GraduationCap,
    LayoutDashboard,
    TrendingUp,
    UserPlus,
    BookOpen,
    CalendarDays,
    CheckSquare
} from 'lucide-react'

function HomeFeatures(){
    return(
        <section id="features" className="w-full px-6 py-20 bg-slate-50 dark:bg-slate-950 lg:px-10">
            <div className="mx-auto max-w-7xl">
                <div className="text-center">
                    <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                        Everything You Need to Manage Your Studies
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                        Keep all your study-related information organized in one place.
                    </p>
                </div>
                <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <div className="h-full rounded-2xl border border-blue-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
                            <FileText className='h-6 w-6 text-blue-600 dark:text-blue-400'/>
                        </div>
                        <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Notes Management</h3>
                        <p className='mt-3 leading-7 text-gray-600 dark:text-gray-400'>
                            Create, view, update, and delete your study notes. Keep
                            important information organized so you can easily find it
                            later.
                        </p>
                    </div>
                    <div className="h-full rounded-2xl border border-blue-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-950">
                            <ClipboardList className='h-6 w-6 text-green-600 dark:text-green-400'/>
                        </div>
                        <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Assignment Tracking</h3>
                        <p className='mt-3 leading-7 text-gray-600 dark:text-gray-400'>
                            Add assignments with their due dates and track upcoming work
                            before deadlines arrive.
                        </p>
                    </div>
                    <div className="h-full rounded-2xl border border-blue-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-950">
                            <GraduationCap className='h-6 w-6 text-purple-600 dark:text-purple-400'/>
                        </div>
                        <h3 className='text-xl font-bold text-gray-900 dark:text-white'>Quiz Management</h3>
                        <p className='mt-3 leading-7 text-gray-600 dark:text-gray-400'>
                            Save quiz details, preparation dates, and upcoming quiz
                            information to stay ready.
                        </p>
                    </div>
                    <div className="h-full rounded-2xl border border-blue-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-950">
                            <FolderHeart className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Project Organization</h3>
                        <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">
                            Manage academic projects, deadlines, progress, and important
                            project details.
                        </p>
                    </div>
                    <div className="h-full rounded-2xl border border-blue-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950">
                            <BookOpen className="h-6 w-6 text-sky-600 dark:text-sky-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Course Management</h3>
                        <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">
                            Create and manage your courses so your academic information
                            remains properly organized.
                        </p>
                    </div>
                    <div className="h-full rounded-2xl border border-blue-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-950">
                            <CalendarDays className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Daily Tasks</h3>
                        <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">
                            Plan the study tasks you need to complete during the day and
                            monitor your progress.
                        </p>
                    </div>
                    <div className="h-full rounded-2xl border border-blue-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 dark:bg-pink-950">
                            <CheckSquare className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Todo Tasks</h3>
                        <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">
                            Create todo items, update their status, and remove completed
                            or unnecessary tasks.
                        </p>
                    </div>
                    <div className="h-full rounded-2xl border border-blue-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-950">
                            <LayoutDashboard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Study Dashboard</h3>
                        <p className="mt-3 leading-7 text-gray-600 dark:text-gray-400">
                            View totals, recent notes, upcoming assignments, quizzes,
                            projects, and tasks from one dashboard.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default HomeFeatures