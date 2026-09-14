import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../context/NotificationContext";

// ── helpers ──────────────────────────────────────────────
const formatRelativeTime = (isoString) => {
  if (!isoString) return "";
  const diff = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
  if (diff < 10) return "Just now";
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(isoString).toLocaleDateString();
};

const getTypeIcon = (type, isEmail) => {
  if (isEmail) return "📧";
  if (type === "success") return "✅";
  if (type === "error") return "❌";
  if (type === "match") return "🎯";
  if (type === "warning") return "⚠️";
  return "🔔";
};

const getTypeColor = (type) => {
  if (type === "success") return "#22c55e";
  if (type === "error") return "#ef4444";
  if (type === "match") return "#a855f7";
  if (type === "warning") return "#f59e0b";
  return "#6366f1";
};

// ── component ─────────────────────────────────────────────
function NotificationBell() {
  const navigate = useNavigate();
  const { history, unreadCount, markAllRead, clearHistory } = useNotification();

  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const bellRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        bellRef.current &&
        !bellRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleOpen = () => {
    setOpen((prev) => !prev);
  };

  const handleViewItem = (item) => {
    if (item.actionUrl) {
      navigate(item.actionUrl);
    }
    setOpen(false);
  };

  return (
    <div className="notif-bell-wrapper">
      {/* Bell Button */}
      <button
        ref={bellRef}
        className={`notif-bell-btn ${open ? "notif-bell-open" : ""}`}
        onClick={handleOpen}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        title="Notifications"
      >
        <span className="notif-bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notif-bell-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
        )}
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div ref={panelRef} className="notif-panel">
          {/* Header */}
          <div className="notif-panel-header">
            <div className="notif-panel-title">
              <span>🔔</span>
              <span>Notifications</span>
              {unreadCount > 0 && (
                <span className="notif-panel-count">{unreadCount} new</span>
              )}
            </div>
            <div className="notif-panel-actions">
              {unreadCount > 0 && (
                <button className="notif-panel-btn" onClick={markAllRead}>
                  Mark all read
                </button>
              )}
              {history.length > 0 && (
                <button className="notif-panel-btn notif-panel-btn-clear" onClick={clearHistory}>
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="notif-panel-list">
            {history.length === 0 ? (
              <div className="notif-panel-empty">
                <span style={{ fontSize: "36px" }}>🔕</span>
                <p>No notifications yet</p>
                <small>Submit a report to see alerts here</small>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className={`notif-item ${!item.read ? "notif-item-unread" : ""}`}
                  onClick={() => handleViewItem(item)}
                  style={{ cursor: item.actionUrl ? "pointer" : "default" }}
                >
                  {/* Left accent bar */}
                  <div
                    className="notif-item-accent"
                    style={{ background: getTypeColor(item.type) }}
                  />

                  {/* Icon */}
                  <div className="notif-item-icon">
                    {getTypeIcon(item.type, item.isEmail)}
                  </div>

                  {/* Content */}
                  <div className="notif-item-content">
                    <div className="notif-item-title">
                      {!item.read && <span className="notif-item-dot" />}
                      {item.title || "Notification"}
                    </div>
                    <div className="notif-item-message">{item.message}</div>
                    <div className="notif-item-footer">
                      <span className="notif-item-time">
                        {formatRelativeTime(item.timestamp)}
                      </span>
                      {item.actionUrl && (
                        <span className="notif-item-view">View →</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
