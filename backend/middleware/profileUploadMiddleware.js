const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { randomUUID } = require('node:crypto');
const { trackTempUpload, withTempUploadCleanup } = require('../utils/tempUploadCleanup');

const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `profile-${randomUUID()}${ext}`;
    trackTempUpload(req, filename);
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only image files (JPEG, PNG, WEBP) are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

const profileUploadMiddleware = withTempUploadCleanup(upload.single('profileImage'));

module.exports = profileUploadMiddleware;
