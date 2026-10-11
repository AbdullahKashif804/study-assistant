const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { EventEmitter } = require("node:events");
const limits = require("../config/aiLimits");
const safety = require("../utils/aiSafety");

function load(file, dependencies = {}, globals = {}, transform = source => source) {
  const module = { exports: {} };
  vm.runInNewContext(transform(fs.readFileSync(path.join(__dirname, "..", file), "utf8")), {
    module, __dirname: path.join(__dirname, "../services"), Buffer, URL, AbortController,
    setTimeout, clearTimeout, setImmediate, console: { error() {} }, process: { env: { GROQ_API_KEY: "synthetic-test-value" } },
    require(name) {
      if (name in dependencies) return dependencies[name];
      if (name === "./attachmentDelivery") return { attachmentURL: attachment => attachment.url };
      if (name === "../config/aiLimits") return limits;
      if (name === "../utils/aiSafety") return safety;
      throw new Error(`Unexpected dependency ${name}`);
    }, ...globals,
  });
  return module.exports;
}

test("bounded external transport handles successful JSON without a network request", async () => {
  const helper = load("utils/aiSafety.js", {}, { fetch: async () => new Response('{"ok":true}') });
  const result = await helper.fetchLimited("https://mock.test", {}, { timeoutMs: 50, maxBytes: 100, json: true });
  assert.equal(result.ok, true);
});

test("external timeout covers connection and response-body stalls and aborts the request", async () => {
  for (const bodyStall of [false, true]) {
    let aborted = false;
    const helper = load("utils/aiSafety.js", {}, { fetch: (_, { signal }) => {
      const pending = () => new Promise((resolve, reject) => signal.addEventListener("abort", () => { aborted = true; reject(new Error("Synthetic private provider details")); }, { once: true }));
      return bodyStall ? { ok: true, headers: new Headers(), body: { getReader: () => ({ read: pending, releaseLock() {} }) } } : pending();
    } });
    await assert.rejects(helper.fetchLimited("https://mock.test", {}, { timeoutMs: 5, maxBytes: 100 }), error => error.statusCode === 504 && !error.message.includes("private"));
    assert.equal(aborted, true);
  }
});

test("declared and streamed oversized downloads reject with 413; provider errors are sanitized", async () => {
  for (const response of [new Response("small", { headers: { "content-length": "1000" } }), new Response("x".repeat(1000))]) {
    const helper = load("utils/aiSafety.js", {}, { fetch: async () => response });
    await assert.rejects(helper.fetchLimited("https://mock.test", {}, { timeoutMs: 50, maxBytes: 100 }), error => error.statusCode === 413);
  }
  const helper = load("utils/aiSafety.js", {}, { fetch: async () => new Response("Sensitive provider payload", { status: 500 }) });
  await assert.rejects(helper.fetchLimited("https://mock.test", {}, { timeoutMs: 50, maxBytes: 100 }), error => error.statusCode === 502 && !error.message.includes("Sensitive"));
});

test("summary, quiz, and grounded answers preserve the model and enforce completion budgets", async () => {
  const calls = [];
  const service = load("services/aiService.js", { "../utils/aiSafety": { ...safety, async requestAI(url, options) {
    const body = JSON.parse(options.body); calls.push(body);
    const value = body.response_format.json_schema.name === "note_summary" ? { summary: "Summary", keyPoints: [], quickRevision: [] }
      : body.response_format.json_schema.name === "note_quiz" ? { title: "Quiz", questions: Array.from({ length: 5 }, () => ({ question: "Question", options: ["A", "B", "C", "D"], correctOption: 0, explanation: "Explanation" })) } : { answer: "Answer", grounded: true };
    return { choices: [{ message: { content: JSON.stringify(value) } }] };
  } } });
  assert.equal((await service.generateNoteSummary({ title: "Note", content: "Material" })).summary, "Summary");
  assert.equal((await service.generateNoteQuiz({ title: "Note", content: "Material" })).title, "Quiz");
  assert.equal((await service.answerFromNotes({ question: "Question", retrievedChunks: [] })).grounded, true);
  assert.ok(calls.every(call => call.model === "openai/gpt-oss-20b" && call.max_completion_tokens === 2048));
  await assert.rejects(service.generateNoteSummary({ title: "Note", content: "x".repeat(12001) }), error => error.statusCode === 413);
});

