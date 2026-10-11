const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");
function load(file, dependencies, logs) {
  const module = { exports: {} };
  vm.runInNewContext(read(file), {
    module, process: { env: {} }, console: { error: (...args) => logs.push(args.join(" ")) },
    require(name) { assert.ok(name in dependencies, `Unexpected dependency: ${name}`); return dependencies[name]; },
  });
  return module.exports;
}

const names = ["assignment", "project", "course", "note", "user"];
function fixture(name, options = {}) {
  const field = name === "user" ? "profileImage" : "attachment";
  const type = name === "user" ? "image" : "raw";
  const old = { publicId: "old-resource", resourceType: type, url: "https://files.example.test/old", ...(options.oldPrivate ? { deliveryType: "authenticated" } : {}) };
  const calls = [], logs = [], deletes = [];
  let stored = { ...old };
  const document = {
    _id: "owned-record", user: "owner", [field]: { ...old }, title: "Same title", content: "Same content",
    attachmentRagChunks: ["old-index"], attachmentRagIndexedAt: "old-date", attachmentRagPublicId: "old-resource",
    async save() { calls.push("save"); if (options.saveFails) throw new Error("Synthetic save failure"); stored = { ...this[field] }; return this; },
    async populate() { calls.push("populate"); if (options.populateFails) throw new Error("Synthetic populate failure"); },
  };
  const upload = { async uploadToCloudinary() {
    calls.push("upload");
    if (options.uploadFails) throw new Error("Synthetic upload failure");
    if (options.nullUpload) return null;
    return { public_id: "new-resource", resource_type: type, type: name === "user" ? "upload" : "authenticated", secure_url: "https://files.example.test/new", format: "pdf", bytes: 123 };
  } };
  // Load the real deletion utility to verify quiet mode prevents provider errors leaking.
  const deletion = load("utils/cloudinaryDelete.js", {
    "../config/cloudinary": { uploader: { async destroy(id, settings) {
      calls.push(`delete:${id}`); deletes.push({ id, type: settings.resource_type, deliveryType: settings.type });
      if (options.cleanupThrows) throw new Error("Synthetic provider credential detail that must not be logged");
      return { result: options.cleanupResult || "ok" };
    } } },
  }, logs);
  const replacement = load("utils/saveWithFileReplacement.js", {
    "./cloudinaryUpload": upload, "./cloudinaryDelete": deletion,
  }, logs);
  const query = filter => {
    assert.equal(filter.user, "owner");
    calls.push("owner-query");
    return { select() { return this; }, then(resolve) { return Promise.resolve(options.notOwned ? null : document).then(resolve); } };
  };
  const model = { findOne: query, async findById(id) { assert.equal(id, "owner"); calls.push("owner-query"); return options.notOwned ? null : document; } };
  const deps = {
    "../utils/saveWithFileReplacement": replacement,
    "../utils/cloudinaryUpload": upload, "../utils/cloudinaryDelete": deletion,
    "../models/Assignments": model, "../models/Projects": model, "../models/Courses": name === "course" ? model : { findOne: async filter => { assert.equal(filter.user, "owner"); return {}; } },
    "../models/Notes.js": model, "../models/Users.js": model,
    bcrypt: {}, "../config/password": {}, jsonwebtoken: {}, path: {}, crypto: {},
    "../services/accountDeletionService": {}, "../models/PendingSignup": {}, "../utils/sendEmail": {},
  };
  const controller = load(`controllers/${name}Controller.js`, deps, logs);
  async function run(withFile = true) {
    const body = { title: "Same title", content: "Same content", description: "Details", course: "owned-course", dueDate: "2026-11-01", totalMark: 100, obtainedMark: 9, technologies: '["React"]', semester: 3, instructor: "Teacher", courseCode: "CS101", first_name: "Test" };
    const req = { body, params: { id: "owned-record" }, user: { _id: "owner" }, ...(withFile ? { file: { path: "mock-path", originalname: "test.pdf", size: 123 } } : {}) };
    const res = { code: 200, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; }, send(data) { this.data = data; return this; } };
    const handler = name === "user" ? "updateProfile" : `update${name[0].toUpperCase()}${name.slice(1)}`;
    await controller[handler](req, res);
    return res;
  }
  return { run, calls, logs, deletes, document, old, field, stored: () => stored };
}

test("all five modules upload, commit the new reference, then delete the old typed resource", async () => {
  for (const name of names) {
    const f = fixture(name);
    assert.equal((await f.run()).code, 200, name);
    assert.ok(f.calls.indexOf("upload") < f.calls.indexOf("save"));
    assert.ok(f.calls.indexOf("save") < f.calls.indexOf("delete:old-resource"));
    assert.equal(f.stored().publicId, "new-resource");
    assert.equal(f.deletes.length, 1);
    assert.equal(f.deletes[0].type, name === "user" ? "image" : "raw");
    if (name === "note") {
      assert.equal(f.document.attachmentRagChunks.length, 0);
      assert.equal(f.document.attachmentRagIndexedAt, null);
      assert.equal(f.document.attachmentRagPublicId, null);
    }
  }
});

