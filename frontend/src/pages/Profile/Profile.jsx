import { useEffect, useState, useRef } from "react";

import {

  UserRound,

  Mail,

  CalendarDays,

  GraduationCap,

  Building2,

  BookOpen,

  LockKeyhole,

  Save,

  Eye,

  EyeOff,

  Camera,

  X,

} from "lucide-react";

import DashboardSidebar from "../../components/dashboard/DashboardSidebar";

import DashboardHeader from "../../components/dashboard/DashboardHeader";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

function Profile() {

  const [profile, setProfile] = useState({

    first_name: "",

    last_name: "",

    email: "",

    dateOfBirth: "",

    university: "",

    program: "",

    currentSemester: "",

    bio: "",

    profileImage: null,

  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [passwordForm, setPasswordForm] = useState({

    currentPassword: "",

    newPassword: "",

    confirmPassword: "",

  });

  const [selectedFile, setSelectedFile] = useState(null);

  const [previewUrl, setPreviewUrl] = useState(null);

  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);

  const [deletingImage, setDeletingImage] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  const [passwordMessage, setPasswordMessage] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = localStorage.getItem("token");

  // =========================

  // FETCH PROFILE

  // =========================

  useEffect(() => {

    const fetchProfile = async () => {

      try {

        const response = await fetch(`${API_BASE_URL}/api/user/profile`, {

          headers: {

            Authorization: `Bearer ${token}`,

          },

        });

        const data = await response.json();

        if (!response.ok) {

          throw new Error(data.message || "Failed to load profile");

        }

        const user = data.data;

        setProfile({

          first_name: user.first_name || "",

          last_name: user.last_name || "",

          email: user.email || "",

          dateOfBirth: user.dateOfBirth

            ? user.dateOfBirth.split("T")[0]

            : "",

          university: user.university || "",

          program: user.program || "",

          currentSemester: user.currentSemester || "",

          bio: user.bio || "",

          profileImage: user.profileImage || null,

        });

      } catch (error) {

        setMessage(error.message);
        setMessageType("error");

      } finally {

        setLoading(false);

      }

    };

    fetchProfile();

  }, [token]);

  // =========================

  // CLEAN PREVIEW URL

  // =========================

  useEffect(() => {

    return () => {

      if (previewUrl) {

        URL.revokeObjectURL(previewUrl);

      }

    };

  }, [previewUrl]);

  // =========================

  // IMAGE CHANGE

  // =========================

  const handleImageChange = (e) => {

    const file = e.target.files[0];

    if (file && file.type.startsWith("image/")) {

      if (previewUrl) {

        URL.revokeObjectURL(previewUrl);

      }

      setSelectedFile(file);

      setPreviewUrl(URL.createObjectURL(file));

    }

  };

  // =========================

  // REMOVE SELECTED PREVIEW

  // =========================

  const handleRemovePreview = () => {

    if (previewUrl) {

      URL.revokeObjectURL(previewUrl);

    }

    setSelectedFile(null);

    setPreviewUrl(null);

    if (fileInputRef.current) {

      fileInputRef.current.value = "";

    }

  };

  // =========================

  // DELETE PROFILE IMAGE

  // =========================

  const handleDeleteProfileImage = async () => {

    setDeletingImage(true);

    setMessage("");

    try {

      const response = await fetch(`${API_BASE_URL}/api/user/profile/image`, {

        method: "DELETE",

        headers: {

          Authorization: `Bearer ${token}`,

        },

      });

      const data = await response.json();

      if (!response.ok) {

        throw new Error(

          data.message || "Failed to delete profile image"

        );

      }

      setProfile((previous) => ({

        ...previous,

        profileImage: null,

      }));

      setMessage("Profile image deleted successfully");
        setMessageType("success");

    } catch (error) {

      setMessage(error.message);
        setMessageType("error");

    } finally {

      setDeletingImage(false);

    }

  };

  // =========================

  // PROFILE INPUT CHANGE

  // =========================

  const handleProfileChange = (e) => {

    const { name, value } = e.target;

    setProfile((previous) => ({

      ...previous,

      [name]: value,

    }));

  };

  // =========================

  // UPDATE PROFILE

  // =========================

  const handleProfileSubmit = async (e) => {

    e.preventDefault();

    setSaving(true);

    setMessage("");

    try {

      const formData = new FormData();

      formData.append("first_name", profile.first_name);

      formData.append("last_name", profile.last_name);

      formData.append("dateOfBirth", profile.dateOfBirth);

      formData.append("university", profile.university);

      formData.append("program", profile.program);

      formData.append("currentSemester", profile.currentSemester);

      formData.append("bio", profile.bio);

      if (selectedFile) {

        formData.append("profileImage", selectedFile);

      }

      const response = await fetch(`${API_BASE_URL}/api/user/profile/update`, {

        method: "PUT",

        headers: {

          Authorization: `Bearer ${token}`,

        },

        body: formData,

      });

      const data = await response.json();

      if (!response.ok) {

        throw new Error(data.message || "Failed to update profile");

      }

      setMessage("Profile updated successfully");
        setMessageType("success");

      if (data.data?.profileImage) {

        setProfile((prev) => ({

          ...prev,

          profileImage: data.data.profileImage,

        }));

      }

      setSelectedFile(null);

      setPreviewUrl(null);

      const storedUser = JSON.parse(

        localStorage.getItem("user") || "{}"

      );

      const updatedUser = {

        ...storedUser,

        first_name: data.data.first_name,

        last_name: data.data.last_name,

        email: data.data.email,

        currentSemester: data.data.currentSemester,

        profileImage:

          data.data.profileImage || storedUser.profileImage,

      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

    } catch (error) {

      setMessage(error.message);
        setMessageType("error");

    } finally {

      setSaving(false);

    }

  };

  // =========================

  // PASSWORD INPUT CHANGE

  // =========================

  const handlePasswordChange = (e) => {

    const { name, value } = e.target;

    setPasswordForm((previous) => ({

      ...previous,

      [name]: value,

    }));

  };

  // =========================

  // CHANGE PASSWORD

  // =========================

  const handlePasswordSubmit = async (e) => {

    e.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {

      setPasswordMessage("New passwords do not match.");

      return;

    }

    setChangingPassword(true);

    setPasswordMessage("");

    try {

      const response = await fetch(`${API_BASE_URL}/api/user/change-password`, {

        method: "PUT",

        headers: {

          "Content-Type": "application/json",

          Authorization: `Bearer ${token}`,

        },

        body: JSON.stringify(passwordForm),

      });

      const data = await response.json();

      if (!response.ok) {

        throw new Error(

          data.message || "Failed to change password"

        );

      }

      setPasswordMessage("Password changed successfully");

      setPasswordForm({

        currentPassword: "",

        newPassword: "",

        confirmPassword: "",

      });

    } catch (error) {

      setPasswordMessage(error.message);

    } finally {

      setChangingPassword(false);

    }

  };

  // =========================

  // LOADING

  // =========================

  if (loading) {

    return (

      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">

        <p className="font-medium text-gray-500 dark:text-gray-400">Loading profile...</p>

      </div>

    );

  }

  const currentAvatarSrc =

    previewUrl || profile.profileImage?.url || "";

  return (

    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 lg:flex">

      {/* SIDEBAR */}

      <DashboardSidebar

        isSidebarOpen={isSidebarOpen}

        setIsSidebarOpen={setIsSidebarOpen}

      />

      <DashboardHeader setIsSidebarOpen={setIsSidebarOpen} />

      {/* MAIN CONTENT */}

      <main className="workspace-content min-h-screen min-w-0 flex-1 bg-slate-100 dark:bg-slate-950">

        <div className="max-w-6xl">

          {/* PAGE HEADER */}

          <div className="mb-8">

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">

              My Profile

            </h1>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">

              Manage your personal and academic information.

            </p>

          </div>

          {/* MAIN GRID */}

          <div className="grid grid-cols-1 gap-7 lg:grid-cols-3">

            {/* LEFT PROFILE CARD */}

            <section className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">

              <div className="flex flex-col items-center text-center">

                {/* FILE INPUT */}

                <input

                  type="file"

                  ref={fileInputRef}

                  onChange={handleImageChange}

                  accept="image/*"

                  className="hidden"

                />

                {/* AVATAR */}

                <div className="group relative">

                  <div

                    onClick={() => fileInputRef.current?.click()}

                    className="flex h-28 w-28 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-white bg-blue-50 text-3xl font-bold text-blue-600 shadow-md ring-1 ring-gray-200 transition hover:opacity-90 dark:border-slate-800 dark:bg-blue-950 dark:text-blue-400 dark:ring-slate-700"

                  >

                    {currentAvatarSrc ? (

                      <img

                        src={currentAvatarSrc}

                        alt="Profile"

                        className="h-full w-full object-cover"

                      />

                    ) : (

                      <span>

                        {profile.first_name?.charAt(0).toUpperCase()}

                        {profile.last_name?.charAt(0).toUpperCase()}

                      </span>

                    )}

                  </div>

                  {/* CAMERA BUTTON */}

                  <button

                    type="button"

                    onClick={() => fileInputRef.current?.click()}

                    className="btn-primary absolute bottom-0 right-0 rounded-full p-2 shadow-md transition"

                    title="Choose Profile Picture"

                  >

                    <Camera className="h-4 w-4" />

                  </button>

                  {/* REMOVE PREVIEW */}

                  {previewUrl && (

                    <button

                      type="button"

                      onClick={handleRemovePreview}

                      className="absolute -right-1 -top-1 rounded-full bg-red-600 p-1 text-white shadow transition hover:bg-red-700"

                      title="Remove selected image"

                    >

                      <X className="h-3.5 w-3.5" />

                    </button>

                  )}

                </div>

                {/* DELETE PROFILE IMAGE */}

                {profile.profileImage && !previewUrl && (

                  <button

                    type="button"

                    onClick={handleDeleteProfileImage}

                    disabled={deletingImage}

                    className="mt-3 text-sm font-medium text-red-600 transition hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-60"

                  >

                    {deletingImage

                      ? "Deleting..."

                      : "Delete Profile Picture"}

                  </button>

                )}

                {/* IMAGE MESSAGE */}

                {selectedFile && (

                  <p className="mt-3 max-w-xs text-xs font-medium leading-5 text-amber-600 dark:text-amber-400">

                    New image selected. Click "Save Changes" below to upload.

                  </p>

                )}

                {/* NAME */}

                <h2 className="mt-5 text-xl font-bold text-gray-900 dark:text-white">

                  {profile.first_name} {profile.last_name}

                </h2>

                {/* EMAIL */}

                <p className="mt-1 break-all text-sm text-gray-500 dark:text-gray-400">

                  {profile.email}

                </p>

                {/* SEMESTER */}

                <div className="mt-6 w-full border-t border-gray-100 pt-5 text-left dark:border-slate-800">

                  <p className="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">

                    Current Semester

                  </p>

                  <p className="mt-1 font-semibold text-gray-900 dark:text-gray-100">

                    Semester {profile.currentSemester || "N/A"}

                  </p>

                </div>

              </div>

            </section>

            {/* RIGHT AREA */}

            <div className="space-y-7 lg:col-span-2">

              {/* PROFILE INFORMATION */}

              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">

                <div className="mb-6">

                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">

                    Profile Information

                  </h2>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">

                    Update your personal and academic details.

                  </p>

                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-5">

                  {/* NAME */}

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div>

                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">

                        First Name

                      </label>

                      <div className="relative mt-1.5">

                        <UserRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

                        <input

                          type="text"

                          name="first_name"

                          value={profile.first_name}

                          onChange={handleProfileChange}

                          required

                          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100 dark:focus:ring-indigo-500"

                        />

                      </div>

                    </div>

                    <div>

                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">

                        Last Name

                      </label>

                      <div className="relative mt-1.5">

                        <UserRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

                        <input

                          type="text"

                          name="last_name"

                          value={profile.last_name}

                          onChange={handleProfileChange}

                          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100 dark:focus:ring-indigo-500"

                        />

                      </div>

                    </div>

                  </div>

                  {/* EMAIL */}

                  <div>

                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">

                      Email

                    </label>

                    <div className="relative mt-1.5">

                      <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

                      <input

                        type="email"

                        value={profile.email}

                        disabled

                        className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-gray-500"

                      />

                    </div>

                  </div>

                  {/* DOB + UNIVERSITY */}

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div>

                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">

                        Date of Birth

                      </label>

                      <div className="relative mt-1.5">

                        <CalendarDays className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

                        <input

                          type="date"

                          name="dateOfBirth"

                          value={profile.dateOfBirth}

                          onChange={handleProfileChange}

                          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100 dark:focus:ring-indigo-500"

                        />

                      </div>

                    </div>

                    <div>

                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">

                        University

                      </label>

                      <div className="relative mt-1.5">

                        <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

                        <input

                          type="text"

                          name="university"

                          value={profile.university}

                          onChange={handleProfileChange}

                          placeholder="Your university"

                          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100 dark:focus:ring-indigo-500"

                        />

                      </div>

                    </div>

                  </div>

                  {/* PROGRAM + SEMESTER */}

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div>

                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">

                        Program

                      </label>

                      <div className="relative mt-1.5">

                        <GraduationCap className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

                        <input

                          type="text"

                          name="program"

                          value={profile.program}

                          onChange={handleProfileChange}

                          placeholder="e.g. BS Artificial Intelligence"

                          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100 dark:focus:ring-indigo-500"

                        />

                      </div>

                    </div>

                    <div>

                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">

                        Current Semester

                      </label>

                      <div className="relative mt-1.5">

                        <BookOpen className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

                        <input

                          type="text"

                          name="currentSemester"

                          value={profile.currentSemester}

                          onChange={handleProfileChange}

                          placeholder="e.g. 5"

                          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100 dark:focus:ring-indigo-500"

                        />

                      </div>

                    </div>

                  </div>

                  {/* BIO */}

                  <div>

                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">

                      Bio

                    </label>

                    <textarea

                      name="bio"

                      rows="4"

                      value={profile.bio}

                      onChange={handleProfileChange}

                      placeholder="Write a short bio..."

                      className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100 dark:focus:ring-indigo-500"

                    />

                  </div>

                  {/* MESSAGE */}

                  {message && (

                    <p
                        role={messageType === "error" ? "alert" : "status"}
                        className={`text-sm font-medium ${
                          messageType === "success"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >

                      {message}

                    </p>

                  )}

                  {/* SUBMIT BUTTON */}

                  <div className="flex justify-end pt-2">

                    <button

                      type="submit"

                      disabled={saving}

                      className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition"

                    >

                      <Save className="h-4 w-4" />

                      {saving ? "Saving..." : "Save Changes"}

                    </button>

                  </div>

                </form>

              </section>

              {/* CHANGE PASSWORD */}

              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">

                <div className="mb-6">

                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">

                    Change Password

                  </h2>

                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">

                    Update your account password.

                  </p>

                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-5">

                  {/* CURRENT PASSWORD */}

                  <div>

                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">

                      Current Password

                    </label>

                    <div className="relative mt-1.5">

                      <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

                      <input

                        type={showCurrentPassword ? "text" : "password"}

                        name="currentPassword"

                        value={passwordForm.currentPassword}

                        onChange={handlePasswordChange}

                        required

                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100 dark:focus:ring-indigo-500"

                      />

                      <button

                        type="button"

                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}

                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"

                      >

                        {showCurrentPassword ? (

                          <EyeOff className="h-5 w-5" />

                        ) : (

                          <Eye className="h-5 w-5" />

                        )}

                      </button>

                    </div>

                  </div>

                  {/* NEW & CONFIRM PASSWORD */}

                  <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

                    <div>

                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">

                        New Password

                      </label>

                      <div className="relative mt-1.5">

                        <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

                        <input

                          type={showNewPassword ? "text" : "password"}

                          name="newPassword"

                          value={passwordForm.newPassword}

                          onChange={handlePasswordChange}

                          required

                          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100 dark:focus:ring-indigo-500"

                        />

                        <button

                          type="button"

                          onClick={() => setShowNewPassword(!showNewPassword)}

                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"

                        >

                          {showNewPassword ? (

                            <EyeOff className="h-5 w-5" />

                          ) : (

                            <Eye className="h-5 w-5" />

                          )}

                        </button>

                      </div>

                    </div>

                    <div>

                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">

                        Confirm New Password

                      </label>

                      <div className="relative mt-1.5">

                        <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-gray-500" />

                        <input

                          type={showConfirmPassword ? "text" : "password"}

                          name="confirmPassword"

                          value={passwordForm.confirmPassword}

                          onChange={handlePasswordChange}

                          required

                          className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-10 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100 dark:focus:ring-indigo-500"

                        />

                        <button

                          type="button"

                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}

                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"

                        >

                          {showConfirmPassword ? (

                            <EyeOff className="h-5 w-5" />

                          ) : (

                            <Eye className="h-5 w-5" />

                          )}

                        </button>

                      </div>

                    </div>

                  </div>

                  {/* PASSWORD MESSAGE */}

                  {passwordMessage && (

                    <p

                      className={`text-sm font-medium ${

                        passwordMessage.includes("successfully")

                          ? "text-emerald-600 dark:text-emerald-400"

                          : "text-red-600 dark:text-red-400"

                      }`}

                    >

                      {passwordMessage}

                    </p>

                  )}

                  {/* SUBMIT BUTTON */}

                  <div className="flex justify-end pt-2">

                    <button

                      type="submit"

                      disabled={changingPassword}

                      className="btn-primary inline-flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold shadow-sm transition"

                    >

                      <Save className="h-4 w-4" />

                      {changingPassword ? "Updating..." : "Update Password"}

                    </button>

                  </div>

                </form>

              </section>

            </div>

          </div>

        </div>

      </main>

    </div>

  );

}

export default Profile;