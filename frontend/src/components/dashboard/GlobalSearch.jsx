
import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000";

function GlobalSearch() {
    const [search, setSearch] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const searchRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const searchData = async () => {
            if (!search.trim()) {
                setResults([]);
                setShowResults(false);
                return;
            }

            try {
                setLoading(true);

                const token = localStorage.getItem("token");

                const response = await fetch(
                    `${API_URL}/api/search?q=${encodeURIComponent(search.trim())}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (data.success) {
                    setResults(data.data);
                    setShowResults(true);
                } else {
                    setResults([]);
                }
            } catch (error) {
                console.error("Global search error:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        const timeout = setTimeout(searchData, 300);

        return () => clearTimeout(timeout);
    }, [search]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchRef.current &&
                !searchRef.current.contains(event.target)
            ) {
                setShowResults(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleResultClick = (result) => {
        navigate(result.path);
        setSearch("");
        setResults([]);
        setShowResults(false);
    };

    return (
        <div
            ref={searchRef}
            className="relative w-40 min-w-0 sm:w-64 md:w-80"
        >
            <Search
                className="
                    absolute left-3 top-1/2
                    h-4 w-4 -translate-y-1/2
                    text-slate-400
                    dark:text-slate-500
                "
            />

            <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => {
                    if (search.trim()) {
                        setShowResults(true);
                    }
                }}
                placeholder="Search..."
                className="
                    w-full rounded-xl
                    border border-slate-200
                    bg-slate-50
                    py-2.5 pl-10 pr-4
                    text-sm text-slate-700
                    outline-none transition

                    placeholder:text-slate-400

                    focus:border-blue-500
                    focus:bg-white
                    focus:ring-4 focus:ring-blue-100

                    dark:border-slate-800
                    dark:bg-slate-900
                    dark:text-slate-200
                    dark:placeholder:text-slate-500
                    dark:focus:border-blue-600
                    dark:focus:bg-slate-900
                    dark:focus:ring-blue-950/50
                "
            />

            {showResults && (
                <div
                    className="
                        absolute left-0 right-0 top-full z-50 mt-2
                        max-h-96 overflow-y-auto
                        rounded-xl
                        border border-slate-200
                        bg-white
                        shadow-lg

                        dark:border-slate-800
                        dark:bg-slate-900
                    "
                >
                    {loading ? (
                        <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                            Searching...
                        </div>
                    ) : results.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                            No results found
                        </div>
                    ) : (
                        results.map((result) => (
                            <button
                                key={`${result.type}-${result.id}`}
                                type="button"
                                onClick={() => handleResultClick(result)}
                                className="
                                    flex w-full items-center justify-between
                                    gap-3 px-4 py-3
                                    text-left
                                    transition

                                    hover:bg-slate-50

                                    dark:hover:bg-slate-800
                                "
                            >
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
                                        {result.title}
                                    </p>

                                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                        {result.type}
                                    </p>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}

export default GlobalSearch;

