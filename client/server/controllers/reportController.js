const Report = require("../models/Report");
const User = require("../models/User");
const {
  sendReportCreatedEmail,
  sendSmartMatchEmail,
  sendReturnedEmail,
  sendStatusUpdateEmail,
  sendNewClaimReceivedEmail,
  sendClaimStatusEmail,
} = require("../services/emailService");
const {
  sendPushToAllUsers,
  sendPushToUsers,
} = require("../services/pushService");
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
      verificationQuestion,
      custodyType,
      custodyLocation,
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
      verificationQuestion: verificationQuestion || "",
      custodyType: custodyType || "with_reporter",
      custodyLocation: custodyLocation || "",
    });

    // ✅ Respond IMMEDIATELY — user gets success in milliseconds
    res.status(201).json({
      message: "Report Submitted Successfully!",
      report,
    });

    // 📧🔔 Emails + Push run in the background — do NOT block the response
    setImmediate(async () => {
      try {
        // 1. Send Report Created Email to student
        await sendReportCreatedEmail(req.user, report);

        // 2. Broadcast push alert to ALL subscribed users (like emergency alert)
        await sendPushToAllUsers({
          title: reportType === "lost"
            ? "🔴 Lost Item Reported!"
            : "🟢 Found Item Reported!",
          body: `${report.itemName} — near ${report.location}. Tap to view.`,
          icon: "/vignan_logo.jpg",
          badge: "/vignan_logo.jpg",
          url: "/lost",
          tag: `report-${report._id}`,
        });

        // 3. Check for Smart Matches against active opposite reports
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
              // Send match emails to both users
              await sendSmartMatchEmail(
                candidate.user, candidate, report,
                matchResult.score, matchResult.reasons
              );
              await sendSmartMatchEmail(
                req.user, report, candidate,
                matchResult.score, matchResult.reasons
              );

              // Send match push alert to BOTH matched users only
              await sendPushToUsers(
                [candidate.user._id, userId],
                {
                  title: "🎯 Match Found!",
                  body: `Your "${report.itemName}" may have been found! Tap to view the match.`,
                  icon: "/vignan_logo.jpg",
                  badge: "/vignan_logo.jpg",
                  url: "/matches",
                  tag: `match-${report._id}`,
                  vibrate: [200, 100, 200, 100, 200],
                }
              );
            }
          }
        }
      } catch (emailError) {
        console.error("⚠️ Background Email/Push Error:", emailError.message);
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

    if (req.body.custodyType) {
      report.custodyType = req.body.custodyType;
    }
    if (req.body.custodyLocation !== undefined) {
      report.custodyLocation = req.body.custodyLocation;
    }

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

    // 📧🔔 Send returned email + push in the background
    setImmediate(async () => {
      try {
        await sendReturnedEmail(req.user, updatedReport);
        await sendPushToUsers(
          [req.user._id],
          {
            title: "✅ Item Returned!",
            body: `Your "${updatedReport.itemName}" has been successfully marked as returned.`,
            icon: "/vignan_logo.jpg",
            badge: "/vignan_logo.jpg",
            url: "/my-reports",
            tag: `returned-${updatedReport._id}`,
            vibrate: [300, 100, 300],
          }
        );
      } catch (emailError) {
        console.error("⚠️ Returned Email/Push Error:", emailError.message);
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
// Submit Claim (Proof of Ownership)
// ==============================
const submitClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { proofAnswer, contactPhone } = req.body;

    if (!proofAnswer || !proofAnswer.trim()) {
      return res.status(400).json({ message: "Proof of ownership answer is required." });
    }

    const report = await Report.findById(id).populate("user", "name email");
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.status === "returned") {
      return res.status(400).json({ message: "This item has already been returned to its owner." });
    }

    if (report.reportType !== "found") {
      return res.status(400).json({ message: "Claims can only be submitted for found items." });
    }

    // A user cannot claim an item they themselves reported
    if (report.user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot claim an item that you reported finding." });
    }

    // Check if the user already submitted a pending or approved claim for this report
    const existingClaim = report.claims.find(
      (c) => c.claimant.toString() === req.user._id.toString() && c.status !== "rejected"
    );

    if (existingClaim) {
      return res.status(400).json({
        message: existingClaim.status === "approved"
          ? "Your claim has already been approved for this item!"
          : "You already have a pending claim submitted for this item.",
      });
    }

    const newClaim = {
      claimant: req.user._id,
      claimantName: req.user.name,
      claimantEmail: req.user.email,
      proofAnswer: proofAnswer.trim(),
      contactPhone: (contactPhone || "").trim(),
      status: "pending",
      createdAt: new Date(),
    };

    report.claims.push(newClaim);
    await report.save();

    // Respond immediately
    res.status(201).json({
      message: "Proof of ownership submitted! The finder has been notified to review your claim.",
      claim: newClaim,
    });

    // Notify finder in background
    setImmediate(async () => {
      try {
        if (report.user && report.user.email) {
          await sendNewClaimReceivedEmail(report.user, report, newClaim);
          await sendPushToUsers([report.user._id], {
            title: "🔐 New Claim Received!",
            body: `${req.user.name} submitted proof for found "${report.itemName}". Tap to review.`,
            icon: "/vignan_logo.jpg",
            url: "/my-reports",
          });
        }
      } catch (err) {
        console.error("⚠️ Claim notification error:", err.message);
      }
    });
  } catch (error) {
    console.error("Submit Claim Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// Review Claim (Approve or Reject by Finder)
// ==============================
const reviewClaim = async (req, res) => {
  try {
    const { id, claimId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Status must be either 'approved' or 'rejected'." });
    }

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Only the reporter (finder) can review claims
    if (report.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only the finder can review claims for this item." });
    }

    const claim = report.claims.id(claimId);
    if (!claim) {
      return res.status(404).json({ message: "Claim not found" });
    }

    claim.status = status;
    claim.reviewedAt = new Date();

    await report.save();

    res.json({
      message: status === "approved"
        ? "Claim approved! Your contact details have been shared with the claimant."
        : "Claim has been rejected.",
      report,
    });

    // Send notifications to claimant in background
    setImmediate(async () => {
      try {
        const claimant = await User.findById(claim.claimant);
        if (claimant && claimant.email) {
          await sendClaimStatusEmail(claimant, report, status, req.user);
          await sendPushToUsers([claimant._id], {
            title: status === "approved" ? "🎉 Claim Approved!" : "Claim Update",
            body: status === "approved"
              ? `Your claim for "${report.itemName}" was approved! Finder contact: ${req.user.email}`
              : `Your claim for "${report.itemName}" was not approved by the finder.`,
            icon: "/vignan_logo.jpg",
            url: "/my-reports",
          });
        }
      } catch (err) {
        console.error("⚠️ Claim review notification error:", err.message);
      }
    });
  } catch (error) {
    console.error("Review Claim Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==============================
// Get All Claims Submitted By Current User
// ==============================
const getMyClaims = async (req, res) => {
  try {
    const reports = await Report.find({
      "claims.claimant": req.user._id,
    })
      .populate("user", "name email")
      .sort({ updatedAt: -1 });

    const userClaims = [];

    reports.forEach((report) => {
      const myClaim = report.claims.find(
        (c) => c.claimant.toString() === req.user._id.toString()
      );

      if (myClaim) {
        userClaims.push({
          reportId: report._id,
          itemName: report.itemName,
          category: report.category,
          location: report.location,
          date: report.date,
          image: report.image,
          reportStatus: report.status,
          verificationQuestion: report.verificationQuestion,
          claimId: myClaim._id,
          proofAnswer: myClaim.proofAnswer,
          contactPhone: myClaim.contactPhone,
          status: myClaim.status,
          createdAt: myClaim.createdAt,
          reviewedAt: myClaim.reviewedAt,
          finder: myClaim.status === "approved"
            ? { name: report.user?.name || "Finder", email: report.user?.email || "" }
            : null,
        });
      }
    });

    res.json(userClaims);
  } catch (error) {
    console.error("Get My Claims Error:", error);
    res.status(500).json({ message: error.message });
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
  submitClaim,
  reviewClaim,
  getMyClaims,
};