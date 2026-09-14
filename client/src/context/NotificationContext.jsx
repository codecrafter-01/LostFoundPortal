import { createContext, useContext, useState, useCallback, useEffect } from "react";

const NotificationContext = createContext();

const STORAGE_KEY = "vignan_notif_history";
const MAX_HISTORY = 20;

const loadHistory = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveHistory = (history) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
};

export const NotificationProvider = ({ children }) => {
  // Live toasts (pop-ups on screen)
  const [notifications, setNotifications] = useState([]);

  // Persistent history (bell dropdown panel)
  const [history, setHistory] = useState(loadHistory);

  // Computed unread count
  const unreadCount = history.filter((n) => !n.read).length;

  // Keep localStorage in sync whenever history changes
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const showNotification = useCallback(
    ({ title, message, type = "info", isEmail = false, duration = 5000, actionUrl = null, actionLabel = "View Report" }) => {
      const id = Date.now() + Math.random();
      const timestamp = new Date().toISOString();

      const newNotif = { id, title, message, type, isEmail, timestamp, actionUrl, actionLabel };

      // Add to live toasts (max 3 visible at once)
      setNotifications((prev) => [newNotif, ...prev].slice(0, 3));

      // Add to persistent history (max 20 entries)
      setHistory((prev) => {
        const updated = [{ ...newNotif, read: false }, ...prev].slice(0, MAX_HISTORY);
        return updated;
      });

      // Auto-dismiss toast after duration
      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
      }
    },
    []
  );

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAllRead = useCallback(() => {
    setHistory((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        history,
        unreadCount,
        showNotification,
        removeNotification,
        markAllRead,
        clearHistory,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

