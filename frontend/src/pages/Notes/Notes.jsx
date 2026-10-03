import { useState, useEffect, useRef } from "react";
import DashboardHeader from "../../components/dashboard/DashboardHeader";
import DashboardSidebar from "../../components/dashboard/DashboardSidebar";
import NotesToolbar from "../../components/notes/NotesToolbar";
import NoteForm from "../../components/notes/NoteForm";
import NotesList from "../../components/notes/NotesList";
import NotePagination from "../../components/notes/NotePagination";

const API_URL = "http://localhost:5000/api/note";

const emptyForm = {
    title: "",
    content: "",
    course: "",
};

function Notes() {
    const [notes, setNotes] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [attachment, setAttachment] = useState(null);

    const [editId, setEditId] = useState(null);
    const [openMenuId, setOpenMenuId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const [search, setSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("newest");
    const [courses, setCourses] = useState([]);
    const [courseFilter, setCourseFilter] = useState("");

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [refreshNotes, setRefreshNotes] = useState(0);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const [limit] = useState(10);

    const formSectionRef = useRef(null);
    const titleInputRef = useRef(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        async function fetchNotes() {
            try {
                setLoading(true);
                setError("");

                const queryParams = new URLSearchParams({
                    search,
                    course: courseFilter,
                    sort: sortOrder,
                    page: currentPage,
                    limit,
                });

                const response = await fetch(`${API_URL}/get?${queryParams}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || "Failed fetch Notes");
                }

                setNotes(data.data || []);
                setTotalPages(data.pagination?.totalPages || 1);
                setTotalItems(data.pagination?.totalItems || 0);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        }

        fetchNotes();
    }, [token, search, courseFilter, sortOrder, currentPage, limit, refreshNotes]);

    async function fetchCourses() {
        try {
            const response = await fetch("http://localhost:5000/api/course/get", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to fetch courses");
            }

            setCourses(data.data || []);
        } catch (error) {
            setError(error.message);
        }
    }

    useEffect(() => {
        fetchCourses();
    }, [token]);

    function handleChange(event) {
        const { name, value } = event.target;
        setForm((currentForm) => ({
            ...currentForm,
            [name]: value,
        }));
    }

    function handleAttachmentChange(event) {
        const file = event.target.files[0];
        setAttachment(file || null);
    }

    function handleSearchChange(value) {
        setSearch(value);
        setCurrentPage(1);
    }

    function handleSortChange(value) {
        setSortOrder(value);
        setCurrentPage(1);
    }

    function handleCourseChange(value) {
        setCourseFilter(value);
        setCurrentPage(1);
    }

    function OpenCreateForm() {
        setForm(emptyForm);
        setAttachment(null);
        setEditId(null);
        setOpenMenuId(null);
        setError("");
        setSuccessMessage("");
        setIsFormOpen(true);

        setTimeout(() => {
            formSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
            titleInputRef.current?.focus();
        }, 100);
    }

    function handleEdit(note) {
        setEditId(note._id);
        setForm({
            title: note.title || "",
            content: note.content || "",
            course: note.course?._id || "",
        });

        setOpenMenuId(null);
        setError("");
        setSuccessMessage("");
        setIsFormOpen(true);

        setTimeout(() => {
            formSectionRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
            titleInputRef.current?.focus();
        }, 100);
    }

    function resetForm() {
        setForm(emptyForm);
        setAttachment(null);
        setEditId(null);
        setIsFormOpen(false);
        setError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!form.title.trim() || !form.content.trim()) {
            setError("Title and content are required");
            return;
        }

        try {
            setSubmitting(true);
            setError("");
            setSuccessMessage("");

            const formData = new FormData();
            formData.append("title", form.title.trim());
            formData.append("content", form.content.trim());

            if (form.course) {
                formData.append("course", form.course);
            }

            if (attachment) {
                formData.append("attachment", attachment);
            }

            const requestUrl = editId ? `${API_URL}/edit/${editId}` : `${API_URL}/add`;
            const requestMethod = editId ? "PUT" : "POST";

            const response = await fetch(requestUrl, {
                method: requestMethod,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || (editId ? "Failed to update note" : "Failed to add note")
                );
            }

            if (editId) {
                setNotes((currentNotes) =>
                    currentNotes.map((note) => (note._id === editId ? data.data : note))
                );
                setSuccessMessage("Note updated Successfully");
            } else {
                setSuccessMessage("Note created Successfully");
                setRefreshNotes((current) => current + 1);
            }

            setForm(emptyForm);
            setAttachment(null);
            setEditId(null);
            setIsFormOpen(false);
        } catch (error) {
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(noteId) {
        const confirmed = window.confirm("Are you sure you want to delete this note?");

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(noteId);
            setOpenMenuId(null);
            setError("");
            setSuccessMessage("");

            const response = await fetch(`${API_URL}/delete/${noteId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to delete note");
            }

            setNotes((currentNotes) => currentNotes.filter((note) => note._id !== noteId));

            if (editId === noteId) {
                setForm(emptyForm);
                setAttachment(null);
                setEditId(null);
                setIsFormOpen(false);
            }

            setSuccessMessage("Note deleted Successfully");
            setRefreshNotes((current) => current + 1);
        } catch (error) {
            setError(error.message);
        } finally {
            setDeletingId(null);
        }
    }

    function formatDate(date) {
        if (!date) return "no date";

        return new Date(date).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    }

    function getCardStyle(index) {
        const styles = [
            { border: "border-t-blue-500", icon: "bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400" },
            { border: "border-t-emerald-500", icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400" },
            { border: "border-t-violet-500", icon: "bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400" },
            { border: "border-t-amber-500", icon: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400" },
        ];

        return styles[index % styles.length];
    }

    return (
        <main className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
            {/* Sidebar */}
            <DashboardSidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            {/* Header */}
            <DashboardHeader setIsSidebarOpen={setIsSidebarOpen} />

            {/* Main Content */}
            <div className="min-w-0 flex-1">
                <section className="mx-auto mt-20 max-w-7xl px-4 py-6 sm:px-6 lg:pl-68">
                    {/* Toolbar */}
                    <NotesToolbar
                        search={search}
                        setSearch={handleSearchChange}
                        sortOrder={sortOrder}
                        setSortOrder={handleSortChange}
                        courseFilter={courseFilter}
                        setCourseFilter={handleCourseChange}
                        courses={courses}
                        notes={notes}
                        OpenCreateForm={OpenCreateForm}
                    />

                    {/* Error Message */}
                    {error && (
                        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* Success Message */}
                    {successMessage && (
                        <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-400">
                            {successMessage}
                        </div>
                    )}

                    {/* Notes + Form Grid */}
                    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
                        <div className="xl:col-span-2">
                            <NotesList
                                loading={loading}
                                search={search}
                                notes={notes}
                                OpenCreateForm={OpenCreateForm}
                                getCardStyle={getCardStyle}
                                openMenuId={openMenuId}
                                setOpenMenuId={setOpenMenuId}
                                deletingId={deletingId}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                formatDate={formatDate}
                            />

                            <NotePagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                setCurrentPage={setCurrentPage}
                            />
                        </div>

                        <div className="xl:sticky xl:top-24 xl:max-h-[calc(100vh-6rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain">
                            <NoteForm
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
                                courses={courses}
                            />
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default Notes;