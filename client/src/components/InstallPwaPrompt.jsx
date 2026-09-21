import { useState, useEffect } from "react";
import { useNotification } from "../context/NotificationContext";

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    // 1. Check if already running in standalone mode (already installed)
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if dismissed in this session
    if (sessionStorage.getItem("vignan_pwa_dismissed") === "true") {
      setDismissed(true);
    }

    // 2. Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // 3. Listen for Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // 4. Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      showNotification({
        title: "🎉 App Installed!",
        message: "Vignan Lost & Found is now installed on your home screen.",
        type: "success",
      });
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [showNotification]);

  const handleInstallClick = async () => {
    if (isIos) {
      setShowIosModal(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback instruction if browser doesn't support deferred prompt directly
      showNotification({
        title: "📲 Install App",
        message: "Open your browser menu (⋮ or Share) and select 'Install app' or 'Add to Home Screen'.",
        type: "info",
      });
      return;
    }

    // Trigger native browser install prompt
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("vignan_pwa_dismissed", "true");
  };

  // Don't render banner if already installed or dismissed
  if (isInstalled || dismissed) return null;

  return (
    <>
      {/* Floating Bottom Install Banner for Mobile / Desktop */}
      <div className="pwa-install-banner" role="region" aria-label="Install Application">
        <div className="pwa-banner-content">
          <img
            src="/vignan_logo.jpg"
            alt="Vignan Portal App"
            className="pwa-banner-icon"
          />
          <div className="pwa-banner-text">
            <h4>Install Vignan Portal</h4>
            <p>Add to your home screen for quick 1-tap access &amp; instant alerts!</p>
          </div>
        </div>

        <div className="pwa-banner-actions">
          <button
            className="pwa-install-btn"
            onClick={handleInstallClick}
            title="Install Application"
          >
            📲 Install App
          </button>
          <button
            className="pwa-dismiss-btn"
            onClick={handleDismiss}
            aria-label="Close install banner"
          >
            ✕
          </button>
        </div>
      </div>

      {/* iOS Safari Instructions Modal */}
      {showIosModal && (
        <div className="pwa-ios-modal-overlay" onClick={() => setShowIosModal(false)}>
          <div className="pwa-ios-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pwa-ios-modal-header">
              <img src="/vignan_logo.jpg" alt="Vignan" className="pwa-modal-logo" />
              <h3>Install on iPhone / iPad</h3>
              <button className="pwa-modal-close" onClick={() => setShowIosModal(false)}>
                ✕
              </button>
            </div>
            <div className="pwa-ios-modal-steps">
              <div className="pwa-ios-step">
                <span className="pwa-step-num">1</span>
                <p>
                  Tap the <strong>Share button</strong>{" "}
                  <span className="pwa-ios-icon">⎋</span> at the bottom of Safari.
                </p>
              </div>
              <div className="pwa-ios-step">
                <span className="pwa-step-num">2</span>
                <p>
                  Scroll down and tap <strong>Add to Home Screen</strong>{" "}
                  <span className="pwa-ios-icon">➕</span>.
                </p>
              </div>
              <div className="pwa-ios-step">
                <span className="pwa-step-num">3</span>
                <p>
                  Tap <strong>Add</strong> in the top right corner. Done! 🎉
                </p>
              </div>
            </div>
            <button className="pwa-ios-done-btn" onClick={() => setShowIosModal(false)}>
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}

/**
 * Compact Navbar Install Button for quick header access
 */
export function NavbarInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosModal, setShowIosModal] = useState(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(userAgent));

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  if (isInstalled) return null;

  const handleClick = async () => {
    if (isIos) {
      setShowIosModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
    } else {
      showNotification({
        title: "📲 Install App",
        message: "To install, tap your browser's menu (⋮) and select 'Install app' or 'Add to Home screen'.",
        type: "info",
      });
    }
  };

  return (
    <>
      <button
        className="nav-install-btn"
        onClick={handleClick}
        title="Install Vignan App on your device"
      >
        <span className="nav-install-icon">📲</span>
        <span className="nav-install-text">Install App</span>
      </button>

      {showIosModal && (
        <div className="pwa-ios-modal-overlay" onClick={() => setShowIosModal(false)}>
          <div className="pwa-ios-modal" onClick={(e) => e.stopPropagation()}>
            <div className="pwa-ios-modal-header">
              <img src="/vignan_logo.jpg" alt="Vignan" className="pwa-modal-logo" />
              <h3>Install on iPhone / iPad</h3>
              <button className="pwa-modal-close" onClick={() => setShowIosModal(false)}>
                ✕
              </button>
            </div>
            <div className="pwa-ios-modal-steps">
              <div className="pwa-ios-step">
                <span className="pwa-step-num">1</span>
                <p>
                  Tap the <strong>Share button</strong>{" "}
                  <span className="pwa-ios-icon">⎋</span> at the bottom of Safari.
                </p>
              </div>
              <div className="pwa-ios-step">
                <span className="pwa-step-num">2</span>
                <p>
                  Scroll down and tap <strong>Add to Home Screen</strong>{" "}
                  <span className="pwa-ios-icon">➕</span>.
                </p>
              </div>
              <div className="pwa-ios-step">
                <span className="pwa-step-num">3</span>
                <p>
                  Tap <strong>Add</strong> in the top right corner. Done! 🎉
                </p>
              </div>
            </div>
            <button className="pwa-ios-done-btn" onClick={() => setShowIosModal(false)}>
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
