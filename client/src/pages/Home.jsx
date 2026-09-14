import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        {/* Opening Animated Magnifying Glass with Question Mark */}
        <div className="magnifier-wrapper" aria-label="Searching for lost items animation">
          <div className="magnifier-glass">
            <svg
              className="magnifier-svg"
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

              {/* Magnifying Glass Outer Ring */}
              <circle
                cx="42"
                cy="42"
                r="28"
                stroke="url(#glassGrad)"
                strokeWidth="7"
                fill="rgba(99, 102, 241, 0.25)"
                filter="url(#glowFilter)"
              />

              {/* Lens Inner Reflection Accent */}
              <path
                d="M 24 32 A 20 20 0 0 1 42 22"
                stroke="#ffffff"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.7"
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
                x="62"
                y="58"
                width="11"
                height="28"
                rx="5.5"
                transform="rotate(-45 62 58)"
                fill="url(#handleGrad)"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
            </svg>
          </div>
        </div>

        <img
          src="/vignan_logo.jpg"
          alt="Vignan Emblem Avatar"
          style={{
            width: "84px",
            height: "84px",
            borderRadius: "50%",
            objectFit: "cover",
            margin: "0 auto 20px",
            border: "3px solid #ffffff",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.4)",
          }}
        />

        <h1>🎓 Vignan Lost & Found Portal</h1>
        <p>
          Helping Vignan students recover their lost belongings quickly, securely, and easily.
        </p>

        <div className="hero-buttons">
          <Link to="/report-lost">
            <button>📦 Report Lost</button>
          </Link>
          <Link to="/report-found">
            <button>📍 Report Found</button>
          </Link>
        </div>
      </section>

      {/* Features */}
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