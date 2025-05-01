const express = require("express");
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/user.controller");
const { protect, authorize } = require("../middleware/auth");
const {
  validateCreateUser,
  validateUpdateUser,
} = require("../validators/user.validator");

const router = express.Router();

// All routes below this line require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(getUsers).post(validateCreateUser, createUser);

router
  .route("/:id")
  .get(getUser)
  .put(validateUpdateUser, updateUser)
  .delete(deleteUser);

module.exports = router;
