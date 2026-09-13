import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home">

      {/* Hero */}

      <section className="hero">

        <h1>🎓 University Lost & Found Portal</h1>

        <p>
          Helping students recover their lost belongings
          quickly and easily.
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
            Report any lost item within the university.
          </p>
        </div>

        <div className="feature-card">
          <h2>📍 Found Items</h2>

          <p>
            Help others by reporting found items.
          </p>
        </div>

        <div className="feature-card">
          <h2>🔒 Secure Login</h2>

          <p>
            Your reports are protected using JWT authentication.
          </p>
        </div>

      </section>

    </div>
  );
}

export default Home;