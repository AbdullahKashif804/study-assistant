const limits = require("../config/aiLimits");

class AIError extends Error {
  constructor(statusCode, message) { super(message); this.statusCode = statusCode; }
}
function requireText(text, max, label) {
  if (typeof text !== "string" || !text.trim()) throw new AIError(400, `${label} is required and must be text`);
  if (text.length > max) throw new AIError(413, `${label} exceeds the AI processing limit`);
  return text.trim();
}
function checkDeadline(deadline) {
  if (Date.now() >= deadline) throw new AIError(504, "AI processing timed out. Please try a smaller request.");
}
function safeAIError(error) {
  return error instanceof AIError ? error : new AIError(500, "AI processing failed. Please try again later.");
}

async function readLimited(response, maxBytes, controller) {
  const declared = Number(response.headers.get("content-length"));
  if (declared > maxBytes) { controller.abort(); throw new AIError(413, "External response exceeds the AI processing limit"); }
  if (!response.body) return Buffer.alloc(0);
  const reader = response.body.getReader();
  const buffers = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) { controller.abort(); throw new AIError(413, "External response exceeds the AI processing limit"); }
      buffers.push(Buffer.from(value));
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(buffers, size);
}

// Timeout includes headers and streaming response body, not just fetch resolution.
async function fetchLimited(url, options, { timeoutMs, maxBytes, json = false }) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    if (!response.ok) { controller.abort(); throw new AIError(502, "AI or document service is currently unavailable"); }
    const buffer = await readLimited(response, maxBytes, controller);
    if (timedOut) throw new AIError(504, "AI or document request timed out. Please try again.");
    if (!json) return buffer;
    try { return JSON.parse(buffer.toString("utf8")); }
    catch { throw new AIError(502, "AI service returned an invalid response"); }
  } catch (error) {
    if (timedOut) throw new AIError(504, "AI or document request timed out. Please try again.");
    if (error instanceof AIError) throw error;
    throw new AIError(502, "AI or document service is currently unavailable");
  } finally { clearTimeout(timer); }
}

async function requestAI(url, options) {
  if (options.body.length > limits.MAX_CONTEXT_CHARS) throw new AIError(413, "AI context exceeds the processing limit");
  return fetchLimited(url, options, { timeoutMs: limits.API_TIMEOUT_MS, maxBytes: limits.MAX_PROVIDER_BYTES, json: true });
}

module.exports = { AIError, requireText, checkDeadline, safeAIError, fetchLimited, requestAI };
