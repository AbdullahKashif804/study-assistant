import Header from "../../components/layout/Header";
import { Link } from "react-router-dom";
import {
  FileCheck2,
  UserRound,
  GraduationCap,
  ShieldAlert,
  Files,
  Ban,
  RefreshCw,
} from "lucide-react";

function Terms() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-slate-50/90 px-6 py-10 dark:bg-slate-950 lg:px-10">
        <div className="mx-auto max-w-5xl">
          {/* HEADER */}
          <section className="mb-8 rounded-2xl border border-gray-100 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-950">
                <FileCheck2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Terms & Conditions
                </h1>

                <p className="mt-2 text-gray-500 dark:text-gray-400">
                  These terms describe the basic rules for using Study
                  Assistant.
                </p>
              </div>
            </div>
          </section>

          <div className="space-y-6">
            <TermsCard
              icon={<UserRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              title="1. Account Responsibility"
            >
              <p>
                You are responsible for providing accurate account
                information and keeping your login credentials secure.
              </p>

              <p className="mt-3">
                You should not allow another person to misuse your Study
                Assistant account.
              </p>
            </TermsCard>

            <TermsCard
              icon={<GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              title="2. Educational Purpose"
            >
              <p>
                Study Assistant is designed to help users organize academic
                information such as notes, courses, assignments, quizzes,
                projects, and study tasks.
              </p>

              <p className="mt-3">
                The application should be used as a study-support tool and
                does not replace the requirements or decisions of your
                university, school, teacher, or educational institution.
              </p>
            </TermsCard>

            <TermsCard
              icon={<Files className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              title="3. User Content and Uploaded Files"
            >
              <p>
                You remain responsible for the notes, files, academic
                information, and other content you upload or create using
                Study Assistant.
              </p>

              <p className="mt-3">
                You should only upload content that you have permission to use and
                should avoid uploading content that violates applicable laws or the
                rights of other people.
              </p>

              <p className="mt-3">
                Uploaded files may be processed and stored using third-party services
                used by Study Assistant, such as cloud storage providers.
              </p>
            </TermsCard>

            <TermsCard
              icon={<Ban className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              title="4. Prohibited Use"
            >
              <p>
                You should not use Study Assistant to intentionally damage
                the service, gain unauthorized access to another user's
                account, upload harmful content, or misuse application
                features.
              </p>
            </TermsCard>

            <TermsCard
              icon={<ShieldAlert className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              title="5. Account Restrictions"
            >
              <p>
                An account may be blocked, restricted, or removed when it is
                used in a way that seriously violates the intended use of
                Study Assistant.
              </p>
            </TermsCard>

            <TermsCard
              icon={<RefreshCw className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              title="6. Service Changes"
            >
              <p>
                Study Assistant may receive new features, improvements,
                interface changes, or technical updates over time.
              </p>

              <p className="mt-3">
                Some features may also be modified or removed as the project
                develops.
              </p>
            </TermsCard>

            <TermsCard
              icon={<ShieldAlert className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              title="7. Availability"
            >
              <p>
                Study Assistant is intended to provide reliable access, but
                temporary interruptions may occur during maintenance,
                deployment, updates, or technical issues.
              </p>
            </TermsCard>

            <TermsCard
              icon={<FileCheck2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
              title="8. Updates to These Terms"
            >
              <p>
                These Terms & Conditions may be updated as Study Assistant
                evolves and new functionality is introduced.
              </p>
            </TermsCard>
          </div>

          <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You can also review our{" "}
              <Link
                to="/privacy-policy"
                className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

function TermsCard({ icon, title, children }) {
  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-7 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-950">
          {icon}
        </div>

        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>

      <div className="leading-7 text-gray-600 dark:text-gray-400">
        {children}
      </div>
    </section>
  );
}

export default Terms;