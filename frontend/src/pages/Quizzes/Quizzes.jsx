import ModuleLayout, { ModuleColumns, ModuleRecords } from "../../components/ui/ModuleLayout";
import Pagination from "../../components/ui/Pagination";
import useFormDraft from "../../hooks/useFormDraft";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import QuizForm from "../../components/quizzes/QuizForm";
import QuizList from "../../components/quizzes/QuizList";
import QuizToolbar from "../../components/quizzes/QuizToolbar";
import StatCard from "../../components/quizzes/QuizStats";

const API_URL = "http://localhost:5000/api/quiz";

const emptyForm = {
  title: "",
  course: "",
  dueDate: "",
  totalMark: "",
  obtainedMark: "",
};

const statusStyles = {
  Upcoming:
    "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-500/30",
  Completed:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/30",
  Overdue:
    "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-500/30",
};

function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editId, setEditId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [courses, setCourses] = useState([]);
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

  const confirmDiscard = useFormDraft(form, null, emptyForm);

  const token = localStorage.getItem("token");

  async function fetchQuizzes() {
    try {
      setFetching(true);
      setError("");

      const queryParams = new URLSearchParams({
        search,
        course: courseFilter,
        status: statusFilter,
        sort: sortBy,
      });

      const response = await fetch(`${API_URL}/get?${queryParams}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch quizzes");
      }

      setQuizzes(data.data || []);
    } catch (error) {
      setError(error.message);
    } finally {
      setFetching(false);
    }
  }

  async function fetchCourses() {
    try {
      const response = await fetch("http://localhost:5000/api/course/get", {
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
    }
  }

  useEffect(() => {
    fetchQuizzes();
  }, [search, courseFilter, statusFilter, sortBy]);

  useEffect(() => {
    fetchCourses();
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));

    setError("");
    setSuccessMessage("");
  }

  function openQuizForm() {
    setIsFormOpen(true);

    setTimeout(() => {
      if (window.matchMedia("(min-width: 1024px)").matches) { formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      }); }

      titleInputRef.current?.focus();
    }, 0);
  }

  function handleNewQuiz() {
    if (submitting || !confirmDiscard()) return;
    setForm(emptyForm);
    setEditId(null);
    setOpenMenuId(null);
    setError("");
    setSuccessMessage("");
    openQuizForm();
  }

  function handleEdit(quiz) {
    if (submitting || !confirmDiscard()) return;
    setEditId(quiz._id);

    setForm({
      title: quiz.title || "",
      course: quiz.course?._id || "",

      dueDate: quiz.dueDate ? String(quiz.dueDate).slice(0, 10) : "",

      totalMark: quiz.totalMark ?? "",
      obtainedMark: quiz.obtainedMark ?? "",
    });

    setOpenMenuId(null);
    setError("");
    setSuccessMessage("");
    openQuizForm();
  }

  function resetForm() {
    setForm(emptyForm);
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
      !form.course.trim() ||
      !form.dueDate ||
      !form.totalMark
    ) {
      setError("Please complete all required fields.");
      return;
    }

    const totalMark = Number(form.totalMark);

    const obtainedMark =
      form.obtainedMark === "" ? undefined : Number(form.obtainedMark);

    if (totalMark <= 0) {
      setError("Total marks must be greater than zero.");
      return;
    }

    if (obtainedMark !== undefined && obtainedMark < 0) {
      setError("Obtained marks cannot be negative.");
      return;
    }

    if (obtainedMark !== undefined && obtainedMark > totalMark) {
      setError("Obtained marks cannot be greater than total marks.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      course: form.course.trim(),
      dueDate: form.dueDate,
      totalMark,
      obtainedMark,
    };

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      const response = await fetch(
        editId ? `${API_URL}/edit/${editId}` : `${API_URL}/add`,
        {
          method: editId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save quiz");
      }

      setSuccessMessage(
        editId ? "Quiz updated successfully." : "Quiz created successfully.",
      );

      resetForm();
      setIsFormOpen(false);

      await fetchQuizzes();
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(quizId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this quiz?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(quizId);
      setError("");
      setSuccessMessage("");
      setOpenMenuId(null);

      const response = await fetch(`${API_URL}/delete/${quizId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete quiz");
      }

      setQuizzes((previousQuizzes) =>
        previousQuizzes.filter((quiz) => quiz._id !== quizId),
      );

      if (editId === quizId) {
        resetForm();
      }

      setSuccessMessage("Quiz deleted successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  function getQuizStatus(quiz) {
    if (quiz.obtainedMark !== undefined && quiz.obtainedMark !== null) {
      return "Completed";
    }

    if (quiz.dueDate && new Date(quiz.dueDate) < new Date()) {
      return "Overdue";
    }
    return "Upcoming";
  }

  const quizStats = useMemo(() => {
    return {
      total: quizzes.length,

      upcoming: quizzes.filter((quiz) => getQuizStatus(quiz) === "Upcoming")
        .length,

      completed: quizzes.filter((quiz) => getQuizStatus(quiz) === "Completed")
        .length,

      overdue: quizzes.filter((quiz) => getQuizStatus(quiz) === "Overdue")
        .length,
    };
  }, [quizzes]);

  function formatDate(date) {
    if (!date) {
      return "";
    }

    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  return (
    <ModuleLayout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
            <QuizToolbar

            busy={submitting}
              search={search}
              setSearch={setSearch}
              courseFilter={courseFilter}
              setCourseFilter={setCourseFilter}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              sortBy={sortBy}
              setSortBy={setSortBy}
              courses={courses}
              quizzes={quizzes}
              handleNewQuiz={handleNewQuiz}
            />
            {error && (
              <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
                {successMessage}
              </div>
            )}
            <div className="mt-6">
              <section className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
                <StatCard
                  title="Total Quizzes"
                  value={quizStats.total}
                  subtitle="All quizzes"
                  icon={<ClipboardCheck size={22} />}
                  iconClass="bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400"
                />
                <StatCard
                  title="Upcoming"
                  value={quizStats.upcoming}
                  subtitle="Upcoming quizzes"
                  icon={<Clock3 size={22} />}
                  iconClass="bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
                />
                <StatCard
                  title="Completed"
                  value={quizStats.completed}
                  subtitle="Completed quizzes"
                  icon={<CheckCircle2 size={22} />}
                  iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                />
                <StatCard
                  title="Overdue"
                  value={quizStats.overdue}
                  subtitle="Past due quizzes"
                  icon={<AlertCircle size={22} />}
                  iconClass="bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
                />
              </section>
            </div>
            <ModuleColumns>
              <ModuleRecords title="Quizzes" pagination={!fetching && <Pagination totalItems={quizzes.length} itemLabel="quiz" />}>

                <QuizList
                  fetching={fetching}
                  quizzes={quizzes}
                  getQuizStatus={getQuizStatus}
                  statusStyles={statusStyles}
                  formatDate={formatDate}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  deletingId={deletingId}
                />
              </ModuleRecords>
              <QuizForm
              error={error}
              confirmDiscard={confirmDiscard}
                formSectionRef={formSectionRef}
                isFormOpen={isFormOpen}
                setIsFormOpen={setIsFormOpen}
                editId={editId}
                form={form}
                handleChange={handleChange}
                titleInputRef={titleInputRef}
                handleSubmit={handleSubmit}
                submitting={submitting}
                handleCancel={handleCancel}
                courses={courses}
              />

            </ModuleColumns>
              </ModuleLayout>
  );
}

export default Quizzes;
