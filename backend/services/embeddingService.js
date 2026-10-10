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
    );
  }

  return extractorPromise;
}

async function createEmbedding(text) {
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
  const cleanTexts = texts
    .map((text) => String(text || "").trim())
    .filter(Boolean);

  if (cleanTexts.length === 0) {
    return [];
  }

  const extractor = await getExtractor();

  const output = await extractor(cleanTexts, {
    pooling: "mean",
    normalize: true,
  });

  return output.tolist();
}

module.exports = {
  createEmbedding,
  createEmbeddings,
};