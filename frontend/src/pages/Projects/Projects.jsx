import ModuleLayout, { ModuleColumns, ModuleRecords } from "../../components/ui/ModuleLayout";
import Pagination from "../../components/ui/Pagination";
import useFormDraft from "../../hooks/useFormDraft";
import {
  Award,
  CheckCircle2,
  Clock3,
  Folder,
} from "lucide-react";

import { useState, useEffect, useMemo, useRef } from "react";
import ProjectForm from "../../components/projects/ProjectForm";
import ProjectList from "../../components/projects/ProjectList";
import ProjectToolbar from "../../components/projects/ProjectToolbar";
import StatCard from "../../components/projects/ProjectStats";

const API_URL = "http://localhost:5000/api/project";

const emptyForm = {
  title: "",
  description: "",
  course: "",
  technologies: "",
  dueDate: "",
  totalMark: "",
  obtainedMark: "",
  status: "In Progress",
};

const statusStyles = {
  "In Progress":
    "bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-400 dark:ring-blue-500/30",
  Completed:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-500/30",
  Graded:
    "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-950/40 dark:text-violet-400 dark:ring-violet-500/30",
};

function Projects() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [editId, setEditId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [attachment, setAttachment] = useState(null);

  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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

  async function fetchProjects() {
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
        throw new Error(data.message || "Unable to fetch projects");
      }
      setProjects(data.data || []);
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
    fetchProjects();
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

  function openProjectForm() {
    setIsFormOpen(true);

    setTimeout(() => {
      if (window.matchMedia("(min-width: 1024px)").matches) { formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      }); }

      titleInputRef.current?.focus();
    }, 0);
  }

  function handleNewProject() {
    if (submitting || !confirmDiscard()) return;
    setForm(emptyForm);
    setAttachment(null);
    setEditId(null);
    setOpenMenuId(null);
    setError("");
    setSuccessMessage("");
    openProjectForm();
  }

  function handleEdit(project) {
    if (submitting || !confirmDiscard()) return;
    setEditId(project._id);
    setForm({
      title: project.title || "",
      description: project.description || "",
      course: project.course?._id || "",

      technologies: Array.isArray(project.technologies)
        ? project.technologies.join(", ")
        : project.technologies || "",

      dueDate: project.dueDate
        ? String(project.dueDate).slice(0, 10)
        : "",

      totalMark: project.totalMark ?? "",
      obtainedMark: project.obtainedMark ?? "",
      status: project.status || "In Progress",
    });
    setAttachment(null);

    setOpenMenuId(null);
    setError("");
    setSuccessMessage("");
    openProjectForm();
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
      !form.description.trim() ||
      !form.course.trim() ||
      !form.technologies.trim() ||
      !form.dueDate ||
      !form.totalMark
    ) {
      setError("Please complete all required fields.");
      return;
    }

    const totalMark = Number(form.totalMark);

    const obtainedMark =
      form.obtainedMark === ""
        ? undefined
        : Number(form.obtainedMark);

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
      const technologies = form.technologies
        .split(",")
        .map((technology) => technology.trim())
        .filter(Boolean);

      formData.append("technologies", JSON.stringify(technologies));
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
        throw new Error(data.message || "Unable to save project");
      }

      setSuccessMessage(
        editId
          ? "Project updated successfully."
          : "Project created successfully.",
      );

      resetForm();
      setIsFormOpen(false);

      await fetchProjects();
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(projectId) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(projectId);
      setError("");
      setSuccessMessage("");
      setOpenMenuId(null);

      const response = await fetch(`${API_URL}/delete/${projectId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete project");
      }

      setProjects((previousProjects) =>
        previousProjects.filter((project) => project._id !== projectId),
      );

      if (editId === projectId) {
        resetForm();
      }

      setSuccessMessage("Project deleted successfully.");
    } catch (error) {
      setError(error.message);
    } finally {
      setDeletingId(null);
    }
  }

  const projectStats = useMemo(() => {
    return {
      total: projects.length,
      inProgress: projects.filter(
        (project) => project.status === "In Progress",
      ).length,
      completed: projects.filter(
        (project) => project.status === "Completed",
      ).length,
      graded: projects.filter(
        (project) => project.status === "Graded",
      ).length,
    };
  }, [projects]);

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

  function formatTechnologies(technologies) {
    if (!technologies) {
      return "";
    }
    if (Array.isArray(technologies)) {
      return technologies.join(", ");
    }
    return technologies;
  }

  return (
    <ModuleLayout isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen}>
          <ProjectToolbar

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
            projects={projects}
            handleNewProject={handleNewProject}
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
                title="Total Projects"
                value={projectStats.total}
                subtitle="All projects"
                icon={<Folder size={22} />}
                iconClass="bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400"
              />
              <StatCard
                title="In Progress"
                value={projectStats.inProgress}
                subtitle="Currently in progress"
                icon={<Clock3 size={22} />}
                iconClass="bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400"
              />
              <StatCard
                title="Completed"
                value={projectStats.completed}
                subtitle="Successfully completed"
                icon={<CheckCircle2 size={22} />}
                iconClass="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
              />
              <StatCard
                title="Graded"
                value={projectStats.graded}
                subtitle="Projects graded"
                icon={<Award size={22} />}
                iconClass="bg-blue-100 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400"
              />
            </section>
          </div>

          <ModuleColumns>
            <ModuleRecords title="Projects" pagination={!fetching && <Pagination totalItems={projects.length} itemLabel="project" />}>
              <ProjectList
                projects={projects}
                fetching={fetching}
                openMenuId={openMenuId}
                setOpenMenuId={setOpenMenuId}
                deletingId={deletingId}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                statusStyles={statusStyles}
                formatDate={formatDate}
                formatTechnologies={formatTechnologies}
              />
            </ModuleRecords>

            <ProjectForm
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


          </ModuleColumns>
    </ModuleLayout>
  );
}

export default Projects;