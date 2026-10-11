const cloudinary = require("../config/cloudinary");

function attachmentURL(attachment) {
  const type = attachment.deliveryType || "upload"; // Explicit legacy-public path.
  if (!["upload", "authenticated"].includes(type) ||
      !["raw", "image", "video"].includes(attachment.resourceType) ||
      typeof attachment.publicId !== "string" || !attachment.publicId) {
    throw new Error("Invalid attachment metadata");
  }
  if (type === "authenticated") {
    return cloudinary.utils.private_download_url(attachment.publicId, attachment.format, {
      resource_type: attachment.resourceType, type,
      expires_at: Math.floor(Date.now() / 1000) + 60, secure: true, attachment: true,
    });
  }
  // Legacy URLs are server-stored, but still constrain the origin and cloud.
  const url = new URL(attachment.url);
  const cloud = cloudinary.config().cloud_name;
  if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" ||
      url.username || url.password || url.search || url.hash ||
      !url.pathname.startsWith(`/${cloud}/`)) throw new Error("Invalid legacy attachment URL");
  return url.href;
}

module.exports = { attachmentURL };
