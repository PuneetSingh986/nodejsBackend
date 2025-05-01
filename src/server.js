const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { StatusCodes } = require("http-status-codes");
const path = require("path");
const errorHandler = require("./middleware/errorHandler");
const auditLoggerMiddleware = require("./middleware/audit-logger.middleware");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Log environment variables for debugging
console.log("Environment variables loaded:");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("MONGO_URI:", process.env.MONGO_URI);
console.log("PORT:", process.env.PORT);

// Connect to MongoDB
connectDB();

// Initialize Express
const app = express();

// Security middleware
app.use(helmet()); // Set security HTTP headers
app.use(cors()); // Enable CORS

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_TIME * 60 * 1000 || 15 * 60 * 1000, // Default: 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // Default: 100 requests per windowMs
  standardHeaders: true,
  message: {
    status: StatusCodes.TOO_MANY_REQUESTS,
    message: "Too many requests, please try again later",
  },
});
app.use(limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logger
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Set static folder
app.use(express.static("public"));

// API Routes - Customer and Admin
const customerAuthRoutes = require("./api/customer/routes/auth.routes");
const adminAuthRoutes = require("./api/admin/routes/auth.routes");

// Create logs directory if it doesn't exist
const fs = require("fs");
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  logger.info(`Created logs directory at ${logsDir}`);
}

// Apply audit logging middleware to protected API routes
// This should come after auth middleware resolves user info but before route handlers
app.use(
  ["/api/v1/customer/auth/*", "/api/v1/admin/auth/*"],
  auditLoggerMiddleware
);

// Mount routes - Customer APIs
app.use("/api/v1/customer/auth", customerAuthRoutes);

// Mount routes - Admin APIs
app.use("/api/v1/admin/auth", adminAuthRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(StatusCodes.OK).json({
    status: "success",
    message: "Server is running",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(StatusCodes.NOT_FOUND).json({
    status: "error",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handler middleware
app.use(errorHandler);

// Initialize first admin user if none exists
// This is done after DB connection is established
const Admin = require("./api/admin/models/admin.model");
(async () => {
  try {
    // Wait for DB connection to be established
    setTimeout(async () => {
      await Admin.createInitialAdmin();
    }, 3000);
  } catch (err) {
    logger.error(`Error initializing admin: ${err.message}`);
  }
})();

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  logger.info(`Audit logging enabled with Winston + Papertrail`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

module.exports = app;
