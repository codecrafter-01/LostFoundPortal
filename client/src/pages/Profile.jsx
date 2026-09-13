import { useEffect, useState } from "react";
import api from "../api";

function Profile() {
  const [stats, setStats] = useState({
    total: 0,
    lost: 0,
    found: 0,
    returned: 0,
  });

  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const response = await api.get("/reports");
      const myReports = response.data.filter(
        (report) => report.user && report.user._id === user?._id
      );

      setStats({
        total: myReports.length,
        lost: myReports.filter((report) => report.reportType === "lost").length,
        found: myReports.filter((report) => report.reportType === "found").length,
        returned: myReports.filter((report) => report.status === "returned").length,
      });
    } catch (error) {
      console.error("Profile Statistics Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">
      {/* Profile Heading */}
      <h1>👤 Student Profile</h1>

      {/* User Information with Vignan Avatar */}
      <div className="dashboard-card" style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
        <img
          src="/vignan_logo.jpg"
          alt="Vignan Avatar"
          style={{
            width: "90px",
            height: "90px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "3px solid #6366f1",
            boxShadow: "0 8px 20px rgba(99, 102, 241, 0.3)",
          }}
        />

        <div style={{ flex: 1, minWidth: "220px", textAlign: "left" }}>
          <h2 style={{ margin: "0 0 10px", fontSize: "28px" }}>👋 {user?.name}</h2>
          <p style={{ margin: "6px 0" }}>
            <strong>Email:</strong> {user?.email}
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>Role:</strong> {user?.role || "Student"}
          </p>
          <p style={{ margin: "6px 0" }}>
            <strong>User ID:</strong> {user?._id}
          </p>
        </div>
      </div>

      <br />

      {/* Profile Statistics */}
      <div className="dashboard-stats">
        <div className="stat-box">
          <h2>{loading ? "..." : stats.total}</h2>
          <p>📋 Total Reports</p>
        </div>
        <div className="stat-box">
          <h2>{loading ? "..." : stats.lost}</h2>
          <p>📦 Lost Reports</p>
        </div>
        <div className="stat-box">
          <h2>{loading ? "..." : stats.found}</h2>
          <p>📍 Found Reports</p>
        </div>
        <div className="stat-box">
          <h2>{loading ? "..." : stats.returned}</h2>
          <p>✅ Returned Reports</p>
        </div>
      </div>
    </div>
  );
}

export default Profile;