import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLost: 0,
    totalFound: 0,
    totalReports: 0,
    activeReports: 0,
    returnedReports: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  // ========================================
  // Fetch Dashboard Statistics
  // ========================================

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/reports/stats"
      );

      setStats(response.data);

    } catch (error) {
      console.error(
        "Dashboard Statistics Error:",
        error
      );

      setError(
        "Unable to load dashboard statistics."
      );

    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // Statistics Card
  // ========================================

  const StatCard = ({
    icon,
    value,
    title,
    description,
  }) => {
    return (
      <div className="dashboard-card">

        <div className="icon">
          {icon}
        </div>

        <h2>
          {loading ? "..." : value}
        </h2>

        <p>
          <strong>{title}</strong>
        </p>

        <small>
          {description}
        </small>

      </div>
    );
  };

  // ========================================
  // Quick Action Card
  // ========================================

  const ActionCard = ({
    icon,
    title,
    description,
    buttonText,
    link,
  }) => {
    return (
      <div className="dashboard-card">

        <div className="icon">
          {icon}
        </div>

        <h2>
          {title}
        </h2>

        <p>
          {description}
        </p>

        <Link to={link}>
          <button>
            {buttonText}
          </button>
        </Link>

      </div>
    );
  };

  // ========================================
  // Dashboard
  // ========================================

  return (
    <div className="dashboard-page">

      {/* ================================== */}
      {/* Dashboard Header */}
      {/* ================================== */}

      <div className="dashboard-title">

        <h1>
          🎓 Student Dashboard
        </h1>

        <p>
          Welcome back,{" "}
          <strong>
            {user?.name || "Student"}
          </strong>{" "}
          👋
        </p>

        <p>
          Manage your Lost & Found activities
          from one place.
        </p>

      </div>


      {/* ================================== */}
      {/* Error Message */}
      {/* ================================== */}

      {error && (
        <div className="empty-report">

          <h3>
            ⚠️ {error}
          </h3>

          <button
            onClick={fetchStats}
          >
            🔄 Try Again
          </button>

        </div>
      )}


      {/* ================================== */}
      {/* System Overview */}
      {/* ================================== */}

      <div className="dashboard-title">

        <h2>
          📊 System Overview
        </h2>

        <p>
          Current Lost & Found portal
          statistics
        </p>

      </div>


      <div className="dashboard-grid">

        <StatCard
          icon="👥"
          value={stats.totalUsers}
          title="Total Users"
          description="Registered students"
        />

        <StatCard
          icon="📋"
          value={stats.totalReports}
          title="Total Reports"
          description="All submitted reports"
        />

        <StatCard
          icon="📦"
          value={stats.totalLost}
          title="Lost Reports"
          description="Items reported as lost"
        />

        <StatCard
          icon="📍"
          value={stats.totalFound}
          title="Found Reports"
          description="Items reported as found"
        />

        <StatCard
          icon="🟢"
          value={stats.activeReports}
          title="Active Reports"
          description="Currently unresolved"
        />

        <StatCard
          icon="✅"
          value={stats.returnedReports}
          title="Returned Items"
          description="Successfully returned"
        />

      </div>


      {/* ================================== */}
      {/* Refresh Statistics */}
      {/* ================================== */}

      <div
        style={{
          textAlign: "center",
          margin: "25px 0",
        }}
      >

        <button
          onClick={fetchStats}
          disabled={loading}
        >
          {loading
            ? "🔄 Updating..."
            : "🔄 Refresh Statistics"}
        </button>

      </div>


      {/* ================================== */}
      {/* Quick Actions */}
      {/* ================================== */}

      <div className="dashboard-title">

        <h2>
          ⚡ Quick Actions
        </h2>

        <p>
          Quickly access the main features
          of the portal.
        </p>

      </div>


      <div className="dashboard-grid">

        <ActionCard
          icon="📦"
          title="Report Lost Item"
          description="Submit details about an item you have lost."
          buttonText="Report Lost"
          link="/report-lost"
        />

        <ActionCard
          icon="📍"
          title="Report Found Item"
          description="Help another student by reporting an item you found."
          buttonText="Report Found"
          link="/report-found"
        />

        <ActionCard
          icon="📋"
          title="My Reports"
          description="View, edit and manage all your submitted reports."
          buttonText="Open Reports"
          link="/my-reports"
        />

        <ActionCard
          icon="🤝"
          title="Smart Matches"
          description="Find possible matches between your lost and found reports."
          buttonText="Find Matches"
          link="/matches"
        />

        <ActionCard
          icon="👤"
          title="My Profile"
          description="View your account information and report statistics."
          buttonText="Open Profile"
          link="/profile"
        />

      </div>


      {/* ================================== */}
      {/* Help / Information */}
      {/* ================================== */}

      <div className="dashboard-card">

        <div className="icon">
          💡
        </div>

        <h2>
          How Lost & Found Works
        </h2>

        <p>
          Report a lost or found item with
          useful details and an image.
        </p>

        <p>
          Our Smart Matching system compares
          reports to identify possible matches.
        </p>

        <p>
          When your item is returned, mark
          the report as <strong>Returned</strong>.
        </p>

      </div>

    </div>
  );
}

export default Dashboard;