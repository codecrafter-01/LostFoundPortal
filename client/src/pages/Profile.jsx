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

  // Load saved student photo from localStorage or fallback
  const [profilePhoto, setProfilePhoto] = useState(
    localStorage.getItem("studentPhoto") || ""
  );

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

  // Handle student photo upload & conversion to base64 for persistent local storage
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Please select a photo smaller than 5MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setProfilePhoto(base64Data);
        localStorage.setItem("studentPhoto", base64Data);
        alert("✅ Student photo updated successfully!");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfilePhoto("");
    localStorage.removeItem("studentPhoto");
  };

  return (
    <div className="dashboard">
      {/* Profile Heading */}
      <h1>👤 Student Profile</h1>

      {/* User Information & Student Photo Upload */}
      <div
        className="dashboard-card"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "28px",
          flexWrap: "wrap",
          padding: "35px",
        }}
      >
        {/* Student Photo Container */}
        <div style={{ position: "relative", textAlign: "center" }}>
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt="Student Profile"
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid #6366f1",
                boxShadow: "0 10px 25px rgba(99, 102, 241, 0.3)",
              }}
            />
          ) : (
            <div
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #e0e7ff 0%, #fae8ff 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "44px",
                border: "3px dashed #6366f1",
                color: "#6366f1",
              }}
            >
              👤
            </div>
          )}

          {/* Upload & Remove Buttons */}
          <div style={{ marginTop: "12px", display: "flex", gap: "6px", justifyContent: "center" }}>
            <label
              htmlFor="student-photo-input"
              style={{
                cursor: "pointer",
                background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
                color: "#ffffff",
                fontSize: "12px",
                fontWeight: "700",
                padding: "6px 14px",
                borderRadius: "9999px",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
                display: "inline-block",
              }}
            >
              📷 {profilePhoto ? "Change Photo" : "Upload Photo"}
            </label>
            <input
              type="file"
              id="student-photo-input"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhotoUpload}
            />

            {profilePhoto && (
              <button
                onClick={handleRemovePhoto}
                style={{
                  background: "#ef4444",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: "700",
                  padding: "6px 12px",
                  borderRadius: "9999px",
                  border: "none",
                }}
              >
                ❌
              </button>
            )}
          </div>
        </div>

        {/* Student Details */}
        <div style={{ flex: 1, minWidth: "240px", textAlign: "left" }}>
          <h2 style={{ margin: "0 0 10px", fontSize: "30px", fontWeight: "800" }}>👋 {user?.name}</h2>
          <p style={{ margin: "8px 0", fontSize: "16px" }}>
            <strong>Email:</strong> {user?.email}
          </p>
          <p style={{ margin: "8px 0", fontSize: "16px" }}>
            <strong>Role:</strong> <span style={{ textTransform: "capitalize", color: "#6366f1", fontWeight: "700" }}>{user?.role || "Student"}</span>
          </p>
          <p style={{ margin: "8px 0", fontSize: "16px" }}>
            <strong>Account ID:</strong> <code style={{ background: "#f1f5f9", padding: "4px 8px", borderRadius: "6px" }}>{user?._id}</code>
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