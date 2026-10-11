const { Readable, Transform } = require("node:stream");
const { pipeline } = require("node:stream/promises");
const { attachmentURL } = require("../services/attachmentDelivery");
const models = {
  note: require("../models/Notes"), assignment: require("../models/Assignments"),
  project: require("../models/Projects"), course: require("../models/Courses"),
};
const MAX_BYTES = 10 * 1024 * 1024;
const mimeTypes = {
  pdf: "application/pdf", jpg: "image/jpeg", jpeg: "image/jpeg",
  png: "image/png", gif: "image/gif", webp: "image/webp",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
};

async function deliverAttachment(req, res) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Content-Security-Policy", "sandbox; default-src 'none'");
  res.setHeader("Referrer-Policy", "no-referrer");
  if (!req.user?._id) return res.status(401).json({ success: false, message: "Authentication required" });
  const model = models[req.baseUrl.split("/").pop()];
  const filter = { _id: req.params.id, user: req.user._id };
  const unavailable = () => res.status(404).json({ success: false, message: "Attachment not found" });
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 30000);
  const disconnect = () => { if (!res.writableFinished) controller.abort(); };
  res.once("close", disconnect);
  try {
    const record = model && await model.findOne(filter).select("attachment").lean();
    const attachment = record?.attachment;
    // Version is an equality guard, never an authorization identity or lookup key.
    if (!attachment || typeof req.query.version !== "string" ||
        req.query.version !== attachment.publicId) return unavailable();
    const url = attachmentURL(attachment);
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || !["api.cloudinary.com", "res.cloudinary.com"].includes(parsed.hostname)) {
      throw new Error("Invalid delivery origin");
    }
    const upstream = await fetch(url, { signal: controller.signal, redirect: "manual" });
    if (!upstream.ok || !upstream.body) {
      await upstream.body?.cancel();
      if ([401, 403, 404].includes(upstream.status)) return unavailable();
      throw new Error("Upstream unavailable");
    }
    if (Number(upstream.headers.get("content-length")) > MAX_BYTES) {
      await upstream.body.cancel();
      return res.status(413).json({ success: false, message: "Attachment exceeds the delivery size limit" });
    }
    // Close the authorization-to-upstream gap for deletes/replacements while fetching headers.
    const current = await model.findOne(filter).select("attachment").lean();
    if (current?.attachment?.publicId !== attachment.publicId ||
        (current.attachment.deliveryType || "upload") !== (attachment.deliveryType || "upload") ||
        current.attachment.resourceType !== attachment.resourceType) {
      await upstream.body.cancel();
      return unavailable();
    }
    const format = String(attachment.format || "").toLowerCase();
    const inline = req.query.download !== "1" && ["pdf", "jpg", "jpeg", "png", "gif", "webp"].includes(format);
    const filename = String(attachment.originalName || `attachment.${format || "bin"}`)
      .replace(/[^a-zA-Z0-9._ -]/g, "_").slice(0, 150) || "attachment";
    res.setHeader("Content-Type", mimeTypes[format] || "application/octet-stream");
    res.setHeader("Content-Disposition", `${inline ? "inline" : "attachment"}; filename="${filename}"`);
    res.setHeader("X-Attachment-Privacy", attachment.deliveryType === "authenticated" ? "authenticated" : "legacy-public");
    let bytes = 0;
    const bounded = new Transform({ transform(chunk, encoding, callback) {
      bytes += chunk.length;
      if (bytes > MAX_BYTES) { controller.abort(); callback(new Error("Attachment size limit")); }
      else callback(null, chunk);
    } });
    // Deliberately never forward upstream Location, cookies, error bodies or signed URLs.
    await pipeline(Readable.fromWeb(upstream.body), bounded, res, { signal: controller.signal });
  } catch {
    if (!res.headersSent && !res.destroyed) res.status(timedOut ? 504 : 502).json({
      success: false, message: timedOut ? "Attachment delivery timed out" : "Attachment could not be retrieved",
    });
    else if (!res.destroyed) res.destroy();
  } finally {
    clearTimeout(timer);
    res.removeListener("close", disconnect);
    controller.abort();
  }
}

module.exports = { deliverAttachment };
