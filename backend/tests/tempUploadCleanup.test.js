const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { EventEmitter } = require("node:events");

// Entire filesystem is mocked. No real upload directory or external resource is touched.
function fixture(options = {}) {
  const directory = path.resolve(__dirname, "../uploads");
  const owned = path.join(directory, "attachment-unit-test.pdf");
  const unrelated = path.join(directory, "unrelated-file.pdf");
  const files = new Map([[unrelated, "regular"]]);
  const deleted = [], logs = [];
  const module = { exports: {} };
  const missing = () => Object.assign(new Error("Synthetic missing file"), { code: "ENOENT" });
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../utils/tempUploadCleanup.js"), "utf8"), {
    module, __dirname: path.resolve(__dirname, "../utils"),
    console: { error: message => logs.push(message) },
    require(name) {
      if (name === "node:path") return path;
      assert.equal(name, "node:fs/promises");
      return {
        async lstat(file) {
          if (!files.has(file)) throw missing();
          return { isFile: () => files.get(file) === "regular", isSymbolicLink: () => files.get(file) === "symlink" };
        },
        async realpath() { return options.redirectDirectory ? path.resolve(directory, "../elsewhere") : directory; },
        async unlink(file) {
          if (options.unlinkFails) throw Object.assign(new Error("Synthetic sensitive filesystem detail"), { code: "EACCES" });
          if (!files.has(file)) throw missing();
          deleted.push(file); files.delete(file);
        },
      };
    },
  });
  const helper = module.exports;
  const req = {};
  const res = new EventEmitter();
  let parserCallback;
  let nextCalls = 0, nextError;
  const wrapped = helper.withTempUploadCleanup((request, response, next) => {
    helper.trackTempUpload(request, path.basename(owned));
    files.set(owned, options.symlink ? "symlink" : options.isDirectory ? "directory" : "regular");
    request.file = { path: owned };
    parserCallback = next;
  });
  function start() { wrapped(req, res, error => { nextCalls++; nextError = error; }); }
  return { ...helper, req, res, owned, unrelated, files, deleted, logs, start,
    parsed: error => parserCallback(error), nextCalls: () => nextCalls, nextError: () => nextError };
}
const settle = () => new Promise(resolve => setImmediate(resolve));

test("response completion cleans tracked uploads after success, validation failure, or database failure", async () => {
  for (const status of [200, 400, 404, 500]) {
    const f = fixture(); f.start(); f.parsed();
    assert.equal(f.nextCalls(), 1);
    assert.equal(f.files.has(f.owned), true);
    f.res.statusCode = status;
    f.res.emit("finish"); f.res.emit("close");
    await settle();
    assert.deepEqual(f.deleted, [f.owned]);
    assert.equal(f.files.has(f.unrelated), true);
    assert.equal(f.res.statusCode, status);
    assert.equal(f.res.listenerCount("finish"), 0);
    assert.equal(f.res.listenerCount("close"), 0);
  }
});

test("Cloudinary upload success/failure cleanup is idempotent with response cleanup", async () => {
  for (const fails of [false, true]) {
    const f = fixture(); f.start(); f.parsed();
    const module = { exports: {} };
    const original = new Error("Synthetic Cloudinary failure");
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../utils/cloudinaryUpload.js"), "utf8"), {
      module, console: { error() {} }, require(name) {
        if (name === "path") return path;
        if (name === "./tempUploadCleanup") return { removeTempUpload: f.removeTempUpload };
        if (name === "../config/cloudinary") return { uploader: { async upload() { if (fails) throw original; return { public_id: "mock-new-resource" }; } } };
        throw new Error("Unexpected dependency");
      },
    });
    if (fails) await assert.rejects(module.exports.uploadToCloudinary(f.owned), error => error === original);
    else assert.equal((await module.exports.uploadToCloudinary(f.owned)).public_id, "mock-new-resource");
    f.res.emit("finish"); await settle();
    assert.deepEqual(f.deleted, [f.owned]);
    assert.equal(f.files.has(f.unrelated), true);
  }
});

test("Multer file-size/parser errors clean tracked partial files before forwarding the original error", async () => {
  const f = fixture(); f.start();
  const error = Object.assign(new Error("File too large"), { code: "LIMIT_FILE_SIZE" });
  f.parsed(error); await settle();
  assert.deepEqual(f.deleted, [f.owned]);
  assert.equal(f.nextError(), error);
  assert.equal(f.nextCalls(), 1);
});

test("missing files, including those already removed by Multer, need no warning", async () => {
  const f = fixture(); f.start(); f.files.delete(f.owned);
  f.parsed(new Error("Synthetic Multer failure")); await settle();
  assert.deepEqual(f.deleted, []);
  assert.deepEqual(f.logs, []);
});

