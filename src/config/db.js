const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    // Log for debugging
    console.log("Connecting to MongoDB with URI:", process.env.MONGO_URI);

    // Check if MONGO_URI is defined
    if (!process.env.MONGO_URI) {
      logger.error("MongoDB URI is not defined in environment variables");
      console.error("MONGO_URI environment variable is missing or undefined");
      console.error("Please check your .env file or environment configuration");
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI, {});

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    console.error("MongoDB Connection Error:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