test("AI controller rejects oversized or non-text questions and hides unknown internal errors", async () => {
  const controller = load("controllers/aiController.js", {
    "../models/Notes": { findOne: async () => { throw new Error("Synthetic private database detail"); } },
    "../services/aiService": {}, "../services/ragService": {}, "../services/studyAgentService": {},
  });
  const response = () => ({ code: 200, status(code) { this.code = code; return this; }, json(data) { this.data = data; } });
  for (const [handler, question, status] of [["askNotes", "x".repeat(1001), 413], ["askStudyAgent", "x".repeat(1501), 413], ["askNotes", {}, 400]]) {
    const res = response(); await controller[handler]({ body: { question }, user: { _id: "owner" } }, res); assert.equal(res.code, status);
  }
  const res = response(); await controller.generateFromNote({ body: { action: "summary" }, params: { id: "note" }, user: { _id: "owner" } }, res);
  assert.equal(res.code, 500); assert.ok(!res.data.message.includes("private"));
});

test("document parser workers enforce time/memory/text limits and retain supported formats", async () => {
  for (const scenario of ["success", "oversized", "timeout"]) {
    let terminated = 0;
    class Worker extends EventEmitter {
      constructor(file, options) {
        super(); assert.equal(options.resourceLimits.maxOldGenerationSizeMb, 128);
        if (scenario !== "timeout") setImmediate(() => this.emit("message", scenario === "success" ? { text: "Study content" } : { oversized: true }));
      }
      async terminate() { terminated++; }
    }
    const service = load("services/documentTextService.js", {
      "node:worker_threads": { Worker }, "node:path": path,
      "../config/aiLimits": { ...limits, PARSE_TIMEOUT_MS: 5 },
      "../utils/aiSafety": { ...safety, fetchLimited: async () => Buffer.from("mock-document") },
    });
    if (scenario === "success") assert.equal((await service.extractDocumentText({ url: "https://mock.test", format: "pdf" })).text, "Study content");
    else await assert.rejects(service.extractDocumentText({ url: "https://mock.test", format: "pdf" }), error => error.statusCode === (scenario === "oversized" ? 413 : 504));
    assert.equal(terminated, 1);
    assert.equal((await service.extractDocumentText({ format: "png" })).supported, false);
  }
});

test("embedding work is rejected before model loading when excessive, and valid batches stay small", async () => {
  const sizes = [];
  const service = load("services/embeddingService.js", {}, {
    embeddingModule: { async pipeline() { return async texts => { sizes.push(texts.length); return { tolist: () => texts.map(() => [1, 0]) }; }; } },
  }, source => source.replace('import("@huggingface/transformers")', "Promise.resolve(embeddingModule)"));
  await assert.rejects(service.createEmbeddings(Array(101).fill("text")), error => error.statusCode === 413);
  await assert.rejects(service.createEmbedding("x".repeat(50001)), error => error.statusCode === 413);
  assert.equal(sizes.length, 0);
  assert.equal((await service.createEmbeddings(Array(19).fill("text"))).length, 19);
  assert.deepEqual(sizes, [8, 8, 3]);
});

function ragFixture(notes, oversized = false) {
  const queries = []; let batches = 0;
  const model = {
    findOne(filter) { queries.push(filter); return { select() { return this; }, maxTimeMS() { return this; }, lean: async () => oversized ? { _id: "large" } : null }; },
    find(filter) {
      queries.push(filter);
      return { select() { return this; }, slice() { return this; }, limit(value) { assert.equal(value, 51); return this; }, maxTimeMS() { return this; }, then(resolve) { return Promise.resolve(notes).then(resolve); } };
    },
  };
  const service = load("services/ragService.js", {
    "../models/Notes": model,
    "./embeddingService": { createEmbedding: async () => [1, 0], createEmbeddings: async chunks => { batches++; return chunks.map(() => [1, 0]); } },
    "./documentTextService": { extractDocumentText: async () => ({ supported: true, text: "Material" }) },
  });
  return { service, queries, batches: () => batches };
}
const note = (content = "Material") => ({ _id: "note", user: "owner", title: "Title", content, ragChunks: [], attachmentRagChunks: [], async save() {} });

