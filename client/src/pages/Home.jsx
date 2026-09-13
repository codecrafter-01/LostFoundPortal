import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-template">
      {/* Hero Section */}
      <section className="hero-template">
        <div className="hero-container">
          {/* Left Column: 3D Illustration with Animated Floating Orbit Badges */}
          <div className="hero-visual">
            <div className="illustration-wrapper">
              <img
                src="/hero_illustration.jpg"
                alt="Lost and Found Campus Illustration"
                className="hero-main-img"
              />

              {/* Animated Floating Orbit Badges */}
              <div className="orbit-badge badge-search floating-slow">
                <span className="badge-icon">🔍</span>
              </div>

              <div className="orbit-badge badge-lost floating-medium">
                <span className="badge-alert">!</span>
                <span className="badge-label">Lost</span>
              </div>

              <div className="orbit-badge badge-found floating-fast">
                <span className="badge-check">✓</span>
                <span className="badge-label">Found</span>
              </div>

              {/* Glowing Ambient Halo */}
              <div className="glowing-halo"></div>
            </div>
          </div>

          {/* Right Column: Hero Typography & CTA */}
          <div className="hero-content">
            <span className="hero-eyebrow">LOST & FOUND STUDENT PORTAL</span>
            <h1 className="hero-title">
              <span className="text-indigo">Lost</span> Something?<br />
              <span className="text-indigo">Found</span> Something?
            </h1>
            <p className="hero-description">
              Reuniting students with their belongings — because every item has a story.
            </p>

            <div className="hero-actions">
              <Link to="/report-lost">
                <button className="btn-primary-indigo">
                  <span>📝</span> Report Lost
                </button>
              </Link>
              <Link to="/report-found">
                <button className="btn-outline-indigo">
                  <span>📦</span> Report Found
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator bounce">
          <span className="scroll-icon">∨</span>
          <span className="scroll-text">Scroll to explore</span>
        </div>
      </section>

      {/* Bottom Features Strip */}
      <section className="features-strip">
        <div className="feature-item">
          <div className="feature-icon-box icon-blue">
            <span className="icon">🛡️</span>
          </div>
          <div className="feature-text">
            <h3>Safe & Secure</h3>
            <p>Your data is protected</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon-box icon-lightning">
            <span className="icon">⚡</span>
          </div>
          <div className="feature-text">
            <h3>Quick & Easy</h3>
            <p>Report in minutes</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon-box icon-purple">
            <span className="icon">👥</span>
          </div>
          <div className="feature-text">
            <h3>Smart Match</h3>
            <p>Find matches automatically</p>
          </div>
        </div>

        <div className="feature-item">
          <div className="feature-icon-box icon-heart">
            <span className="icon">💙</span>
          </div>
          <div className="feature-text">
            <h3>Community</h3>
            <p>Together we help each other</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;