import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

// Format relative time ("Just now", "2 min ago", etc.)
const formatRelativeTime = (isoString) => {
  if (!isoString) return "";
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 10) return "Just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  return `${Math.floor(diff / 3600)}h ago`;
};

const getIcon = (type, isEmail) => {
  if (isEmail) return "📧";
  if (type === "success") return "✅";
  if (type === "error") return "❌";
  if (type === "match") return "🎯";
  if (type === "warning") return "⚠️";
  return "🔔";
};

function NotificationToast() {
  const navigate = useNavigate();
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {notifications.map((item) => (
        <div
          key={item.id}
          className={`toast-banner ${item.isEmail ? "toast-email" : ""} toast-${item.type}`}
        >
          {/* Icon */}
          <div className="toast-icon-wrapper">
            <span className={`toast-icon ${item.isEmail ? "toast-icon-email" : ""}`}>
              {getIcon(item.type, item.isEmail)}
            </span>
          </div>

          {/* Body */}
          <div className="toast-body">
            {item.isEmail && (
              <span className="toast-badge">📬 EMAIL SENT</span>
            )}
            <h4 className="toast-title">
              {item.title || (item.isEmail ? "Email Notification Sent" : "Notification")}
            </h4>
            <p className="toast-message">{item.message}</p>

            {/* Bottom row: timestamp + action button */}
            <div className="toast-footer">
              <span className="toast-time">{formatRelativeTime(item.timestamp)}</span>
              {item.actionUrl && (
                <button
                  className="toast-action-btn"
                  onClick={() => {
                    removeNotification(item.id);
                    navigate(item.actionUrl);
                  }}
                >
                  {item.actionLabel || "View Report"}
                </button>
              )}
            </div>
          </div>

          {/* Close */}
          <button
            className="toast-close-btn"
            onClick={() => removeNotification(item.id)}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default NotificationToast;

