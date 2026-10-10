import Pagination from "../../components/ui/Pagination";
import useFormDraft from "../../hooks/useFormDraft";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  GraduationCap,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import AssignmentToolbar from "../../components/assignments/AssignmentToolbar";
import AssignmentForm from "../../components/assignments/AssignmentForm";
import AssignmentList from "../../components/assignments/AssignmentList";
import StatCard from "../../components/assignments/AssignmentStats";

const API_URL = "http://localhost:5000/api/assignment";

const emptyForm = {
  title: "",
  description: "",
  course: "",
  dueDate: "",
  status: "Pending",
  totalMark: "",
  obtainedMark: "",
};

const statusStyles = {
  Pending:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-500/30",
  Completed:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/30",
  Submitted:
    "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-500/30",
  Graded:
    "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-950/40 dark:text-violet-400 dark:ring-violet-500/30",
};

function Assignments() {
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editId, setEditId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [attachment, setAttachment] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [courses, setCourses] = useState([]);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formSectionRef = useRef(null);
  const titleInputRef = useRef(null);

  const confirmDiscard = useFormDraft(form, attachment, emptyForm);

  const token = localStorage.getItem("token");

  async function fetchAssignments() {
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
        throw new Error(data.message || "Unable to fetch assignments");
      }

      setAssignments(data.data || []);
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
    fetchAssignments();
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

  function handleAttachmentChange(event) {
    const file = event.target.files[0];
    setAttachment(file || null);
  }

  function openAssignmentForm() {
    setIsFormOpen(true);

    setTimeout(() => {
      if (window.matchMedia("(min-width: 1024px)").matches) { formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      }); }

      titleInputRef.current?.focus();
    }, 100);
  }

  function handleNewAssignment() {
    if (submitting || !confirmDiscard()) return;
    setForm(emptyForm);
    setAttachment(null);
    setEditId(null);
    setOpenMenuId(null);
    setError("");
    setSuccessMessage("");
    openAssignmentForm();
  }

  function handleEdit(assignment) {
    if (submitting || !confirmDiscard()) return;
    setEditId(assignment._id);

    setForm({
      title: assignment.title || "",
      description: assignment.description || "",
      course: assignment.course?._id || "",
      dueDate: assignment.dueDate
        ? String(assignment.dueDate).slice(0, 10)
        : "",
      status: assignment.status || "Pending",
      totalMark: assignment.totalMark ?? "",
      obtainedMark: assignment.obtainedMark ?? "",
    });

    setAttachment(null);

    setOpenMenuId(null);
    setError("");
    setSuccessMessage("");
    openAssignmentForm();
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

    const totalMark = Number(form.totalMark);

    const obtainedMark =
      form.obtainedMark === "" ? undefined : Number(form.obtainedMark);

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.course.trim() ||
      !form.dueDate ||
      !form.totalMark
    ) {
      setError("Please complete all required fields.");
      return;
    }

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

    try {
      setSubmitting(true);
      setError("");
      setSuccessMessage("");

      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("description", form.description.trim());
      formData.append("course", form.course.trim());
      formData.append("dueDate", form.dueDate);
      formData.append("totalMark", totalMark);

      if (obtainedMark !== undefined) {
        formData.append("obtainedMark", obtainedMark);
      }

      if (editId) {
        formData.append("status", form.status);
      }

      if (attachment) {
        formData.append("attachment", attachment);
      }

      const response = await fetch(
        editId ? `${API_URL}/edit/${editId}` : `${API_URL}/add`,
        {
          method: editId ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save assignment");
      }

      setSuccessMessage(
        editId
          ? "Assignment updated successfully."
          : "Assignment created successfully.",
      );

      resetForm();
      setIsFormOpen(false);
      await fetchAssignments();
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(assignmentId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this assignment?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(assignmentId);
      setError("");
      setSuccessMessage("");
      setOpenMenuId(null);

      const response = await fetch(`${API_URL}/delete/${assignmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete assignment");
      }

      setAssignments((previousAssignments) =>
        previousAssignments.filter(
          (assignment) => assignment._id !== assignmentId,
        ),
      );

      if (editId === assignmentId) {
        resetForm();
      }

      setSuccessMessage("Assignment deleted successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  const assignmentStats = useMemo(() => {
    return {
      total: assignments.length,

      pending: assignments.filter(
        (assignment) => assignment.status === "Pending",
      ).length,

      completed: assignments.filter(
        (assignment) => assignment.status === "Completed",
      ).length,

      graded: assignments.filter(
        (assignment) => assignment.status === "Graded",
      ).length,
    };
  }, [assignments]);

  function formatDate(date) {
    if (!date) {
      return "No due date";
    }

    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  }

  function isOverdue(assignment) {
    return (
      assignment.status !== "Completed" &&
      assignment.status !== "Graded" &&
      new Date(assignment.dueDate) < new Date()
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 lg:flex">
      <DashboardSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="min-w-0 flex-1">
        <DashboardHeader setIsSidebarOpen={setIsSidebarOpen} />
        <main className="workspace-content ">
          <AssignmentToolbar

            busy={submitting}
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            assignments={assignments}
            courses={courses}
            handleNewAssignment={handleNewAssignment}
            courseFilter={courseFilter}
            setCourseFilter={setCourseFilter}
          />

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
              {successMessage}
            </div>
          )}

          <div className="mt-6">
            <section className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
              <StatCard
                title="Total Assignments"
                value={assignmentStats.total}
                icon={<ClipboardList size={21} />}
                iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
              />
              <StatCard
                title="Pending"
                value={assignmentStats.pending}
                icon={<Clock3 size={21} />}
                iconClass="bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
              />
              <StatCard
                title="Completed"
                value={assignmentStats.completed}
                icon={<CheckCircle2 size={21} />}
                iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
              />
              <StatCard
                title="Graded"
                value={assignmentStats.graded}
                icon={<GraduationCap size={21} />}
                iconClass="bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400"
              />
            </section>
          </div>

          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.85fr)] xl:grid-cols-[minmax(0,1fr)_400px]">
            <section aria-label="Assignments" className="module-records overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="border-b border-slate-200 px-5 py-4 text-lg font-bold text-slate-900 dark:border-slate-800 dark:text-slate-100">All Assignments</h2>
              <div className="p-4 sm:p-5">
                <AssignmentList
                  assignments={assignments}
                  fetching={fetching}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  deletingId={deletingId}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  statusStyles={statusStyles}
                  isOverdue={isOverdue}
                  formatDate={formatDate}
                />
              </div>
              {!fetching && <Pagination totalItems={assignments.length} itemLabel="assignment" />}
            </section>

            <div className="contents">
              <AssignmentForm
              error={error}
              confirmDiscard={confirmDiscard}
                form={form}
                handleChange={handleChange}
                handleSubmit={handleSubmit}
                handleAttachmentChange={handleAttachmentChange}
                attachment={attachment}
                editId={editId}
                submitting={submitting}
                handleCancel={handleCancel}
                isFormOpen={isFormOpen}
                formSectionRef={formSectionRef}
                titleInputRef={titleInputRef}
                setIsFormOpen={setIsFormOpen}
                courses={courses}
              />
            </div>


          </div>
        </main>
      </div>
    </div>
  );
}

export default Assignments;