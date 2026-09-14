import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        {/* Crisp HD 3D Magnifying Glass Icon with Opening Animation */}
        <div className="magnifier-hd-wrapper" aria-label="3D Magnifying Glass searching animation">
          <div className="magnifier-hd-card">
            <img
              src="/vignan_hd_magnifier.jpg"
              alt="3D Magnifying Glass Icon"
              className="magnifier-hd-img"
            />
          </div>
        </div>

        {/* Crisp HD Vignan Lost & Found Portal Title */}
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