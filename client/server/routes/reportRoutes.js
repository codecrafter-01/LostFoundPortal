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
  submitClaim,
  reviewClaim,
  getMyClaims,
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
// Get My Claims
// LOGIN REQUIRED
// ==============================
router.get(
  "/claims/my",
  protect,
  getMyClaims
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
// Submit Claim (Proof of Ownership)
// LOGIN REQUIRED
// ==============================
router.post(
  "/:id/claim",
  protect,
  submitClaim
);


// ==============================
// Review Claim (Approve/Reject by Finder)
// LOGIN REQUIRED
// ==============================
router.put(
  "/:id/claims/:claimId/review",
  protect,
  reviewClaim
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