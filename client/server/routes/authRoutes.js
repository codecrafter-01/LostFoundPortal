const express = require("express");

const router = express.Router();

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");


// ==============================
// Register
// PUBLIC
// ==============================

router.post(
  "/register",
  registerUser
);


// ==============================
// Login
// PUBLIC
// ==============================

router.post(
  "/login",
  loginUser
);


module.exports = router;