test("upload rejection or missing upload result preserves the original file and reference", async () => {
  for (const name of names) for (const failure of ["uploadFails", "nullUpload"]) {
    const f = fixture(name, { [failure]: true });
    assert.equal((await f.run()).code, 500);
    assert.equal(f.calls.includes("save"), false);
    assert.equal(f.deletes.length, 0);
    assert.equal(f.stored().publicId, "old-resource");
    assert.equal(f.document[f.field].publicId, "old-resource");
  }
});

test("failed database saves compensate only the new upload and preserve the old file", async () => {
  for (const name of names) {
    const f = fixture(name, { saveFails: true });
    assert.equal((await f.run()).code, 500);
    assert.equal(f.deletes.length, 1);
    assert.equal(f.deletes[0].id, "new-resource");
    assert.equal(f.deletes[0].deliveryType, name === "user" ? "upload" : "authenticated");
    assert.equal(f.deletes[0].type, name === "user" ? "image" : "raw");
    assert.equal(f.stored().publicId, "old-resource");
    assert.equal(f.document[f.field].publicId, "old-resource");
  }
});

test("post-save cleanup errors and negative Cloudinary results retain the new reference and log safely", async () => {
  for (const name of names) for (const options of [{ cleanupThrows: true }, { cleanupResult: "error" }]) {
    const f = fixture(name, options);
    assert.equal((await f.run()).code, 200);
    assert.equal(f.stored().publicId, "new-resource");
    assert.equal(f.logs.length, 1);
    assert.match(f.logs[0], /cleanup failed.*manual retry/);
    assert.ok(!f.logs[0].includes("credential"));
  }
});

test("unowned records never trigger uploads, saves, or deletions in any module", async () => {
  for (const name of names) {
    const f = fixture(name, { notOwned: true });
    assert.equal((await f.run()).code, 404);
    assert.deepEqual(f.calls, ["owner-query"]);
    assert.equal(f.stored().publicId, "old-resource");
  }
});

test("editing without a new file preserves the existing attachment and performs no Cloudinary calls", async () => {
  for (const name of names) {
    const f = fixture(name);
    assert.equal((await f.run(false)).code, 200);
    assert.equal(f.calls.includes("upload"), false);
    assert.equal(f.deletes.length, 0);
    assert.equal(f.stored().publicId, "old-resource");
  }
});

test("a population failure after save never compensates the committed new file", async () => {
  for (const name of ["assignment", "project", "note"]) {
    const f = fixture(name, { populateFails: true });
    assert.equal((await f.run()).code, 500);
    assert.equal(f.stored().publicId, "new-resource");
    assert.equal(f.deletes.length, 1);
    assert.equal(f.deletes[0].id, "old-resource");
  }
});

test("local temp cleanup failure does not hide a successful upload or replace its original failure", async () => {
  for (const fails of [false, true]) {
    const logs = [];
    const original = new Error("Synthetic upload failure");
    const upload = load("utils/cloudinaryUpload.js", {
      "../config/cloudinary": { uploader: { async upload() { if (fails) throw original; return { public_id: "new-resource" }; } } },
      "./tempUploadCleanup": { async removeTempUpload() { logs.push("Temporary upload cleanup failed; manual cleanup required."); } },
      path: { extname: () => ".pdf" },
    }, logs);
    if (fails) await assert.rejects(upload.uploadToCloudinary("mock-path", "test", { quiet: true }), error => error === original);
    else assert.equal((await upload.uploadToCloudinary("mock-path", "test", { quiet: true })).public_id, "new-resource");
    assert.deepEqual(logs, ["Temporary upload cleanup failed; manual cleanup required."]);
  }
});

test("failed compensation keeps the original database reference and logs a sanitized recovery warning", async () => {
  for (const name of names) {
    const f = fixture(name, { saveFails: true, cleanupThrows: true });
    assert.equal((await f.run()).code, 500);
    assert.equal(f.stored().publicId, "old-resource");
    assert.equal(f.deletes[0].id, "new-resource");
    assert.ok(f.logs.some(message => /cleanup failed.*new upload/.test(message)));
    assert.ok(f.logs.every(message => !message.includes("credential")));
  }
});

test("adding a first attachment requires no old-file deletion", async () => {
  for (const name of names) {
    const f = fixture(name);
    f.document[f.field] = null;
    assert.equal((await f.run()).code, 200);
    assert.equal(f.stored().publicId, "new-resource");
    assert.equal(f.deletes.length, 0);
  }
});

test("missing legacy resource types skip attachment deletion instead of guessing; profile images use image", async () => {
  for (const name of names) {
    const f = fixture(name);
    delete f.document[f.field].resourceType;
    assert.equal((await f.run()).code, 200);
    assert.equal(f.stored().publicId, "new-resource");
    if (name === "user") assert.equal(f.deletes[0].type, "image");
    else {
      assert.equal(f.deletes.length, 0);
      assert.match(f.logs[0], /invalid resource metadata/);
    }
  }
});

test("authenticated replacements delete only the old authenticated resource after commit", async () => {
 for (const name of ["note", "assignment", "project", "course"]) { const f = fixture(name, { oldPrivate: true }); assert.equal((await f.run()).code, 200); assert.equal(f.deletes[0].deliveryType, "authenticated"); assert.equal(f.stored().deliveryType, "authenticated"); }
});
