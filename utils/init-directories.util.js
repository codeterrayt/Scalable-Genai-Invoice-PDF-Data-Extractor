const fs = require("fs").promises;
const path = require("path");

async function initOutputDirs() {
  const baseDir = path.resolve(__dirname, "../output");
  const dirs = [
    path.join(baseDir, "json"),
    path.join(baseDir, "yaml"),
    path.join(baseDir, "../uploads"),
  ];

  try {
    for (const dir of dirs) {
      await fs.mkdir(dir, { recursive: true });
    }
    console.log("✅ Output folders initialized.");
  } catch (err) {
    console.error("❌ Failed to initialize output folders:", err.message);
    process.exit(1);
  }
}

module.exports = { initOutputDirs };
