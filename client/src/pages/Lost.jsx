import { useEffect, useState } from "react";
import api from "../api";
import { getImageUrl } from "../utils/imageUtils";

const CATEGORIES = [
  "ALL",
  "🎒 Bag",
  "💻 Laptop",
  "📱 Mobile Phone",
  "🔑 Keys",
  "💳 ID Card",
  "📚 Books",
  "🎧 Earphones",
  "⌚ Watch",
  "💧 Water Bottle",
  "👕 Clothing",
  "📄 Documents",
  "🎓 Others",
];

function Lost() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);

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

  // Search & Category Filter
  const filteredReports = reports.filter((report) => {
    const searchText = search.toLowerCase().trim();
    const matchesSearch =
      String(report.itemName || "").toLowerCase().includes(searchText) ||
      String(report.category || "").toLowerCase().includes(searchText) ||
      String(report.location || "").toLowerCase().includes(searchText) ||
      String(report.description || "").toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "ALL" ||
      String(report.category || "").toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="reports-page">
        <h1>📦 Lost Items</h1>
        <div className="empty-report">
          <h2>Loading Vignan lost items...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <h1>📦 Lost Items</h1>
      <p className="reports-subtitle">
        View items currently reported lost by Vignan students across campus.
      </p>

      {/* Search Bar */}
      <div className="report-toolbar">
        <input
          type="text"
          placeholder="🔍 Search item name, location, description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Interactive Category Filter Pills */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center", margin: "20px 0 25px" }}>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: "8px 16px",
              borderRadius: "9999px",
              fontSize: "13px",
              fontWeight: "600",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              background: selectedCategory === cat ? "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" : "#ffffff",
              color: selectedCategory === cat ? "#ffffff" : "#475569",
              boxShadow: selectedCategory === cat ? "0 4px 14px rgba(99, 102, 241, 0.35)" : "none",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <div style={{ textAlign: "center", margin: "15px 0", fontSize: "16px", fontWeight: "700", color: "#4f46e5" }}>
        Showing {filteredReports.length} lost item{filteredReports.length !== 1 ? "s" : ""}
      </div>

      {filteredReports.length === 0 ? (
        <div className="empty-report">
          <h2>📦 No Lost Items Match</h2>
          <p>Try clearing your search or selecting a different category pill above.</p>
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
                  <p><strong>👤 Reported By:</strong> {report.user?.name || "Vignan Student"}</p>

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