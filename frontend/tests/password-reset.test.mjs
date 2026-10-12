import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

// Exercise page handlers and React state with mocked hooks/Fetch, not a browser DOM.
function fixture() {
  const slots = [], requests = [];
  let cursor = 0, responder = async () => ({ ok: true, status: 200, json: async () => ({ message: "Generic response", resetToken: "synthetic-memory-token" }) });
  const context = vm.createContext({
    API_BASE_URL: "https://backend.test", TextEncoder, TypeError,
    useNavigate: () => () => {}, useEffect() {},
    useRef(initial) { const index = cursor++; return slots[index] ||= { current: initial }; },
    useState(initial) {
      const index = cursor++;
      if (!(index in slots)) slots[index] = initial;
      return [slots[index], value => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
    },
    fetch: async (url, options) => { requests.push({ url, body: JSON.parse(options.body) }); return responder(); },
  });
  const source = readFileSync(new URL("../src/pages/Auth/ForgotPassword.jsx", import.meta.url), "utf8")
    .replace(/^import[^\n]*\n/gm, "").replace("export default function", "function");
  vm.runInContext(source.slice(0, source.indexOf("  const titles")) +
    "return { submit, step, email, otp, resetToken, newPassword, confirmPassword, cooldown, loading, message, error, setEmail, setOtp, setNewPassword, setConfirmPassword, setCooldown }; }", context);
  return { requests, render() { cursor = 0; return context.ForgotPassword(); }, respond(fn) { responder = fn; } };
}

test("recovery page uses shared Fetch endpoints and keeps reset credentials in memory until reset succeeds", async () => {
  const f = fixture();
  f.render().setEmail("student@example.test");
  await f.render().submit("request");
  assert.equal(f.render().step, "otp");
  assert.equal(f.render().cooldown, 60);
  f.render().setOtp("123456");
  await f.render().submit("verify");
  assert.equal(f.render().step, "password");
  f.render().setNewPassword("synthetic-new-password");
  f.render().setConfirmPassword("synthetic-new-password");
  await f.render().submit("reset");
  assert.equal(f.render().step, "done");
  assert.equal(f.render().resetToken, "");
  assert.equal(f.render().newPassword, "");
  assert.deepEqual(f.requests.map(item => item.url), [
    "https://backend.test/api/user/forgot-password", "https://backend.test/api/user/verify-reset-otp", "https://backend.test/api/user/reset-password",
  ]);
  assert.equal(f.requests[2].body.resetToken, "synthetic-memory-token");
});

test("request loading lock prevents duplicate submissions and cooldown prevents immediate resends", async () => {
  const f = fixture();
  let finish;
  f.respond(() => new Promise(resolve => { finish = resolve; }));
  f.render().setEmail("student@example.test");
  const pending = f.render().submit("request");
  assert.equal(f.render().loading, true);
  await f.render().submit("request");
  assert.equal(f.requests.length, 1);
  finish({ ok: true, status: 200, json: async () => ({ message: "Generic response" }) });
  await pending;
  await f.render().submit("request");
  assert.equal(f.requests.length, 1);
  assert.equal(f.render().loading, false);
});

test("client validates OTP/passwords and preserves entered values after a server error", async () => {
  const f = fixture();
  f.render().setEmail("student@example.test");
  f.render().setOtp("bad");
  await f.render().submit("verify");
  assert.equal(f.requests.length, 0);
  f.render().setNewPassword("short");
  f.render().setConfirmPassword("short");
  await f.render().submit("reset");
  assert.equal(f.requests.length, 0);
  f.render().setNewPassword("synthetic-new-password");
  f.render().setConfirmPassword("different-password");
  await f.render().submit("reset");
  assert.equal(f.requests.length, 0);
  f.render().setConfirmPassword("synthetic-new-password");
  f.respond(async () => ({ ok: false, status: 400, json: async () => ({ message: "Reset session expired" }) }));
  await f.render().submit("reset");
  assert.equal(f.render().error, "Reset session expired");
  assert.equal(f.render().newPassword, "synthetic-new-password");
});

test("429 request responses apply Retry-After cooldown without advancing the recovery step", async () => {
  const f = fixture();
  f.render().setEmail("student@example.test");
  f.respond(async () => ({ ok: false, status: 429, headers: { get: () => "120" }, json: async () => ({ message: "Try again later" }) }));
  await f.render().submit("request");
  assert.equal(f.render().step, "email");
  assert.equal(f.render().cooldown, 120);
  assert.equal(f.render().error, "Try again later");
});
