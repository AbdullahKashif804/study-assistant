const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { Writable } = require("node:stream");
const { EventEmitter } = require("node:events");

function load(file, deps, globals = {}) {
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), {
    module, Buffer, URL, AbortController, setTimeout, clearTimeout,
    __dirname: path.join(__dirname, "../services"), console: { error() {} },
    require(name) { if (name in deps) return deps[name]; if (name.endsWith(".js") && name.slice(0, -3) in deps) return deps[name.slice(0, -3)]; if (name.startsWith("node:")) return require(name); throw new Error(`Unexpected dependency: ${name}`); },
    ...globals,
  });
  return module.exports;
}

function fixture(options = {}) {
  const attachment = { publicId: "owned.pdf", resourceType: "raw", deliveryType: "authenticated", format: "pdf", originalName: 'Study"\r\n.pdf' };
  let queries = 0, fetches = 0;
  const model = { findOne(filter) {
    queries++;
    assert.equal(filter.user, "owner"); assert.equal(filter._id, "record");
    return { select() { return this; }, async lean() {
      return options.missing || (options.changed && queries > 1) ? null : { attachment };
    } };
  } };
  const resolver = load("services/attachmentDelivery.js", { "../config/cloudinary": {
    config: () => ({ cloud_name: "fixture" }), utils: {
      private_download_url(id, format, settings) {
        assert.equal(id, "owned.pdf"); assert.equal(settings.type, "authenticated");
        assert.equal(settings.resource_type, "raw"); assert.equal(format, "pdf");
        assert.ok(settings.expires_at <= Date.now() / 1000 + 60);
        return "https://api.cloudinary.com/v1_1/fixture/raw/download?signature=internal-only";
      },
    },
  } });
  const controller = load("controllers/attachmentController.js", {
    "../services/attachmentDelivery": resolver,
    ...Object.fromEntries(["Notes", "Assignments", "Projects", "Courses"].map(name => [`../models/${name}`, model])),
  }, {
    setTimeout: (fn, ms) => setTimeout(fn, options.timeout ? 5 : ms),
    fetch: async (url, settings) => {
      fetches++; assert.equal(settings.redirect, "manual");
      if (options.timeout) return new Promise((resolve, reject) => settings.signal.addEventListener("abort", () => reject(new Error("sensitive details"))));
      if (options.redirect) return new Response(null, { status: 302, headers: { location: "https://unsafe.test/?secret=redacted" } });
      if (options.upstreamMissing) return new Response(null, { status: 404 });
      return new Response(options.streamLarge ? Buffer.alloc(10 * 1024 * 1024 + 1) : "%PDF-test", {
        headers: options.large ? { "content-length": "20000000" } : { "content-type": "text/html" },
      });
    },
  });
  const chunks = [];
  const res = new Writable({ write(chunk, encoding, callback) { res.headersSent = true; chunks.push(chunk); callback(); } });
  res.on("error", () => {});
  res.headers = {}; res.code = 200;
  res.setHeader = (key, value) => { res.headers[key] = value; };
  res.status = code => { res.code = code; return res; };
  res.json = data => { res.data = data; res.end(); return res; };
  const req = { user: { _id: "owner" }, baseUrl: "/api/note", params: { id: "record" }, query: { version: "owned.pdf", ...(options.download ? { download: "1" } : {}) } };
  return { attachment, req, res, resolver, fetches: () => fetches,
    bytes: () => Buffer.concat(chunks).toString(), run: () => controller.deliverAttachment(req, res) };
}

