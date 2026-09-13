const jwt = require("jsonwebtoken");
const User = require("../models/User");

// =====================================
// Authentication Middleware
// =====================================
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check Authorization header
    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return res.status(401).json({
        message: "Not Authorized. Please login.",
      });
    }

    // Get token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Get user from database
    const user = await User.findById(decoded.id).select(
      "-password"
    );

    if (!user) {
      return res.status(401).json({
        message: "User not found. Please login again.",
      });
    }

    // Attach user to request
    req.user = user;

    next();

  } catch (error) {
    console.error(
      "Authentication Error:",
      error.message
    );

    return res.status(401).json({
      message: "Invalid or expired token. Please login again.",
    });
  }
};

module.exports = protect;