import { useEffect, useState } from "react";
import api from "../api";
import { getImageUrl } from "../utils/imageUtils";
import { useNotification } from "../context/NotificationContext";
import { formatTime } from "../utils/timeUtils";

const CATEGORIES = [
  "ALL",
  "🎒 Bag",
  "💻 Laptop",
  "📱 Mobile Phone",
  "⚡ Electronics",
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

function Found() {
  const [reports, setReports] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Claim Modal State
  const [claimModalReport, setClaimModalReport] = useState(null);
  const [proofAnswer, setProofAnswer] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submittingClaim, setSubmittingClaim] = useState(false);

  const { showNotification } = useNotification();
  const token = localStorage.getItem("token");
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");

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
      showNotification({
        title: "Load Error",
        message: error.response?.data?.message || "Failed to load found reports",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenClaimModal = (report) => {
    if (!token) {
      showNotification({
        title: "Login Required",
        message: "Please login to your student account to claim an item.",
        type: "error",
      });
      return;
    }
    setClaimModalReport(report);
    setProofAnswer("");
    setContactPhone("");
  };

  const handleCloseClaimModal = () => {
    setClaimModalReport(null);
    setProofAnswer("");
    setContactPhone("");
  };

  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!proofAnswer.trim()) {
      showNotification({
        title: "Missing Information",
        message: "Please provide proof of ownership to submit your claim.",
        type: "error",
      });
      return;
    }

    try {
      setSubmittingClaim(true);
      const response = await api.post(
        `/reports/${claimModalReport._id}/claim`,
        { proofAnswer, contactPhone },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      showNotification({
        title: "Claim Submitted! 📨",
        message: response.data.message || "Your proof of ownership has been sent to the finder for review.",
        type: "success",
      });

      handleCloseClaimModal();
      fetchFoundReports();
    } catch (error) {
      console.error("Submit Claim Error:", error);
      showNotification({
        title: "Claim Error",
        message: error.response?.data?.message || "Failed to submit claim.",
        type: "error",
      });
    } finally {
      setSubmittingClaim(false);
    }
  };

  // Search & Category Filter
  const filteredReports = reports.filter((report) => {
    const searchText = search.toLowerCase().trim();
    const matchesSearch =
      String(report.itemName || "").toLowerCase().includes(searchText) ||
      String(report.category || "").toLowerCase().includes(searchText) ||
      String(report.location || "").toLowerCase().includes(searchText) ||
      String(report.time || "").toLowerCase().includes(searchText) ||
      String(report.description || "").toLowerCase().includes(searchText);

    const matchesCategory =
      selectedCategory === "ALL" ||
      String(report.category || "").toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="reports-page">
        <h1>📍 Found Items</h1>
        <div className="empty-report">
          <h2>Loading Vignan found items...</h2>
          <p>Please wait.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <h1>📍 Found Items</h1>
      <p className="reports-subtitle">
        View items currently reported found by Vignan students across campus.
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
        Showing {filteredReports.length} found item{filteredReports.length !== 1 ? "s" : ""}
      </div>

      {filteredReports.length === 0 ? (
        <div className="empty-report">
          <h2>📍 No Found Items Match</h2>
          <p>Try clearing your search or selecting a different category pill above.</p>
        </div>
      ) : (
        <div className="reports-grid">
          {filteredReports.map((report) => {
            const imgUrl = getImageUrl(report.image);
            const reportUserId = typeof report.user === "object" ? report.user?._id : report.user;
            const isOwner = currentUser && reportUserId === currentUser._id;
            
            // Check if current user has already submitted a claim
            const myClaim = report.claims?.find(
              (c) => (typeof c.claimant === "object" ? c.claimant._id : c.claimant) === currentUser?._id
            );

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
                  <p><strong>📅 Date:</strong> {report.date}{report.time ? ` at ${formatTime(report.time)}` : ""}</p>
                  <p><strong>📝 Description:</strong> {report.description}</p>
                  <p><strong>👤 Reported By:</strong> {report.user?.name || "Vignan Student"}</p>

                  {report.verificationQuestion && (
                    <div style={{ margin: "10px 0", padding: "8px 12px", background: "rgba(99, 102, 241, 0.08)", borderRadius: "10px", border: "1px dashed #6366f1" }}>
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#4f46e5", display: "block" }}>
                        🔒 Verification Question:
                      </span>
                      <span style={{ fontSize: "13px", color: "#1e293b", fontStyle: "italic" }}>
                        "{report.verificationQuestion}"
                      </span>
                    </div>
                  )}

                  {report.custodyType === "college_desk" && report.custodyLocation && (
                    <div style={{ margin: "10px 0", padding: "10px 12px", background: "#ecfdf5", borderRadius: "10px", border: "1.5px solid #10b981", textAlign: "left" }}>
                      <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#065f46", display: "flex", alignItems: "center", gap: "6px", letterSpacing: "0.5px" }}>
                        🛡️ IN OFFICIAL CAMPUS CUSTODY
                      </span>
                      <p style={{ margin: "4px 0 2px", fontSize: "13px", color: "#047857", fontWeight: "700" }}>
                        📍 {report.custodyLocation}
                      </p>
                      <small style={{ color: "#059669", fontSize: "11.5px", display: "block" }}>
                        💡 Show your College ID Card at the counter to collect.
                      </small>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "14px", flexWrap: "wrap", gap: "8px" }}>
                    <span className="status found-status">
                      📍 FOUND
                    </span>

                    {/* Claim Action or Status */}
                    {isOwner ? (
                      <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b", padding: "6px 12px", background: "#f1f5f9", borderRadius: "9999px" }}>
                        Your Report
                      </span>
                    ) : myClaim ? (
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "700",
                          padding: "6px 12px",
                          borderRadius: "9999px",
                          background: myClaim.status === "approved" ? "#dcfce7" : myClaim.status === "rejected" ? "#fee2e2" : "#fef3c7",
                          color: myClaim.status === "approved" ? "#166534" : myClaim.status === "rejected" ? "#991b1b" : "#92400e",
                        }}
                      >
                        {myClaim.status === "approved"
                          ? "🎉 Claim Approved!"
                          : myClaim.status === "rejected"
                          ? "❌ Claim Rejected"
                          : "⏳ Claim Pending"}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleOpenClaimModal(report)}
                        style={{
                          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                          color: "#ffffff",
                          border: "none",
                          padding: "8px 16px",
                          borderRadius: "9999px",
                          fontSize: "13px",
                          fontWeight: "700",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => (e.target.style.transform = "translateY(-2px)")}
                        onMouseLeave={(e) => (e.target.style.transform = "none")}
                      >
                        🔐 Claim Item
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Claim Verification Modal */}
      {claimModalReport && (
        <div className="claim-modal-overlay" onClick={handleCloseClaimModal}>
          <div className="claim-modal" onClick={(e) => e.stopPropagation()}>
            <div className="claim-modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "28px" }}>🔐</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", color: "#0f172a" }}>Proof of Ownership</h3>
                  <small style={{ color: "#64748b" }}>Claiming "{claimModalReport.itemName}"</small>
                </div>
              </div>
              <button className="claim-modal-close" onClick={handleCloseClaimModal}>✕</button>
            </div>

            <form onSubmit={handleSubmitClaim} style={{ marginTop: "16px" }}>
              <div className="claim-question-box">
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#4f46e5", marginBottom: "4px" }}>
                  ❓ {claimModalReport.verificationQuestion ? "Finder's Verification Question:" : "Proof of Ownership Request:"}
                </label>
                <p style={{ margin: 0, fontSize: "14px", color: "#1e293b", fontWeight: "600" }}>
                  {claimModalReport.verificationQuestion || "Describe unique identifying marks, serial numbers, contents, or features proving this item is yours."}
                </p>
              </div>

              <div style={{ marginTop: "16px", textAlign: "left" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Your Proof Answer <span style={{ color: "#ef4444" }}>*</span>
                </label>
                <textarea
                  rows="4"
                  placeholder="Provide precise details only the rightful owner would know..."
                  value={proofAnswer}
                  onChange={(e) => setProofAnswer(e.target.value)}
                  required
                  style={{ width: "100%", padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "14px", outline: "none" }}
                />
              </div>

              <div style={{ marginTop: "14px", textAlign: "left" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
                  Your Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210 (shared with finder upon approval)"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "14px" }}
                />
              </div>

              <div style={{ display: "flex", gap: "10px", marginTop: "22px" }}>
                <button
                  type="button"
                  onClick={handleCloseClaimModal}
                  style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "1px solid #cbd5e1", background: "#f8fafc", color: "#475569", fontWeight: "700", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingClaim}
                  style={{
                    flex: 2,
                    padding: "12px",
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                    color: "#ffffff",
                    fontWeight: "700",
                    cursor: submittingClaim ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.3)",
                  }}
                >
                  {submittingClaim ? "Submitting Proof..." : "Submit Claim 🔐"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Found;