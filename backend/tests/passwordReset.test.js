const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const crypto = require("node:crypto");
const bcrypt = require("bcrypt");
const { createAuthRateLimiters } = require("../middleware/authRateLimit");

const get = (object, key) => key.split(".").reduce((value, part) => value?.[part], object);
function put(object, key, value, remove = false) {
  const parts = key.split(".");
  const last = parts.pop();
  for (const part of parts) object = object[part] ||= {};
  if (remove) delete object[last]; else object[last] = value;
}
function matches(object, filter) {
  return Object.entries(filter).every(([key, condition]) => {
    if (key === "$or") return condition.some(item => matches(object, item));
    const value = get(object, key);
    if (condition && typeof condition === "object" && !(condition instanceof Date)) {
      return Object.entries(condition).every(([op, expected]) => {
        if (op === "$exists") return (value !== undefined) === expected;
        if (op === "$ne") return value !== expected;
        if (op === "$gt") return value > expected;
        if (op === "$lt") return value < expected;
        if (op === "$lte") return value <= expected;
        throw new Error("Unexpected mock query operator");
      });
    }
    return value === condition;
  });
}

function fixture() {
  const user = { _id: "synthetic-owner", email: "student@example.test", password: "original" };
  const emails = [], logs = [];
  let failEmail = false, failUpdate = false;
  const model = {
    findOneAndUpdate(filter, update) {
      let result = null;
      if (matches(user, filter)) {
        apply(update);
        result = structuredClone(user);
      }
      return { select: async () => result, then: (resolve, reject) => Promise.resolve(result).then(resolve, reject) };
    },
    async exists(filter) { return matches(user, filter) ? { _id: user._id } : null; },
    async updateOne(filter, update) {
      if (failUpdate) throw new Error("synthetic-sensitive-database-details");
      if (!matches(user, filter)) return { modifiedCount: 0 };
      apply(update); return { modifiedCount: 1 };
    },
  };
  function apply(update) {
    for (const [key, value] of Object.entries(update.$set || {})) put(user, key, value);
    for (const key of Object.keys(update.$unset || {})) put(user, key, undefined, true);
    for (const [key, value] of Object.entries(update.$inc || {})) put(user, key, get(user, key) + value);
  }
  const dependencies = {
    "node:crypto": crypto, bcrypt, "../models/Users": model,
    "../config/password": require("../config/password"),
    "../utils/sendEmail": async (email, subject, body) => {
      if (failEmail) throw new Error("synthetic-sensitive-provider-details");
      emails.push({ email, subject, body });
    },
  };
  const module = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../controllers/passwordResetController.js"), "utf8"), {
    module, Buffer, Date, process: { env: { JWT_SECRET: "synthetic-test-only-signing-key" } },
    console: { error: message => logs.push(message) },
    require(name) { assert.ok(name in dependencies); return dependencies[name]; },
  });
  async function invoke(action, body = {}) {
    const res = { code: 200, headers: {}, setHeader(key, value) { this.headers[key] = value; },
      status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
    const req = { body: { email: user.email, ...body } };
    let valid = false;
    module.exports.validatePasswordReset(action)(req, res, () => { valid = true; });
    if (valid) await module.exports[{ request: "requestPasswordReset", verify: "verifyPasswordReset", reset: "resetPassword" }[action]](req, res);
    return res;
  }
  const otp = () => emails.at(-1).body.match(/code is: (\d{6})/)[1];
  return { user, emails, logs, invoke, otp, setFailEmail: () => { failEmail = true; }, setFailUpdate: () => { failUpdate = true; } };
}

async function loginWith(user, password) {
  const module = { exports: {} };
  const dependencies = {
    bcrypt, "../config/password": require("../config/password"),
    "../models/Users.js": { findOne: async () => user },
    "../services/accountDeletionService": {}, "../utils/cloudinaryUpload": {},
    "../utils/cloudinaryDelete": {}, "../utils/saveWithFileReplacement": {},
    "../models/PendingSignup": {}, "../utils/sendEmail": async () => {},
    jsonwebtoken: { sign: () => "synthetic-login-token" }, path: {}, crypto,
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../controllers/userController.js"), "utf8"), {
    module, process: { env: {} }, console: { error() {} },
    require(name) { assert.ok(name in dependencies); return dependencies[name]; },
  });
  const response = { code: 200, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
  await module.exports.SignIn({ body: { email: user.email, password } }, response);
  return response;
}

