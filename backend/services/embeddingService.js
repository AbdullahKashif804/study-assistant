const limits = require("../config/aiLimits");
const { AIError, checkDeadline } = require("../utils/aiSafety");
let extractorPromise = null;

const EMBEDDING_MODEL = "Xenova/all-MiniLM-L6-v2";

async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = import("@huggingface/transformers").then(
      async ({ pipeline }) => {
        return pipeline(
          "feature-extraction",
          EMBEDDING_MODEL
        );
      }
    ).catch(() => { extractorPromise = null; throw new AIError(503, "Study search model is currently unavailable"); });
  }

  return extractorPromise;
}

async function createEmbedding(text) {
  if (typeof text !== "string" || text.length > limits.MAX_TEXT_CHARS) throw new AIError(413, "Embedding input exceeds the processing limit");
  const cleanText = String(text || "").trim();

  if (!cleanText) {
    return [];
  }

  const extractor = await getExtractor();

  const output = await extractor(cleanText, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}

async function createEmbeddings(texts) {
  if (!Array.isArray(texts) || texts.length > limits.MAX_NEW_CHUNKS || texts.some(text => typeof text !== "string" || text.length > 1200)) throw new AIError(413, "Embedding workload exceeds the processing limit");
  const cleanTexts = texts
    .map((text) => String(text || "").trim())
    .filter(Boolean);

  if (cleanTexts.length === 0) {
    return [];
  }

  const extractor = await getExtractor();

  const result = [];
  const deadline = Date.now() + limits.WORK_TIMEOUT_MS;
  for (let start = 0; start < cleanTexts.length; start += limits.EMBEDDING_BATCH) {
    checkDeadline(deadline);
    const output = await extractor(cleanTexts.slice(start, start + limits.EMBEDDING_BATCH), { pooling: "mean", normalize: true });
    result.push(...output.tolist());
    await new Promise(resolve => setImmediate(resolve));
  }
  checkDeadline(deadline);
  return result;
}

module.exports = {
  createEmbedding,
  createEmbeddings,
};
