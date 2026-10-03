import {
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Flag,
} from "lucide-react";
import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import DailyTaskToolbar from "../../components/dailyTasks/DailyTaskToolbar";
import StatCard from "../../components/dailyTasks/DailyTaskStats";
import DailyTaskForm from "../../components/dailyTasks/DailyTaskForm";
import DailyTaskList from "../../components/dailyTasks/DailyTaskList";
import DailyTaskPagination from "../../components/dailyTasks/DailyTaskPagination";

const API_URL = "http://localhost:5000/api/dailyTask";

const emptyForm = {
  title: "",
  description: "",
  taskDate: "",
  priority: "Medium",
  status: "Pending",
};

const priorityStyles = {
  High: "bg-red-50 text-red-600 ring-red-600/20 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-500/30",
  Medium: "bg-amber-50 text-amber-600 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-500/30",
  Low: "bg-emerald-50 text-emerald-600 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/30",
};

function DailyTasks() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editId, setEditId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [limit] = useState(10);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const [fetching, setFetching] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingTaskId, setUpdatingTaskId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const formSectionRef = useRef(null);
  const titleInputRef = useRef(null);

  const token = localStorage.getItem("token");

  const fetchTasks = useCallback(async () => {
    try {
      setFetching(true);
      setError("");

      const queryParams = new URLSearchParams({
        search,
        priority: priorityFilter,
        date: dateFilter,
        sort: sortBy,
        page: currentPage,
        limit,
      });

      const response = await fetch(`${API_URL}/get?${queryParams}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to fetch daily tasks");
      }

      setTasks(data.data || []);
      setTotalPages(data.pagination?.totalPages || 1);
      setTotalItems(data.pagination?.totalItems || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setFetching(false);
    }
  }, [search, priorityFilter, dateFilter, sortBy, currentPage, limit, token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, priorityFilter, dateFilter, sortBy]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    if (isFormOpen) {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      titleInputRef.current?.focus();
    }
  }, [isFormOpen]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccessMessage("");
  }

  function handleNewTask() {
    setForm(emptyForm);
    setEditId(null);
    setOpenMenuId(null);
    setError("");
    setSuccessMessage("");
    setIsFormOpen(true);
  }

  function handleEdit(task) {
    setEditId(task._id);
    setForm({
      title: task.title || "",
      description: task.description || "",
      taskDate: task.taskDate ? String(task.taskDate).slice(0, 10) : "",
      priority: task.priority || "Medium",
      status: task.status || "Pending",
    });
    setOpenMenuId(null);
    setError("");
    setSuccessMessage("");
    setIsFormOpen(true);
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

    if (!form.title.trim() || !form.taskDate) {
      setError("Task title and task date are required.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      taskDate: form.taskDate,
      priority: form.priority,
    };

    if (editId) {
      payload.status = form.status;
    }

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
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save daily task");
      }

      setSuccessMessage(
        editId
          ? "Daily task updated successfully."
          : "Daily task created successfully."
      );

      resetForm();
      setIsFormOpen(false);
      await fetchTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleComplete(task) {
    try {
      setUpdatingTaskId(task._id);
      setError("");

      const payload = {
        title: task.title,
        description: task.description || "",
        taskDate: task.taskDate,
        priority: task.priority,
        status: task.status === "Completed" ? "Pending" : "Completed",
      };

      const response = await fetch(`${API_URL}/edit/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update task");
      }

      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? data.data : t))
      );
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingTaskId(null);
    }
  }

  async function handleDelete(taskId) {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      setDeletingId(taskId);
      setError("");
      setSuccessMessage("");
      setOpenMenuId(null);

      const response = await fetch(`${API_URL}/delete/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete daily task");
      }

      if (editId === taskId) {
        resetForm();
      }

      setSuccessMessage("Daily task deleted successfully.");

      if (tasks.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        await fetchTasks();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  const taskStats = useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === "Pending").length,
      completed: tasks.filter((t) => t.status === "Completed").length,
      highPriority: tasks.filter(
        (t) => t.priority === "High" && t.status !== "Completed"
      ).length,
    };
  }, [tasks]);

  function formatDate(date) {
    if (!date) return "";
    const [year, month, day] = date.slice(0, 10).split("-");
    return new Date(year, month - 1, day).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  return (
    <div className="min-h-screen bg-slate-100 transition-colors dark:bg-slate-950 lg:flex">
      <DashboardSidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="min-w-0 flex-1">
        <DashboardHeader setIsSidebarOpen={setIsSidebarOpen} />
        <main className="mx-auto max-w-7xl px-4 mt-20 py-6 sm:px-6 lg:pl-68">
          <DailyTaskToolbar
            search={search}
            setSearch={setSearch}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            dateFilter={dateFilter}
            setDateFilter={setDateFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
            dailyTasks={tasks}
            handleNewTask={handleNewTask}
          />

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/50 dark:text-red-400">
              {error}
            </div>
          )}
          {successMessage && (
            <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/50 dark:text-emerald-400">
              {successMessage}
            </div>
          )}

          <div className="mt-6">
            <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Tasks"
                value={taskStats.total}
                subtitle="Page items"
                icon={<ClipboardCheck size={22} />}
                iconClass="bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-400"
              />
              <StatCard
                title="Pending"
                value={taskStats.pending}
                subtitle="Tasks to do"
                icon={<Clock3 size={22} />}
                iconClass="bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
              />
              <StatCard
                title="Completed"
                value={taskStats.completed}
                subtitle="Tasks done"
                icon={<CheckCircle2 size={22} />}
                iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
              />
              <StatCard
                title="High Priority"
                value={taskStats.highPriority}
                subtitle="High priority tasks"
                icon={<Flag size={22} />}
                iconClass="bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-400"
              />
            </section>
          </div>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
            <section className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="border-b border-slate-200 p-4 dark:border-slate-800">
                <DailyTaskList
                  tasks={tasks}
                  fetching={fetching}
                  updatingTaskId={updatingTaskId}
                  handleToggleComplete={handleToggleComplete}
                  priorityStyles={priorityStyles}
                  openMenuId={openMenuId}
                  setOpenMenuId={setOpenMenuId}
                  handleEdit={handleEdit}
                  deletingId={deletingId}
                  handleDelete={handleDelete}
                  formatDate={formatDate}
                />
              </div>

              {!fetching && tasks.length > 0 && (
                <DailyTaskPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  setCurrentPage={setCurrentPage}
                />
              )}
            </section>

            <DailyTaskForm
              form={form}
              handleChange={handleChange}
              handleSubmit={handleSubmit}
              editId={editId}
              submitting={submitting}
              handleCancel={handleCancel}
              isFormOpen={isFormOpen}
              formSectionRef={formSectionRef}
              titleInputRef={titleInputRef}
              setIsFormOpen={setIsFormOpen}
              setForm={setForm}
            />

            {isFormOpen && (
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs xl:hidden dark:bg-slate-950/70"
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DailyTasks;