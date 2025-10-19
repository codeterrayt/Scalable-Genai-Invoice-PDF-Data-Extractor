const express = require("express");
const { initOutputDirs } = require("./utils/init-directories.util");
const { connectMongo } = require("./clients/mongoose.client");

initOutputDirs();
connectMongo();

const app = express();

app.use(express.json());

app.use("/api", require("./routes/routes"));

app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});
