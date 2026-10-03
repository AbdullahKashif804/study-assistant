import { Plus, Search } from "lucide-react";

function CourseToolbar({
    search,
    setSearch,
    semesterFilter,
    setSemesterFilter,
    sortBy,
    setSortBy,
    semesters,
    courses,
    handleNewCourse,
}){
    return(
        <>
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
                Courses
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Manage your courses and track your learning
                journey.
            </p>
        </div>
        <button
        type="button"
        onClick={handleNewCourse}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-100 dark:bg-indigo-600 dark:hover:bg-indigo-500 dark:focus:ring-indigo-950/50"
        >
            <Plus size={18} />
            New Course
        </button>
    </div>
        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative flex-1">
                <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
                <input
                type="search"
                value={search}
                onChange={(event) =>
                    setSearch(event.target.value)
                    }
                placeholder="Search courses..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500 dark:focus:ring-indigo-950"
                />
            </div>
            <select
            value={semesterFilter}
            onChange={(event) =>
                setSemesterFilter(event.target.value)
                }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:focus:ring-indigo-950"
            >
                <option value="" className="dark:bg-slate-900">
                    All Semesters
                </option>
                {semesters.map((semester) => (
                    <option
                    key={semester}
                    value={semester}
                    className="dark:bg-slate-900"
                    >
                        Semester {semester}
                    </option>
                ))}
            </select>
            <select
            value={sortBy}
            onChange={(event) =>
                setSortBy(event.target.value)
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:ring-4 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:focus:ring-indigo-950"
            >
                <option value="newest" className="dark:bg-slate-900">
                    Newest
                </option>
                <option value="oldest" className="dark:bg-slate-900">
                    Oldest
                </option>
                <option value="title" className="dark:bg-slate-900">
                    Title
                </option>
            </select>
        </div>
         <div className="mb-4 mt-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            All Courses
          </h3>
        </div>
      </div>

    
    </>
    )
}

export default CourseToolbar;