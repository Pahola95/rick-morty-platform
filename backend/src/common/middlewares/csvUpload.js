const multer = require('multer');

// Store the file in memory so we can parse it without hitting the disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'text/csv' ||
    file.mimetype === 'application/vnd.ms-excel' ||
    file.originalname.toLowerCase().endsWith('.csv')
  ) {
    cb(null, true);
  } else {
    const err = new Error('Solo se permiten archivos CSV');
    err.status = 422;
    cb(err, false);
  }
};

const csvUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB max
    files: 1,
  },
});

module.exports = csvUpload;
