import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../src/config/api.js", import.meta.url), "utf8")
  .replace("export const API_BASE_URL", "const API_BASE_URL")
  .replace("import.meta.env", "env");

function resolve(env) {
  return vm.runInNewContext(`${source}\nAPI_BASE_URL;`, { URL, env });
}

test("development alone falls back to localhost when configuration is absent or blank", () => {
  assert.equal(resolve({ DEV: true }), "http://localhost:5000");
  assert.equal(resolve({ DEV: true, VITE_API_BASE_URL: "  " }), "http://localhost:5000");
  assert.throws(() => resolve({ DEV: false }), /required in production/);
  assert.throws(() => resolve({ DEV: false, VITE_API_BASE_URL: "  " }), /required in production/);
});

test("normalizes configured origins and preserves endpoint composition", () => {
  const base = resolve({ DEV: false, VITE_API_BASE_URL: "  https://study-backend.onrender.com///  " });
  assert.equal(base, "https://study-backend.onrender.com");
  assert.equal(`${base}/api/user/profile`, "https://study-backend.onrender.com/api/user/profile");
  assert.equal(resolve({ DEV: true, VITE_API_BASE_URL: "http://127.0.0.1:5000/" }), "http://127.0.0.1:5000");
});

test("rejects invalid URLs and unsafe protocols without echoing the supplied value", () => {
  for (const value of ["invalid-url", "/api", "ftp://example.test", "javascript:alert(1)", "https:example.test"]) {
    assert.throws(() => resolve({ DEV: true, VITE_API_BASE_URL: value }), error => {
      assert.ok(error.message.startsWith("VITE_API_BASE_URL"));
      assert.ok(!error.message.includes(value));
      return true;
    });
  }
});

test("production requires HTTPS even for an explicitly configured local server", () => {
  assert.throws(() => resolve({ DEV: false, VITE_API_BASE_URL: "http://localhost:5000" }), /HTTPS in production/);
  assert.throws(() => resolve({ DEV: false, VITE_API_BASE_URL: "http://example.test" }), /HTTPS in production/);
});

test("rejects credentials, API prefixes, queries, and fragments that would corrupt requests", () => {
  for (const value of ["https://user:example@example.test", "https://example.test/api", "https://example.test?mode=test", "https://example.test#api"]) {
    assert.throws(() => resolve({ DEV: false, VITE_API_BASE_URL: value }), /must be a backend origin/);
  }
});
