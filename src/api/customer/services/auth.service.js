const Customer = require("../models/customer.model");
const otpService = require("./otp.service");
const logger = require("../../../utils/logger");

/**
 * Find a customer by phone number or ID
 * @param {string} phone - Customer phone number
 * @param {string} customerId - Customer ID
 * @returns {Promise<object|null>} - Customer or null
 */
const findCustomerByPhone = async (phone, customerId = null) => {
  try {
    if (customerId) {
      return await Customer.findById(customerId);
    }
    return await Customer.findOne({ phone });
  } catch (error) {
    logger.error(`Error finding customer: ${error.message}`);
    return null;
  }
};

/**
 * Create a new customer with phone number
 * @param {string} phone - Customer phone number
 * @returns {Promise<object|null>} - Created customer or null
 */
const createCustomer = async (phone) => {
  try {
    return await Customer.create({
      phone,
      isPhoneVerified: false,
      profileCompleted: false,
    });
  } catch (error) {
    logger.error(`Error creating customer: ${error.message}`);
    return null;
  }
};

/**
 * Generate and send OTP to customer
 * @param {object} customer - Customer object
 * @returns {Promise<boolean>} - Whether OTP was sent successfully
 */
const generateAndSendOTP = async (customer) => {
  try {
    // Generate OTP
    const otp = await customer.generateOTP();

    // Send OTP
    return await otpService.sendOTP(customer.phone, otp);
  } catch (error) {
    logger.error(`Error generating and sending OTP: ${error.message}`);
    return false;
  }
};

/**
 * Verify customer OTP
 * @param {string} customerId - Customer ID
 * @param {string} otp - OTP to verify
 * @returns {Promise<object|null>} - Customer if OTP is valid, null otherwise
 */
const verifyCustomerOTP = async (customerId, otp) => {
  try {
    // Find customer
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return null;
    }

    // Verify OTP
    const isValidOTP = await customer.verifyOTP(otp);

    if (!isValidOTP) {
      return null;
    }

    // Mark phone as verified
    customer.isPhoneVerified = true;
    await customer.save();

    return customer;
  } catch (error) {
    logger.error(`Error verifying customer OTP: ${error.message}`);
    return null;
  }
};

/**
 * Complete customer profile
 * @param {string} customerId - Customer ID
 * @param {object} profileData - Profile data
 * @returns {Promise<object|null>} - Updated customer or null
 */
const completeCustomerProfile = async (customerId, profileData) => {
  try {
    const { firstName, lastName, email, ...additionalInfo } = profileData;

    // Find customer
    const customer = await Customer.findById(customerId);

    if (!customer) {
      return null;
    }

    // Update profile
    customer.firstName = firstName;
    customer.lastName = lastName;
    if (email) customer.email = email;

    // Handle additional info
    if (additionalInfo.address) customer.address = additionalInfo.address;
    if (additionalInfo.dateOfBirth)
      customer.dateOfBirth = additionalInfo.dateOfBirth;
    if (additionalInfo.gender) customer.gender = additionalInfo.gender;

    // Mark profile as completed
    customer.profileCompleted = true;

    await customer.save();

    return customer;
  } catch (error) {
    logger.error(`Error completing customer profile: ${error.message}`);
    return null;
  }
};

/**
 * Generate token response for customer
 * @param {object} customer - Customer object
 * @returns {object} - Token response
 */
const generateTokenResponse = (customer) => {
  // Create token
  const token = customer.getSignedJwtToken();

  // Prepare customer data with only necessary fields
  const customerData = {
    id: customer._id,
    phone: customer.phone,
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    isPhoneVerified: customer.isPhoneVerified,
    profileCompleted: customer.profileCompleted,
  };

  return {
    token,
    customer: customerData,
  };
};

/**
 * Update customer's last login timestamp
 * @param {string} customerId - Customer ID
 * @returns {Promise<boolean>} - Whether update was successful
 */
const updateLastLogin = async (customerId) => {
  try {
    const result = await Customer.findByIdAndUpdate(
      customerId,
      { lastLogin: Date.now() },
      { new: true }
    );
    return !!result;
  } catch (error) {
    logger.error(`Error updating last login: ${error.message}`);
    return false;
  }
};

module.exports = {
  findCustomerByPhone,
  createCustomer,
  generateAndSendOTP,
  verifyCustomerOTP,
  completeCustomerProfile,
  generateTokenResponse,
  updateLastLogin,
};
