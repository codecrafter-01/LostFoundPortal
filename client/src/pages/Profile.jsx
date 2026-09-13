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

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/reports"
      );

      const myReports =
        response.data.filter(
          (report) =>
            report.user &&
            report.user._id === user?._id
        );

      setStats({
        total: myReports.length,

        lost: myReports.filter(
          (report) =>
            report.reportType === "lost"
        ).length,

        found: myReports.filter(
          (report) =>
            report.reportType === "found"
        ).length,

        returned: myReports.filter(
          (report) =>
            report.status === "returned"
        ).length,
      });

    } catch (error) {
      console.error(
        "Profile Statistics Error:",
        error
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard">

      {/* Profile Heading */}

      <h1>
        👤 Student Profile
      </h1>

      {/* User Information */}

      <div className="dashboard-card">

        <h2>
          👋 {user?.name}
        </h2>

        <p>
          <strong>Email:</strong>{" "}
          {user?.email}
        </p>

        <p>
          <strong>Role:</strong>{" "}
          {user?.role || "Student"}
        </p>

        <p>
          <strong>User ID:</strong>{" "}
          {user?._id}
        </p>

      </div>

      <br />

      {/* Profile Statistics */}

      <div className="dashboard-stats">

        {/* Total Reports */}

        <div className="stat-box">

          <h2>
            {loading
              ? "..."
              : stats.total}
          </h2>

          <p>
            📋 Total Reports
          </p>

        </div>

        {/* Lost Reports */}

        <div className="stat-box">

          <h2>
            {loading
              ? "..."
              : stats.lost}
          </h2>

          <p>
            📦 Lost Reports
          </p>

        </div>

        {/* Found Reports */}

        <div className="stat-box">

          <h2>
            {loading
              ? "..."
              : stats.found}
          </h2>

          <p>
            📍 Found Reports
          </p>

        </div>

        {/* Returned Reports */}

        <div className="stat-box">

          <h2>
            {loading
              ? "..."
              : stats.returned}
          </h2>

          <p>
            ✅ Returned Reports
          </p>

        </div>

      </div>

    </div>
  );
}

export default Profile;