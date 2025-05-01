const Admin = require("../models/admin.model");
const logger = require("../../../utils/logger");

/**
 * Find admin by email
 * @param {string} email - Admin email
 * @returns {Promise<object|null>} - Admin with password or null
 */
const findAdminByEmail = async (email) => {
  try {
    return await Admin.findOne({ email }).select("+password");
  } catch (error) {
    logger.error(`Error finding admin by email: ${error.message}`);
    return null;
  }
};

/**
 * Verify admin password
 * @param {object} admin - Admin object with password field
 * @param {string} password - Password to verify
 * @returns {Promise<boolean>} - Whether password matches
 */
const verifyPassword = async (admin, password) => {
  try {
    return await admin.matchPassword(password);
  } catch (error) {
    logger.error(`Error verifying admin password: ${error.message}`);
    return false;
  }
};

/**
 * Update admin last login time
 * @param {object} admin - Admin object
 * @returns {Promise<boolean>} - Whether update was successful
 */
const updateLastLogin = async (admin) => {
  try {
    admin.lastLogin = Date.now();
    await admin.save({ validateBeforeSave: false });
    return true;
  } catch (error) {
    logger.error(`Error updating admin last login: ${error.message}`);
    return false;
  }
};

/**
 * Generate token response for admin
 * @param {object} admin - Admin object
 * @returns {object} - Token response
 */
const generateTokenResponse = (admin) => {
  // Create token
  const token = admin.getSignedJwtToken();

  // Prepare admin data
  const adminData = {
    id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    permissions: admin.permissions,
  };

  return {
    token,
    admin: adminData,
  };
};

/**
 * Initialize first admin if none exists
 * @returns {Promise<boolean>} - Whether initialization was successful
 */
const initializeAdmin = async () => {
  try {
    await Admin.createInitialAdmin();
    return true;
  } catch (error) {
    logger.error(`Error initializing admin: ${error.message}`);
    return false;
  }
};

module.exports = {
  findAdminByEmail,
  verifyPassword,
  updateLastLogin,
  generateTokenResponse,
  initializeAdmin,
};
