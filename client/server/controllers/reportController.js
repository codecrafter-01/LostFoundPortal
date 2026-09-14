const Report = require("../models/Report");
const User = require("../models/User");
const {
  sendReportCreatedEmail,
  sendSmartMatchEmail,
  sendReturnedEmail,
  sendStatusUpdateEmail,
} = require("../services/emailService");
const { calculateMatchScore } = require("../utils/matchUtils");

// ==============================
// Create Report
// ==============================
const createReport = async (req, res) => {
  try {
    const {
      itemName,
      category,
      location,
      date,
      description,
      reportType,
    } = req.body;

    const image = req.file
      ? `/uploads/${req.file.filename}`
      : "";

    // User is taken from the verified JWT, NOT from the browser request.
    const userId = req.user._id;

    const report = await Report.create({
      itemName,
      category,
      location,
      date,
      description,
      image,
      reportType,
      user: userId,
      status: "active",
      returnedAt: null,
    });

    // ✅ Respond IMMEDIATELY — user gets success in milliseconds
    res.status(201).json({
      message: "Report Submitted Successfully!",
      report,
    });

    // 📧 Emails run in the background — do NOT block the response
    setImmediate(async () => {
      try {
        // 1. Send Report Created Email to student
        await sendReportCreatedEmail(req.user, report);

        // 2. Check for Smart Matches against active opposite reports
        const oppositeType = reportType === "lost" ? "found" : "lost";
        const candidateReports = await Report.find({
          status: "active",
          reportType: oppositeType,
          user: { $ne: userId },
        }).populate("user", "name email");

        for (const candidate of candidateReports) {
          if (candidate.user && candidate.user.email) {
            const matchResult = calculateMatchScore(report, candidate);
            if (matchResult.isMatch) {
              // Notify the matched item owner
              await sendSmartMatchEmail(
                candidate.user,
                candidate,
                report,
                matchResult.score,
                matchResult.reasons
              );
              // Notify the report creator
              await sendSmartMatchEmail(
                req.user,
                report,
                candidate,
                matchResult.score,
                matchResult.reasons
              );
            }
          }
        }
      } catch (emailError) {
        console.error("⚠️ Background Email Error:", emailError.message);
      }
    });

  } catch (error) {
    console.error("Create Report Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// ==============================
// Get All Reports
// PUBLIC ROUTE
// ==============================
const getReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(reports);

  } catch (error) {
    console.error(
      "Get Reports Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ==============================
// Dashboard Statistics
// PUBLIC ROUTE
// ==============================
const getStats = async (req, res) => {
  try {
    const totalUsers =
      await User.countDocuments();

    const totalLost =
      await Report.countDocuments({
        reportType: "lost",
      });

    const totalFound =
      await Report.countDocuments({
        reportType: "found",
      });

    const totalReports =
      await Report.countDocuments();

    const activeReports =
      await Report.countDocuments({
        status: "active",
      });

    const returnedReports =
      await Report.countDocuments({
        status: "returned",
      });

    res.json({
      totalUsers,
      totalLost,
      totalFound,
      totalReports,
      activeReports,
      returnedReports,
    });

  } catch (error) {
    console.error(
      "Dashboard Stats Error:",
      error
    );

    res.status(500).json({
      message:
        "Failed to load dashboard statistics",
    });
  }
};


// ==============================
// Update Report
// ==============================
const updateReport = async (req, res) => {
  try {
    const report =
      await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // Check ownership
    if (
      report.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to edit this report",
      });
    }

    // Returned reports cannot be edited
    if (report.status === "returned") {
      return res.status(400).json({
        message:
          "Returned reports cannot be edited",
      });
    }

    report.itemName =
      req.body.itemName;

    report.category =
      req.body.category;

    report.location =
      req.body.location;

    report.date =
      req.body.date;

    report.description =
      req.body.description;

    if (req.file) {
      report.image =
        `/uploads/${req.file.filename}`;
    }

    const updatedReport = await report.save();

    // ✅ Respond immediately
    res.json({
      message: "Report Updated Successfully",
      report: updatedReport,
    });

    // 📧 Send status update email in the background
    setImmediate(async () => {
      try {
        await sendStatusUpdateEmail(req.user, updatedReport);
      } catch (emailError) {
        console.error("⚠️ Status Update Email Error:", emailError.message);
      }
    });

  } catch (error) {
    console.error("Update Report Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// ==============================
// Mark Report as Returned
// ==============================
const markAsReturned = async (req, res) => {
  try {
    const report =
      await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // Check ownership
    if (
      report.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to modify this report",
      });
    }

    if (report.status === "returned") {
      return res.status(400).json({
        message:
          "This report is already marked as returned",
      });
    }

    report.status = "returned";
    report.returnedAt = new Date();

    const updatedReport = await report.save();

    // ✅ Respond immediately
    res.json({
      message: "Item marked as returned successfully!",
      report: updatedReport,
    });

    // 📧 Send returned email in the background
    setImmediate(async () => {
      try {
        await sendReturnedEmail(req.user, updatedReport);
      } catch (emailError) {
        console.error("⚠️ Returned Email Error:", emailError.message);
      }
    });

  } catch (error) {
    console.error("Mark Returned Error:", error);
    res.status(500).json({ message: error.message });
  }
};


// ==============================
// Delete Report
// ==============================
const deleteReport = async (req, res) => {
  try {
    const report =
      await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({
        message: "Report not found",
      });
    }

    // Check ownership
    if (
      report.user.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        message:
          "You are not allowed to delete this report",
      });
    }

    await Report.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Report Deleted Successfully",
    });

  } catch (error) {
    console.error(
      "Delete Report Error:",
      error
    );

    res.status(500).json({
      message: error.message,
    });
  }
};


// ==============================
// Export Controllers
// ==============================
module.exports = {
  createReport,
  getReports,
  getStats,
  updateReport,
  markAsReturned,
  deleteReport,
};