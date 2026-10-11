const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const bcrypt = require("bcrypt");
const { BCRYPT_COST } = require("../config/password");

test("new passwords use cost 12, verify correctly, and reject incorrect input", async () => {
  assert.equal(BCRYPT_COST, 12);
  const hash = await bcrypt.hash("synthetic-new-password", BCRYPT_COST);
  assert.equal(bcrypt.getRounds(hash), 12);
  assert.equal(await bcrypt.compare("synthetic-new-password", hash), true);
  assert.equal(await bcrypt.compare("synthetic-wrong-input", hash), false);
});

test("legacy cost-6 bcrypt hashes remain valid without modification", async () => {
  const hash = await bcrypt.hash("synthetic-legacy-password", 6);
  assert.equal(await bcrypt.compare("synthetic-legacy-password", hash), true);
  assert.equal(await bcrypt.compare("synthetic-wrong-input", hash), false);
  assert.equal(bcrypt.getRounds(hash), 6);
});

function fixture() {
  const calls = { hashes: [], comparisons: [], saves: 0, emails: 0, tokens: 0 };
  const user = { _id: "test-owner", email: "student@example.test", password: "synthetic-old-hash", async save() { calls.saves++; } };
  let matched = true;
  function Pending(data) { Object.assign(this, data); }
  Pending.prototype.save = async () => {};
  const dependencies = {
    "../utils/saveWithFileReplacement": { saveWithFileReplacement: ({ document }) => document.save() },
    bcrypt: {
      async hash(input, rounds) { calls.hashes.push({ input, rounds }); return "synthetic-new-hash"; },
      async compare(input, hash) { calls.comparisons.push({ input, hash }); return matched; },
    },
    "../config/password": { BCRYPT_COST },
    "../models/Users.js": { findOne: async () => null, findById: async () => user },
    "../models/PendingSignup": Pending,
    "../utils/sendEmail": async () => { calls.emails++; },
    "../services/accountDeletionService": {},
    "../utils/cloudinaryUpload": {},
    "../utils/cloudinaryDelete": {},
    crypto: { randomInt: () => 123456 },
    path: {},
    jsonwebtoken: { sign() { calls.tokens++; return "synthetic-jwt"; } },
  };
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../controllers/userController.js"), "utf8"), {
    module, process: { env: {} }, console: { error() {} },
    require(name) { assert.ok(name in dependencies); return dependencies[name]; },
  });
  async function invoke(name, body) {
    const response = { code: 200, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
    await module.exports[name]({ body, user: { _id: user._id } }, response);
    return response;
  }
  return { calls, user, dependencies, invoke, setMatched(value) { matched = value; } };
}

test("signup uses the centralized cost and preserves pending email verification", async () => {
  const f = fixture();
  const result = await f.invoke("SignUp", { first_name: "Test", last_name: "Student", email: "student@example.test", password: "synthetic-input", currentSemester: 3, agreedToTerms: true });
  assert.equal(result.code, 201);
  assert.equal(f.calls.hashes.length, 1);
  assert.equal(f.calls.hashes[0].rounds, BCRYPT_COST);
  assert.equal(f.calls.emails, 1);
});

test("password update verifies the old hash and hashes only the replacement at cost 12", async () => {
  const f = fixture();
  const result = await f.invoke("changePassword", { currentPassword: "synthetic-old-input", newPassword: "synthetic-new-input", confirmPassword: "synthetic-new-input" });
  assert.equal(result.code, 200);
  assert.equal(f.calls.comparisons.length, 1);
  assert.equal(f.calls.comparisons[0].hash, "synthetic-old-hash");
  assert.equal(f.calls.hashes.length, 1);
  assert.equal(f.calls.hashes[0].rounds, BCRYPT_COST);
  assert.equal(f.calls.saves, 1);
});

test("incorrect current passwords and mismatched confirmation never hash or save", async () => {
  const f = fixture();
  f.setMatched(false);
  assert.equal((await f.invoke("changePassword", { currentPassword: "wrong", newPassword: "synthetic-new-input", confirmPassword: "synthetic-new-input" })).code, 400);
  assert.equal((await f.invoke("changePassword", { currentPassword: "old", newPassword: "new", confirmPassword: "different" })).code, 400);
  assert.equal(f.calls.hashes.length, 0);
  assert.equal(f.calls.saves, 0);
});

test("login compares existing hashes without rehashing, rejects incorrect input, and preserves JWT issuance", async () => {
  const f = fixture();
  f.dependencies["../models/Users.js"].findOne = async () => f.user;
  const body = { email: "student@example.test", password: "synthetic-input" };
  assert.equal((await f.invoke("SignIn", body)).code, 200);
  assert.equal(f.calls.tokens, 1);
  f.setMatched(false);
  assert.equal((await f.invoke("SignIn", body)).code, 400);
  assert.equal(f.calls.tokens, 1);
  assert.equal(f.calls.hashes.length, 0);
  assert.equal(f.calls.saves, 0);
});
