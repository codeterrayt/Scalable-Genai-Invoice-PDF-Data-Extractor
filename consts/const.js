const FILE_STATUS = {
    PENDING: "pending",
    PROCESSING: "processing",
    PROCESSED: "processed",
    ERROR: "error",
};
const FILE_STATUS_ARRAY = Object.values(FILE_STATUS);

const FILE_TYPE = {
    PDF: "pdf",
    IMAGE: "image",
};


module.exports = { FILE_STATUS, FILE_TYPE, FILE_STATUS_ARRAY };