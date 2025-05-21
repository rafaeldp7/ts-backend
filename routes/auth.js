const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");
const authController = require("../controllers/authController.js");



console.log("authController:", authController);

// PUBLIC ROUTES
router.get("/", authController.status);
router.post("/register", authController.register);
router.get("/verify/:token", authController.verifyEmail);
router.post("/login", authController.login);
router.get("/first-user-name", authController.getFirstUserName);
router.get("/user-growth", authController.getUserGrowth);
router.get("/user-count", authController.getUserCount);
router.get("/new-users-this-month", authController.getNewUsersThisMonth);


// PROTECTED ROUTES
router.get("/profile", authMiddleware, authController.getProfile);
router.get("/users", authController.getAllUsers);
router.delete("/delete-account", authMiddleware, authController.deleteAccount);

module.exports = router;
