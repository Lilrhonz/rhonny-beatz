const multer = require('multer');

const storage = multer.memoryStorage();

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB

function fileFilter(req, file, cb) {
  const allowed = {
    coverArt: ['image/jpeg', 'image/png', 'image/webp'],
    wavFile: ['audio/wav', 'audio/x-wav', 'audio/wave'],
    coverImage: ['image/jpeg', 'image/png', 'image/webp']
  };

  const allowedTypes = allowed[file.fieldname];
  if (!allowedTypes) {
    return cb(new Error(`Unexpected field: ${file.fieldname}`));
  }
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error(`Invalid file type for ${file.fieldname}: ${file.mimetype}`));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter
});

module.exports = upload;