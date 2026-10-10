import { Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/layout/Header";

function VerifyEmail() {
    const location = useLocation();
    const navigate = useNavigate();

const signupEmail = location.state?.email || "";
  const [email, setEmail] = useState(signupEmail);
  const [verificationCode, setVerificationCode] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState("");
  const [resending, setResending] = useState(false);

  const handleSubmit = async (e) => {
  e.preventDefault();

  setLoading(true);
  setMessage("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/user/verify-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          verificationCode,
        }),
      }
    );

    const data = await response.json();
if (response.ok) {
  setMessageType("success");
  setMessage(data.message);

  setTimeout(() => {
    navigate("/login");
  }, 1500);
} else {
  setMessageType("error");
  setMessage(
    `Error: ${
      data.message || "Something went wrong"
    }`
  );
}
} catch (error) {
  setMessageType("error");
  setMessage(
    "Network error, Please try again later"
  );
 } finally {
  setLoading(false);
}
};

const handleResend = async () => {
  setResending(true);
  setMessage("");

  try {
    const response = await fetch(
      "http://localhost:5000/api/user/resend-verification",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      setMessageType("success");
      setMessage(data.message);
    } else {
      setMessageType("error");
      setMessage(
        `Error: ${data.message || "Something went wrong"}`
      );
    }
  } catch (error) {
    setMessageType("error");
    setMessage(
      "Network error, Please try again later"
    );
  } finally {
    setResending(false);
  }
};
  return (
    <>
      <Header />

      <main className="min-h-screen w-full bg-slate-50/90 px-6 py-10 transition-colors dark:bg-slate-950 lg:px-10">
        <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center">
          <section className="w-full rounded-2xl border border-gray-100 bg-white p-8 shadow-xl transition-colors dark:border-slate-800 dark:bg-slate-900">

            <div className="mb-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                <ShieldCheck className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              </div>

              <h1 className="mt-5 text-3xl font-bold text-gray-900 dark:text-slate-100">
                Verify Your Email
              </h1>

              <p className="mt-2 text-sm font-medium text-gray-500 dark:text-slate-400">
                Enter the verification code sent to your email address.
              </p>
            </div>

            <form
  onSubmit={handleSubmit}
  className="space-y-5"
>

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
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                    className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-900 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* VERIFICATION CODE */}
              <div>
                <label
                  htmlFor="verificationCode"
                  className="block text-sm font-medium text-gray-700 dark:text-slate-300"
                >
                  Verification Code
                </label>

                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) =>
                    setVerificationCode(e.target.value)
                  }
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  required
                  className="mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-lg font-semibold tracking-[0.3em] text-gray-900 outline-none transition placeholder:text-sm placeholder:font-normal placeholder:tracking-normal placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-500"
                />
              </div>

              {/* INFO */}
              <div className="rounded-lg bg-blue-50/60 p-4 dark:border dark:border-slate-700/50 dark:bg-slate-800/50">
                <p className="text-sm leading-6 text-gray-600 dark:text-slate-400">
                  Your verification code expires in 10 minutes.
                </p>

                <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-slate-400">
                  If you do not see the email, please check your Spam or Junk folder.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full rounded-lg py-3 font-semibold shadow-md transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>

              
<button
  type="button"
  onClick={handleResend}
  disabled={resending || loading}
  className="w-full rounded-lg border border-indigo-600 py-3 font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-500 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
>
  {resending ? "Sending..." : "Resend Verification Code"}
</button>


            </form>

            {message && (
              <p
  className={`mt-4 text-center text-sm ${
    messageType === "error"
      ? "text-red-600 dark:text-red-400"
      : "text-emerald-600 dark:text-emerald-400"
  }`}
>
  {message}
</p>
            )}

          </section>
        </div>
      </main>
    </>
  );
}
export default VerifyEmail;

