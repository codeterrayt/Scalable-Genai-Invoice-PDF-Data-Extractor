const mongoose = require("mongoose");

let isConnected = false;

async function connectMongo() {
  if (isConnected) {
    console.log("⚡ Reusing existing MongoDB connection");
    return mongoose;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log("✅ MongoDB connected");
    return mongoose;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
}

async function disconnectMongo() {
  try {
    if (isConnected) {
      await mongoose.disconnect();
      isConnected = false;
      console.log("🔌 MongoDB disconnected");
    }
  } catch (err) {
    console.error("Error disconnecting MongoDB:", err);
  }
}

module.exports = { connectMongo, disconnectMongo };
