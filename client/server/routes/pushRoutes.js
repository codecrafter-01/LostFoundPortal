const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const User = require("../models/User");

// ==============================
// Subscribe — save push subscription
// LOGIN REQUIRED
// ==============================
router.post("/subscribe", protect, async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: "Invalid subscription object" });
    }

    await User.findByIdAndUpdate(
      req.user._id,
      { pushSubscription: subscription },
      { new: true }
    );

    console.log(`✅ [PushRoutes] User ${req.user.email} subscribed to push notifications`);
    res.json({ message: "Push subscription saved successfully" });

  } catch (error) {
    console.error("❌ [PushRoutes] Subscribe error:", error.message);
    res.status(500).json({ message: "Failed to save subscription" });
  }
});

// ==============================
// Unsubscribe — remove push subscription
// LOGIN REQUIRED
// ==============================
router.delete("/unsubscribe", protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { pushSubscription: null });
    console.log(`ℹ️ [PushRoutes] User ${req.user.email} unsubscribed from push notifications`);
    res.json({ message: "Unsubscribed successfully" });
  } catch (error) {
    console.error("❌ [PushRoutes] Unsubscribe error:", error.message);
    res.status(500).json({ message: "Failed to unsubscribe" });
  }
});

// ==============================
// Get VAPID public key
// PUBLIC (browser needs this to subscribe)
// ==============================
router.get("/vapid-public-key", (req, res) => {
  const key = process.env.VAPID_PUBLIC_KEY;
  if (!key) {
    return res.status(503).json({ message: "Push notifications not configured" });
  }
  res.json({ publicKey: key });
});

module.exports = router;
