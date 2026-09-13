const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from .env");
    }

    console.log("🔄 Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    console.log("✅ MongoDB Connected Successfully");
    console.log(
      `📦 Database: ${mongoose.connection.name}`
    );

  } catch (error) {
    console.error("");
    console.error("❌ MongoDB Connection Failed");
    console.error("================================");
    console.error("Message:", error.message);

    if (error.reason) {
      console.error("Reason:", error.reason);
    }

    if (error.code) {
      console.error("Code:", error.code);
    }

    console.error("================================");
    console.error("");

    process.exit(1);
  }
};

module.exports = connectDB;