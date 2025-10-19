const express = require("express");
const router = express.Router();
const { uploadFile, getFiles, getFileById } = require("../controller/file.controller");
const { uploadMultiple } = require("../services/upload.service");
const { rateLimiter } = require("../middleware/rate-limiter.middleware");

router.get("/", getFiles);
router.post("/upload", rateLimiter, uploadMultiple("files"), uploadFile);
router.get("/:id", getFileById);

module.exports = router;
