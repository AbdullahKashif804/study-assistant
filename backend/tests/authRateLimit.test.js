const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const express = require("express");
const { createAuthRateLimiters } = require("../middleware/authRateLimit");

function request(limiter, { ip = "192.0.2.1", email = "student@example.test", req } = {}) {
  const result = { status: 200, headers: {}, next: 0 };
  const res = {
    setHeader(name, value) { result.headers[name] = value; },
    status(code) { result.status = code; return this; },
    json(body) { result.body = body; return this; },
  };
  limiter(req || { ip, body: { email } }, res, () => result.next++);
  return result;
}

test("normal requests on every protected endpoint reach the existing handler", () => {
  for (const name of ["signIn", "signUp", "verifyEmail", "resendVerification"]) {
    const result = request(createAuthRateLimiters()[name]);
    assert.equal(result.status, 200);
    assert.equal(result.next, 1);
  }
});

test("each endpoint enforces its per-IP cap even while email addresses vary", () => {
  for (const [name, max] of [["signIn", 20], ["signUp", 10], ["verifyEmail", 30], ["resendVerification", 10]]) {
    const limiter = createAuthRateLimiters()[name];
    for (let i = 0; i < max; i++) assert.equal(request(limiter, { email: `${i}@example.test` }).next, 1);
    const blocked = request(limiter, { email: "extra@example.test" });
    assert.equal(blocked.status, 429);
    assert.equal(blocked.next, 0);
    assert.ok(Number(blocked.headers["Retry-After"]) > 0);
    assert.equal(blocked.headers["Cache-Control"], "no-store");
  }
});

test("independent clients retain separate budgets", () => {
  const { signIn } = createAuthRateLimiters();
  for (let i = 0; i < 20; i++) request(signIn, { email: `${i}@example.test` });
  assert.equal(request(signIn).status, 429);
  assert.equal(request(signIn, { ip: "192.0.2.2", email: "other@example.test" }).next, 1);
});

test("normalized email budgets stop distributed login and OTP guessing", () => {
  for (const [name, max] of [["signIn", 10], ["verifyEmail", 5]]) {
    const limiter = createAuthRateLimiters()[name];
    for (let i = 0; i < max; i++) {
      assert.equal(request(limiter, { ip: `192.0.2.${i + 1}`, email: " Student@Example.Test " }).next, 1);
    }
    assert.equal(request(limiter, { ip: "198.51.100.1" }).status, 429);
  }
});

test("signup and resend share a sixty-second email cooldown and five-per-hour budget", () => {
  let time = 0;
  const limits = createAuthRateLimiters({ now: () => time });
  assert.equal(request(limits.signUp).next, 1);
  assert.equal(request(limits.resendVerification, { ip: "192.0.2.2" }).status, 429);
  time += 60000;
  assert.equal(request(limits.resendVerification).next, 1);
  time += 60000;
  assert.equal(request(limits.signUp).next, 1);
  time += 60000;
  assert.equal(request(limits.resendVerification).next, 1);
  time += 60000;
  assert.equal(request(limits.signUp).status, 429);
  time = 3600000;
  assert.equal(request(limits.signUp).next, 1);
});

test("expired login and verification windows permit normal requests again", () => {
  let time = 0;
  const limits = createAuthRateLimiters({ now: () => time });
  for (let i = 0; i < 10; i++) request(limits.signIn);
  for (let i = 0; i < 5; i++) request(limits.verifyEmail);
  assert.equal(request(limits.signIn).status, 429);
  assert.equal(request(limits.verifyEmail).status, 429);
  time = 15 * 60000;
  assert.equal(request(limits.signIn).next, 1);
  assert.equal(request(limits.verifyEmail).next, 1);
});

test("429 bodies reveal neither email identities nor account existence", () => {
  const responses = [];
  for (const email of ["existing@example.test", "unknown@example.test"]) {
    const { verifyEmail } = createAuthRateLimiters();
    for (let i = 0; i < 5; i++) request(verifyEmail, { email });
    responses.push(request(verifyEmail, { email }).body);
  }
  assert.deepEqual(responses[0], responses[1]);
  assert.deepEqual(responses[0], { success: false, message: "Too many authentication requests. Please try again later." });
});

