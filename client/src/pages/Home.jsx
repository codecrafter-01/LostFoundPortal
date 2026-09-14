import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        {/* Frameless Standalone Animated Magnifying Glass (No Box Container) */}
        <div className="magnifier-simple-wrapper" aria-label="Searching for lost items animation">
          <div className="magnifier-simple-icon">
            <svg
              className="magnifier-simple-svg"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="50%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#4f46e5" />
                </linearGradient>
                <linearGradient id="handleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#6366f1" />
                  <stop offset="100%" stopColor="#312e81" />
                </linearGradient>
                <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Holographic Glowing Orbit Ring */}
              <ellipse
                cx="42"
                cy="42"
                rx="34"
                ry="14"
                stroke="#818cf8"
                strokeWidth="2.5"
                fill="none"
                opacity="0.75"
                transform="rotate(-25 42 42)"
              />

              {/* Magnifying Glass Lens Outer Ring */}
              <circle
                cx="42"
                cy="42"
                r="26"
                stroke="url(#glassGrad)"
                strokeWidth="7"
                fill="rgba(99, 102, 241, 0.25)"
                filter="url(#glowFilter)"
              />

              {/* Lens Inner Reflection Accent */}
              <path
                d="M 24 32 A 18 18 0 0 1 42 22"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.85"
              />

              {/* Question Mark Inside Lens */}
              <text
                x="42"
                y="50"
                textAnchor="middle"
                fontSize="24"
                fontWeight="800"
                fill="#ffffff"
                fontFamily="Outfit, sans-serif"
              >
                ?
              </text>

              {/* Magnifying Glass Handle */}
              <rect
                x="60"
                y="56"
                width="11"
                height="28"
                rx="5.5"
                transform="rotate(-45 60 56)"
                fill="url(#handleGrad)"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

        {/* Crisp Vector Title & Subtitle */}
        <h1 className="portal-hd-title">
          Vignan <span className="title-highlight">Lost & Found</span>
          <div className="portal-sub-tag">
            <span className="tag-line"></span>
            <span className="tag-text">STUDENT PORTAL</span>
            <span className="tag-line"></span>
          </div>
        </h1>

        {/* Action Buttons */}
        <div className="hero-buttons">
          <Link to="/report-lost">
            <button>📦 Report Lost</button>
          </Link>
          <Link to="/report-found">
            <button>📍 Report Found</button>
          </Link>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features">
        <div className="feature-card">
          <h2>📦 Lost Items</h2>
          <p>
            Report any lost item within Vignan campus.
          </p>
        </div>

        <div className="feature-card">
          <h2>📍 Found Items</h2>
          <p>
            Help fellow Vignan students by reporting found items.
          </p>
        </div>

        <div className="feature-card">
          <h2>🔒 Secure Portal</h2>
          <p>
            Protected with JWT authentication and instant automated email alerts.
          </p>
        </div>
      </section>
    </div>
  );
}

export default Home;