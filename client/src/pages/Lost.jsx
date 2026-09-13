import { useEffect, useState } from "react";
import api from "../api";
import { getImageUrl } from "../utils/imageUtils";

function Lost() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // ==============================
  // Fetch Lost Reports
  // ==============================
  useEffect(() => {
    fetchLostReports();
  }, []);

  const fetchLostReports = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reports");
      const lostReports = response.data.filter(
        (report) =>
          String(report.reportType || "").toLowerCase() === "lost" &&
          report.status !== "returned"
      );
      setReports(lostReports);
    } catch (error) {
      console.error("Fetch Lost Reports Error:", error);
      alert(error.response?.data?.message || "Failed to load lost reports");
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
        <h1>📦 Lost Items</h1>
        <div className="empty-report">
          <h2>Loading lost items...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <h1>📦 Lost Items</h1>
      <p className="reports-subtitle">
        View items currently reported lost by students across the university.
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
        {filteredReports.length} lost item{filteredReports.length !== 1 ? "s" : ""} found
      </div>

      {filteredReports.length === 0 ? (
        <div className="empty-report">
          <h2>📦 No Lost Items Found</h2>
          <p>{search ? "No active lost items match your search." : "No active lost items have been reported yet."}</p>
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
                    📦 No Photo Provided
                  </div>
                )}

                <div className="report-content">
                  <h2>{report.itemName}</h2>
                  <p><strong>📂 Category:</strong> {report.category}</p>
                  <p><strong>📍 Location:</strong> {report.location}</p>
                  <p><strong>📅 Date:</strong> {report.date}</p>
                  <p><strong>📝 Description:</strong> {report.description}</p>
                  <p><strong>👤 Reported By:</strong> {report.user?.name || "Student"}</p>

                  <span className="status lost-status" style={{ marginTop: "12px" }}>
                    📦 LOST
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

export default Lost;