test("invalid email types cannot bypass IP caps or crash the limiter", () => {
  const { signIn } = createAuthRateLimiters();
  for (let i = 0; i < 20; i++) assert.equal(request(signIn, { email: { $ne: null } }).next, 1);
  assert.equal(request(signIn, { email: null }).status, 429);
});

test("IPv4-mapped addresses share IPv4 budgets and IPv6 rotation is grouped by /56", () => {
  for (const [first, second] of [["192.0.2.1", "::ffff:192.0.2.1"], ["2001:db8:abcd:1200::1", "2001:0db8:abcd:12ff::99"]]) {
    const { signIn } = createAuthRateLimiters();
    for (let i = 0; i < 20; i++) request(signIn, { ip: first, email: `${i}@example.test` });
    assert.equal(request(signIn, { ip: second }).status, 429);
    assert.equal(request(signIn, { ip: "2001:db8:abcd:1300::1" }).next, 1);
  }
});

test("bounded storage fails closed and recovers after expired buckets are swept", () => {
  let time = 0;
  const { signIn } = createAuthRateLimiters({ now: () => time, maxEntries: 2 });
  assert.equal(request(signIn).next, 1);
  assert.equal(request(signIn, { ip: "192.0.2.2", email: "other@example.test" }).status, 429);
  time = 15 * 60000;
  assert.equal(request(signIn, { ip: "192.0.2.2", email: "other@example.test" }).next, 1);
});

test("Express ignores forwarded spoofing locally and trusts only the nearest Render hop", () => {
  for (const trust of [false, 1]) {
    const app = express();
    app.set("trust proxy", trust);
    const { signIn } = createAuthRateLimiters();
    function proxyRequest(spoofed) {
      const req = Object.create(app.request);
      req.app = app;
      req.socket = { remoteAddress: "10.0.0.1" };
      req.headers = { "x-forwarded-for": `${spoofed}, 192.0.2.10` };
      req.body = {};
      assert.equal(req.ip, trust ? "192.0.2.10" : "10.0.0.1");
      return req;
    }
    for (let i = 0; i < 20; i++) assert.equal(request(signIn, { req: proxyRequest(`198.51.100.${i + 1}`) }).next, 1);
    assert.equal(request(signIn, { req: proxyRequest("203.0.113.1") }).status, 429);
  }
});

test("public authentication and recovery routes are limited; protected routes keep their handlers", () => {
  const routes = [];
  const router = Object.fromEntries(["post", "get", "put", "delete"].map(method => [method, (...args) => routes.push({ method, args })]));
  const controller = new Proxy({}, { get: (_, name) => `controller:${name}` });
  const limits = { signIn: "signin-limit", signUp: "signup-limit", verifyEmail: "verify-limit", resendVerification: "resend-limit",
    requestPasswordReset: "reset-request-limit", verifyPasswordReset: "reset-verify-limit", resetPassword: "reset-limit" };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../routes/userRoute.js"), "utf8"), {
    module: { exports: {} },
    require(name) {
      if (name === "express") return { Router: () => router };
      if (name.includes("userController")) return controller;
      if (name.includes("passwordResetController")) return {
        validatePasswordReset: action => `reset-validate:${action}`,
        requestPasswordReset: "reset-request", verifyPasswordReset: "reset-verify", resetPassword: "reset",
      };
      if (name.includes("validateInput")) return { validateInput: name => `validate:${name}` };
      if (name.includes("authRateLimit")) return { createAuthRateLimiters: () => limits };
      if (name.includes("profileUploadMiddleware")) return "upload";
      if (name.includes("authMiddleware")) return "auth";
      throw new Error("Unexpected dependency");
    },
  });
  assert.deepEqual(routes.map(({ method, args }) => [method, ...args]), [
    ["post", "/forgot-password", "reset-request-limit", "reset-validate:request", "reset-request"],
    ["post", "/verify-reset-otp", "reset-verify-limit", "reset-validate:verify", "reset-verify"],
    ["post", "/reset-password", "reset-limit", "reset-validate:reset", "reset"],
    ["post", "/signup", "signup-limit", "validate:signup", "controller:SignUp"],
    ["post", "/verify-email", "verify-limit", "validate:verifyEmail", "controller:VerifyEmail"],
    ["post", "/resend-verification", "resend-limit", "validate:resendVerification", "controller:ResendVerificationCode"],
    ["post", "/signin", "signin-limit", "validate:signin", "controller:SignIn"],
    ["get", "/profile", "auth", "controller:getProfile"],
    ["put", "/profile/update", "auth", "upload", "validate:profile", "controller:updateProfile"],
    ["delete", "/profile/image", "auth", "controller:deleteProfileImage"],
    ["put", "/change-password", "auth", "validate:password", "controller:changePassword"],
    ["delete", "/delete-account", "auth", "controller:DeleteAccount"],
  ]);
});

