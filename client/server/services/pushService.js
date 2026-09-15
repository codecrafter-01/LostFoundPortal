const webpush = require("web-push");
const User = require("../models/User");

// =====================================
// Configure VAPID Keys
// =====================================
const initWebPush = () => {
  const { VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_EMAIL } = process.env;

  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.log("ℹ️ [PushService] VAPID keys not set. Push notifications disabled.");
    return false;
  }

  webpush.setVapidDetails(
    VAPID_EMAIL || "mailto:admin@vignan.ac.in",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
  return true;
};

// =====================================
// Send Push to a Single User
// =====================================
const sendPushToUser = async (subscription, payload) => {
  if (!subscription) return;

  if (!initWebPush()) return;

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
    console.log("✅ [PushService] Push sent successfully");
  } catch (err) {
    // 410 = subscription expired/unsubscribed — clean it up
    if (err.statusCode === 410 || err.statusCode === 404) {
      console.log("ℹ️ [PushService] Stale subscription removed");
      await User.updateOne(
        { "pushSubscription.endpoint": subscription.endpoint },
        { $set: { pushSubscription: null } }
      );
    } else {
      console.error("❌ [PushService] Push send error:", err.message);
    }
  }
};

// =====================================
// Broadcast Push to ALL Subscribed Users
// (Like an emergency alert — everyone gets it)
// =====================================
const sendPushToAllUsers = async (payload) => {
  if (!initWebPush()) return;

  try {
    const users = await User.find({
      pushSubscription: { $ne: null },
    }).select("pushSubscription");

    if (users.length === 0) {
      console.log("ℹ️ [PushService] No subscribed users to notify");
      return;
    }

    console.log(`📢 [PushService] Broadcasting push to ${users.length} user(s)...`);

    const results = await Promise.allSettled(
      users.map((user) => sendPushToUser(user.pushSubscription, payload))
    );

    const sent = results.filter((r) => r.status === "fulfilled").length;
    console.log(`✅ [PushService] Broadcast complete: ${sent}/${users.length} delivered`);
  } catch (err) {
    console.error("❌ [PushService] Broadcast error:", err.message);
  }
};

// =====================================
// Send Push to a Specific List of Users
// (For match alerts — only the two matched users)
// =====================================
const sendPushToUsers = async (userIds, payload) => {
  if (!initWebPush()) return;

  try {
    const users = await User.find({
      _id: { $in: userIds },
      pushSubscription: { $ne: null },
    }).select("pushSubscription");

    await Promise.allSettled(
      users.map((user) => sendPushToUser(user.pushSubscription, payload))
    );
  } catch (err) {
    console.error("❌ [PushService] Targeted push error:", err.message);
  }
};

module.exports = {
  sendPushToUser,
  sendPushToAllUsers,
  sendPushToUsers,
};
