import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import { getImageUrl } from "../utils/imageUtils";
import { useNotification } from "../context/NotificationContext";

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const user = JSON.parse(localStorage.getItem("user") || "null");

  // ========================================
  // Fetch Reports
  // ========================================
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get("/reports");
      findMatches(response.data);
    } catch (error) {
      console.error("Fetch Matching Reports Error:", error);
      showNotification({
        title: "Match Error",
        message: error.response?.data?.message || "Failed to load matching reports",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // Convert Text To Words
  // ========================================
  const getWords = (text) => {
    return (text || "")
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2);
  };

  // ========================================
  // Calculate Text Similarity
  // ========================================
  const calculateSimilarity = (text1, text2) => {
    const words1 = getWords(text1);
    const words2 = getWords(text2);
    if (words1.length === 0 || words2.length === 0) return 0;
    const commonWords = words1.filter((word) => words2.includes(word));
    const uniqueWords = [...new Set([...words1, ...words2])];
    if (uniqueWords.length === 0) return 0;
    return commonWords.length / uniqueWords.length;
  };

  // ========================================
  // Find Smart Matches
  // ========================================
  const findMatches = (allReports) => {
    if (!user?._id) {
      setMatches([]);
      return;
    }

    const myReports = allReports.filter((report) => {
      if (!report.user) return false;
      const reportUserId = typeof report.user === "object" ? report.user._id : report.user;
      return reportUserId === user._id;
    });

    const activeMyReports = myReports.filter((report) => report.status !== "returned");
    const possibleMatches = [];

    activeMyReports.forEach((myReport) => {
      allReports.forEach((otherReport) => {
        if (otherReport._id === myReport._id) return;
        if (otherReport.status === "returned") return;
        if (myReport.reportType === otherReport.reportType) return;

        let score = 0;
        const reasons = [];

        // 1. ITEM NAME — 40%
        const myItem = (myReport.itemName || "").toLowerCase().trim();
        const otherItem = (otherReport.itemName || "").toLowerCase().trim();

        if (myItem && otherItem) {
          if (myItem === otherItem) {
            score += 40;
            reasons.push("Same item name");
          } else if (myItem.includes(otherItem) || otherItem.includes(myItem)) {
            score += 30;
            reasons.push("Very similar item name");
          } else {
            const similarity = calculateSimilarity(myItem, otherItem);
            if (similarity >= 0.5) {
              score += 20;
              reasons.push("Similar item name");
            }
          }
        }

        // 2. CATEGORY — 25%
        const myCategory = (myReport.category || "").toLowerCase().trim();
        const otherCategory = (otherReport.category || "").toLowerCase().trim();

        if (myCategory && otherCategory && myCategory === otherCategory) {
          score += 25;
          reasons.push("Same category");
        }

        // 3. LOCATION — 20%
        const myLocation = (myReport.location || "").toLowerCase().trim();
        const otherLocation = (otherReport.location || "").toLowerCase().trim();

        if (myLocation && otherLocation) {
          if (myLocation === otherLocation) {
            score += 20;
            reasons.push("Same location");
          } else if (myLocation.includes(otherLocation) || otherLocation.includes(myLocation)) {
            score += 10;
            reasons.push("Similar location");
          }
        }

        // 4. DESCRIPTION — 15%
        const myDescription = myReport.description || "";
        const otherDescription = otherReport.description || "";
        const descriptionSimilarity = calculateSimilarity(myDescription, otherDescription);

        if (descriptionSimilarity >= 0.5) {
          score += 15;
          reasons.push("Similar description");
        } else if (descriptionSimilarity >= 0.25) {
          score += 8;
          reasons.push("Related description");
        }

        if (score >= 50) {
          possibleMatches.push({
            myReport,
            matchedReport: otherReport,
            score,
            reasons,
          });
        }
      });
    });

    const uniqueMatches = [];
    const seen = new Set();

    possibleMatches.forEach((match) => {
      const key = `${match.myReport._id}-${match.matchedReport._id}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueMatches.push(match);
      }
    });

    uniqueMatches.sort((a, b) => b.score - a.score);
    setMatches(uniqueMatches);
  };

  const getMatchLabel = (score) => {
    if (score >= 80) return "Excellent Match";
    if (score >= 65) return "Strong Match";
    return "Possible Match";
  };

  if (loading) {
    return (
      <div className="reports-page">
        <div className="empty-report">
          <h2>🔎 Finding Possible Matches...</h2>
          <p>Our smart matching system is comparing your reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <h1>🤝 Smart Lost & Found Matches</h1>
      <p className="reports-subtitle">
        Our smart matching algorithm compares item names, categories, locations, and descriptions side-by-side to find potential matches.
      </p>

      {matches.length === 0 ? (
        <div className="empty-report">
          <h2>🔍 No Possible Matches Found</h2>
          <p>We couldn't find a strong match for your active reports yet.</p>
          <p>New matches will appear automatically when someone reports a related item.</p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", marginTop: "16px", flexWrap: "wrap" }}>
            <Link to="/report-lost">
              <button className="login-btn">📦 Report Lost Item</button>
            </Link>
            <Link to="/report-found">
              <button className="login-btn">📍 Report Found Item</button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div style={{ textAlign: "center", margin: "20px 0 35px", fontSize: "18px", fontWeight: "700" }}>
            <span style={{ background: "#e0e7ff", color: "#4f46e5", padding: "8px 20px", borderRadius: "9999px" }}>
              🎯 {matches.length} possible match{matches.length !== 1 ? "es" : ""} detected
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "40px" }}>
            {matches.map((match, index) => {
              const label = getMatchLabel(match.score);
              const myImg = getImageUrl(match.myReport.image);
              const matchedImg = getImageUrl(match.matchedReport.image);

              return (
                <div key={`${match.myReport._id}-${match.matchedReport._id}-${index}`} className="match-card-container">
                  {/* Top Match Badge Header */}
                  <div className="match-header-badge">
                    <span className="status returned-status" style={{ fontSize: "15px", padding: "8px 20px" }}>
                      ⭐ {match.score}% {label}
                    </span>
                    
                    <div className="match-reasons-inline">
                      <strong>Reasons:</strong> {match.reasons.join(" • ")}
                    </div>
                  </div>

                  {/* Side-by-Side 2-Column Grid */}
                  <div className="match-comparison-grid">
                    {/* Left Column: Your Report */}
                    <div className="match-column my-report-column">
                      <div className="column-badge">🧑 Your Report ({match.myReport.reportType.toUpperCase()})</div>

                      {myImg ? (
                        <img
                          src={myImg}
                          alt={match.myReport.itemName}
                          className="report-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=60";
                          }}
                        />
                      ) : (
                        <div className="image-placeholder">
                          📷 No Image Provided
                        </div>
                      )}

                      <h2>{match.myReport.itemName}</h2>
                      <p><strong>Category:</strong> {match.myReport.category}</p>
                      <p><strong>Location:</strong> {match.myReport.location}</p>
                      <p><strong>Date:</strong> {match.myReport.date}</p>
                      <p><strong>Description:</strong> {match.myReport.description}</p>
                    </div>

                    {/* Clean Vertical VS Divider */}
                    <div className="match-divider">
                      <div className="vs-circle">VS</div>
                    </div>

                    {/* Right Column: Matched Report */}
                    <div className="match-column matched-report-column">
                      <div className="column-badge matched-badge">🤝 Possible Match ({match.matchedReport.reportType.toUpperCase()})</div>

                      {matchedImg ? (
                        <img
                          src={matchedImg}
                          alt={match.matchedReport.itemName}
                          className="report-image"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=400&auto=format&fit=crop&q=60";
                          }}
                        />
                      ) : (
                        <div className="image-placeholder">
                          📷 No Image Provided
                        </div>
                      )}

                      <h2>{match.matchedReport.itemName}</h2>
                      <p><strong>Category:</strong> {match.matchedReport.category}</p>
                      <p><strong>Location:</strong> {match.matchedReport.location}</p>
                      <p><strong>Date:</strong> {match.matchedReport.date}</p>
                      <p><strong>Description:</strong> {match.matchedReport.description}</p>

                      {match.matchedReport.user && (
                        <p style={{ marginTop: "12px", background: "#f1f5f9", padding: "8px 12px", borderRadius: "10px" }}>
                          <strong>👤 Reported By:</strong> {match.matchedReport.user.name} ({match.matchedReport.user.email})
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default Matches;