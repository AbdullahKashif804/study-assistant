const cloudinary = require('../config/cloudinary');

const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
    try {
        if (!publicId) return null;

        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType
        });

        return result;
    } catch (error) {
        console.error('Cloudinary Delete Error:', error);
        throw error;
    }
};

module.exports = { deleteFromCloudinary };