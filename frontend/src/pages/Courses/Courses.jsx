import {
  BookOpen,
  CheckCircle2,
  Clock3,
  UserRound,
} from "lucide-react";

import { useState, useEffect, useMemo, useRef } from "react";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import CourseToolbar from "../../components/courses/CourseToolbar";
import CourseForm from "../../components/courses/CourseForm";
import CourseList from "../../components/courses/CourseList";
import StatCard from "../../components/courses/CourseStats";

const API_URL = "http://localhost:5000/api/course";

const emptyForm = {
  title: "",
  courseCode: "",
  semester: "",
  instructor: "",
  description: "",
  status: "Active",
};

function Courses(){
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [attachment, setAttachment] = useState(null);

  const [openMenuId, setOpenMenuId] = useState(null);

  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [fetching, setFetching] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const formSectionRef = useRef(null);

  const titleInputRef = useRef(null);

  const token = localStorage.getItem("token");

  async function fetchCourses() {
    try {
      setFetching(true);
      setError("");

      const queryParams = new URLSearchParams({
        search,
        semester : semesterFilter,
        sort : sortBy
      })
      const response = await fetch(`${API_URL}/get?${queryParams}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch courses");
      }

      setCourses(data.data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setFetching(false);
    }
  }

  useEffect(() => {
    fetchCourses();
  }, [search, semesterFilter, sortBy]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
    

    setError("");
    setSuccessMessage("");
  }
  function handleAttachmentChange(event) {
    const file = event.target.files[0];
    setAttachment(file || null);
}

  function openCourseForm() {
    setIsFormOpen(true);

    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      titleInputRef.current?.focus();
    }, 0);
  }
  function handleNewCourse() {
    setForm(emptyForm);
    setAttachment(null);
    setEditId(null);
    setOpenMenuId(null);
    setError("");
    setSuccessMessage("");
    openCourseForm();
  }

  function handleEdit(course) {
    setEditId(course._id);

    setForm({
      title: course.title || "",
      courseCode: course.courseCode || "",
      semester: course.semester || "",
      instructor: course.instructor || "",
      description: course.description || "",
      status: course.status || "Active",
    });
    setAttachment(null);
    setOpenMenuId(null);
    setError("");
    setSuccessMessage("");
    openCourseForm();
  }
  function resetForm() {
    setForm(emptyForm);
    setAttachment(null);
    setEditId(null);
    setOpenMenuId(null);
  }

  function handleCancel() {
    resetForm();
    setIsFormOpen(false);
    setError("");
    setSuccessMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (
      !form.title.trim() ||
      !form.courseCode.trim() ||
      !form.semester ||
      !form.instructor.trim() ||
      !form.description.trim()
    ) {
      setError("Please complete all required fields.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      const formData = new FormData();
        formData.append("title", form.title.trim());
        formData.append("courseCode", form.courseCode.trim());
        formData.append("semester", Number(form.semester));
        formData.append("instructor", form.instructor.trim());
        formData.append("description", form.description.trim());

        if (editId) {
            formData.append("status", form.status);
        }
        if (attachment) {
            formData.append("attachment", attachment);
        }

      const response = await fetch(
        editId
          ? `${API_URL}/edit/${editId}`
          : `${API_URL}/add`,
        {
          method: editId ? "PUT" : "POST",

          headers:{
             Authorization : `Bearer ${token}`
          },
          body: formData,
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Unable to save course");
      }
      setSuccessMessage(
        editId
          ? "Course updated successfully."
          : "Course created successfully.",
      );
      resetForm();
      setIsFormOpen(false);
      await fetchCourses();
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(courseId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this course?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(courseId);
      setError("");
      setSuccessMessage("");
      setOpenMenuId(null);

      const response = await fetch(
        `${API_URL}/delete/${courseId}`,
        {
          method: "DELETE",

          headers:{
            Authorization: `Bearer ${token}`
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete course");
      }

      setCourses((previousCourses) =>
        previousCourses.filter(
          (course) => course._id !== courseId,
        ),
      );

      if (editId === courseId) {
        resetForm();
      }
      setSuccessMessage("Course deleted successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  const courseStats = useMemo(() => {
    const instructors = new Set(
      courses
        .map((course) => course.instructor?.trim())
        .filter(Boolean),
    );

    return {
      total: courses.length,
      active: courses.filter(
        (course) => course.status === "Active",
      ).length,
      completed: courses.filter(
        (course) => course.status === "Completed",
      ).length,
      instructors: instructors.size,
    };
  }, [courses]);

  // ============================
  // SEMESTERS
  // ============================

  const semesters = useMemo(() => {
  return [
    ...new Set(
      courses
        .map((course) => course.semester)
        .filter(Boolean),
    ),
  ].sort((a, b) => a - b);
}, [courses]);



  return(
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 lg:flex">
      <DashboardSidebar
      isSidebarOpen={isSidebarOpen}
      setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="min-w-0 flex-1">
        <DashboardHeader setIsSidebarOpen={setIsSidebarOpen} /> 
          <main className="mx-auto max-w-7xl px-4 mt-20 py-6 sm:px-6 lg:pl-68">
            <CourseToolbar
            search={search}
            setSearch={setSearch}
            semesterFilter={semesterFilter}
            setSemesterFilter={setSemesterFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            semesters={semesters}
            courses={courses}
            handleNewCourse={handleNewCourse}
            />
                {error && (
                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/50 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-400">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/50 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        {successMessage}
                    </div>
                )}
                <div className="mt-6">
                <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                    title="Total Courses"
                    value={courseStats.total}
                    subtitle="All your courses"
                    icon={<BookOpen size={22} />}
                    iconClass="bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400"
                    />
                    <StatCard
                    title="Active Courses"
                    value={courseStats.active}
                    subtitle="Currently in progress"
                    icon={<Clock3 size={22} />}
                    iconClass="bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400"
                    />
                    <StatCard
                    title="Completed Courses"
                    value={courseStats.completed}
                    subtitle="Successfully completed"
                    icon={<CheckCircle2 size={22} />}
                    iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400"
                    />
                    <StatCard
                    title="Instructors"
                    value={courseStats.instructors}
                    subtitle="Total instructors"
                    icon={<UserRound size={22} />}
                    iconClass="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400"
                    />
                </section>
                </div>
                <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
                    <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                        <CourseList
                        courses={courses}
                        fetching={fetching}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        deletingId={deletingId}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        />
                        {!fetching && (
                          <div className="mt-6 flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Showing page 1 of 1 • {courses.length} total {courses.length === 1 ? "course" : "courses"}
                            </p>
                          </div>
                        )}
            </section>
            <CourseForm
            form={form}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            attachment={attachment}
            handleAttachmentChange={handleAttachmentChange}
            editId={editId}
            submitting={submitting}
            resetForm={resetForm}
            isFormOpen={isFormOpen}
            formSectionRef={formSectionRef}
            titleInputRef={titleInputRef}
            setIsFormOpen={setIsFormOpen}
            /> 
                </div>
            </main>
        </div>
    </div>
  )
}

export default Courses;