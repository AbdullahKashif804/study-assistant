const cloudinary = require('../config/cloudinary');
const { removeTempUpload } = require('./tempUploadCleanup');
const path = require('path');
const studyFolders = new Set(["notes_attachments", "assignment_attachments", "project_attachments", "course_attachments"]);

const uploadToCloudinary = async (localFilePath, folderName = 'mern_uploads', { quiet = false } = {}) => {
  try {
    if (!localFilePath) return null;

    const extension = path.extname(localFilePath).toLowerCase();

    const rawFileExtensions = ['.pdf', '.docx', '.pptx'];

    const resourceType = rawFileExtensions.includes(extension)
      ? 'raw'
      : 'image';

    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: folderName,
      resource_type: resourceType,
      ...(studyFolders.has(folderName) ? { type: "authenticated", overwrite: false } : {}),
    });

    if (studyFolders.has(folderName)) {
      if (response.type !== "authenticated" || response.resource_type !== resourceType || !response.public_id) {
        throw new Error("Unexpected attachment delivery metadata");
      }
      // Store only an unsigned, inaccessible delivery URL, never a reusable signature.
      response.secure_url = cloudinary.url(response.public_id, {
        resource_type: resourceType, type: "authenticated", secure: true, sign_url: false,
        ...(resourceType === "image" && response.format ? { format: response.format } : {}),
      });
    }
    return response;
  } catch (error) {
    if (studyFolders.has(folderName)) {
      if (!quiet) console.error('Study attachment upload failed; provider details suppressed.');
      throw new Error('Study attachment upload failed');
    }
    if (!quiet) console.error('Cloudinary Upload Error:', error);
    throw error;
  } finally {
    // A local cleanup failure must not hide a successful remote upload or mask
    // its original error, otherwise the caller cannot compensate safely.
    await removeTempUpload(localFilePath);
  }
};

module.exports = { uploadToCloudinary };
