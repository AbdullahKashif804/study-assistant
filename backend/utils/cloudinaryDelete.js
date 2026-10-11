const cloudinary = require('../config/cloudinary');

const deleteFromCloudinary = async (publicId, resourceType = 'image', { quiet = false, deliveryType = "upload" } = {}) => {
    try {
        if (!publicId) return null;

        if (!["upload", "authenticated"].includes(deliveryType)) throw new Error("Invalid delivery type");
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resourceType,
            type: deliveryType,
            ...(deliveryType === "authenticated" ? { invalidate: true } : {})
        });

        return result;
    } catch (error) {
        if (deliveryType === "authenticated") {
            if (!quiet) console.error('Authenticated attachment cleanup failed; provider details suppressed.');
            throw new Error('Attachment cleanup failed');
        }
        if (!quiet) console.error('Cloudinary Delete Error:', error);
        throw error;
    }
};

module.exports = { deleteFromCloudinary };
