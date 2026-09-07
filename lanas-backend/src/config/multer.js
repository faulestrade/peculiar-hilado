const multer = require('multer');
const path = require('path');

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp/;
  const ext = allowed.test(path.extname(file.originalname).toLowerCase());
  const mime = allowed.test(file.mimetype);
  if (ext && mime) cb(null, true);
  else cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, webp)'));
};

module.exports = multer({ storage: multer.memoryStorage(), fileFilter, limits: { fileSize: 500 * 1024 } });
