// tasks/processFile.js
const path = require("path");
const fs = require("fs").promises;
const { GenAIprocessFile } = require("../services/gen-ai.service");

async function processFile(file) {
  try {

    const { json, yaml } = await GenAIprocessFile({
      filePath: file.filePath,
      type: file.type,
      fileName: file.fileName,
      id: file._id,
    });

    const baseDir = path.resolve(__dirname, "../output");
    const baseName = `${file.fileName}_${file._id}`;
    const jsonPath = path.join(baseDir, "json", `${baseName}.json`);
    const yamlPath = path.join(baseDir, "yaml", `${baseName}.yaml`);

    await fs.writeFile(jsonPath, JSON.stringify(json, null, 2), "utf8");
    await fs.writeFile(yamlPath, yaml, "utf8");

    console.log(`✅ Files written: ${jsonPath}, ${yamlPath}`);

    return json;
  } catch (err) {
    throw err;
  }
}

module.exports = { processFile };
