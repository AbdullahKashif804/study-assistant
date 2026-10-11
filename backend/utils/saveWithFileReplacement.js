const { uploadToCloudinary } = require("./cloudinaryUpload");
const { deleteFromCloudinary } = require("./cloudinaryDelete");

const validTypes = new Set(["image", "raw", "video"]);

function sameResource(first, second) {
  return first?.publicId === second?.publicId && first?.resourceType === second?.resourceType && (first?.deliveryType || "upload") === (second?.deliveryType || "upload");
}

async function cleanup(resource, stage) {
  if (!resource?.publicId || typeof resource.publicId !== "string" || !validTypes.has(resource.resourceType)) {
    console.error(`Cloudinary replacement cleanup skipped (${stage}): invalid resource metadata; manual review required.`);
    return;
  }
  try {
    const result = await deleteFromCloudinary(resource.publicId, resource.resourceType, { quiet: true, deliveryType: resource.deliveryType || "upload" });
    if (!["ok", "not found"].includes(result?.result)) throw new Error("Cleanup not confirmed");
  } catch {
    console.error(`Cloudinary replacement cleanup failed (${stage}); manual retry required.`);
  }
}

// Keep external cleanup outside the database commit boundary. Never compensate
// after save succeeds (including failures in later response population).
async function saveWithFileReplacement({ document, field = "attachment", file, folder, onReplacement }) {
  if (!file) return document.save();
  const previous = document[field];
  // Only legacy profile images have a known image-only resource type.
  const oldResource = previous?.publicId ? {
    publicId: previous.publicId,
    deliveryType: previous.deliveryType || "upload",
    resourceType: previous.resourceType || (field === "profileImage" ? "image" : undefined),
  } : null;
  let uploaded;
  try {
    const result = await uploadToCloudinary(file.path, folder, { quiet: true });
    if (result) uploaded = { publicId: result.public_id, resourceType: result.resource_type, deliveryType: result.type || (field === "profileImage" ? "upload" : "authenticated") };
    if (!uploaded?.publicId || typeof uploaded.publicId !== "string" || !validTypes.has(uploaded.resourceType) || !result.secure_url) {
      throw new Error("Replacement upload did not return valid file metadata");
    }
    document[field] = {
      url: result.secure_url,
      publicId: uploaded.publicId,
      format: result.format || file.originalname.split(".").pop(),
      resourceType: uploaded.resourceType,
      ...(field === "profileImage" ? {} : { deliveryType: uploaded.deliveryType }),
      size: result.bytes || file.size,
      ...(field === "profileImage" ? {} : { originalName: file.originalname }),
    };
    if (onReplacement) onReplacement();
    await document.save();
  } catch (error) {
    document[field] = previous;
    if (uploaded && !sameResource(uploaded, oldResource)) await cleanup(uploaded, "new upload after failed save");
    throw error;
  }
  if (oldResource && !sameResource(oldResource, uploaded)) await cleanup(oldResource, "old file after successful save");
  return document;
}

module.exports = { saveWithFileReplacement };
