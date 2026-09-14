import { useNotification } from "../context/NotificationContext";

function NotificationToast() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      {notifications.map((item) => (
        <div
          key={item.id}
          className={`toast-banner ${item.isEmail ? "toast-email" : ""} toast-${item.type}`}
        >
          <div className="toast-icon-wrapper">
            {item.isEmail ? (
              <span className="toast-icon toast-icon-email">📧</span>
            ) : item.type === "success" ? (
              <span className="toast-icon">✅</span>
            ) : item.type === "error" ? (
              <span className="toast-icon">❌</span>
            ) : item.type === "match" ? (
              <span className="toast-icon">🤝</span>
            ) : (
              <span className="toast-icon">ℹ️</span>
            )}
          </div>

          <div className="toast-body">
            {item.isEmail && (
              <span className="toast-badge">EMAIL NOTIFICATION</span>
            )}
            <h4 className="toast-title">
              {item.title || (item.isEmail ? "Email Alert Dispatched" : "Notification")}
            </h4>
            <p className="toast-message">{item.message}</p>
          </div>

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