test("existing signup, OTP resend/verification, expiry, and JWT login work with mocked services", async () => {
  const calls = { email: 0, users: [], deleted: 0, jwt: 0 };
  let pending;
  function Pending(data) { Object.assign(this, data); this._id = "pending-test"; }
  Pending.prototype.save = async function () { pending = this; };
  Pending.findOne = async () => pending;
  Pending.deleteOne = async () => { calls.deleted++; pending = undefined; };
  function User(data) { Object.assign(this, data); this._id = "user-test"; }
  User.prototype.save = async function () { calls.users.push(this); };
  User.findOne = async () => calls.users[0];
  const module = { exports: {} };
  const deps = {
    "../utils/saveWithFileReplacement": { saveWithFileReplacement: ({ document }) => document.save() },
    "../config/password": require("../config/password"),
    bcrypt: { hash: async () => "mock-hash", compare: async () => true },
    "../models/Users.js": User,
    "../models/PendingSignup": Pending,
    jsonwebtoken: { sign(payload, secret, options) { calls.jwt++; assert.equal(payload.id, "user-test"); assert.equal(options.expiresIn, "7d"); return "mock-jwt"; } },
    crypto: { randomInt: () => 123456 },
    path: {},
    "../utils/sendEmail": async () => { calls.email++; },
    "../services/accountDeletionService": {},
    "../utils/cloudinaryUpload": {},
    "../utils/cloudinaryDelete": {},
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../controllers/userController.js"), "utf8"), {
    module, process: { env: {} }, console: { error() {} },
    require(name) { assert.ok(name in deps); return deps[name]; },
  });
  const controller = module.exports;
  const limits = createAuthRateLimiters();
  async function invoke(name, body) {
    const response = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(data) { this.data = data; return this; } };
    await controller[name]({ body }, response);
    return response;
  }
  assert.equal(request(limits.signUp).next, 1);
  assert.equal((await invoke("SignUp", { first_name: "Test", last_name: "Student", email: "student@example.test", password: "mock-password", currentSemester: 3, agreedToTerms: true })).statusCode, 201);
  assert.equal(pending.currentSemester, 3);
  assert.equal(pending.verificationCode, "123456");
  assert.ok(pending.verificationCodeExpiresAt > new Date());
  // A distinct fixture email budget isolates resend controller behavior from cooldown tests above.
  assert.equal(request(limits.resendVerification, { email: "resend@example.test" }).next, 1);
  assert.equal((await invoke("ResendVerificationCode", { email: "student@example.test" })).statusCode, 200);
  assert.equal(calls.email, 2);
  const body = { email: "student@example.test", verificationCode: "123456" };
  assert.equal((await invoke("VerifyEmail", { ...body, verificationCode: "000000" })).statusCode, 400);
  pending.verificationCodeExpiresAt = new Date(0);
  assert.equal((await invoke("VerifyEmail", body)).statusCode, 400);
  pending.verificationCodeExpiresAt = new Date(Date.now() + 600000);
  assert.equal(request(limits.verifyEmail).next, 1);
  assert.equal((await invoke("VerifyEmail", body)).statusCode, 201);
  assert.equal(calls.users[0].currentSemester, 3);
  assert.equal(calls.deleted, 1);
  assert.equal(request(limits.signIn).next, 1);
  const login = await invoke("SignIn", { email: "student@example.test", password: "mock-password" });
  assert.equal(login.statusCode, 200);
  assert.equal(login.data.token, "mock-jwt");
  assert.equal(calls.jwt, 1);
});
