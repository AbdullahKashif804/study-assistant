const limits = require("../config/aiLimits");
const { AIError, requireText, checkDeadline } = require("../utils/aiSafety");
const noteModel = require("../models/Notes");

const {
  createEmbedding,
  createEmbeddings,
} = require("./embeddingService");

const {
  extractDocumentText,
} = require("./documentTextService");

const CHUNK_SIZE = 1200;
const CHUNK_OVERLAP = 200;
const TOP_K = 5;

function chunkText(text) {
  if (String(text || "").length > limits.MAX_TEXT_CHARS) throw new AIError(413, "Study text exceeds the indexing limit");
  const cleanText = String(text || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanText) {
    return [];
  }

  if (cleanText.length <= CHUNK_SIZE) {
    return [cleanText];
  }

  const chunks = [];

  let start = 0;

  while (start < cleanText.length) {
    const end = Math.min(
      start + CHUNK_SIZE,
      cleanText.length
    );

    const chunk = cleanText
      .slice(start, end)
      .trim();

    if (chunk) {
      chunks.push(chunk);
      if (chunks.length > limits.MAX_CHUNKS_PER_SOURCE) throw new AIError(413, "Study source contains too many chunks");
    }

    if (end >= cleanText.length) {
      break;
    }

    start = end - CHUNK_OVERLAP;
  }

  return chunks;
}

function cosineSimilarity(vectorA, vectorB) {
  if (
    !Array.isArray(vectorA) ||
    !Array.isArray(vectorB) ||
    vectorA.length === 0 ||
    vectorA.length !== vectorB.length
  ) {
    return -1;
  }

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (
    let i = 0;
    i < vectorA.length;
    i += 1
  ) {
    dotProduct += vectorA[i] * vectorB[i];

    magnitudeA +=
      vectorA[i] * vectorA[i];

    magnitudeB +=
      vectorB[i] * vectorB[i];
  }

  if (
    magnitudeA === 0 ||
    magnitudeB === 0
  ) {
    return -1;
  }

  return (
    dotProduct /
    (
      Math.sqrt(magnitudeA) *
      Math.sqrt(magnitudeB)
    )
  );
}

async function ensureNoteTextIndexed(note, budget) {
  const content = String(
    note.content || ""
  ).trim();

  if (!content) {
    return;
  }

  const alreadyIndexed =
    Array.isArray(note.ragChunks) &&
    note.ragChunks.length > 0;

  if (alreadyIndexed) {
    return;
  }

  const chunks = chunkText(
    `${note.title}\n\n${content}`
  );

  if (chunks.length === 0) {
    return;
  }

  budget.newChunks += chunks.length;
  if (budget.newChunks > limits.MAX_NEW_CHUNKS) throw new AIError(413, "Too much new study material to index in one request. Retry to continue indexing.");
  checkDeadline(budget.deadline);
  const embeddings = await createEmbeddings(chunks);
  checkDeadline(budget.deadline);

  note.ragChunks = chunks.map(
    (text, index) => ({
      text,
      embedding:
        embeddings[index] || [],
    })
  );

  note.ragIndexedAt = new Date();

  await note.save();
}

async function ensureAttachmentIndexed(note, budget) {
  if (!note.attachment?.url) {
    return;
  }

  const currentPublicId =
    note.attachment.publicId || null;

  const alreadyIndexed =
    Array.isArray(
      note.attachmentRagChunks
    ) &&
    note.attachmentRagChunks.length > 0 &&
    note.attachmentRagPublicId ===
      currentPublicId;

  if (alreadyIndexed) {
    return;
  }

  checkDeadline(budget.deadline);
  const extracted =
    await extractDocumentText({
      url: note.attachment.url,
      attachment: note.attachment,
      format: note.attachment.format,
      originalName:
        note.attachment.originalName,
    });

  checkDeadline(budget.deadline);
  if (!extracted.supported) {
    return;
  }

  if (!extracted.text) {
    note.attachmentRagChunks = [];
    note.attachmentRagIndexedAt =
      new Date();
    note.attachmentRagPublicId =
      currentPublicId;

    await note.save();

    return;
  }

  const chunks =
    chunkText(extracted.text);

  if (chunks.length === 0) {
    return;
  }

  budget.newChunks += chunks.length;
  if (budget.newChunks > limits.MAX_NEW_CHUNKS) throw new AIError(413, "Too much new study material to index in one request. Retry to continue indexing.");
  checkDeadline(budget.deadline);
  const embeddings = await createEmbeddings(chunks);
  checkDeadline(budget.deadline);

  note.attachmentRagChunks =
    chunks.map((text, index) => ({
      text,
      embedding:
        embeddings[index] || [],
    }));

  note.attachmentRagIndexedAt =
    new Date();

  note.attachmentRagPublicId =
    currentPublicId;

  await note.save();
}

