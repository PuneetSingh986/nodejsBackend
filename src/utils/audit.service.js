const logger = require("./logger");

/**
 * Utility service for explicitly logging important data changes
 * This can be used in controllers when you need to log specific changes with detailed before/after data
 */

/**
 * Compare two objects and extract changed fields with before/after values
 * @param {Object} oldData - Original data
 * @param {Object} newData - New/updated data
 * @returns {Object} - Changes with before/after values
 */
const getChanges = (oldData, newData) => {
  if (!oldData || !newData) return {};

  const changes = {};

  // Convert mongoose documents to plain objects if needed
  const oldObj = oldData.toObject ? oldData.toObject() : oldData;
  const newObj = newData.toObject ? newData.toObject() : newData;

  // Find changed fields
  Object.keys(newObj).forEach((key) => {
    // Skip internal mongoose fields
    if (key.startsWith("_") && key !== "_id") return;

    // Skip functions
    if (typeof newObj[key] === "function") return;

    // Check if values are different
    if (JSON.stringify(oldObj[key]) !== JSON.stringify(newObj[key])) {
      changes[key] = {
        before: oldObj[key],
        after: newObj[key],
      };
    }
  });

  return changes;
};

/**
 * Log data changes with detailed information
 * @param {Object} options - Log options
 * @param {string} options.userType - User type ('admin' or 'customer')
 * @param {string} options.userId - User ID
 * @param {string} options.action - Action performed ('create', 'update', 'delete')
 * @param {string} options.resource - Resource type (e.g., 'customer', 'product')
 * @param {string} options.resourceId - Resource ID
 * @param {Object} [options.oldData] - Original data before changes
 * @param {Object} [options.newData] - New data after changes
 * @param {string} [options.message] - Human-readable description of the action
 * @param {Object} [options.req] - Express request object (for IP, user agent)
 */
const logDataChange = (options) => {
  const {
    userType,
    userId,
    action,
    resource,
    resourceId,
    oldData,
    newData,
    message,
    req,
  } = options;

  // Calculate changes if both oldData and newData provided
  const changes = oldData && newData ? getChanges(oldData, newData) : {};

  // Additional context from request if available
  const context = req
    ? {
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.headers["user-agent"],
        path: req.path,
        method: req.method,
      }
    : {};

  // Log the detailed audit event
  logger.audit(userType, userId, action, resource, {
    resourceId,
    changes,
    message,
    ...context,
  });
};

module.exports = {
  logDataChange,
  getChanges,
};
