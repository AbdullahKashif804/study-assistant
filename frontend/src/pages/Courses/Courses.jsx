import ModuleLayout, { ModuleColumns, ModuleRecords } from "../../components/ui/ModuleLayout";
import Pagination from "../../components/ui/Pagination";
import useFormDraft from "../../hooks/useFormDraft";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  UserRound,
} from "lucide-react";

import { useState, useEffect, useMemo, useRef } from "react";
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

async function fetchCurrentSemester(token) {
  const response = await fetch("http://localhost:5000/api/user/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Unable to fetch current semester");
  }

  return data.data.currentSemester;
}

function Courses(){
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [currentSemester, setCurrentSemester] = useState("");
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
  const confirmDiscard = useFormDraft(form, attachment, { ...emptyForm, semester: currentSemester });
  const token = localStorage.getItem("token");

  useEffect(() => {
    let cancelled = false;

    fetchCurrentSemester(token)
      .then((semester) => {
        if (cancelled) return;
        setCurrentSemester(semester);
        setForm((previousForm) => previousForm.semester
          ? previousForm
          : { ...previousForm, semester });
      })
      .catch((error) => {
        if (!cancelled) setError(error.message);
      });

    return () => { cancelled = true; };
  }, [token]);

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
      if (window.matchMedia("(min-width: 1024px)").matches) { formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      }); }

      titleInputRef.current?.focus();
    }, 0);
  }
  async function handleNewCourse() {
    if (submitting || !confirmDiscard()) return;
    let semester;
    try {
      semester = await fetchCurrentSemester(token);
    } catch (error) {
      setError(error.message);
      return;
    }
    setCurrentSemester(semester);
    setForm({ ...emptyForm, semester });
    setAttachment(null);
    setEditId(null);
    setOpenMenuId(null);
    setError("");
    setSuccessMessage("");
    openCourseForm();
  }

  function handleEdit(course) {
    if (submitting || !confirmDiscard()) return;
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
    setForm({ ...emptyForm, semester: currentSemester });
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



  return (
    <ModuleLayout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
            <CourseToolbar

            busy={submitting}
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
                    <div className="mt-5 rounded-xl border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/50 px-4 py-3 text-sm font-medium text-red-700 dark:text-red-400">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/50 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        {successMessage}
                    </div>
                )}
                <div className="mt-6">
                <section className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
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
                <ModuleColumns>
                    <ModuleRecords title="Courses" pagination={!fetching && <Pagination totalItems={courses.length} itemLabel="course" />}>
                        <CourseList
                        courses={courses}
                        fetching={fetching}
                        openMenuId={openMenuId}
                        setOpenMenuId={setOpenMenuId}
                        deletingId={deletingId}
                        handleEdit={handleEdit}
                        handleDelete={handleDelete}
                        />
            </ModuleRecords>
            <CourseForm
              error={error}
              confirmDiscard={confirmDiscard}
            form={form}
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            attachment={attachment}
            handleAttachmentChange={handleAttachmentChange}
            editId={editId}
            submitting={submitting}
            handleCancel={handleCancel}
            isFormOpen={isFormOpen}
            formSectionRef={formSectionRef}
            titleInputRef={titleInputRef}
            setIsFormOpen={setIsFormOpen}
            />
                </ModuleColumns>
                </ModuleLayout>
  );
}

export default Courses;
