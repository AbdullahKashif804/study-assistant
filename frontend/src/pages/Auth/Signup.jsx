import {
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Sparkles,
  UserRound,
  ChevronDown,
} from "lucide-react";

import { useState } from "react";
import Header from "../../components/layout/Header";
import AuthPreview from "./auth.jpeg";
import {
  Link,
  useNavigate,
} from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    currentSemester: "",
    password: "",
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    agreedToTerms,
    setAgreedToTerms,
  ] = useState(false);

  const handleChange = (e) => {
    const { name, value } =
      e.target;

    setForm({
      ...form,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formElement = e.currentTarget;

if (!formElement.checkValidity()) {
  formElement.reportValidity();
  return;
}

 const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(form.email)) {
    setMessage("Error: Please enter a valid email address");
    return;
  }

  
    if (!agreedToTerms) {
      setMessage(
        "Error: Please agree to the Terms & Conditions and Privacy Policy"
      );
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "http://localhost:5000/api/user/signup",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            ...form,
            agreedToTerms,
          }),
        }
      );

      const data = 
        await response.json();

      if (response.ok) {
        navigate("/verify-email", {
  state: {
    email: form.email,
  },
});
      } else {
        setMessage(
          `Error: ${
            data.message ||
            "Something Went wrong"
          }`
        );
      }
    } catch (error) {
      setMessage(
        "Network error, Please try again later"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header variant="auth" />

      <main className="min-h-screen w-full bg-slate-50/90 px-6 py-10 transition-colors dark:bg-slate-950 lg:px-10">
        <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 lg:grid-cols-2">

          {/* LEFT SECTION */}
          <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl transition-colors dark:border-slate-800 dark:bg-slate-900">

            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
                Create Your Account
              </h1>

              <p className="mt-2 text-sm font-medium text-gray-500 dark:text-slate-400">
                Join AI Study Assistant
                and start your smarter
                learning journey
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
              autoComplete="off"
            >

              {/* NAME */}
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label
                    htmlFor="first_name"
                    className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                  >
                    First Name
                  </label>

                  <div className="relative mt-1.5">
                    <UserRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-slate-500" />

                    <input
                      type="text"
                      name="first_name"
                      value={
                        form.first_name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="First Name"
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="last_name"
                    className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                  >
                    Last Name
                  </label>

                  <div className="relative mt-1.5">
                    <UserRound className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-slate-500" />

                    <input
                      type="text"
                      name="last_name"
                      value={
                        form.last_name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Last Name"
                      required
                      className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Email
                </label>

                <div className="relative mt-1.5">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-slate-500" />

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={
                      handleChange
                    }
                    autoComplete="new-password"
                    placeholder="name@example.com"
                    pattern="[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* SEMESTER */}
              <div>
                <label
                  htmlFor="currentSemester"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Current Semester
                </label>

                <div className="relative mt-1.5">
                  <select
                    id="currentSemester"
                    name="currentSemester"
                    value={
                      form.currentSemester
                    }
                    onChange={
                      handleChange
                    }
                    required
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white py-2.5 pl-4 pr-10 text-gray-700 outline-none transition focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:focus:ring-indigo-500"
                  >
                    <option
                      value=""
                      disabled
                      className="dark:bg-slate-800 dark:text-slate-400"
                    >
                      Select Current
                      Semester
                    </option>

                    <option value="1" className="dark:bg-slate-800 dark:text-slate-100">
                      Semester 1
                    </option>

                    <option value="2" className="dark:bg-slate-800 dark:text-slate-100">
                      Semester 2
                    </option>

                    <option value="3" className="dark:bg-slate-800 dark:text-slate-100">
                      Semester 3
                    </option>

                    <option value="4" className="dark:bg-slate-800 dark:text-slate-100">
                      Semester 4
                    </option>

                    <option value="5" className="dark:bg-slate-800 dark:text-slate-100">
                      Semester 5
                    </option>

                    <option value="6" className="dark:bg-slate-800 dark:text-slate-100">
                      Semester 6
                    </option>

                    <option value="7" className="dark:bg-slate-800 dark:text-slate-100">
                      Semester 7
                    </option>

                    <option value="8" className="dark:bg-slate-800 dark:text-slate-100">
                      Semester 8
                    </option>
                  </select>

                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                </div>
              </div>

              {/* PASSWORD */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Password
                </label>

                <div className="relative mt-1.5">
                  <LockKeyhole className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 dark:text-slate-500" />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    name="password"
                    value={
                      form.password
                    }
                    onChange={
                      handleChange
                    }
                    autoComplete="new-password"
                    placeholder="Enter password"
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-12 text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        !showPassword
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* TERMS */}
              <div className="flex items-start gap-3 rounded-lg bg-blue-50/60 p-4 dark:bg-slate-800/50 dark:border dark:border-slate-700/50">

                <input
                  id="termsAgreement"
                  type="checkbox"
                  checked={
                    agreedToTerms
                  }
                  onChange={(e) =>
                    setAgreedToTerms(
                      e.target.checked
                    )
                  }
                  className="mt-1 h-4 w-4 rounded border-gray-300 accent-indigo-600 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-700 dark:checked:bg-indigo-600"
                />

                <label
                  htmlFor="termsAgreement"
                  className="text-sm leading-6 text-gray-600 dark:text-slate-400"
                >
                  I agree to the{" "}

                  <Link
                    to="/terms"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Terms & Conditions
                  </Link>

                  {" "}and acknowledge
                  the{" "}

                  <Link
                    to="/privacy-policy"
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {/* CREATE */}
              <button
                type="submit"
                disabled={
                  loading ||
                  !agreedToTerms
                }
                className="btn-primary w-full rounded-lg py-3 font-semibold shadow-md transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                {loading
                  ? "Creating account..."
                  : "Create Account"}
              </button>

              <p className="mt-6 text-center text-sm text-gray-600 dark:text-slate-400">
                Already have an
                account?

                <Link
                  to="/login"
                  className="ml-1 font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  Sign In
                </Link>
              </p>
            </form>

            {message && (
              <p
                className={`mt-4 text-center text-sm ${
                  message.startsWith(
                    "Error"
                  ) ||
                  message.startsWith(
                    "Network"
                  )
                    ? "text-red-600 dark:text-red-400"
                    : "text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {message}
              </p>
            )}
          </section>

          {/* RIGHT SECTION */}
          <section className="hidden rounded-3xl bg-blue-50 p-10 transition-colors dark:bg-slate-900 dark:border dark:border-slate-800 lg:block">

            <div className="flex items-center gap-2 font-medium text-blue-700 dark:text-blue-400">
              <Sparkles className="h-5 w-5" />
              Smart Study Management
            </div>

            <h2 className="mt-5 text-4xl font-bold leading-tight text-gray-900 dark:text-slate-100">
              Learn Smarter and Stay
              Organized
            </h2>

            <p className="mt-4 max-w-xl text-lg leading-8 text-gray-900 dark:text-slate-300">
              Keep your academic
              information organized and
              quickly view your most
              important study activities
              from one personal dashboard.
            </p>

            <div className="mt-7 space-y-4">

              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />

                <p className="text-gray-700 dark:text-slate-300">
                  Manage notes,
                  assignments, quizzes,
                  and projects.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />

                <p className="text-gray-700 dark:text-slate-300">
                  Track upcoming
                  deadlines and pending
                  tasks.
                </p>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />

                <p className="text-gray-700 dark:text-slate-300">
                  View your complete
                  study overview from one
                  dashboard.
                </p>
              </div>
            </div>

            <div className="mt-9 overflow-hidden rounded-2xl border border-blue-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-800">
              <img
                src={AuthPreview}
                alt="Study Assistant auth preview"
                className="w-full rounded-xl"
              />
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default Signup;