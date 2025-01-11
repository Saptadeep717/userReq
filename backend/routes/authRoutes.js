const express = require("express");
const router = express.Router();
const { signup, login } = require("../controllers/authController.js");

// Signup Route
router.post("/signup", signup);

// Login Route
router.post("/login", login);

module.exports = router;