test("registered/unknown emails get identical generic responses; only registered email receives a hashed, separate reset OTP", async () => {
  const f = fixture();
  const known = await f.invoke("request");
  const unknown = await f.invoke("request", { email: "unknown@example.test" });
  assert.equal(known.code, 200);
  assert.deepEqual(known.data, unknown.data);
  assert.equal(f.emails.length, 1);
  assert.match(f.otp(), /^\d{6}$/);
  assert.match(f.user.passwordReset.otpHash, /^[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(f.user).includes(f.otp()), false);
  const remaining = f.user.passwordReset.expiresAt.getTime() - Date.now();
  assert.ok(remaining > 590000 && remaining <= 600000);
  assert.equal(known.headers["Cache-Control"], "no-store");
});

test("correct OTP is single-use; reset token is hashed, consumes all recovery state, and new password replaces old", async () => {
  const f = fixture();
  f.user.password = await bcrypt.hash("synthetic-old-password", 6);
  await f.invoke("request");
  const otp = f.otp();
  const verified = await f.invoke("verify", { otp });
  assert.equal(verified.code, 200);
  assert.match(verified.data.resetToken, /^[a-f0-9]{64}$/);
  assert.notEqual(f.user.passwordReset.tokenHash, verified.data.resetToken);
  assert.equal(f.user.passwordReset.otpHash, undefined);
  assert.equal((await f.invoke("verify", { otp })).code, 400);
  const body = { resetToken: verified.data.resetToken, newPassword: "synthetic-new-password", confirmPassword: "synthetic-new-password" };
  assert.equal((await f.invoke("reset", body)).code, 200);
  assert.equal(bcrypt.getRounds(f.user.password), 12);
  assert.equal(await bcrypt.compare(body.newPassword, f.user.password), true);
  assert.equal(await bcrypt.compare("synthetic-old-password", f.user.password), false);
  assert.equal((await loginWith(f.user, body.newPassword)).code, 200);
  assert.equal((await loginWith(f.user, "synthetic-old-password")).code, 400);
  assert.equal(f.user.passwordReset, undefined);
  assert.equal((await f.invoke("reset", body)).code, 400);
});

test("wrong, expired, unknown and reused codes return safe errors; five failures lock the challenge", async () => {
  const f = fixture();
  await f.invoke("request");
  const otp = f.otp();
  const wrong = otp === "000000" ? "000001" : "000000";
  const errors = [];
  for (let i = 0; i < 5; i++) errors.push((await f.invoke("verify", { otp: wrong })).data.message);
  assert.equal((await f.invoke("verify", { otp })).code, 400);
  assert.equal(f.user.passwordReset.attempts, 5);
  f.user.passwordReset.attempts = 0;
  f.user.passwordReset.expiresAt = new Date(0);
  errors.push((await f.invoke("verify", { otp })).data.message);
  errors.push((await f.invoke("verify", { email: "unknown@example.test", otp })).data.message);
  assert.equal(new Set(errors).size, 1);
});

test("resend enforces durable cooldown, replaces old OTP/token and preserves password", async () => {
  const f = fixture();
  await f.invoke("request");
  const original = f.user.passwordReset.otpHash;
  await f.invoke("request");
  assert.equal(f.emails.length, 1);
  assert.equal(f.user.passwordReset.otpHash, original);
  const verified = await f.invoke("verify", { otp: f.otp() });
  f.user.passwordReset.sentAt = new Date(Date.now() - 61000);
  await f.invoke("request");
  assert.equal(f.emails.length, 2);
  assert.notEqual(f.user.passwordReset.otpHash, original);
  assert.equal(f.user.passwordReset.tokenHash, undefined);
  assert.equal((await f.invoke("reset", { resetToken: verified.data.resetToken, newPassword: "synthetic-new-password", confirmPassword: "synthetic-new-password" })).code, 400);
  assert.equal(f.user.password, "original");
});

test("reset rejects missing verification, expired tokens, mismatched/short/oversized passwords and injection-shaped inputs", async () => {
  const f = fixture();
  assert.equal((await f.invoke("request", { email: { $ne: null } })).code, 400);
  assert.equal((await f.invoke("verify", { otp: "12345" })).code, 400);
  const body = { resetToken: "a".repeat(64), newPassword: "synthetic-new-password", confirmPassword: "synthetic-new-password" };
  assert.equal((await f.invoke("reset", body)).code, 400);
  await f.invoke("request");
  body.resetToken = (await f.invoke("verify", { otp: f.otp() })).data.resetToken;
  for (const newPassword of ["short", "a".repeat(73), "\u00e9".repeat(37), "        "]) {
    assert.equal((await f.invoke("reset", { ...body, newPassword, confirmPassword: newPassword })).code, 400);
  }
  assert.equal((await f.invoke("reset", { ...body, confirmPassword: "different" })).code, 400);
  f.user.passwordReset.expiresAt = new Date(0);
  assert.equal((await f.invoke("reset", body)).code, 400);
  assert.equal(f.user.password, "original");
});

test("pending account deletion cannot request, verify or finish recovery", async () => {
  const f = fixture();
  await f.invoke("request");
  const otp = f.otp();
  f.user.accountDeletionPending = true;
  assert.equal((await f.invoke("verify", { otp })).code, 400);
  await f.invoke("request");
  assert.equal(f.emails.length, 1);
});

test("provider/database failures log only sanitized messages and do not change the password", async () => {
  const f = fixture();
  f.setFailEmail();
  assert.equal((await f.invoke("request")).code, 200);
  const other = fixture();
  await other.invoke("request");
  other.setFailUpdate();
  assert.equal((await other.invoke("verify", { otp: other.otp() })).code, 500);
  assert.equal(other.user.password, "original");
  assert.equal([...f.logs, ...other.logs].join(" ").includes("synthetic-sensitive"), false);
});

test("a failed final database write preserves the original password and verified reset session", async () => {
  const f = fixture();
  await f.invoke("request");
  const verified = await f.invoke("verify", { otp: f.otp() });
  const storedTokenHash = f.user.passwordReset.tokenHash;
  f.setFailUpdate();
  const result = await f.invoke("reset", { resetToken: verified.data.resetToken,
    newPassword: "synthetic-new-password", confirmPassword: "synthetic-new-password" });
  assert.equal(result.code, 500);
  assert.equal(f.user.password, "original");
  assert.equal(f.user.passwordReset.tokenHash, storedTokenHash);
  assert.equal(f.logs.join(" ").includes("synthetic-sensitive"), false);
});

test("concurrent verification and reset each have at most one successful consumer", async () => {
  const f = fixture();
  await f.invoke("request");
  const attempts = await Promise.all([f.invoke("verify", { otp: f.otp() }), f.invoke("verify", { otp: f.otp() })]);
  assert.equal(attempts.filter(item => item.code === 200).length, 1);
  const token = attempts.find(item => item.code === 200).data.resetToken;
  const body = { resetToken: token, newPassword: "synthetic-new-password", confirmPassword: "synthetic-new-password" };
  const resets = await Promise.all([f.invoke("reset", body), f.invoke("reset", body)]);
  assert.equal(resets.filter(item => item.code === 200).length, 1);
});

test("recovery endpoints rate-limit independently from signup/login and reject excess attempts with 429", () => {
  for (const [name, limit] of [["verifyPasswordReset", 5], ["resetPassword", 10], ["requestPasswordReset", 1]]) {
    const limits = createAuthRateLimiters();
    function invoke(which, email = "student@example.test") {
      const result = { code: 200, next: false, headers: {} };
      limits[which]({ ip: "192.0.2.1", body: { email } }, {
        setHeader(key, value) { result.headers[key] = value; }, status(code) { result.code = code; return this; }, json(body) { result.body = body; },
      }, () => { result.next = true; });
      return result;
    }
    for (let i = 0; i < limit; i++) assert.equal(invoke(name).next, true);
    const blocked = invoke(name);
    assert.equal(blocked.code, 429);
    assert.ok(Number(blocked.headers["Retry-After"]) > 0);
    assert.equal(blocked.body.message.includes("student"), false);
    assert.equal(invoke("signIn").next, true);
    assert.equal(invoke(name, "different@example.test").next, true);
  }
});

test("recovery secrets are excluded from default user queries", () => {
  const User = require("../models/Users");
  assert.equal(User.schema.path("passwordReset").options.select, false);
});
