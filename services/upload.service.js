const multer = require("multer");
const path = require("path");
const fs = require("fs");

const allowedMimeTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});


const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false); 
  }
};

const MAX_FILE_SIZE_MB = process.env.MAX_FILE_SIZE;

const uploadMultiple = (fieldName, maxCount = 100) =>
  multer({ storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 } }).array(fieldName, maxCount);

module.exports = { uploadMultiple };
