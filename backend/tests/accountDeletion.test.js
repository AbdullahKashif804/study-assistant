const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function load(relative, dependencies) {
  const context = vm.createContext({
    module: { exports: {} }, console: { error() {} }, process: { env: {} },
    require(name) {
      if (name in dependencies) return dependencies[name];
      return {};
    },
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, "..", relative), "utf8"), context);
  return context.module.exports;
}

function fixture() {
  const names = ["Notes", "Assignments", "Projects", "Courses", "Quizzes", "DailyTasks", "todoTask"];
  const attachment = (id, type = "raw") => ({ publicId: id, resourceType: type });
  const state = {
    users: [{ _id: "owner", email: "owner@example.com", profileImage: attachment("avatar", "image") },
      { _id: "other", email: "other@example.com" }],
    pending: [{ email: "owner@example.com" }, { email: "other@example.com" }],
    records: Object.fromEntries(names.map(name => [name, [
      { user: "owner", attachment: ["Notes", "Assignments", "Projects", "Courses"].includes(name) ? attachment(name, name === "Notes" ? "image" : "raw") : null },
      { user: "other", attachment: attachment(`other-${name}`) },
    ]])),
  };
  const calls = [];
  const deleted = new Set();
  let transactions = 0;
  const options = {};
  const query = getter => ({
    select() { return this; }, session() { return this; },
    then(resolve, reject) { return Promise.resolve().then(getter).then(resolve, reject); },
  });
  const userModel = {
    db: { async transaction(callback) {
      transactions++;
      if (options.unsupported) throw new Error("Transactions unsupported");
      const snapshot = structuredClone(state);
      try { await callback({ transaction: transactions }); }
      catch (error) { Object.assign(state, snapshot); throw error; }
    } },
    async findByIdAndUpdate(id, update, opts) {
      assert.ok(opts.session);
      const user = state.users.find(user => user._id === id);
      if (user) Object.assign(user, update.$set);
      return user;
    },
    findById(id) { return query(() => state.users.find(user => user._id === id)); },
    async deleteOne(filter, opts) {
      assert.ok(opts.session);
      if (options.databaseFailure) throw new Error("Database unavailable");
      state.users = state.users.filter(user => user._id !== filter._id);
    },
  };
  const dependencies = {
    "../models/Users": userModel,
    "../models/PendingSignup": { async deleteMany(filter, opts) {
      assert.ok(opts.session);
      state.pending = state.pending.filter(record => record.email !== filter.email);
    } },
    "../utils/cloudinaryDelete": { async deleteFromCloudinary(id, type) {
      calls.push([id, type]);
      if (options.cloudThrow) throw new Error("Network failure");
      if (options.cloudFailure) return { result: "error" };
      const result = deleted.has(id) ? "not found" : "ok";
      deleted.add(id);
      if (options.concurrentUpload && id === "Courses") {
        state.records.Notes[0].attachment = attachment("new-upload");
        options.concurrentUpload = false;
      }
      return { result };
    } },
  };
  for (const name of names) dependencies[`../models/${name}`] = {
    find(filter) { return query(() => state.records[name].filter(record => record.user === filter.user)); },
    async deleteMany(filter, opts) {
      assert.ok(opts.session);
      state.records[name] = state.records[name].filter(record => record.user !== filter.user);
    },
  };
  return { state, calls, options, api: load("services/accountDeletionService.js", dependencies) };
}

test("complete cascade preserves other users and uses stored Cloudinary types", async () => {
  const { api, state, calls } = fixture();
  await api.deleteAccount("owner");
  assert.deepEqual(state.users.map(user => user._id), ["other"]);
  for (const records of Object.values(state.records)) assert.deepEqual(records.map(record => record.user), ["other"]);
  assert.deepEqual(state.pending, [{ email: "other@example.com" }]);
  assert.deepEqual(calls, [["avatar", "image"], ["Notes", "image"], ["Assignments", "raw"], ["Projects", "raw"], ["Courses", "raw"]]);
});