test("response close before parser completion waits for late writes and never calls the controller", async () => {
  const f = fixture(); f.start(); f.res.emit("close");
  await settle(); assert.equal(f.files.has(f.owned), true);
  f.parsed(); await settle();
  assert.deepEqual(f.deleted, [f.owned]);
  assert.equal(f.nextCalls(), 0);
});

test("untracked, traversal, redirected-directory, symlink, and directory targets are never deleted", async () => {
  const f = fixture(); f.start(); f.parsed();
  await f.removeTempUpload(f.unrelated);
  await f.removeTempUpload(path.resolve(f.owned, "../../outside.txt"));
  f.req.file.path = f.unrelated; // Response cleanup uses registered paths, not this mutable property.
  f.res.emit("finish"); await settle();
  assert.deepEqual(f.deleted, [f.owned]);
  assert.equal(f.files.has(f.unrelated), true);
  const registration = fixture(); registration.start();
  assert.throws(() => registration.trackTempUpload(registration.req, "../outside.txt"));
  registration.parsed(); registration.res.emit("finish"); await settle();
  for (const options of [{ symlink: true }, { isDirectory: true }, { redirectDirectory: true }]) {
    const protectedFile = fixture(options); protectedFile.start(); protectedFile.parsed(); protectedFile.res.emit("finish"); await settle();
    assert.deepEqual(protectedFile.deleted, []);
    assert.equal(protectedFile.files.has(protectedFile.unrelated), true);
  }
});

test("cleanup errors log safely, preserve responses, and allow a response-time retry", async () => {
  const f = fixture({ unlinkFails: true }); f.start(); f.parsed();
  await f.removeTempUpload(f.owned);
  f.res.statusCode = 400; f.res.emit("finish"); await settle();
  assert.equal(f.res.statusCode, 400);
  assert.equal(f.files.has(f.owned), true);
  assert.equal(f.logs.length, 2);
  assert.ok(f.logs.every(message => message === "Temporary upload cleanup failed; manual cleanup required."));
  assert.equal(f.nextCalls(), 1);
});

test("both actual Multer configurations preserve restrictions and register generated filenames", () => {
  for (const [file, field, size] of [["uploadMiddleware.js", "attachment", 10], ["profileUploadMiddleware.js", "profileImage", 5]]) {
    let config, registered = 0, wrapped = 0;
    const multer = options => { config = options; return { single(name) { assert.equal(name, field); return "parser"; } }; };
    multer.diskStorage = options => options;
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../middleware", file), "utf8"), {
      module: { exports: {} }, __dirname: path.resolve(__dirname, "../middleware"), require(name) {
        if (name === "multer") return multer;
        if (name === "path") return path;
        if (name === "fs") return { existsSync: () => true };
        if (name === "node:crypto") return { randomUUID: () => "mock-random-id" };
        if (name.includes("tempUploadCleanup")) return {
          trackTempUpload(req, filename) { registered++; assert.ok(!filename.includes("..")); },
          withTempUploadCleanup(parser) { wrapped++; assert.equal(parser, "parser"); return parser; },
        };
        throw new Error("Unexpected dependency");
      },
    });
    assert.equal(config.limits.fileSize, size * 1024 * 1024);
    config.storage.filename({}, { originalname: "test.png" }, (error, filename) => { assert.equal(error, null); assert.match(filename, /mock-random-id\.png$/); });
    assert.equal(registered, 1); assert.equal(wrapped, 1);
    config.fileFilter({}, { mimetype: "image/png" }, (error, allowed) => { assert.equal(error, null); assert.equal(allowed, true); });
    config.fileFilter({}, { mimetype: "application/x-executable" }, error => assert.ok(error));
  }
});

test("all five upload route families authenticate before starting Multer", () => {
  for (const name of ["note", "assignment", "project", "course", "user"]) {
    const routes = [];
    const router = Object.fromEntries(["post", "get", "put", "delete"].map(method => [method, (...args) => routes.push(args)]));
    let uploads = 0;
    const upload = () => { uploads++; };
    const auth = (req, res, next) => { res.statusCode = 401; }; // Reject; do not call next.
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, `../routes/${name}Route.js`), "utf8"), {
      module: { exports: {} }, require(dependency) {
        if (dependency === "express") return { Router: () => router };
        if (dependency.includes("authRateLimit")) return { createAuthRateLimiters: () => ({}) };
        if (dependency.includes("validateInput")) return { validateInput: () => () => {}, validateRecordId() {} };
        if (/profileUploadMiddleware|uploadMiddleware/.test(dependency)) return upload;
        if (dependency.includes("authMiddleware")) return auth;
        return new Proxy({}, { get: () => () => {} });
      },
    });
    for (const route of routes.filter(args => args.includes(upload))) {
      assert.equal(route[1], auth);
      assert.ok(route.indexOf(auth) < route.indexOf(upload));
      const res = {}; route[1]({}, res, () => upload()); assert.equal(res.statusCode, 401);
    }
    assert.equal(uploads, 0);
  }
});
