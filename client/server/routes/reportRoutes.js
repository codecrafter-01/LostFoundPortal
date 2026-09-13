const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");
const protect = require("../middleware/authMiddleware");

const {
  createReport,
  getReports,
  getStats,
  updateReport,
  markAsReturned,
  deleteReport,
} = require("../controllers/reportController");


// ==============================
// Dashboard Statistics
// PUBLIC
// ==============================

router.get(
  "/stats",
  getStats
);


// ==============================
// Get All Reports
// PUBLIC
// ==============================

router.get(
  "/",
  getReports
);


// ==============================
// Create Report
// LOGIN REQUIRED
// ==============================

router.post(
  "/",
  protect,
  upload.single("image"),
  createReport
);


// ==============================
// Update Report
// LOGIN REQUIRED
// ==============================

router.put(
  "/:id",
  protect,
  upload.single("image"),
  updateReport
);


// ==============================
// Mark Report as Returned
// LOGIN REQUIRED
// ==============================

router.put(
  "/:id/returned",
  protect,
  markAsReturned
);


// ==============================
// Delete Report
// LOGIN REQUIRED
// ==============================

router.delete(
  "/:id",
  protect,
  deleteReport
);


module.exports = router;