for (const failure of ["cloudThrow", "cloudFailure", "databaseFailure"]) {
  test(`${failure} retains records and file references for an idempotent retry`, async () => {
    const { api, state, options } = fixture();
    options[failure] = true;
    await assert.rejects(api.deleteAccount("owner"));
    assert.equal(state.users[0].accountDeletionPending, true);
    for (const records of Object.values(state.records)) assert.equal(records.length, 2);
    assert.equal(state.pending.length, 2);
    options[failure] = false;
    await api.deleteAccount("owner");
    assert.equal(state.users.length, 1);
  });
}

test("unsupported transactions fail before Cloudinary cleanup or pending flag", async () => {
  const { api, state, options, calls } = fixture();
  options.unsupported = true;
  await assert.rejects(api.deleteAccount("owner"));
  assert.equal(calls.length, 0);
  assert.equal(state.users[0].accountDeletionPending, undefined);
});

test("an upload changed during cleanup aborts the database cascade and can be retried", async () => {
  const { api, state, options, calls } = fixture();
  options.concurrentUpload = true;
  await assert.rejects(api.deleteAccount("owner"), /upload changed/);
  assert.equal(state.records.Notes.length, 2);
  await api.deleteAccount("owner");
  assert.ok(calls.some(([id]) => id === "new-upload"));
});

test("missing Cloudinary identifiers fail without discarding cleanup references", async () => {
  const { api, state } = fixture();
  state.records.Notes[0].attachment = { url: "legacy-file" };
  await assert.rejects(api.deleteAccount("owner"), /identifier/);
  assert.equal(state.users.length, 2);
});

test("legacy attachments without a resource type fail rather than deleting under a guessed type", async () => {
  const { api, state, calls } = fixture();
  state.records.Notes[0].attachment = { publicId: "legacy-image" };
  await assert.rejects(api.deleteAccount("owner"), /resource type/);
  assert.equal(calls.length, 0);
  assert.equal(state.users.length, 2);
});

function response() {
  return { code: 200, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
}

test("controller requires explicit confirmation and ignores frontend user IDs", async () => {
  const calls = [];
  const api = load("controllers/userController.js", { "../services/accountDeletionService": {
    deleteAccount: async id => { calls.push(id); },
  } });
  const denied = response();
  await api.DeleteAccount({ body: { userId: "other" }, user: { _id: "owner" } }, denied);
  assert.equal(denied.code, 400);
  assert.equal(calls.length, 0);
  const success = response();
  await api.DeleteAccount({ body: { confirmation: "DELETE", userId: "other" }, user: { _id: "owner" } }, success);
  assert.equal(success.code, 200);
  assert.deepEqual(calls, ["owner"]);
});

test("controller never reports complete deletion when cleanup fails", async () => {
  const api = load("controllers/userController.js", { "../services/accountDeletionService": {
    deleteAccount: async () => { throw new Error("Cleanup failed"); },
  } });
  const res = response();
  await api.DeleteAccount({ body: { confirmation: "DELETE" }, user: { _id: "owner" } }, res);
  assert.equal(res.code, 500);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /Retry/);
});

test("JWT middleware denies deleted and pending users, allowing only authenticated deletion retries", async () => {
  let user = { _id: "owner", accountDeletionPending: true };
  const middleware = load("middleware/authMiddleware.js", {
    jsonwebtoken: { verify: () => ({ id: "owner" }) },
    "../models/Users": { findById: id => { assert.equal(id, "owner"); return { select: async () => user }; } },
  });
  const req = { headers: { authorization: "Bearer test-token" }, method: "GET", baseUrl: "/api/course", path: "/get" };
  let passed = 0;
  const blocked = response();
  await middleware(req, blocked, () => passed++);
  assert.equal(blocked.code, 409);
  req.method = "DELETE"; req.baseUrl = "/api/user"; req.path = "/delete-account";
  await middleware(req, response(), () => passed++);
  assert.equal(passed, 1);
  user = null;
  const deleted = response();
  await middleware(req, deleted, () => passed++);
  assert.equal(deleted.code, 401);
  assert.equal(passed, 1);
});
