import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
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