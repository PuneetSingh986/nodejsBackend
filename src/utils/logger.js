const { createLogger, format, transports } = require("winston");
const path = require("path");
const winston = require("winston");

// Define log format
const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Define human-readable format for console and Papertrail
const readableFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(
    (info) =>
      `${info.timestamp} ${info.level}: ${info.message}${
        info.meta ? " " + JSON.stringify(info.meta) : ""
      }`
  )
);

// Define the custom settings for each transport
const options = {
  console: {
    level: "debug",
    format: readableFormat,
  },
  fileError: {
    level: "error",
    filename: path.join("logs", "error.log"),
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  },
  fileCombined: {
    level: "info",
    filename: path.join("logs", "combined.log"),
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  },
  fileAudit: {
    level: "info",
    filename: path.join("logs", "audit.log"),
    format: logFormat,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  },
};

// Create logger instance
const logger = createLogger({
  level: process.env.NODE_ENV === "development" ? "debug" : "info",
  format: logFormat,
  defaultMeta: { service: "api" },
  transports: [
    new transports.Console(options.console),
    new transports.File(options.fileError),
    new transports.File(options.fileCombined),
    new transports.File({
      ...options.fileAudit,
      filename: path.join("logs", "audit.log"),
    }),
  ],
  exitOnError: false,
});

// Create specialized audit logger function
logger.audit = (userType, userId, action, resource, details = {}) => {
  logger.info(`AUDIT: ${userType} ${userId} ${action} ${resource}`, {
    meta: {
      type: "audit",
      userType,
      userId,
      action,
      resource,
      ...details,
      timestamp: new Date().toISOString(),
    },
  });
};

// Try to set up Papertrail in a separate block with lazy loading
// This avoids the "Cannot read properties of undefined" error
if (process.env.NODE_ENV !== "test") {
  try {
    // Lazy load the Papertrail transport only when needed
    const { Papertrail } = require("winston-papertrail");

    // Only add if we have the required configuration
    if (process.env.PAPERTRAIL_HOST && process.env.PAPERTRAIL_PORT) {
      const papertrailTransport = new Papertrail({
        host: process.env.PAPERTRAIL_HOST,
        port: parseInt(process.env.PAPERTRAIL_PORT, 10),
        hostname: process.env.PAPERTRAIL_HOSTNAME || "nodejs-app",
        program: "api",
        level: "info",
        format: readableFormat,
        colorize: true,
      });

      // Handle errors properly to prevent crashing
      papertrailTransport.on("error", (err) => {
        console.error("Papertrail error:", err);
      });

      // Add transport only after error handler is attached
      papertrailTransport.on("connect", () => {
        logger.add(papertrailTransport);
        logger.info("Papertrail logging connected");
      });
    } else {
      logger.info("Papertrail disabled: missing host or port configuration");
    }
  } catch (error) {
    console.error(`Error setting up Papertrail: ${error.message}`);
    logger.error(`Error setting up Papertrail: ${error.message}`);
  }
}

module.exports = logger;
