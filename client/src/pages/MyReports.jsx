import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { getImageUrl } from "../utils/imageUtils";
import { useNotification } from "../context/NotificationContext";

function MyReports() {
  const [reports, setReports] = useState([]);
  const [myClaims, setMyClaims] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [expandedClaims, setExpandedClaims] = useState({});
  const [processingClaimId, setProcessingClaimId] = useState(null);

  const { showNotification } = useNotification();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ========================================
  // Fetch My Reports & My Claims
  // ========================================
  useEffect(() => {
    fetchReports();
    fetchMyClaims();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reports");
      const userReports = response.data.filter((report) => {
        if (!report.user) return false;
        const reportUserId = typeof report.user === "object" ? report.user._id : report.user;
        return reportUserId === user?._id;
      });
      setReports(userReports);
    } catch (error) {
      console.error("Fetch My Reports Error:", error);
      showNotification({
        title: "Load Error",
        message: error.response?.data?.message || "Failed to load your reports",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMyClaims = async () => {
    try {
      const response = await api.get("/reports/claims/my");
      setMyClaims(response.data || []);
    } catch (error) {
      console.error("Fetch My Claims Error:", error);
    }
  };

  const toggleClaims = (reportId) => {
    setExpandedClaims((prev) => ({
      ...prev,
      [reportId]: !prev[reportId],
    }));
  };

  const handleReviewClaim = async (reportId, claimId, status) => {
    const actionText = status === "approved" ? "Approve" : "Reject";
    const confirmed = window.confirm(`Are you sure you want to ${actionText} this claim?`);
    if (!confirmed) return;

    try {
      setProcessingClaimId(claimId);
      const response = await api.put(`/reports/${reportId}/claims/${claimId}/review`, { status });

      showNotification({
        title: status === "approved" ? "🎉 Claim Approved" : "Claim Rejected",
        message: response.data.message || `Claim has been ${status}.`,
        type: status === "approved" ? "success" : "info",
      });

      fetchReports();
    } catch (error) {
      console.error("Review Claim Error:", error);
      showNotification({
        title: "Review Error",
        message: error.response?.data?.message || "Failed to review claim.",
        type: "error",
      });
    } finally {
      setProcessingClaimId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this report?");
    if (!confirmed) return;

    try {
      await api.delete(`/reports/${id}`);
      showNotification({
        title: "Report Deleted",
        message: "Report deleted successfully.",
        type: "success",
      });
      fetchReports();
    } catch (error) {
      console.error("Delete Report Error:", error);
      showNotification({
        title: "Delete Error",
        message: error.response?.data?.message || "Failed to delete report",
        type: "error",
      });
    }
  };

  const handleReturned = async (id) => {
    const confirmed = window.confirm("Have you received/returned this item? The report will be marked as returned and cannot be edited afterwards.");
    if (!confirmed) return;

    try {
      await api.put(`/reports/${id}/returned`);
      showNotification({
        title: "Status Updated",
        message: "Item marked as returned successfully.",
        type: "success",
      });
      fetchReports();
    } catch (error) {
      console.error("Mark Returned Error:", error);
      showNotification({
        title: "Update Error",
        message: error.response?.data?.message || "Failed to mark item as returned",
        type: "error",
      });
    }
  };

  const filteredReports = reports.filter((report) => {
    if (filter === "active") return report.status !== "returned";
    if (filter === "returned") return report.status === "returned";
    return true;
  });

  const totalReports = reports.length;
  const activeReports = reports.filter((r) => r.status !== "returned").length;
  const returnedReports = reports.filter((r) => r.status === "returned").length;

  if (loading) {
    return (
      <div className="reports-page">
        <div className="empty-report">
          <h2>📋 Loading Your Reports...</h2>
          <p>Please wait while we load your reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <h1>📋 My Reports &amp; Claims</h1>
      <p className="reports-subtitle">Manage the Lost &amp; Found items reported by you and track your submitted claims.</p>

      {/* Summary stats */}
      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="icon">📋</div>
          <h2>{totalReports}</h2>
          <p>Total Reports</p>
        </div>
        <div className="dashboard-card">
          <div className="icon">🟢</div>
          <h2>{activeReports}</h2>
          <p>Active Reports</p>
        </div>
        <div className="dashboard-card">
          <div className="icon">✅</div>
          <h2>{returnedReports}</h2>
          <p>Returned Reports</p>
        </div>
        <div className="dashboard-card">
          <div className="icon">🔐</div>
          <h2>{myClaims.length}</h2>
          <p>My Claims</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ textAlign: "center", margin: "30px 0", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px" }}>
        <button
          onClick={() => setFilter("all")}
          className="login-btn"
          style={{ background: filter === "all" ? "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" : "#ffffff", color: filter === "all" ? "#ffffff" : "#475569", border: "1px solid #cbd5e1" }}
        >
          📋 All Reports ({totalReports})
        </button>
        <button
          onClick={() => setFilter("active")}
          className="login-btn"
          style={{ background: filter === "active" ? "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" : "#ffffff", color: filter === "active" ? "#ffffff" : "#475569", border: "1px solid #cbd5e1" }}
        >
          🟢 Active ({activeReports})
        </button>
        <button
          onClick={() => setFilter("returned")}
          className="login-btn"
          style={{ background: filter === "returned" ? "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)" : "#ffffff", color: filter === "returned" ? "#ffffff" : "#475569", border: "1px solid #cbd5e1" }}
        >
          ✅ Returned ({returnedReports})
        </button>
        <button
          onClick={() => setFilter("claims")}
          className="login-btn"
          style={{ background: filter === "claims" ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "#ffffff", color: filter === "claims" ? "#ffffff" : "#475569", border: "1px solid #cbd5e1" }}
        >
          🔐 My Submitted Claims ({myClaims.length})
        </button>
        <button onClick={() => { fetchReports(); fetchMyClaims(); }} className="login-btn" style={{ background: "#64748b" }}>
          🔄 Refresh
        </button>
      </div>

      {/* VIEW: MY SUBMITTED CLAIMS TAB */}
      {filter === "claims" ? (
        <div>
          {myClaims.length === 0 ? (
            <div className="empty-report">
              <h2>🔐 No Claims Submitted Yet</h2>
              <p>When you see an item in "Found Items" that belongs to you, click "Claim Item" to submit proof of ownership.</p>
              <div style={{ marginTop: "16px" }}>
                <Link to="/found">
                  <button className="login-btn">📍 Browse Found Items</button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="reports-grid">
              {myClaims.map((claimItem) => {
                const isApproved = claimItem.status === "approved";
                const isRejected = claimItem.status === "rejected";
                const isPending = claimItem.status === "pending";
                const imgUrl = getImageUrl(claimItem.image);

                return (
                  <div className="report-card" key={claimItem.claimId}>
                    <div style={{ textAlign: "center", marginBottom: "12px" }}>
                      <span
                        className="status"
                        style={{
                          background: isApproved ? "#dcfce7" : isRejected ? "#fee2e2" : "#fef3c7",
                          color: isApproved ? "#166534" : isRejected ? "#991b1b" : "#92400e",
                        }}
                      >
                        {isApproved ? "🎉 CLAIM APPROVED" : isRejected ? "❌ NOT VERIFIED" : "⏳ PENDING FINDER REVIEW"}
                      </span>
                    </div>

                    {imgUrl ? (
                      <img src={imgUrl} alt={claimItem.itemName} className="report-image" />
                    ) : (
                      <div className="image-placeholder">📍 Found Item</div>
                    )}

                    <h2>{claimItem.itemName}</h2>
                    <p><strong>📂 Category:</strong> {claimItem.category}</p>
                    <p><strong>📍 Found At:</strong> {claimItem.location}</p>
                    <p><strong>📅 Date Found:</strong> {claimItem.date}</p>

                    <div style={{ margin: "12px 0", padding: "10px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                      <strong style={{ fontSize: "12px", color: "#64748b", display: "block" }}>Your Proof Answer:</strong>
                      <p style={{ margin: "4px 0 0", fontSize: "13.5px", color: "#0f172a" }}>"{claimItem.proofAnswer}"</p>
                    </div>

                    {isApproved && claimItem.finder && (
                      <div style={{ marginTop: "14px", padding: "12px", background: "#ecfdf5", border: "1.5px solid #10b981", borderRadius: "12px" }}>
                        <strong style={{ color: "#065f46", fontSize: "14px" }}>🎉 Finder Contact Released:</strong>
                        <p style={{ margin: "6px 0 2px", fontSize: "13px", color: "#047857" }}>
                          <strong>Name:</strong> {claimItem.finder.name}
                        </p>
                        <p style={{ margin: "0", fontSize: "13px", color: "#047857" }}>
                          <strong>Email:</strong>{" "}
                          <a href={`mailto:${claimItem.finder.email}`} style={{ color: "#059669", fontWeight: "bold" }}>
                            {claimItem.finder.email}
                          </a>
                        </p>
                      </div>
                    )}

                    {isPending && (
                      <p style={{ fontSize: "12.5px", color: "#64748b", fontStyle: "italic", marginTop: "10px" }}>
                        ⏳ The finder has been notified. Check back soon for contact release upon approval!
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="empty-report">
          <h2>
            {filter === "returned" ? "✅ No Returned Reports" : filter === "active" ? "🟢 No Active Reports" : "📋 No Reports Yet"}
          </h2>
          <p>
            {filter === "returned" ? "You don't have any returned reports." : filter === "active" ? "You don't have any active reports." : "You have not submitted any Lost or Found reports yet."}
          </p>
          {filter === "all" && (
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px" }}>
              <Link to="/report-lost">
                <button className="login-btn">📦 Report Lost Item</button>
              </Link>
              <Link to="/report-found">
                <button className="login-btn">📍 Report Found Item</button>
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="reports-grid">
          {filteredReports.map((report) => {
            const isReturned = report.status === "returned";
            const isFoundReport = report.reportType === "found";
            const imgUrl = getImageUrl(report.image);
            const claimsCount = report.claims?.length || 0;
            const isClaimsExpanded = expandedClaims[report._id];

            return (
              <div className="report-card" key={report._id}>
                <div style={{ textAlign: "center", marginBottom: "15px" }}>
                  <span className={isReturned ? "status returned-status" : "status active-status"}>
                    {isReturned ? "✅ RETURNED" : "🟢 ACTIVE"}
                  </span>
                </div>

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
                    📷 No Photo Provided
                  </div>
                )}

                <h2>{report.itemName}</h2>
                <p><strong>Type:</strong> <span style={{ textTransform: "uppercase" }}>{report.reportType}</span></p>
                <p><strong>Category:</strong> {report.category}</p>
                <p><strong>Location:</strong> {report.location}</p>
                <p><strong>Date:</strong> {report.date}</p>
                <p><strong>Description:</strong> {report.description}</p>

                {report.verificationQuestion && (
                  <div style={{ margin: "10px 0", padding: "8px 12px", background: "rgba(99, 102, 241, 0.08)", borderRadius: "8px", border: "1px dashed #6366f1" }}>
                    <small style={{ fontWeight: "700", color: "#4f46e5", display: "block" }}>🔒 Secret Question:</small>
                    <span style={{ fontSize: "13px", color: "#1e293b", fontStyle: "italic" }}>"{report.verificationQuestion}"</span>
                  </div>
                )}

                {isReturned && report.returnedAt && (
                  <p><strong>Returned On:</strong> {new Date(report.returnedAt).toLocaleDateString()}</p>
                )}

                {/* CLAIMS REVIEW SECTION FOR FOUND REPORTS */}
                {isFoundReport && (
                  <div style={{ marginTop: "15px", paddingTop: "15px", borderTop: "1px solid #e2e8f0" }}>
                    <button
                      onClick={() => toggleClaims(report._id)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        borderRadius: "10px",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                        background: isClaimsExpanded ? "rgba(99, 102, 241, 0.15)" : "#f8fafc",
                        color: "#4f46e5",
                        fontWeight: "700",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>📬 Ownership Claims ({claimsCount})</span>
                      <span>{isClaimsExpanded ? "▲ Hide" : "▼ Review"}</span>
                    </button>

                    {isClaimsExpanded && (
                      <div style={{ marginTop: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        {claimsCount === 0 ? (
                          <div style={{ padding: "12px", background: "#f8fafc", borderRadius: "10px", fontSize: "13px", color: "#64748b", textAlign: "center" }}>
                            No ownership claims submitted yet.
                          </div>
                        ) : (
                          report.claims.map((claim) => (
                            <div
                              key={claim._id}
                              style={{
                                padding: "12px",
                                background: claim.status === "approved" ? "#f0fdf4" : claim.status === "rejected" ? "#fef2f2" : "#ffffff",
                                border: `1px solid ${claim.status === "approved" ? "#bbf7d0" : claim.status === "rejected" ? "#fecaca" : "#e2e8f0"}`,
                                borderRadius: "10px",
                                textAlign: "left",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                <strong style={{ fontSize: "13.5px", color: "#0f172a" }}>{claim.claimantName}</strong>
                                <span
                                  style={{
                                    fontSize: "11px",
                                    fontWeight: "800",
                                    padding: "3px 8px",
                                    borderRadius: "9999px",
                                    background: claim.status === "approved" ? "#dcfce7" : claim.status === "rejected" ? "#fee2e2" : "#fef3c7",
                                    color: claim.status === "approved" ? "#166534" : claim.status === "rejected" ? "#991b1b" : "#92400e",
                                  }}
                                >
                                  {claim.status.toUpperCase()}
                                </span>
                              </div>

                              <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "6px" }}>
                                ✉️ {claim.claimantEmail} {claim.contactPhone ? `| 📞 ${claim.contactPhone}` : ""}
                              </div>

                              <div style={{ padding: "8px", background: "rgba(15, 23, 42, 0.04)", borderRadius: "8px", fontSize: "13px", color: "#334155" }}>
                                <strong>Proof Answer:</strong> "{claim.proofAnswer}"
                              </div>

                              {claim.status === "pending" && (
                                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                                  <button
                                    onClick={() => handleReviewClaim(report._id, claim._id, "approved")}
                                    disabled={processingClaimId === claim._id}
                                    style={{
                                      flex: 1,
                                      padding: "6px 10px",
                                      borderRadius: "8px",
                                      border: "none",
                                      background: "#16a34a",
                                      color: "#ffffff",
                                      fontSize: "12px",
                                      fontWeight: "700",
                                      cursor: "pointer",
                                    }}
                                  >
                                    ✅ Approve
                                  </button>
                                  <button
                                    onClick={() => handleReviewClaim(report._id, claim._id, "rejected")}
                                    disabled={processingClaimId === claim._id}
                                    style={{
                                      flex: 1,
                                      padding: "6px 10px",
                                      borderRadius: "8px",
                                      border: "none",
                                      background: "#ef4444",
                                      color: "#ffffff",
                                      fontSize: "12px",
                                      fontWeight: "700",
                                      cursor: "pointer",
                                    }}
                                  >
                                    ❌ Reject
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div style={{ marginTop: "20px" }}>
                  {!isReturned && (
                    <>
                      <Link to={`/edit-report/${report._id}`}>
                        <button className="login-btn" style={{ padding: "8px 16px" }}>✏️ Edit</button>
                      </Link>{" "}
                      <button onClick={() => handleReturned(report._id)} className="login-btn" style={{ padding: "8px 16px", background: "#16a34a" }}>
                        ✅ Mark Returned
                      </button>{" "}
                    </>
                  )}
                  <button onClick={() => handleDelete(report._id)} className="logout-btn" style={{ padding: "8px 16px" }}>
                    🗑️ Delete
                  </button>
                </div>

                {isReturned && (
                  <div style={{ marginTop: "15px", padding: "10px", borderRadius: "10px", background: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                    <strong style={{ color: "#166534" }}>🔒 Report Locked</strong>
                    <p style={{ fontSize: "13px", color: "#15803d", margin: "4px 0 0" }}>
                      This report has been marked as returned and can no longer be edited.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyReports;