const logger = require("../utils/logger");

/**
 * Middleware to log all API requests for audit purposes
 * Captures request data and logs it to both local files and Papertrail
 */
const auditLoggerMiddleware = (req, res, next) => {
  // Save the original send method
  const originalSend = res.send;

  // Get resource from URL path
  const getResource = (path) => {
    const parts = path.split("/").filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : "unknown";
  };

  // Get action from HTTP method
  const getAction = (method, path) => {
    if (path.includes("login")) return "login";
    if (path.includes("logout")) return "logout";

    switch (method) {
      case "GET":
        return "read";
      case "POST":
        return "create";
      case "PUT":
      case "PATCH":
        return "update";
      case "DELETE":
        return "delete";
      default:
        return method.toLowerCase();
    }
  };

  // Override send method to log after response is sent
  res.send = function (body) {
    // Parse response body if JSON
    let responseData = {};
    if (body && typeof body === "string") {
      try {
        responseData = JSON.parse(body);
      } catch (e) {
        // Not JSON, ignore
      }
    }

    // Only audit if we have a user (admin or customer)
    const user = req.admin || req.customer;
    if (user) {
      const userType = req.admin ? "admin" : "customer";
      const userId = user._id.toString();
      const resource = getResource(req.path);
      const action = getAction(req.method, req.path);

      // Prepare audit details
      const details = {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
        requestBody: req.method !== "GET" ? sanitizeBody(req.body) : undefined,
        responseStatus: responseData.status || "unknown",
        timestamp: new Date().toISOString(),
      };

      // Log the audit event
      logger.audit(userType, userId, action, resource, details);
    }

    // Call the original send
    return originalSend.apply(res, arguments);
  };

  next();
};

/**
 * Sanitize request body to remove sensitive information
 */
const sanitizeBody = (body) => {
  if (!body) return {};

  // Create a copy to avoid modifying the original
  const sanitized = { ...body };

  // Remove sensitive fields
  const sensitiveFields = ["password", "token", "secret", "otp", "creditCard"];
  sensitiveFields.forEach((field) => {
    if (sanitized[field]) sanitized[field] = "[REDACTED]";
  });

  return sanitized;
};

module.exports = auditLoggerMiddleware;
