const mongoose = require("mongoose");
const { FILE_STATUS_ARRAY, FILE_TYPE, FILE_STATUS } = require("../consts/const");

const fileSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
    type: { type: String, enum: FILE_TYPE, required: true },
    status: { type: String, enum: FILE_STATUS_ARRAY, default: FILE_STATUS.PENDING },
    isFlagged: { type: Boolean, default: false },
    size: { type: Number }, 
    uploadedAt: { type: Date, default: Date.now },
    data: { type: Object, default: null }, 
    retries: { type: Number, default: 0 },
    error: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("File", fileSchema);