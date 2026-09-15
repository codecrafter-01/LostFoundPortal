import { useState, useEffect, useCallback } from "react";
import api from "../api";

const STORAGE_KEY = "vignan_push_subscribed";

// Convert a base64 VAPID public key to Uint8Array (required by browser)
const urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
};

const usePushNotification = () => {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState("default");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check browser support and current state on mount
  useEffect(() => {
    const supported =
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
      const saved = localStorage.getItem(STORAGE_KEY);
      setIsSubscribed(saved === "true" && Notification.permission === "granted");
    }
  }, []);

  // Register Service Worker
  const registerSW = async () => {
    const reg = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;
    return reg;
  };

  // Subscribe to push notifications
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError("Push notifications are not supported in this browser.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Ask browser for notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        setError("Permission denied. Please allow notifications in your browser settings.");
        setLoading(false);
        return false;
      }

      // 2. Fetch VAPID public key from server
      const { data } = await api.get("/push/vapid-public-key");
      const vapidPublicKey = urlBase64ToUint8Array(data.publicKey);

      // 3. Register Service Worker
      const reg = await registerSW();

      // 4. Create push subscription
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });

      // 5. Send subscription to backend to save in MongoDB
      const token = localStorage.getItem("token");
      if (token) {
        await api.post("/push/subscribe", { subscription: subscription.toJSON() });
      }

      setIsSubscribed(true);
      localStorage.setItem(STORAGE_KEY, "true");
      setLoading(false);
      return true;

    } catch (err) {
      console.error("[PushHook] Subscribe error:", err);
      setError("Failed to enable notifications. Please try again.");
      setLoading(false);
      return false;
    }
  }, [isSupported]);

  // Unsubscribe from push notifications
  const unsubscribe = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        await api.delete("/push/unsubscribe");
      }
      setIsSubscribed(false);
      localStorage.removeItem(STORAGE_KEY);
      setLoading(false);
      return true;
    } catch (err) {
      console.error("[PushHook] Unsubscribe error:", err);
      setError("Failed to disable notifications.");
      setLoading(false);
      return false;
    }
  }, []);

  return {
    isSupported,
    isSubscribed,
    permission,
    loading,
    error,
    subscribe,
    unsubscribe,
  };
};

export default usePushNotification;
