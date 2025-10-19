const File = require("../models/file.model");
const { queueInvoiceTask } = require("../services/queue.service");
const { FILE_TYPE, FILE_STATUS } = require("../consts/const");
const { getFilesQuerySchema } = require("../validation/file.validation");


async function uploadFile(req, res) {
  try {

    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: "No valid PDF or image files uploaded" });
    }

    const fileDocs = files.map(f => ({
      fileName: f.originalname,
      filePath: f.path,
      type: f.mimetype === "application/pdf" ? FILE_TYPE.PDF : FILE_TYPE.IMAGE,
      status: FILE_STATUS.PENDING,
      size: f.size,
    }));

    const savedFiles = await File.insertMany(fileDocs);

    await Promise.all(savedFiles.map(file =>
      queueInvoiceTask({ id: file._id })
    ));

    return res.status(201).json({
      message: "Files uploaded and queued",
      file_ids: savedFiles.map(file => file._id)
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}


async function getFileById(req, res) {
  try {

    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    return res.status(200).json(file);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getFiles(req, res) {
  try {

    if(req.body === undefined){
      req.body = {};
    }

    const parseResult = getFilesQuerySchema.safeParse(req.body);

    if (!parseResult.success) {
      return res.status(400).json({ error: "Invalid filter values" });
    }

    const { flag, status } = parseResult.data;

    const query = {};
    if (typeof flag === "boolean") query.isFlagged = flag;
    if (status) query.status = status;

    const files = await File.find(query);

    return res.status(200).json(files);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { uploadFile, getFiles, getFileById };