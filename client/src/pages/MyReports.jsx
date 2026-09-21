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
      <div style={{ textAlign: "center", marginBottom: "22px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "0 0 6px" }}>
          📋 My Reports &amp; Claims
        </h1>
        <p style={{ color: "#64748b", fontSize: "14px", margin: 0 }}>
          Manage your reported items and track proof of ownership claims in real time.
        </p>
      </div>

      {/* Compact Modern Stats Strip */}
      <div className="myreports-stats-strip">
        <div className="myreports-stat-pill">
          <span className="myreports-stat-icon">📋</span>
          <div className="myreports-stat-data">
            <div className="myreports-stat-num">{totalReports}</div>
            <div className="myreports-stat-label">Total Reports</div>
          </div>
        </div>

        <div className="myreports-stat-pill">
          <span className="myreports-stat-icon">🟢</span>
          <div className="myreports-stat-data">
            <div className="myreports-stat-num" style={{ color: "#16a34a" }}>{activeReports}</div>
            <div className="myreports-stat-label">Active Items</div>
          </div>
        </div>

        <div className="myreports-stat-pill">
          <span className="myreports-stat-icon">✅</span>
          <div className="myreports-stat-data">
            <div className="myreports-stat-num" style={{ color: "#4f46e5" }}>{returnedReports}</div>
            <div className="myreports-stat-label">Returned Items</div>
          </div>
        </div>

        <div className="myreports-stat-pill">
          <span className="myreports-stat-icon">🔐</span>
          <div className="myreports-stat-data">
            <div className="myreports-stat-num" style={{ color: "#059669" }}>{myClaims.length}</div>
            <div className="myreports-stat-label">Submitted Claims</div>
          </div>
        </div>
      </div>

      {/* Compact Segmented Tab Filter Bar */}
      <div className="myreports-tabs-bar">
        <button
          onClick={() => setFilter("all")}
          className={`myreports-tab-btn ${filter === "all" ? "active" : ""}`}
        >
          📋 All ({totalReports})
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`myreports-tab-btn ${filter === "active" ? "active" : ""}`}
        >
          🟢 Active ({activeReports})
        </button>
        <button
          onClick={() => setFilter("returned")}
          className={`myreports-tab-btn ${filter === "returned" ? "active" : ""}`}
        >
          ✅ Returned ({returnedReports})
        </button>
        <button
          onClick={() => setFilter("claims")}
          className={`myreports-tab-btn ${filter === "claims" ? "active-claims" : ""}`}
        >
          🔐 My Claims ({myClaims.length})
        </button>
        <button
          onClick={() => { fetchReports(); fetchMyClaims(); }}
          className="myreports-refresh-btn"
          title="Refresh reports and claims"
        >
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
                  <div className="report-card myreports-card" key={claimItem.claimId}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <span
                        className="status"
                        style={{
                          fontSize: "11px",
                          padding: "4px 10px",
                          borderRadius: "9999px",
                          background: isApproved ? "#dcfce7" : isRejected ? "#fee2e2" : "#fef3c7",
                          color: isApproved ? "#166534" : isRejected ? "#991b1b" : "#92400e",
                          fontWeight: "800",
                        }}
                      >
                        {isApproved ? "🎉 CLAIM APPROVED" : isRejected ? "❌ NOT VERIFIED" : "⏳ PENDING REVIEW"}
                      </span>
                      <span style={{ fontSize: "11.5px", color: "#64748b", fontWeight: "700" }}>
                        📍 FOUND ITEM
                      </span>
                    </div>

                    {imgUrl ? (
                      <img src={imgUrl} alt={claimItem.itemName} className="myreports-card-img" />
                    ) : (
                      <div className="image-placeholder" style={{ height: "160px", marginBottom: "12px" }}>
                        📍 No Photo
                      </div>
                    )}

                    <h2 className="myreports-card-title">{claimItem.itemName}</h2>

                    <div className="myreports-meta-list">
                      <p><strong>📂 Category:</strong> {claimItem.category}</p>
                      <p><strong>📍 Found Location:</strong> {claimItem.location}</p>
                      <p><strong>📅 Date Found:</strong> {claimItem.date}</p>
                    </div>

                    <div style={{ margin: "10px 0", padding: "10px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0", textAlign: "left" }}>
                      <strong style={{ fontSize: "11.5px", color: "#64748b", display: "block" }}>Your Proof Answer:</strong>
                      <p style={{ margin: "3px 0 0", fontSize: "13px", color: "#0f172a" }}>"{claimItem.proofAnswer}"</p>
                    </div>

                    {isApproved && claimItem.finder && (
                      <div style={{ marginTop: "10px", padding: "10px 12px", background: "#ecfdf5", border: "1.5px solid #10b981", borderRadius: "10px", textAlign: "left" }}>
                        <strong style={{ color: "#065f46", fontSize: "12.5px" }}>🎉 Finder Contact Released:</strong>
                        <p style={{ margin: "4px 0 2px", fontSize: "12.5px", color: "#047857" }}>
                          <strong>Name:</strong> {claimItem.finder.name}
                        </p>
                        <p style={{ margin: "0", fontSize: "12.5px", color: "#047857" }}>
                          <strong>Email:</strong>{" "}
                          <a href={`mailto:${claimItem.finder.email}`} style={{ color: "#059669", fontWeight: "bold" }}>
                            {claimItem.finder.email}
                          </a>
                        </p>
                      </div>
                    )}

                    {isPending && (
                      <p style={{ fontSize: "12px", color: "#64748b", fontStyle: "italic", margin: "8px 0 0" }}>
                        ⏳ Finder will review your proof. Contact details will appear here once approved.
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
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "16px" }}>
              <Link to="/report-lost">
                <button className="myreports-action-btn myreports-edit-btn" style={{ padding: "10px 18px" }}>📦 Report Lost Item</button>
              </Link>
              <Link to="/report-found">
                <button className="myreports-action-btn myreports-returned-btn" style={{ padding: "10px 18px" }}>📍 Report Found Item</button>
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
              <div className="report-card myreports-card" key={report._id}>
                {/* Header Badge Row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <span className={isReturned ? "status returned-status" : "status active-status"} style={{ fontSize: "11px", padding: "4px 10px" }}>
                    {isReturned ? "✅ RETURNED" : "🟢 ACTIVE"}
                  </span>
                  <span style={{ fontSize: "11.5px", fontWeight: "700", color: isFoundReport ? "#059669" : "#dc2626" }}>
                    {isFoundReport ? "📍 FOUND REPORT" : "📦 LOST REPORT"}
                  </span>
                </div>

                {/* Compact Image */}
                {imgUrl ? (
                  <img
                    src={imgUrl}
                    alt={report.itemName}
                    className="myreports-card-img"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=60";
                    }}
                  />
                ) : (
                  <div className="image-placeholder" style={{ height: "160px", marginBottom: "12px" }}>
                    📷 No Photo
                  </div>
                )}

                {/* Title */}
                <h2 className="myreports-card-title">{report.itemName}</h2>

                {/* Meta details */}
                <div className="myreports-meta-list">
                  <p><strong>📂 Category:</strong> {report.category}</p>
                  <p><strong>📍 Location:</strong> {report.location}</p>
                  <p><strong>📅 Date:</strong> {report.date}</p>
                  <p><strong>📝 Description:</strong> {report.description}</p>
                  {isReturned && report.returnedAt && (
                    <p><strong>✅ Returned On:</strong> {new Date(report.returnedAt).toLocaleDateString()}</p>
                  )}
                </div>

                {/* Autonomous College Campus Custody Badge */}
                {report.custodyType === "college_desk" && report.custodyLocation && (
                  <div style={{ margin: "8px 0", padding: "8px 10px", background: "#ecfdf5", borderRadius: "10px", border: "1px solid #10b981", textAlign: "left" }}>
                    <span style={{ fontSize: "11px", fontWeight: "800", color: "#065f46", display: "block" }}>
                      🛡️ IN CAMPUS CUSTODY:
                    </span>
                    <span style={{ fontSize: "12.5px", color: "#047857", fontWeight: "700" }}>
                      📍 {report.custodyLocation}
                    </span>
                  </div>
                )}

                {/* Secret Verification Question */}
                {report.verificationQuestion && (
                  <div style={{ margin: "8px 0", padding: "8px 10px", background: "rgba(99, 102, 241, 0.08)", borderRadius: "8px", border: "1px dashed #6366f1", textAlign: "left" }}>
                    <small style={{ fontWeight: "700", color: "#4f46e5", display: "block", fontSize: "11px" }}>🔒 Secret Question:</small>
                    <span style={{ fontSize: "12.5px", color: "#1e293b", fontStyle: "italic" }}>"{report.verificationQuestion}"</span>
                  </div>
                )}

                {/* CLAIMS REVIEW SECTION FOR FOUND REPORTS */}
                {isFoundReport && (
                  <div style={{ margin: "10px 0 6px" }}>
                    <button
                      onClick={() => toggleClaims(report._id)}
                      style={{
                        width: "100%",
                        padding: "7px 10px",
                        borderRadius: "8px",
                        border: "1px solid rgba(99, 102, 241, 0.3)",
                        background: isClaimsExpanded ? "rgba(99, 102, 241, 0.15)" : "#f8fafc",
                        color: "#4f46e5",
                        fontWeight: "700",
                        fontSize: "12px",
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
                      <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "8px" }}>
                        {claimsCount === 0 ? (
                          <div style={{ padding: "10px", background: "#f8fafc", borderRadius: "8px", fontSize: "12px", color: "#64748b", textAlign: "center" }}>
                            No ownership claims submitted yet.
                          </div>
                        ) : (
                          report.claims.map((claim) => (
                            <div
                              key={claim._id}
                              style={{
                                padding: "10px",
                                background: claim.status === "approved" ? "#f0fdf4" : claim.status === "rejected" ? "#fef2f2" : "#ffffff",
                                border: `1px solid ${claim.status === "approved" ? "#bbf7d0" : claim.status === "rejected" ? "#fecaca" : "#e2e8f0"}`,
                                borderRadius: "8px",
                                textAlign: "left",
                              }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                                <strong style={{ fontSize: "13px", color: "#0f172a" }}>{claim.claimantName}</strong>
                                <span
                                  style={{
                                    fontSize: "10.5px",
                                    fontWeight: "800",
                                    padding: "2px 7px",
                                    borderRadius: "9999px",
                                    background: claim.status === "approved" ? "#dcfce7" : claim.status === "rejected" ? "#fee2e2" : "#fef3c7",
                                    color: claim.status === "approved" ? "#166534" : claim.status === "rejected" ? "#991b1b" : "#92400e",
                                  }}
                                >
                                  {claim.status.toUpperCase()}
                                </span>
                              </div>

                              <div style={{ fontSize: "11.5px", color: "#64748b", marginBottom: "4px" }}>
                                ✉️ {claim.claimantEmail} {claim.contactPhone ? `| 📞 ${claim.contactPhone}` : ""}
                              </div>

                              <div style={{ padding: "6px 8px", background: "rgba(15, 23, 42, 0.04)", borderRadius: "6px", fontSize: "12px", color: "#334155" }}>
                                <strong>Proof:</strong> "{claim.proofAnswer}"
                              </div>

                              {claim.status === "pending" && (
                                <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                                  <button
                                    onClick={() => handleReviewClaim(report._id, claim._id, "approved")}
                                    disabled={processingClaimId === claim._id}
                                    style={{
                                      flex: 1,
                                      padding: "6px",
                                      borderRadius: "6px",
                                      border: "none",
                                      background: "#16a34a",
                                      color: "#ffffff",
                                      fontSize: "11.5px",
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
                                      padding: "6px",
                                      borderRadius: "6px",
                                      border: "none",
                                      background: "#ef4444",
                                      color: "#ffffff",
                                      fontSize: "11.5px",
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

                {/* Clean Compact Actions Row */}
                <div className="myreports-actions-row">
                  {!isReturned && (
                    <>
                      <Link
                        to={`/edit-report/${report._id}`}
                        className="myreports-action-btn myreports-edit-btn"
                      >
                        ✏️ Edit
                      </Link>
                      <button
                        onClick={() => handleReturned(report._id)}
                        className="myreports-action-btn myreports-returned-btn"
                      >
                        ✅ Mark Returned
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(report._id)}
                    className="myreports-action-btn myreports-delete-btn"
                  >
                    🗑️ Delete
                  </button>
                </div>

                {isReturned && (
                  <div style={{ marginTop: "10px", padding: "8px 10px", borderRadius: "8px", background: "#f0fdf4", border: "1px solid #bbf7d0", textAlign: "left" }}>
                    <strong style={{ color: "#166534", fontSize: "12px" }}>🔒 Report Closed</strong>
                    <p style={{ fontSize: "11.5px", color: "#15803d", margin: "2px 0 0" }}>
                      Item returned successfully.
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