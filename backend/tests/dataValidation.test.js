const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { validateInput, validateRecordId } = require("../middleware/validateInput");

const owner = "000000000000000000000001";
const course = "000000000000000000000002";
const record = "000000000000000000000003";
const bodies = {
  assignment: { title: "Assignment", description: "Details", course, dueDate: "2026-11-01", totalMark: "100", obtainedMark: "9" },
  project: { title: "Project", description: "Details", course, dueDate: "2026-11-01", totalMark: "100", obtainedMark: "9", technologies: '["React"]' },
  quiz: { title: "Quiz", course, dueDate: "2026-11-01", totalMark: "100", obtainedMark: "9" },
  course: { title: "Course", courseCode: "CS101", semester: "3", instructor: "Teacher", description: "Details" },
  note: { title: "Note", content: "Study material", course },
  dailyTask: { title: "Daily task", taskDate: "2026-11-01", priority: "High", status: "Pending" },
  todoTask: { title: "To-do", dueDate: "2026-11-01", priority: "Medium", status: "Pending" },
  signup: { first_name: "Test", last_name: "Student", email: "student@example.test", password: "synthetic-input", currentSemester: "3", agreedToTerms: true },
};

function response() {
  return { code: 200, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; } };
}
function validate(name, body) {
  const req = { body: { ...body } };
  const res = response();
  let passed = false;
  validateInput(name)(req, res, () => { passed = true; });
  return { req, res, passed };
}

test("marks accept numbers and decimal strings, including zero obtained marks", () => {
  for (const module of ["assignment", "project", "quiz"]) {
    for (const [totalMark, obtainedMark] of [["100", "9"], [100, 0], ["20.5", "20.5"], ["1e2", " 9 "]]) {
      const result = validate(module, { ...bodies[module], totalMark, obtainedMark });
      assert.equal(result.passed, true);
      assert.equal(result.req.body.totalMark, Number(totalMark));
      assert.equal(result.req.body.obtainedMark, Number(obtainedMark));
    }
  }
});

test("marks reject invalid types, non-finite/unsafe numbers, negatives, and scores over totals", () => {
  for (const module of ["assignment", "project", "quiz"]) {
    for (const value of ["NaN", "Infinity", "1e309", "12abc", "0x10", " ", true, [], {}, Infinity, NaN, Number.MAX_SAFE_INTEGER + 1]) {
      for (const field of ["totalMark", "obtainedMark"]) assert.equal(validate(module, { ...bodies[module], [field]: value }).res.code, 400);
    }
    for (const [totalMark, obtainedMark] of [["20", "100"], ["100", "-1"], ["-10", "0"], [0, 0]]) {
      assert.equal(validate(module, { ...bodies[module], totalMark, obtainedMark }).res.code, 400);
    }
  }
});

test("blank/null obtained marks remain optional and an omitted score stays omitted", () => {
  for (const module of ["assignment", "project", "quiz"]) {
    for (const obtainedMark of ["", null]) {
      const result = validate(module, { ...bodies[module], obtainedMark });
      assert.equal(result.passed, true);
      assert.equal(result.req.body.obtainedMark, null);
    }
    const body = { ...bodies[module] }; delete body.obtainedMark;
    assert.equal(Object.hasOwn(validate(module, body).req.body, "obtainedMark"), false);
  }
});

test("signup, profile, and course semesters consistently enforce integers 1 through 8", () => {
  for (const [module, field, base] of [["signup", "currentSemester", bodies.signup], ["profile", "currentSemester", {}], ["course", "semester", bodies.course]]) {
    for (const value of [1, "3", 8]) {
      const result = validate(module, { ...base, [field]: value });
      assert.equal(result.passed, true);
      assert.equal(result.req.body[field], Number(value));
    }
    for (const value of [0, -1, 9, 2.5, "3abc", "", null, false, true, [3], {}, Infinity]) {
      assert.equal(validate(module, { ...base, [field]: value }).res.code, 400);
    }
  }
  assert.equal(validate("profile", { bio: "Partial profile update" }).passed, true);
});

