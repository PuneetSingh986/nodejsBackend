const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const CustomerSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
      match: [/^\+?[1-9]\d{9,14}$/, "Please provide a valid phone number"],
    },
    firstName: {
      type: String,
      trim: true,
      maxlength: [50, "First name cannot be more than 50 characters"],
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: [50, "Last name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
      sparse: true, // Allows multiple null values (not required)
      lowercase: true,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    isPhoneVerified: {
      type: Boolean,
      default: false,
    },
    otp: {
      code: {
        type: String,
        select: false, // Don't return code in queries
      },
      expiresAt: {
        type: Date,
        select: false, // Don't return expiration in queries
      },
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer not to say"],
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Generate signed JWT token
CustomerSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: "customer" }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Generate OTP for phone verification
CustomerSchema.methods.generateOTP = async function () {
  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash the OTP
  const salt = await bcrypt.genSalt(10);
  const hashedOTP = await bcrypt.hash(otp, salt);

  // Set OTP and expiration (5 minutes from now)
  this.otp = {
    code: hashedOTP,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };

  await this.save();

  // Return the plain text OTP (to be sent to user)
  return otp;
};

// Verify OTP
CustomerSchema.methods.verifyOTP = async function (enteredOTP) {
  // Get customer with OTP fields (which are normally excluded from queries)
  const customer = await this.constructor
    .findById(this._id)
    .select("+otp.code +otp.expiresAt");

  // Check if OTP has expired
  if (Date.now() > customer.otp.expiresAt) {
    return false;
  }

  // Compare the entered OTP with the hashed OTP in database
  return await bcrypt.compare(enteredOTP, customer.otp.code);
};

module.exports = mongoose.model("Customer", CustomerSchema);
