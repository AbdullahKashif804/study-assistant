const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const read = file => fs.readFileSync(path.join(__dirname, "..", file), "utf8");

// Execute the real startup modules with isolated process, Express, and MongoDB mocks.
// dotenv is stubbed: these tests never read credentials or open network connections.
function fixture(env = {}) {
  let resolveConnection, rejectConnection;
  const connection = new Promise((resolve, reject) => {
    resolveConnection = resolve;
    rejectConnection = reject;
  });
  const calls = { connections: [], listeners: [], exits: [], logs: [], middleware: [], routes: [], settings: [] };
  const processMock = { env: { MONGODB_URL: "mock-database-uri", PORT: "5099", ...env }, exit: code => calls.exits.push(code) };
  const consoleMock = {
    log: (...args) => calls.logs.push(args.join(" ")),
    error: (...args) => calls.logs.push(args.join(" ")),
  };
  const dbModule = { exports: {} };
  vm.runInNewContext(read("config/db.js"), {
    module: dbModule, process: processMock, console: consoleMock,
    require(name) {
      assert.equal(name, "mongoose");
      return { connect(uri, options) { calls.connections.push({ uri, options }); return connection; } };
    },
  });
  const corsMiddleware = {};
  const jsonMiddleware = {};
  const app = {
    set(...args) { calls.settings.push(args); },
    use(...args) { calls.middleware.push(args); },
    get(...args) { calls.routes.push(args); },
    listen(port, callback) { calls.listeners.push(port); callback(); },
  };
  const express = () => app;
  express.json = () => jsonMiddleware;
  vm.runInNewContext(read("server.js"), {
    process: processMock, console: consoleMock,
    require(name) {
      if (name === "dotenv") return { config() {} };
      if (name === "express") return express;
      if (name === "cors") return () => corsMiddleware;
      if (name === "./config/db") return dbModule.exports;
      if (name.startsWith("./routes/")) return name;
      throw new Error("Unexpected dependency in startup test");
    },
  });
  return { calls, resolveConnection, rejectConnection, connectDB: dbModule.exports, corsMiddleware, jsonMiddleware };
}

const settle = () => new Promise(resolve => setImmediate(resolve));

test("proxy trust is disabled locally and limited to one hop on Render", () => {
  assert.deepEqual(fixture().calls.settings.map(args => [...args]), [["trust proxy", false]]);
  assert.deepEqual(fixture({ RENDER: "true" }).calls.settings.map(args => [...args]), [["trust proxy", 1]]);
});

test("pending MongoDB connection keeps HTTP closed and sets a ten-second selection timeout", async () => {
  const { calls } = fixture();
  await settle();
  assert.equal(calls.connections.length, 1);
  assert.equal(calls.connections[0].options.serverSelectionTimeoutMS, 10000);
  assert.deepEqual(calls.listeners, []);
  assert.deepEqual(calls.exits, []);
});

test("successful MongoDB connection starts HTTP exactly once", async () => {
  const { calls, resolveConnection } = fixture();
  resolveConnection();
  await settle();
  await settle();
  assert.deepEqual(calls.listeners, ["5099"]);
  assert.deepEqual(calls.exits, []);
  assert.equal(calls.connections.length, 1);
});

test("connection failures propagate, never listen, exit nonzero, and log no sensitive details", async () => {
  for (const reason of ["invalid credentials", "network unavailable", "server selection timed out"]) {
    const { calls, rejectConnection, connectDB } = fixture();
    const failure = new Error(`${reason}: mongodb://mock-user:mock-password@private-host/test`);
    failure.reason = { servers: new Map([["private-host", { error: failure }]]) };
    rejectConnection(failure);
    await settle();
    assert.deepEqual(calls.listeners, []);
    assert.deepEqual(calls.exits, [1]);
    assert.deepEqual(calls.logs, ["Startup failed: unable to initialize the backend. Check MongoDB configuration and connectivity. HTTP server was not started."]);
    await assert.rejects(connectDB(), error => error === failure);
  }
});

test("middleware, root response, and API route registration order are preserved before listening", () => {
  const { calls, corsMiddleware, jsonMiddleware } = fixture();
  assert.equal(calls.middleware[0][0], corsMiddleware);
  assert.equal(calls.middleware[1][0], jsonMiddleware);
  assert.deepEqual(calls.middleware.slice(2).map(args => [args[0], args[1]]), [
    ["/api/user", "./routes/userRoute"],
    ["/api/note", "./routes/noteRoute"],
    ["/api/assignment", "./routes/assignmentRoute"],
    ["/api/project", "./routes/projectRoute"],
    ["/api/quiz", "./routes/quizRoute"],
    ["/api/course", "./routes/courseRoute"],
    ["/api/dailyTask", "./routes/dailyTaskRoute"],
    ["/api/todoTask", "./routes/todoTaskRoute"],
    ["/api/dashboard", "./routes/dashboardRoute"],
    ["/api/admin", "./routes/adminRoutes"],
    ["/api/search", "./routes/globalSearchRoutes"],
    ["/api/ai", "./routes/aiRoute"],
  ]);
  assert.equal(calls.routes[0][0], "/");
  let response;
  calls.routes[0][1]({}, { send(value) { response = value; } });
  assert.equal(response, "Running");
  assert.deepEqual(calls.listeners, []);
});
