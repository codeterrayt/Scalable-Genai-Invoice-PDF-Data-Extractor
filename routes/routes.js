const express = require("express");
const fileRoutes = require("./file.routes");

const router = express.Router();

router.use("/file", fileRoutes);

module.exports = router;
