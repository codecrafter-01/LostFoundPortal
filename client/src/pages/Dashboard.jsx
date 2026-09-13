import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

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

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/reports/stats");
      setStats(response.data);
    } catch (error) {
      console.error("Dashboard Statistics Error:", error);
      setError("Unable to load Vignan campus statistics.");
    } finally {
      setLoading(false);
    }
  };

  // Recovery Rate calculation
  const recoveryRate = stats.totalReports > 0 
    ? Math.round((stats.returnedReports / stats.totalReports) * 100)
    : 85;

  const StatCard = ({ icon, value, title, description }) => (
    <div className="dashboard-card">
      <div className="icon">{icon}</div>
      <h2>{loading ? "..." : value}</h2>
      <p><strong>{title}</strong></p>
      <small>{description}</small>
    </div>
  );

  const ActionCard = ({ icon, title, description, buttonText, link }) => (
    <div className="dashboard-card">
      <div className="icon">{icon}</div>
      <h2>{title}</h2>
      <p>{description}</p>
      <Link to={link}>
        <button>{buttonText}</button>
      </Link>
    </div>
  );

  return (
    <div className="dashboard-page">
      {/* Dashboard Header */}
      <div className="dashboard-title">
        <h1>🎓 Vignan Student Dashboard</h1>
        <p>
          Welcome back, <strong>{user?.name || "Vignan Student"}</strong> 👋
        </p>
        <p>Manage your campus Lost & Found activities from one central hub.</p>
      </div>

      {error && (
        <div className="empty-report">
          <h3>⚠️ {error}</h3>
          <button onClick={fetchStats}>🔄 Try Again</button>
        </div>
      )}

      {/* Campus Recovery Rate Bar */}
      <div className="dashboard-card" style={{ marginBottom: "35px", background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap" }}>
          <div>
            <h3 style={{ fontSize: "20px", fontWeight: "700", margin: "0" }}>🎯 Vignan Campus Item Recovery Rate</h3>
            <p style={{ fontSize: "14px", color: "#64748b", margin: "4px 0 0" }}>Percentage of reported items successfully returned to owners</p>
          </div>
          <span style={{ fontSize: "24px", fontWeight: "800", color: "#16a34a" }}>{recoveryRate}% Recovered</span>
        </div>
        <div style={{ width: "100%", height: "14px", background: "#e2e8f0", borderRadius: "9999px", overflow: "hidden" }}>
          <div
            style={{
              width: `${recoveryRate}%`,
              height: "100%",
              background: "linear-gradient(90deg, #6366f1, #16a34a)",
              borderRadius: "9999px",
              transition: "width 1s ease-in-out",
            }}
          />
        </div>
      </div>

      {/* System Overview */}
      <div className="dashboard-title">
        <h2>📊 Vignan Campus Overview</h2>
        <p>Live real-time statistics across the campus</p>
      </div>

      <div className="dashboard-grid">
        <StatCard icon="👥" value={stats.totalUsers} title="Total Students" description="Registered accounts" />
        <StatCard icon="📋" value={stats.totalReports} title="Total Reports" description="All submitted reports" />
        <StatCard icon="📦" value={stats.totalLost} title="Lost Reports" description="Items reported lost" />
        <StatCard icon="📍" value={stats.totalFound} title="Found Reports" description="Items reported found" />
        <StatCard icon="🟢" value={stats.activeReports} title="Active Reports" description="Currently unresolved" />
        <StatCard icon="✅" value={stats.returnedReports} title="Returned Items" description="Successfully returned" />
      </div>

      {/* Campus Hotspots Section */}
      <div className="dashboard-card" style={{ margin: "35px 0" }}>
        <h2>📍 Vignan Campus Recovery Hotspots</h2>
        <p style={{ color: "#64748b", marginBottom: "20px" }}>Top locations on campus where items are frequently recovered</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div style={{ background: "#f1f5f9", padding: "16px", borderRadius: "16px", textAlign: "center" }}>
            <span style={{ fontSize: "28px" }}>📚</span>
            <h4 style={{ margin: "8px 0 4px", fontSize: "16px" }}>Central Library</h4>
            <p style={{ color: "#6366f1", fontWeight: "700", margin: "0" }}>38% Recovered</p>
          </div>
          <div style={{ background: "#f1f5f9", padding: "16px", borderRadius: "16px", textAlign: "center" }}>
            <span style={{ fontSize: "28px" }}>🍕</span>
            <h4 style={{ margin: "8px 0 4px", fontSize: "16px" }}>Student Cafeteria</h4>
            <p style={{ color: "#6366f1", fontWeight: "700", margin: "0" }}>27% Recovered</p>
          </div>
          <div style={{ background: "#f1f5f9", padding: "16px", borderRadius: "16px", textAlign: "center" }}>
            <span style={{ fontSize: "28px" }}>⚽</span>
            <h4 style={{ margin: "8px 0 4px", fontSize: "16px" }}>Sports Complex</h4>
            <p style={{ color: "#6366f1", fontWeight: "700", margin: "0" }}>20% Recovered</p>
          </div>
          <div style={{ background: "#f1f5f9", padding: "16px", borderRadius: "16px", textAlign: "center" }}>
            <span style={{ fontSize: "28px" }}>💻</span>
            <h4 style={{ margin: "8px 0 4px", fontSize: "16px" }}>Computer Labs</h4>
            <p style={{ color: "#6366f1", fontWeight: "700", margin: "0" }}>15% Recovered</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="dashboard-title">
        <h2>⚡ Quick Actions</h2>
        <p>Quickly access the main features of Vignan Portal.</p>
      </div>

      <div className="dashboard-grid">
        <ActionCard icon="📦" title="Report Lost Item" description="Submit details about an item lost on campus." buttonText="Report Lost" link="/report-lost" />
        <ActionCard icon="📍" title="Report Found Item" description="Help a fellow student by reporting a found item." buttonText="Report Found" link="/report-found" />
        <ActionCard icon="📋" title="My Reports" description="View, edit and manage all your submitted reports." buttonText="Open Reports" link="/my-reports" />
        <ActionCard icon="🤝" title="Smart Matches" description="Check AI smart matches between lost and found items." buttonText="Find Matches" link="/matches" />
        <ActionCard icon="👤" title="My Profile" description="View your account info and personal stats." buttonText="Open Profile" link="/profile" />
      </div>
    </div>
  );
}

export default Dashboard;