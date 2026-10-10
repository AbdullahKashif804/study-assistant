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

async function ensureNoteTextIndexed(note) {
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

  const embeddings =
    await createEmbeddings(chunks);

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

async function ensureAttachmentIndexed(note) {
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

  const extracted =
    await extractDocumentText({
      url: note.attachment.url,
      format: note.attachment.format,
      originalName:
        note.attachment.originalName,
    });

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

  const embeddings =
    await createEmbeddings(chunks);

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
    .select(
      "+ragChunks " +
        "+ragIndexedAt " +
        "+attachmentRagChunks " +
        "+attachmentRagIndexedAt " +
        "+attachmentRagPublicId"
    );

  for (const note of notes) {
    await ensureNoteTextIndexed(note);

    await ensureAttachmentIndexed(note);
  }
}

async function retrieveRelevantNoteChunks({
  userId,
  question,
}) {
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
    .select(
      "+ragChunks " +
        "+ragIndexedAt " +
        "+attachmentRagChunks " +
        "+attachmentRagIndexedAt " +
        "+attachmentRagPublicId"
    );

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