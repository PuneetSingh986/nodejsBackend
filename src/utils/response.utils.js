/**
 * Utility functions for API responses
 */

/**
 * Send a success response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {object|array} data - Response data
 * @param {string} message - Success message
 */
const sendSuccessResponse = (
  res,
  statusCode,
  data,
  message = "Operation successful"
) => {
  return res.status(statusCode).json({
    status: "success",
    message,
    data,
  });
};

/**
 * Send an error response
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {object} errors - Optional validation errors
 */
const sendErrorResponse = (res, statusCode, message, errors = null) => {
  const response = {
    status: "error",
    message,
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};

/**
 * Send a paginated response with metadata
 * @param {object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {array} data - Data array
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @param {string} message - Success message
 */
const sendPaginatedResponse = (
  res,
  statusCode,
  data,
  page,
  limit,
  total,
  message = "Data retrieved successfully"
) => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return res.status(statusCode).json({
    status: "success",
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    },
  });
};

module.exports = {
  sendSuccessResponse,
  sendErrorResponse,
  sendPaginatedResponse,
};
