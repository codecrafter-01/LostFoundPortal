import { useEffect, useState } from "react";
import api from "../api";
import { getImageUrl } from "../utils/imageUtils";

function Found() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ==============================
  // Fetch Found Reports
  // ==============================
  useEffect(() => {
    fetchFoundReports();
  }, []);

  const fetchFoundReports = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reports");
      const foundReports = response.data.filter(
        (report) =>
          String(report.reportType || "").toLowerCase() === "found" &&
          report.status !== "returned"
      );
      setReports(foundReports);
    } catch (error) {
      console.error("Fetch Found Reports Error:", error);
      alert(error.response?.data?.message || "Failed to load found reports");
    } finally {
      setLoading(false);
    }
  };

  // Search filter
  const filteredReports = reports.filter((report) => {
    const searchText = search.toLowerCase().trim();
    return (
      String(report.itemName || "").toLowerCase().includes(searchText) ||
      String(report.category || "").toLowerCase().includes(searchText) ||
      String(report.location || "").toLowerCase().includes(searchText) ||
      String(report.description || "").toLowerCase().includes(searchText)
    );
  });

  if (loading) {
    return (
      <div className="reports-page">
        <h1>📍 Found Items</h1>
        <div className="empty-report">
          <h2>Loading found items...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <h1>📍 Found Items</h1>
      <p className="reports-subtitle">
        View items currently reported found by students.
      </p>

      {/* Search */}
      <div className="report-toolbar">
        <input
          type="text"
          placeholder="🔍 Search item, category, location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div style={{ textAlign: "center", margin: "20px 0", fontSize: "18px", fontWeight: "600" }}>
        {filteredReports.length} found item{filteredReports.length !== 1 ? "s" : ""} found
      </div>

      {filteredReports.length === 0 ? (
        <div className="empty-report">
          <h2>📍 No Found Items</h2>
          <p>{search ? "No active found items match your search." : "No active found items have been reported yet."}</p>
        </div>
      ) : (
        <div className="reports-grid">
          {filteredReports.map((report) => {
            const imgUrl = getImageUrl(report.image);

            return (
              <div className="report-card" key={report._id}>
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={report.itemName}
                    className="report-image"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=60";
                    }}
                  />
                ) : (
                  <div className="image-placeholder">
                    📍 No Photo Provided
                  </div>
                )}

                <div className="report-content">
                  <h2>{report.itemName}</h2>
                  <p><strong>📂 Category:</strong> {report.category}</p>
                  <p><strong>📍 Location:</strong> {report.location}</p>
                  <p><strong>📅 Date:</strong> {report.date}</p>
                  <p><strong>📝 Description:</strong> {report.description}</p>
                  <p><strong>👤 Reported By:</strong> {report.user?.name || "Student"}</p>

                  <span className="status found-status" style={{ marginTop: "12px" }}>
                    📍 FOUND
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Found;