test("owner preview and download stream bytes with safe headers and no signed URL leakage", async () => {
  for (const download of [false, true]) {
    const f = fixture({ download }); await f.run();
    assert.equal(f.res.code, 200); assert.equal(f.bytes(), "%PDF-test");
    assert.equal(f.res.headers["Content-Type"], "application/pdf");
    assert.ok(f.res.headers["Content-Disposition"].startsWith(download ? "attachment;" : "inline;"));
    assert.ok(!/[\r\n]/.test(f.res.headers["Content-Disposition"]));
    assert.equal(f.res.headers["Cache-Control"], "private, no-store, max-age=0");
    assert.equal(f.res.headers["X-Content-Type-Options"], "nosniff");
    assert.equal(f.res.headers["X-Attachment-Privacy"], "authenticated");
    assert.ok(!JSON.stringify(f.res.headers).includes("signature"));
  }
});
test("unauthenticated, cross-owner/deleted and stale references never fetch upstream", async () => {
  for (const scenario of ["unauthenticated", "missing", "stale"]) {
    const f = fixture({ missing: scenario === "missing" });
    if (scenario === "unauthenticated") delete f.req.user;
    if (scenario === "stale") f.req.query.version = "old.pdf";
    await f.run(); assert.equal(f.res.code, scenario === "unauthenticated" ? 401 : 404);
    assert.equal(f.fetches(), 0);
  }
});
test("replacement/deletion during upstream fetch and absent cloud files return 404", async () => {
  for (const options of [{ changed: true }, { upstreamMissing: true }]) {
    const f = fixture(options); await f.run(); assert.equal(f.res.code, 404); assert.equal(f.bytes(), "");
  }
});
test("redirects, oversized bodies and timeouts fail without exposing upstream details", async () => {
  for (const [options, status] of [[{ redirect: true }, 502], [{ large: true }, 413], [{ timeout: true }, 504]]) {
    const f = fixture(options); await f.run(); assert.equal(f.res.code, status);
    assert.ok(!JSON.stringify(f.res.data).includes("secret")); assert.equal(f.bytes(), "");
  }
  const f = fixture({ streamLarge: true }); await f.run(); assert.equal(f.res.destroyed, true);
  assert.ok(f.bytes().length <= 10 * 1024 * 1024);
});
test("legacy-public assets work but arbitrary or credential-bearing stored URLs fail closed", async () => {
  const f = fixture(); delete f.attachment.deliveryType;
  f.attachment.url = "https://res.cloudinary.com/fixture/raw/upload/owned.pdf";
  await f.run(); assert.equal(f.res.code, 200); assert.equal(f.res.headers["X-Attachment-Privacy"], "legacy-public");
  for (const url of ["https://evil.test/file", "http://res.cloudinary.com/fixture/file", "https://res.cloudinary.com/other/file", "https://res.cloudinary.com/fixture/file?signature=secret"]) {
    assert.throws(() => f.resolver.attachmentURL({ ...f.attachment, url }));
  }
});
test("four upload folders require authenticated delivery; profile/default uploads retain behavior and temp cleanup", async () => {
  const calls = [], removed = [];
  const upload = load("utils/cloudinaryUpload.js", {
    path, "./tempUploadCleanup": { removeTempUpload: async value => removed.push(value) },
    "../config/cloudinary": { url: () => "https://res.cloudinary.com/fixture/raw/authenticated/new.pdf",
      uploader: { async upload(file, settings) {
        calls.push(settings); return { public_id: "new.pdf", resource_type: settings.resource_type, type: settings.type || "upload", secure_url: "not-returned-for-private" };
      } },
    },
  });
  for (const folder of ["notes_attachments", "assignment_attachments", "project_attachments", "course_attachments"]) {
    const result = await upload.uploadToCloudinary("/synthetic/file.pdf", folder);
    assert.equal(result.type, "authenticated"); assert.equal(calls.at(-1).overwrite, false);
    assert.ok(!result.secure_url.includes("signature"));
  }
  await upload.uploadToCloudinary("/synthetic/profile.png", "profile_images");
  assert.equal(calls.at(-1).type, undefined); assert.equal(calls.at(-1).resource_type, "image");
  assert.equal(removed.length, 5);
});
test("authenticated RAG download uses only server-side signed URL, keeps limits and parses the document", async () => {
  const f = fixture(); let fetched;
  class Worker extends EventEmitter {
    constructor() { super(); setImmediate(() => this.emit("message", { text: "Study content" })); }
    terminate() { return Promise.resolve(); }
  }
  const service = load("services/documentTextService.js", {
    "./attachmentDelivery": f.resolver, "node:worker_threads": { Worker },
    "../config/aiLimits": require("../config/aiLimits"),
    "../utils/aiSafety": { AIError: require("../utils/aiSafety").AIError, async fetchLimited(url, options, budget) {
      fetched = url; assert.equal(options.redirect, "error"); assert.equal(budget.maxBytes, 10 * 1024 * 1024);
      return Buffer.from("%PDF-test");
    } },
  });
  const result = await service.extractDocumentText({ attachment: f.attachment, format: "pdf" });
  assert.equal(result.text, "Study content"); assert.ok(fetched.startsWith("https://api.cloudinary.com/"));
});
test("all four attachment routes run actual JWT middleware before validation and delivery", async () => {
  const auth = load("middleware/authMiddleware.js", { jsonwebtoken: { verify() { throw new Error("No JWT"); } }, "../models/Users": {} });
  for (const name of ["note", "assignment", "project", "course"]) {
    const routes = [];
    const router = Object.fromEntries(["get", "post", "put", "delete"].map(method => [method, (...args) => routes.push(args)]));
    load(`routes/${name}Route.js`, {
      express: { Router: () => router }, "../middleware/authMiddleware": auth,
      "../middleware/uploadMiddleware.js": () => {},
      "../middleware/validateInput": { validateRecordId() {}, validateInput: () => () => {} },
      "../controllers/attachmentController": { deliverAttachment() {} },
      [`../controllers/${name}Controller`]: {},
    });
    const route = routes.find(args => args[0] === "/attachment/:id"); assert.equal(route[1], auth);
    const res = { status(code) { this.code = code; return this; }, json() {} };
    await route[1]({ headers: {} }, res, () => assert.fail("Unauthenticated access passed"));
    assert.equal(res.code, 401);
  }
});
