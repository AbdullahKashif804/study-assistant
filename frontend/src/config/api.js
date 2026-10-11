// Vite exposes this public value at build time; never put credentials here.
function resolveApiBaseUrl(env) {
  const configured = env.VITE_API_BASE_URL?.trim();
  if (!configured) {
    if (env.DEV) return "http://localhost:5000";
    throw new Error("VITE_API_BASE_URL is required in production. Set the HTTPS backend origin and rebuild the frontend.");
  }

  const baseUrl = configured.replace(/\/+$/, "");
  let url;
  try {
    url = new URL(baseUrl);
  } catch {
    throw new Error("VITE_API_BASE_URL must be a valid absolute backend URL.");
  }

  if (!/^https?:\/\//i.test(baseUrl) || !["http:", "https:"].includes(url.protocol)) {
    throw new Error("VITE_API_BASE_URL must use HTTP or HTTPS.");
  }
  if (!env.DEV && url.protocol !== "https:") {
    throw new Error("VITE_API_BASE_URL must use HTTPS in production.");
  }
  if (url.username || url.password || url.search || url.hash || url.pathname !== "/") {
    throw new Error("VITE_API_BASE_URL must be a backend origin without credentials, an API path, query, or fragment.");
  }

  return baseUrl;
}

export const API_BASE_URL = resolveApiBaseUrl(import.meta.env);