test("all modules reject object-valued text and invalid dates before reaching persistence", () => {
  for (const module of Object.keys(bodies)) {
    const field = module === "signup" ? "first_name" : "title";
    assert.equal(validate(module, { ...bodies[module], [field]: { $ne: null } }).res.code, 400);
    assert.equal(validate(module, { ...bodies[module], [field]: " " }).res.code, 400);
  }
  for (const module of ["assignment", "project", "quiz", "dailyTask", "todoTask"]) {
    const field = module === "dailyTask" ? "taskDate" : "dueDate";
    for (const value of ["bad-date", "2026-02-30", 123, {}]) assert.equal(validate(module, { ...bodies[module], [field]: value }).res.code, 400);
  }
  assert.equal(validate("profile", { dateOfBirth: "" }).req.body.dateOfBirth, null);
});

test("technology arrays, enums, OTP text, terms, and auth scalar inputs are checked", () => {
  for (const value of ['"React"', '{}', '[]', '[3]', '[""]']) assert.equal(validate("project", { ...bodies.project, technologies: value }).res.code, 400);
  assert.equal(validate("project", { ...bodies.project, technologies: ["React"] }).passed, true);
  assert.equal(validate("dailyTask", { ...bodies.dailyTask, priority: "Urgent" }).res.code, 400);
  assert.equal(validate("course", { ...bodies.course, status: "Unknown" }).res.code, 400);
  assert.equal(validate("course", { ...bodies.course, status: "" }).res.code, 400);
  assert.equal(validate("profile", { first_name: " " }).res.code, 400);
  assert.equal(validate("signup", { ...bodies.signup, agreedToTerms: "false" }).res.code, 400);
  for (const name of ["signin", "verifyEmail", "resendVerification"]) assert.equal(validate(name, { email: { $ne: null }, password: "test", verificationCode: "123456" }).res.code, 400);
  assert.equal(validate("verifyEmail", { email: "student@example.test", verificationCode: "123456" }).passed, true);
  assert.equal(validate("verifyEmail", { email: "student@example.test", verificationCode: 123456 }).res.code, 400);
});

function controllerFixture(module, { courseAvailable = true } = {}) {
  const calls = { saves: 0, updates: [], queries: [], uploads: 0 };
  const existing = { _id: record, user: owner, obtainedMark: 9, async save() { calls.saves++; return this; }, async populate() {} };
  function Model(data) { Object.assign(this, data); this.save = async () => { calls.saves++; return this; }; }
  Model.findOne = query => { calls.queries.push(query); return { select() { return this; }, then(resolve) { return Promise.resolve(existing).then(resolve); } }; };
  Model.findOneAndUpdate = async (query, data, options) => { calls.queries.push(query); calls.updates.push({ data, options }); return { ...existing, ...data }; };
  const exported = { exports: {} };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, `../controllers/${module}Controller.js`), "utf8"), {
    module: exported,
    require(name) {
      if (name.includes("saveWithFileReplacement")) return { saveWithFileReplacement: ({ document }) => document.save() };
      if (name.includes("cloudinaryUpload")) return { uploadToCloudinary: async () => { calls.uploads++; } };
      if (name.includes("cloudinaryDelete")) return { deleteFromCloudinary: async () => {} };
      if (name.includes("Courses") && module !== "course") return { findOne: async query => { calls.queries.push(query); return courseAvailable && query.user === owner ? { _id: course } : null; } };
      return Model;
    },
  });
  async function invoke(action, body) {
    const req = { body: { ...body }, user: { _id: owner }, params: { id: record } };
    const res = response();
    let passed = false;
    validateInput(module)(req, res, () => { passed = true; });
    if (passed) await exported.exports[action](req, res);
    return res;
  }
  return { calls, invoke, existing };
}

