import Header from "../../components/layout/Header";
import { useState } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Eye, EyeOff, LockKeyhole } from "lucide-react";
import AuthPreview from "./auth.jpeg";

function Login() {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:5000/api/user/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (!response.ok) {
                setEmail("");
                setPassword("");
                throw new Error(data.message || 'Failed to Sign In');
            }
            localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data.user));

window.dispatchEvent(new Event("userChanged"));

navigate('/Dashboard');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header variant="auth" />
            <main className="min-h-screen w-full bg-slate-50/90 px-6 py-10 dark:bg-slate-950 lg:px-10">
                <div className="mx-auto grid max-w-5xl grid-cols-1 items-center gap-12 lg:grid-cols-2">

                    <section className="rounded-2xl border border-gray-100 bg-white p-8 shadow-xl dark:border-slate-800 dark:bg-slate-900">
                        <div className="mb-8">
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Welcome Back
                            </h1>
                            <p className="mt-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                                Sign in to continue your learning journey with AI.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
                            <div>
                                <label
                                    htmlFor="email"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email
                                </label>
                                <div className="relative mt-1.5">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        autoComplete="new-password"
                                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-950"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label
                                    htmlFor="password"
                                    className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <div className="relative mt-1.5">
                                    <LockKeyhole className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter Password"
                                        autoComplete="new-password"
                                        className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 outline-none transition placeholder:text-gray-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-gray-500 dark:focus:ring-blue-950"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-blue-600 py-3 font-semibold text-white shadow-md transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-600 dark:hover:bg-blue-500">
                                {loading ? "Signing in ...." : "Sign In"}
                            </button>
                        </form>
                        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                            Don't have an account?{" "}
                            <Link
                                to="/signup"
                                className="ml-1 font-semibold text-blue-600 hover:underline dark:text-blue-400"
                            >
                                Create Account
                            </Link>
                        </p>

                        {error && (
                            <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400">
                                {error}
                            </p>
                        )}
                    </section>

                    <section className="hidden rounded-3xl bg-blue-50 p-10 dark:bg-blue-950/40 lg:block">
                        <div>
                            <h1 className="text-4xl font-bold leading-tight text-gray-900 dark:text-white">
                                Your AI Learning Companion
                            </h1>
                            <p className="mt-4 max-w-xl text-lg leading-8 text-gray-600 dark:text-gray-300">
                                Stay organized, boost productivity, 
                                and achieve your academic goals with an
                                intelligent study assistant.
                            </p>
                        </div>
                        <div className="mt-9 overflow-hidden rounded-2xl border border-blue-200 bg-white p-3 shadow-sm dark:border-blue-900 dark:bg-slate-900">
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

export default Login;