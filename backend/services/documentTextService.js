const { attachmentURL } = require("./attachmentDelivery");
const { Worker } = require("node:worker_threads");
const path = require("node:path");
const limits = require("../config/aiLimits");
const { AIError, fetchLimited } = require("../utils/aiSafety");
const SUPPORTED_DOCUMENT_FORMATS = [
  "pdf",
  "docx",
  "pptx",
];

function normalizeFormat(format, originalName = "") {
  const cleanFormat = String(format || "")
    .toLowerCase()
    .replace(".", "")
    .trim();

  if (cleanFormat) {
    return cleanFormat;
  }

  const parts = String(originalName || "").split(".");

  if (parts.length < 2) {
    return "";
  }

  return parts[parts.length - 1].toLowerCase();
}

async function downloadFileBuffer(url) {
  return fetchLimited(url, { redirect: "error" }, { timeoutMs: limits.DOWNLOAD_TIMEOUT_MS, maxBytes: limits.MAX_DOCUMENT_BYTES });
}

function parseDocument(buffer, format) {
  return new Promise((resolve, reject) => {
    const worker = new Worker(path.join(__dirname, "documentParserWorker.js"), {
      workerData: { buffer, format }, resourceLimits: { maxOldGenerationSizeMb: 128 },
    });
    let finished = false;
    const finish = (error, text) => {
      if (finished) return;
      finished = true; clearTimeout(timer);
      void worker.terminate().catch(() => {});
      if (error) reject(error); else resolve(text);
    };
    const timer = setTimeout(() => finish(new AIError(504, "Document processing timed out. Please use a smaller document.")), limits.PARSE_TIMEOUT_MS);
    worker.once("message", result => {
      if (result.oversized) finish(new AIError(413, "Document text exceeds the AI processing limit"));
      else if (result.failed || typeof result.text !== "string") finish(new AIError(422, "Study document could not be processed"));
      else finish(null, result.text);
    });
    worker.once("error", () => finish(new AIError(422, "Study document could not be processed within resource limits")));
    worker.once("exit", () => { if (!finished) finish(new AIError(422, "Study document processing stopped")); });
  });
}

async function extractDocumentText({
  attachment,
  url,
  format,
  originalName,
}) {
  const normalizedFormat = normalizeFormat(
    format,
    originalName
  );

  if (
    !SUPPORTED_DOCUMENT_FORMATS.includes(
      normalizedFormat
    )
  ) {
    return {
      supported: false,
      text: "",
      format: normalizedFormat,
    };
  }

  const fileBuffer = await downloadFileBuffer(attachment ? attachmentURL(attachment) : url);

  const text = await parseDocument(fileBuffer, normalizedFormat);

  return {
    supported: true,
    text,
    format: normalizedFormat,
  };
}

module.exports = {
  extractDocumentText,
  SUPPORTED_DOCUMENT_FORMATS,
};