test("RAG preserves owner scope and ranked sources for normal requests", async () => {
  const f = ragFixture([note()]);
  const chunks = await f.service.retrieveRelevantNoteChunks({ userId: "owner", question: "Question" });
  assert.equal(chunks.length, 1); assert.equal(chunks[0].sourceType, "note");
  assert.ok(f.queries.every(query => query.user === "owner"));
});

test("RAG rejects excessive libraries, legacy indexes, oversized notes, and new indexing work", async () => {
  const cached = note(); cached.ragChunks = Array(51).fill({ text: "text", embedding: [1, 0] });
  for (const [notes, oversized] of [[Array.from({ length: 51 }, () => note()), false], [[cached], false], [[note()], true], [Array.from({ length: 3 }, () => note("x".repeat(48000))), false]]) {
    const f = ragFixture(notes, oversized);
    await assert.rejects(f.service.retrieveRelevantNoteChunks({ userId: "owner", question: "Question" }), error => error.statusCode === 413);
    assert.ok(f.batches() <= 2);
  }
});

test("planner succeeds normally and rejects excessive tool calls without executing them", async () => {
  for (const excessive of [false, true]) {
    let tools = 0;
    const service = load("services/studyAgentService", {
      "./studyAgentTools": { executeStudyAgentTool: async () => { tools++; return []; } },
      "../utils/aiSafety": { ...safety, requestAI: async () => ({ choices: [{ message: excessive ? { tool_calls: Array(9).fill({ function: { name: "get_assignments", arguments: "{}" } }) } : { content: "Study plan" } }] }) },
    });
    if (excessive) await assert.rejects(service.runStudyAgent({ userId: "owner", question: "Plan" }), error => error.statusCode === 413);
    else assert.equal((await service.runStudyAgent({ userId: "owner", question: "Plan" })).answer, "Study plan");
    assert.equal(tools, 0);
  }
});

test("AI concurrency limits are held until actual completion and released after failure", async () => {
  const { limitAI } = require("../middleware/aiWorkload");
  let finish;
  const handler = limitAI(() => new Promise(resolve => { finish = resolve; }));
  const pending = handler({ user: { _id: "owner" } }, {});
  const res = { status(code) { this.code = code; return this; }, json() {}, setHeader() {} };
  await handler({ user: { _id: "owner" } }, res); assert.equal(res.code, 429);
  finish(); await pending;
  await assert.rejects(limitAI(async () => { throw new Error("Synthetic failure"); })({ user: { _id: "owner" } }, {}));
  assert.equal(await limitAI(async () => "available")({ user: { _id: "owner" } }, {}), "available");
});

test("controller forwards safe timeout status and keeps AI authentication ahead of workload gates", async () => {
  const controller = load("controllers/aiController.js", {
    "../models/Notes": {}, "../services/aiService": {}, "../services/ragService": {},
    "../services/studyAgentService": { runStudyAgent: async () => { throw new safety.AIError(504, "AI processing timed out. Please try again."); } },
  });
  const res = { status(code) { this.code = code; return this; }, json(data) { this.data = data; } };
  await controller.askStudyAgent({ body: { question: "Plan" }, user: { _id: "owner" } }, res);
  assert.equal(res.code, 504); assert.match(res.data.message, /timed out/);
  const routes = [];
  load("routes/aiRoute.js", {
    express: { Router: () => ({ post(...args) { routes.push(args); } }) },
    "../controllers/aiController": { generateFromNote: "generate", askNotes: "ask", askStudyAgent: "planner" },
    "../middleware/authMiddleware": "auth",
    "../middleware/aiWorkload": { limitAI: handler => `limited:${handler}` },
  });
  assert.deepEqual(routes.map(args => [...args]), [
    ["/note/:id/generate", "auth", "limited:generate"],
    ["/notes/ask", "auth", "limited:ask"],
    ["/study-agent", "auth", "limited:planner"],
  ]);
});
