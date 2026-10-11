import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

function fixture({ status = 200, download = false, blocked = false } = {}) {
  const requests = [], notices = [], clicked = [], revoked = [];
  const popup = { opener: {}, closed: false, location: { replace(url) { popup.url = url; } }, close() { this.closed = true; } };
  let interval;
  const context = vm.createContext({
    API_BASE_URL: "https://backend.test", Blob, AbortController, encodeURIComponent,
    Date, setTimeout: () => 1, clearTimeout() {},
    setInterval(fn) { interval = fn; return 1; }, clearInterval() {},
    URL: { createObjectURL: () => "blob:local-private-preview", revokeObjectURL: url => revoked.push(url) },
    localStorage: { getItem: () => "synthetic-token" },
    window: { open: () => blocked ? null : popup, alert: message => notices.push(message) },
    document: { body: { append() {} }, createElement: () => ({ click() { clicked.push({ href: this.href, download: this.download }); }, remove() {} }) },
    fetch: async (url, options) => { requests.push({ url, options }); return new Response("%PDF-fixture", { status, headers: { "content-type": "application/pdf" } }); },
  });
  const source = readFileSync(new URL("../src/utils/openAttachment.js", import.meta.url), "utf8")
    .replace(/^import .*;\r?\n/, "").replace("export async function", "async function");
  vm.runInContext(source, context);
  return { requests, notices, clicked, revoked, popup,
    run: () => context.openAttachment("note", { _id: "record", attachment: { publicId: "owned.pdf", originalName: "Study.pdf" } }, download),
    closePreview() { popup.closed = true; interval(); },
  };
}
test("preview fetches the owner endpoint with bearer auth and opens only a local blob", async () => {
  const f = fixture(); await f.run();
  assert.equal(f.requests.length, 1);
  assert.equal(f.requests[0].options.headers.Authorization, "Bearer synthetic-token");
  assert.equal(f.requests[0].url, "https://backend.test/api/note/attachment/record?version=owned.pdf&download=0");
  assert.equal(f.popup.url, "blob:local-private-preview"); assert.equal(f.popup.opener, null);
  f.closePreview(); assert.deepEqual(f.revoked, ["blob:local-private-preview"]);
});
test("download uses authenticated Fetch and preserves the filename without Cloudinary links", async () => {
  const f = fixture({ download: true }); await f.run();
  assert.ok(f.requests[0].url.endsWith("download=1"));
  assert.deepEqual(f.clicked, [{ href: "blob:local-private-preview", download: "Study.pdf" }]);
});
test("expired auth and deleted attachments close the empty preview and show safe errors", async () => {
  for (const status of [401, 404, 502]) {
    const f = fixture({ status }); await f.run();
    assert.equal(f.popup.closed, true); assert.equal(f.popup.url, undefined);
    assert.equal(f.notices.length, 1); assert.ok(!f.notices[0].includes("synthetic-token"));
  }
});
test("blocked popups do not fetch files or leak a token into navigation", async () => {
  const f = fixture({ blocked: true }); await f.run();
  assert.equal(f.requests.length, 0); assert.equal(f.notices.length, 1);
});
