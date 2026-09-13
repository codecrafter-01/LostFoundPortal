import { useEffect, useState } from "react";
import axios from "axios";

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

      const response = await axios.get(
        "http://localhost:5000/api/reports"
      );

      const foundReports =
        response.data.filter(
          (report) =>
            String(
              report.reportType || ""
            ).toLowerCase() === "found" &&
            report.status !== "returned"
        );

      setReports(foundReports);

    } catch (error) {
      console.error(
        "Fetch Found Reports Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load found reports"
      );

    } finally {
      setLoading(false);
    }
  };

  // ==============================
  // Search
  // ==============================
  const filteredReports =
    reports.filter((report) => {
      const searchText =
        search.toLowerCase().trim();

      return (
        String(report.itemName || "")
          .toLowerCase()
          .includes(searchText) ||

        String(report.category || "")
          .toLowerCase()
          .includes(searchText) ||

        String(report.location || "")
          .toLowerCase()
          .includes(searchText) ||

        String(report.description || "")
          .toLowerCase()
          .includes(searchText)
      );
    });

  // ==============================
  // Loading
  // ==============================
  if (loading) {
    return (
      <div className="reports-page">

        <h1>📍 Found Items</h1>

        <div className="empty-report">

          <h2>
            Loading found items...
          </h2>

          <p>
            Please wait.
          </p>

        </div>

      </div>
    );
  }

  // ==============================
  // Page
  // ==============================
  return (
    <div className="reports-page">

      {/* ============================== */}
      {/* Heading */}
      {/* ============================== */}

      <h1>📍 Found Items</h1>

      <p className="reports-subtitle">
        View items currently reported found
        by students.
      </p>

      {/* ============================== */}
      {/* Search */}
      {/* ============================== */}

      <div className="report-toolbar">

        <input
          type="text"
          placeholder="🔍 Search item, category, location..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

      </div>

      {/* ============================== */}
      {/* Report Count */}
      {/* ============================== */}

      <div
        style={{
          textAlign: "center",
          margin: "20px 0",
          fontSize: "18px",
          fontWeight: "600",
        }}
      >
        {filteredReports.length} found item
        {filteredReports.length !== 1
          ? "s"
          : ""}{" "}
        found
      </div>

      {/* ============================== */}
      {/* No Reports */}
      {/* ============================== */}

      {filteredReports.length === 0 ? (

        <div className="empty-report">

          <h2>
            📍 No Found Items
          </h2>

          {search ? (
            <p>
              No active found items match
              your search.
            </p>
          ) : (
            <p>
              No active found items have
              been reported yet.
            </p>
          )}

        </div>

      ) : (

        /* ============================== */
        /* Reports Grid */
        /* ============================== */

        <div className="reports-grid">

          {filteredReports.map(
            (report) => (

              <div
                className="report-card"
                key={report._id}
              >

                {/* ============================== */}
                {/* Image */}
                {/* ============================== */}

                {report.image ? (

                  <img
                    src={`http://localhost:5000${report.image}`}
                    alt={report.itemName}
                    className="report-image"
                    onError={(e) => {
                      e.target.style.display =
                        "none";
                    }}
                  />

                ) : (

                  <div
                    style={{
                      height: "180px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      background:
                        "#f1f3f8",
                      fontSize: "60px",
                      borderRadius: "12px",
                    }}
                  >
                    📍
                  </div>

                )}

                {/* ============================== */}
                {/* Content */}
                {/* ============================== */}

                <div className="report-content">

                  <h2>
                    {report.itemName}
                  </h2>

                  <p>
                    <strong>
                      📂 Category:
                    </strong>{" "}
                    {report.category}
                  </p>

                  <p>
                    <strong>
                      📍 Location:
                    </strong>{" "}
                    {report.location}
                  </p>

                  <p>
                    <strong>
                      📅 Date:
                    </strong>{" "}
                    {report.date}
                  </p>

                  <p>
                    <strong>
                      📝 Description:
                    </strong>{" "}
                    {report.description}
                  </p>

                  <p>
                    <strong>
                      👤 Reported By:
                    </strong>{" "}
                    {report.user?.name ||
                      "Unknown"}
                  </p>

                  {/* Found Badge */}

                  <span className="status found-status">
                    📍 FOUND
                  </span>

                </div>

              </div>

            )
          )}

        </div>

      )}

    </div>
  );
}

export default Found;