test("all seven CRUD controllers preserve successful create/update and owner-scoped persistence", async () => {
  for (const module of ["assignment", "project", "quiz", "course", "note", "dailyTask", "todoTask"]) {
    const f = controllerFixture(module);
    const suffix = module[0].toUpperCase() + module.slice(1);
    const created = await f.invoke(`add${suffix}`, bodies[module]);
    assert.equal(created.code, 201, module);
    assert.equal(created.data.data.user, owner);
    const updated = await f.invoke(`update${suffix}`, bodies[module]);
    assert.equal(updated.code, 200, module);
    assert.ok(f.calls.queries.every(query => query.user === owner));
    if (["quiz", "dailyTask", "todoTask"].includes(module)) assert.equal(f.calls.updates[0].options.runValidators, true);
    if (["assignment", "project", "quiz"].includes(module)) assert.equal(created.data.data.totalMark, 100);
  }
});

test("invalid marks are rejected identically on create/update, before queries, saves, or uploads", async () => {
  for (const module of ["assignment", "project", "quiz"]) {
    const f = controllerFixture(module);
    const suffix = module[0].toUpperCase() + module.slice(1);
    for (const action of [`add${suffix}`, `update${suffix}`]) assert.equal((await f.invoke(action, { ...bodies[module], totalMark: "20", obtainedMark: "100" })).code, 400);
    assert.equal(f.calls.queries.length, 0);
    assert.equal(f.calls.saves, 0);
    assert.equal(f.calls.uploads, 0);
  }
});

test("unavailable or foreign course relationships retain existing 404 behavior without writes", async () => {
  for (const module of ["assignment", "project", "quiz", "note"]) {
    const f = controllerFixture(module, { courseAvailable: false });
    const suffix = module[0].toUpperCase() + module.slice(1);
    for (const action of [`add${suffix}`, `update${suffix}`]) assert.equal((await f.invoke(action, bodies[module])).code, 404);
    assert.equal(f.calls.saves, 0);
    assert.equal(f.calls.updates.length, 0);
    assert.ok(f.calls.queries.every(query => query.user === owner));
  }
});

test("quiz updates retain omitted obtained marks but reject totals below that retained score", async () => {
  const f = controllerFixture("quiz");
  const body = { ...bodies.quiz }; delete body.obtainedMark;
  assert.equal((await f.invoke("updateQuiz", body)).code, 200);
  assert.equal((await f.invoke("updateQuiz", { ...body, totalMark: 5 })).code, 400);
  assert.equal(f.calls.updates.length, 1);
});

test("record ID middleware allows ObjectId strings and rejects malformed identifiers", () => {
  for (const value of [record, "bad-id"]) {
    const res = response(); let next = 0;
    validateRecordId({ params: { id: value } }, res, () => next++);
    assert.equal(res.code, value === record ? 200 : 400);
    assert.equal(next, value === record ? 1 : 0);
  }
});

test("actual CRUD routes apply the same validation on create/update after authentication and multipart parsing", () => {
  for (const module of ["assignment", "project", "quiz", "course", "note", "dailyTask", "todoTask"]) {
    const routes = [];
    const router = Object.fromEntries(["post", "get", "put", "delete"].map(method => [method, (...args) => routes.push({ method, args })]));
    vm.runInNewContext(fs.readFileSync(path.join(__dirname, `../routes/${module}Route.js`), "utf8"), {
      module: { exports: {} }, require(name) {
        if (name === "express") return { Router: () => router };
        if (name.includes("validateInput")) return { validateInput: value => `validate:${value}`, validateRecordId: "validate-id" };
        if (name.includes("authMiddleware")) return "auth";
        if (name.includes("uploadMiddleware")) return "upload";
        return new Proxy({}, { get: (_, key) => `controller:${key}` });
      },
    });
    for (const { method, args } of routes) {
      assert.equal(args[1], "auth");
      if (args[0].includes(":id")) assert.equal(args[2], "validate-id");
      if (["post", "put"].includes(method)) {
        assert.equal(args.at(-2), `validate:${module}`);
        if (["assignment", "project", "course", "note"].includes(module)) assert.equal(args.at(-3), "upload");
      }
    }
  }
});
