const request = require("supertest");
const mongoose = require("mongoose");
const { StatusCodes } = require("http-status-codes");
const app = require("../../src/server");
const User = require("../../src/models/user.model");

describe("Auth Endpoints", () => {
  beforeAll(async () => {
    // Clear the users collection before tests
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Close MongoDB connection after tests are complete
    await mongoose.connection.close();
  });

  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  };

  // Test user registration
  describe("POST /api/v1/auth/register", () => {
    it("should register a new user and return token", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(res.statusCode).toEqual(StatusCodes.CREATED);
      expect(res.body).toHaveProperty("token");
      expect(res.body.data.user).toHaveProperty("name", testUser.name);
      expect(res.body.data.user).toHaveProperty(
        "email",
        testUser.email.toLowerCase()
      );
      expect(res.body.data.user).not.toHaveProperty("password");
    });

    it("should not register user with same email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(testUser);

      expect(res.statusCode).toEqual(StatusCodes.CONFLICT);
      expect(res.body.message).toContain("Duplicate");
    });

    it("should not register user without required fields", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ name: "Test User" });

      expect(res.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(res.body.message).toContain("Validation error");
    });
  });

  // Test user login
  describe("POST /api/v1/auth/login", () => {
    it("should login user and return token", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toEqual(StatusCodes.OK);
      expect(res.body).toHaveProperty("token");
      expect(res.body.data.user).toHaveProperty(
        "email",
        testUser.email.toLowerCase()
      );
    });

    it("should not login with incorrect password", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(res.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(res.body.message).toContain("Invalid credentials");
    });

    it("should not login with non-existent email", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({
        email: "nonexistent@example.com",
        password: "password123",
      });

      expect(res.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(res.body.message).toContain("Invalid credentials");
    });
  });
});