async function ensureNotesIndexed(userId) {
  const budget = { newChunks: 0, deadline: Date.now() + limits.WORK_TIMEOUT_MS };
  const oversized = await noteModel.findOne({ user: userId, $expr: { $or: [
    { $gt: [{ $strLenCP: { $ifNull: ["$content", ""] } }, limits.MAX_TEXT_CHARS - limits.MAX_TITLE_CHARS - 2] },
    { $gt: [{ $strLenCP: { $ifNull: ["$title", ""] } }, limits.MAX_TITLE_CHARS] },
  ] } }).select("_id").maxTimeMS(5000).lean();
  if (oversized) throw new AIError(413, "A study note exceeds the AI indexing limit. Shorten or split it first.");
  const notes = await noteModel
    .find({
      user: userId,
      $or: [
        {
          content: {
            $exists: true,
            $ne: "",
          },
        },
        {
          "attachment.url": {
            $exists: true,
            $ne: "",
          },
        },
      ],
    })
    .select("user title content attachment +ragChunks +ragIndexedAt +attachmentRagChunks +attachmentRagIndexedAt +attachmentRagPublicId")
    .slice("ragChunks", limits.MAX_CHUNKS_PER_SOURCE + 1)
    .slice("attachmentRagChunks", limits.MAX_CHUNKS_PER_SOURCE + 1)
    .limit(limits.MAX_NOTES + 1).maxTimeMS(5000);
  if (notes.length > limits.MAX_NOTES) throw new AIError(413, "Study library exceeds the AI limit of 50 notes");
  let storedChunks = 0;
  for (const note of notes) {
    for (const chunks of [note.ragChunks || [], note.attachmentRagChunks || []]) {
      if (chunks.length > limits.MAX_CHUNKS_PER_SOURCE) throw new AIError(413, "Stored study source exceeds the chunk limit");
      storedChunks += chunks.length;
      if (chunks.some(chunk => typeof chunk.text !== "string" || chunk.text.length > CHUNK_SIZE || !Array.isArray(chunk.embedding) || chunk.embedding.length > limits.MAX_VECTOR_DIMENSIONS)) throw new AIError(413, "Stored study index exceeds the processing limits");
    }
  }
  if (storedChunks > limits.MAX_RETRIEVAL_CHUNKS) throw new AIError(413, "Study library exceeds the retrieval workload limit");

  for (const note of notes) {
    checkDeadline(budget.deadline);
    await ensureNoteTextIndexed(note, budget);

    await ensureAttachmentIndexed(note, budget);
  }
}

async function retrieveRelevantNoteChunks({
  userId,
  question,
}) {
  requireText(question, 1000, "Question");
  const queryEmbedding =
    await createEmbedding(question);

  if (queryEmbedding.length === 0) {
    return [];
  }

  await ensureNotesIndexed(userId);

  const notes = await noteModel
    .find({
      user: userId,
      $or: [
        {
          content: {
            $exists: true,
            $ne: "",
          },
        },
        {
          "attachment.url": {
            $exists: true,
            $ne: "",
          },
        },
      ],
    })
    .select("user title content attachment +ragChunks +ragIndexedAt +attachmentRagChunks +attachmentRagIndexedAt +attachmentRagPublicId")
    .slice("ragChunks", limits.MAX_CHUNKS_PER_SOURCE + 1)
    .slice("attachmentRagChunks", limits.MAX_CHUNKS_PER_SOURCE + 1)
    .limit(limits.MAX_NOTES + 1).maxTimeMS(5000);
  if (notes.length > limits.MAX_NOTES) throw new AIError(413, "Study library exceeds the AI limit of 50 notes");
  let storedChunks = 0;
  for (const note of notes) {
    for (const chunks of [note.ragChunks || [], note.attachmentRagChunks || []]) {
      if (chunks.length > limits.MAX_CHUNKS_PER_SOURCE) throw new AIError(413, "Stored study source exceeds the chunk limit");
      storedChunks += chunks.length;
      if (chunks.some(chunk => typeof chunk.text !== "string" || chunk.text.length > CHUNK_SIZE || !Array.isArray(chunk.embedding) || chunk.embedding.length > limits.MAX_VECTOR_DIMENSIONS)) throw new AIError(413, "Stored study index exceeds the processing limits");
    }
  }
  if (storedChunks > limits.MAX_RETRIEVAL_CHUNKS) throw new AIError(413, "Study library exceeds the retrieval workload limit");

  const candidates = [];

  for (const note of notes) {
    for (
      const chunk of note.ragChunks || []
    ) {
      const score =
        cosineSimilarity(
          queryEmbedding,
          chunk.embedding
        );

      candidates.push({
        noteId: note._id.toString(),
        title: note.title,

        sourceType: "note",
        sourceName: note.title,

        text: chunk.text,
        score,
      });
    }

    for (
      const chunk of
      note.attachmentRagChunks || []
    ) {
      const score =
        cosineSimilarity(
          queryEmbedding,
          chunk.embedding
        );

      candidates.push({
        noteId: note._id.toString(),
        title: note.title,

        sourceType: "attachment",

        sourceName:
          note.attachment
            ?.originalName ||
          "Attachment",

        text: chunk.text,
        score,
      });
    }
  }

  return candidates
    .filter(
      (item) =>
        Number.isFinite(item.score) &&
        item.score >= 0
    )
    .sort(
      (a, b) =>
        b.score - a.score
    )
    .slice(0, TOP_K);
}

module.exports = {
  retrieveRelevantNoteChunks,
};
