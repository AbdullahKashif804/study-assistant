import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import Header from "../../components/layout/Header";
import { API_BASE_URL } from "../../config/api";

const inputClass = "mt-1.5 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  // Recovery credentials stay in memory, never URLs or browser storage.
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const busy = useRef(false);
  const heading = useRef(null);

  useEffect(() => { heading.current?.focus(); }, [step]);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);
  useEffect(() => {
    if (step !== "done") return;
    const timer = setTimeout(() => navigate("/login", { replace: true }), 2000);
    return () => clearTimeout(timer);
  }, [step, navigate]);

  async function submit(action) {
    if (busy.current || (action === "request" && cooldown)) return;
    setError("");
    setMessage("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) || email.trim().length > 254) {
      setError("Enter a valid email address."); return;
    }
    if (action === "verify" && !/^\d{6}$/.test(otp)) {
      setError("Enter the six-digit reset code."); return;
    }
    if (action === "reset" && (newPassword.length < 8 || new TextEncoder().encode(newPassword).length > 72 || !newPassword.trim())) {
      setError("Use at least 8 characters and at most 72 UTF-8 bytes for your password."); return;
    }
    if (action === "reset" && newPassword !== confirmPassword) {
      setError("Passwords do not match."); return;
    }
    busy.current = true;
    setLoading(true);
    try {
      const endpoint = { request: "forgot-password", verify: "verify-reset-otp", reset: "reset-password" }[action];
      const body = { email: email.trim() };
      if (action === "verify") body.otp = otp;
      if (action === "reset") Object.assign(body, { resetToken, newPassword, confirmPassword });
      const response = await fetch(`${API_BASE_URL}/api/user/${endpoint}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await response.json();
      if (response.status === 429) {
        const retryAfter = Number(response.headers.get("Retry-After"));
        if (action === "request") setCooldown(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : 60);
      }
      if (!response.ok) throw new Error(data.message || "Request failed. Please try again.");
      setMessage(data.message);
      if (action === "request") {
        setCooldown(60); setOtp(""); setResetToken(""); setStep("otp");
      } else if (action === "verify") {
        setResetToken(data.resetToken); setOtp(""); setStep("password");
      } else {
        setNewPassword(""); setConfirmPassword(""); setResetToken(""); setStep("done");
      }
    } catch (failure) {
      setError(failure instanceof TypeError ? "Network error. Please try again." : failure.message);
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  const titles = { email: "Forgot Password", otp: "Verify Reset Code", password: "Reset Password", done: "Password Updated" };
  return (
    <>
      <Header variant="auth" />
      <main className="min-h-screen bg-slate-50/90 px-4 py-10 dark:bg-slate-950 sm:px-6">
        <section className="mx-auto w-full max-w-md rounded-2xl border border-gray-100 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <ShieldCheck aria-hidden="true" className="mx-auto mb-4 h-10 w-10 text-indigo-600 dark:text-indigo-400" />
          <h1 ref={heading} tabIndex={-1} className="text-center text-3xl font-bold text-gray-900 dark:text-white">{titles[step]}</h1>
          <p className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400">
            {step === "email" ? "Enter your account email to request a reset code." :
              step === "otp" ? "Enter the six-digit code. It expires 10 minutes after sending." :
              step === "password" ? "Choose a new password before your reset session expires." : "Redirecting to Login..."}
          </p>
          {step !== "done" && (
            <form className="mt-6 space-y-5" onSubmit={event => { event.preventDefault(); submit(step === "email" ? "request" : step === "otp" ? "verify" : "reset"); }}>
              <fieldset disabled={loading} className="space-y-5 disabled:opacity-70">
                <div>
                  <label htmlFor="reset-email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                  <input id="reset-email" type="email" autoComplete="email" required maxLength={254} readOnly={step !== "email"}
                    value={email} onChange={event => setEmail(event.target.value)} className={inputClass} />
                </div>
                {step === "otp" && (
                  <div>
                    <label htmlFor="reset-otp" className="text-sm font-medium text-gray-700 dark:text-gray-300">Reset code</label>
                    <input id="reset-otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" required maxLength={6}
                      value={otp} onChange={event => setOtp(event.target.value)} className={inputClass} aria-describedby="reset-help" />
                    <p id="reset-help" className="mt-2 text-sm text-gray-500 dark:text-gray-400">Check Spam or Junk if the email does not arrive.</p>
                  </div>
                )}
                {step === "password" && (
                  <>
                    <div>
                      <label htmlFor="reset-new" className="text-sm font-medium text-gray-700 dark:text-gray-300">New password</label>
                      <input id="reset-new" type="password" autoComplete="new-password" required minLength={8} maxLength={72}
                        value={newPassword} onChange={event => setNewPassword(event.target.value)} className={inputClass} aria-describedby="password-help" />
                      <p id="password-help" className="mt-2 text-sm text-gray-500 dark:text-gray-400">At least 8 characters; maximum 72 UTF-8 bytes.</p>
                    </div>
                    <div>
                      <label htmlFor="reset-confirm" className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm new password</label>
                      <input id="reset-confirm" type="password" autoComplete="new-password" required minLength={8} maxLength={72}
                        value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} className={inputClass} />
                    </div>
                  </>
                )}
                <button type="submit" disabled={loading || (step === "email" && cooldown > 0)} className="btn-primary w-full rounded-lg py-3 font-semibold disabled:cursor-not-allowed disabled:opacity-60">
                  {loading ? "Please wait..." : step === "email" ? (cooldown ? `Try again in ${cooldown}s` : "Send Reset Code") : step === "otp" ? "Verify Code" : "Reset Password"}
                </button>
                {step === "otp" && (
                  <button type="button" onClick={() => submit("request")} disabled={loading || cooldown > 0}
                    className="w-full rounded-lg border border-indigo-600 py-3 font-semibold text-indigo-600 disabled:opacity-60 dark:text-indigo-400">
                    {cooldown ? `Resend code in ${cooldown}s` : "Resend Code"}
                  </button>
                )}
                {step !== "email" && (
                  <button type="button" className="w-full text-sm text-blue-600 hover:underline dark:text-blue-400" onClick={() => {
                    setStep("email"); setResetToken(""); setOtp(""); setNewPassword(""); setConfirmPassword(""); setMessage(""); setError("");
                  }}>Start over / request a new code</button>
                )}
              </fieldset>
            </form>
          )}
          <div aria-live="polite" className="mt-4 text-sm">
            {message && <p className="text-emerald-600 dark:text-emerald-400">{message}</p>}
            {error && <p role="alert" className="text-red-600 dark:text-red-400">{error}</p>}
          </div>
          <Link to="/login" className="mt-6 block text-center text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">Back to Login</Link>
        </section>
      </main>
    </>
  );
}
