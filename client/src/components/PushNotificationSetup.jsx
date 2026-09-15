import usePushNotification from "../hooks/usePushNotification";

function PushNotificationSetup() {
  const {
    isSupported,
    isSubscribed,
    permission,
    loading,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotification();

  if (!isSupported) {
    return (
      <div className="push-card push-card-unsupported">
        <div className="push-card-icon">🔕</div>
        <div className="push-card-body">
          <h3 className="push-card-title">Push Alerts Unavailable</h3>
          <p className="push-card-desc">
            Your browser doesn't support push notifications. Try Chrome or Edge on Android/Desktop.
          </p>
        </div>
      </div>
    );
  }

  if (permission === "denied") {
    return (
      <div className="push-card push-card-denied">
        <div className="push-card-icon">🚫</div>
        <div className="push-card-body">
          <h3 className="push-card-title">Notifications Blocked</h3>
          <p className="push-card-desc">
            You've blocked notifications. Go to your browser settings → Site Permissions → Allow notifications for this site.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`push-card ${isSubscribed ? "push-card-active" : "push-card-inactive"}`}>
      {/* Animated bell */}
      <div className={`push-card-icon ${isSubscribed ? "push-bell-ring" : ""}`}>
        {isSubscribed ? "🔔" : "🔕"}
      </div>

      <div className="push-card-body">
        <div className="push-card-header">
          <h3 className="push-card-title">
            {isSubscribed ? "Live Alerts Active ✅" : "Enable Live Alerts"}
          </h3>
          {isSubscribed && (
            <span className="push-card-badge">ON</span>
          )}
        </div>

        <p className="push-card-desc">
          {isSubscribed
            ? "You'll get an instant buzz on your phone/laptop whenever a new Lost or Found report is submitted — even when this tab is closed!"
            : "Get an instant buzz alert on your phone or laptop whenever someone reports a lost or found item — just like a government emergency alert!"
          }
        </p>

        {error && (
          <p className="push-card-error">⚠️ {error}</p>
        )}

        <button
          className={`push-card-btn ${isSubscribed ? "push-card-btn-off" : "push-card-btn-on"}`}
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={loading}
          id="push-toggle-btn"
        >
          {loading
            ? "⏳ Please wait..."
            : isSubscribed
              ? "🔕 Disable Alerts"
              : "🔔 Enable Alerts — Get Notified!"
          }
        </button>
      </div>
    </div>
  );
}

export default PushNotificationSetup;
