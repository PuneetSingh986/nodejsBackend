const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AdminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [50, "Name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't return password in queries
    },
    role: {
      type: String,
      enum: ["super-admin", "admin", "manager", "support", "content-manager"],
      default: "support",
    },
    permissions: {
      customers: {
        read: {
          type: Boolean,
          default: false,
        },
        write: {
          type: Boolean,
          default: false,
        },
        delete: {
          type: Boolean,
          default: false,
        },
      },
      orders: {
        read: {
          type: Boolean,
          default: false,
        },
        write: {
          type: Boolean,
          default: false,
        },
        delete: {
          type: Boolean,
          default: false,
        },
      },
      products: {
        read: {
          type: Boolean,
          default: false,
        },
        write: {
          type: Boolean,
          default: false,
        },
        delete: {
          type: Boolean,
          default: false,
        },
      },
      // Add more resources as needed
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Set default permissions based on role
AdminSchema.pre("save", async function (next) {
  // Only run this if role was modified or it's a new document
  if (!this.isModified("role") && !this.isNew) {
    return next();
  }

  // Set permissions based on role
  if (this.role === "super-admin") {
    // Super admin has all permissions
    Object.keys(this.permissions).forEach((resource) => {
      this.permissions[resource].read = true;
      this.permissions[resource].write = true;
      this.permissions[resource].delete = true;
    });
  } else if (this.role === "admin") {
    // Admin has read/write but not delete for most resources
    Object.keys(this.permissions).forEach((resource) => {
      this.permissions[resource].read = true;
      this.permissions[resource].write = true;
      this.permissions[resource].delete = false;
    });
  } else if (this.role === "manager") {
    // Manager has read for all and write for some
    Object.keys(this.permissions).forEach((resource) => {
      this.permissions[resource].read = true;
      this.permissions[resource].write = ["customers", "orders"].includes(
        resource
      );
      this.permissions[resource].delete = false;
    });
  } else if (this.role === "support") {
    // Support has only read for customers and orders
    Object.keys(this.permissions).forEach((resource) => {
      this.permissions[resource].read = ["customers", "orders"].includes(
        resource
      );
      this.permissions[resource].write = false;
      this.permissions[resource].delete = false;
    });
  } else if (this.role === "content-manager") {
    // Content manager has read/write for products only
    Object.keys(this.permissions).forEach((resource) => {
      this.permissions[resource].read = resource === "products";
      this.permissions[resource].write = resource === "products";
      this.permissions[resource].delete = false;
    });
  }

  next();
});

// Encrypt password using bcrypt
AdminSchema.pre("save", async function (next) {
  // Only run this if password was modified
  if (!this.isModified("password")) {
    return next();
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Sign JWT and return
AdminSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      isAdmin: true,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRE || "1d",
    }
  );
};

// Match password
AdminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Static method to create initial super-admin if none exists
AdminSchema.statics.createInitialAdmin = async function () {
  const adminCount = await this.countDocuments();

  if (adminCount === 0) {
    const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || "admin@example.com";
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || "admin123";

    await this.create({
      name: "System Administrator",
      email: defaultEmail,
      password: defaultPassword,
      role: "super-admin",
    });

    console.log(`Initial super-admin created with email: ${defaultEmail}`);
  }
};

module.exports = mongoose.model("Admin", AdminSchema);
