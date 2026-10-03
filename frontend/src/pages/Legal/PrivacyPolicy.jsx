import Header from "../../components/layout/Header";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  UserRound,
  FileText,
  Cloud,
  LockKeyhole,
  Trash2,
} from "lucide-react";

function PrivacyPolicy() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50/90 px-6 py-10 transition-colors dark:bg-slate-950 lg:px-10">
        <div className="mx-auto max-w-5xl">
          {/* HEADER */}
          <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-slate-800">
                <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                  Privacy Policy
                </h1>

                <p className="mt-2 text-gray-500 dark:text-slate-400">
                  This page explains how Study Assistant handles information
                  provided while using the application.
                </p>
              </div>
            </div>
          </section>

          <div className="space-y-6">
            {/* ACCOUNT INFORMATION */}
            <PolicyCard
              icon={<UserRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              title="1. Account Information"
            >
              <p>
                Study Assistant may store information you provide while
                creating and managing your account, including your name,
                email address, current semester, university, academic
                program, date of birth, and profile information.
              </p>
            </PolicyCard>

            {/* STUDY DATA */}
            <PolicyCard
              icon={<FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              title="2. Study Information"
            >
              <p>
                The application stores information you create while using
                Study Assistant, including notes, assignments, projects,
                quizzes, courses, daily tasks, and todo tasks.
              </p>

              <p className="mt-3">
                This information is used to provide the study-management
                features available inside your account.
              </p>
            </PolicyCard>

            {/* FILES */}
            <PolicyCard
              icon={<Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              title="3. Uploaded Files"
            >
              <p>
                Some Study Assistant features allow you to upload files such
                as PDFs, DOCX files, PPTX files, and images.
              </p>

              <p className="mt-3">
                Uploaded files may be stored using a cloud storage provider
                such as Cloudinary. File information such as file name,
                storage reference, file type, and file size may also be
                stored by Study Assistant.
              </p>
            </PolicyCard>

            {/* DATA USAGE */}
            <PolicyCard
              icon={<ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              title="4. How Information Is Used"
            >
              <p>
                Information stored by Study Assistant is used to provide and
                improve application features, display your personal study
                dashboard, manage academic information, and maintain your
                account.
              </p>
            </PolicyCard>

            {/* SECURITY */}
            <PolicyCard
              icon={<LockKeyhole className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              title="5. Account Security"
            >
              <p>
                Passwords are stored in hashed form and are not intended to
                be stored as plain text.
              </p>

              <p className="mt-3">
                You are responsible for keeping your account credentials
                secure and should not share your password with other people.
              </p>
            </PolicyCard>

            {/* ADMIN PRIVACY */}
            <PolicyCard
              icon={<ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              title="6. Administrative Access"
            >
              <p>
                Study Assistant may provide administrative features for monitoring
                overall platform activity and managing application-level information.
              </p>

              <p className="mt-3">
                Administrative information may include statistics such as total
                registered users, total notes, assignments, projects, courses,
                quizzes, and other overall platform counts.
              </p>

              <p className="mt-3">
                Administrative features are designed to provide an overview of
                platform activity and are not intended to provide access to users'
                private study content or personal uploaded files.
              </p>
            </PolicyCard>

            {/* DELETE */}
            <PolicyCard
              icon={<Trash2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              title="7. Account and Data Management"
            >
              <p>
                Users may update certain profile information through their
                account. Account deletion and related data-management
                features may be provided through Study Assistant
                administration features.
              </p>
            </PolicyCard>

            {/* THIRD PARTY */}
            <PolicyCard
              icon={<Cloud className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              title="8. Third-Party Services"
            >
              <p>
                Study Assistant may use third-party services for features
                such as file storage, email delivery, hosting, databases,
                or future AI functionality.
              </p>
            </PolicyCard>

            {/* CHANGES */}
            <PolicyCard
              icon={<FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              title="9. Policy Updates"
            >
              <p>
                This Privacy Policy may be updated as Study Assistant gains
                new features or changes how information is handled.
              </p>
            </PolicyCard>
          </div>

          {/* FOOTER */}
          <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-gray-600 dark:text-slate-400">
              You can also review our{" "}
              <Link
                to="/terms"
                className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Terms & Conditions
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

function PolicyCard({ icon, title, children }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-slate-800">
          {icon}
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
          {title}
        </h2>
      </div>

      <div className="leading-7 text-gray-600 dark:text-slate-400">
        {children}
      </div>
    </section>
  );
}

export default PrivacyPolicy;