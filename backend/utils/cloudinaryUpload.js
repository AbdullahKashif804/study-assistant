const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const uploadToCloudinary = async (localFilePath, folderName = 'mern_uploads') => {
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
    });

    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};

module.exports = { uploadToCloudinary };