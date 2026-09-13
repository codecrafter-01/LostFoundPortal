import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function MyReports() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(
    localStorage.getItem("user")
  );

  // ========================================
  // Fetch My Reports
  // ========================================

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/reports"
      );

      const myReports =
        response.data.filter((report) => {
          if (!report.user) {
            return false;
          }

          const reportUserId =
            typeof report.user === "object"
              ? report.user._id
              : report.user;

          return (
            reportUserId === user?._id
          );
        });

      setReports(myReports);

    } catch (error) {
      console.error(
        "Fetch My Reports Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to load your reports"
      );

    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // Delete Report
  // ========================================

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(
        `/reports/${id}`
      );

      alert(
        "Report deleted successfully."
      );

      fetchReports();

    } catch (error) {
      console.error(
        "Delete Report Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to delete report"
      );
    }
  };

  // ========================================
  // Mark As Returned
  // ========================================

  const handleReturned = async (id) => {
    const confirmed = window.confirm(
      "Have you received/returned this item? The report will be marked as returned and cannot be edited afterwards."
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.put(
        `/reports/${id}/returned`
      );

      alert(
        "Item marked as returned successfully."
      );

      fetchReports();

    } catch (error) {
      console.error(
        "Mark Returned Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to mark item as returned"
      );
    }
  };

  // ========================================
  // Filter Reports
  // ========================================

  const filteredReports =
    reports.filter((report) => {
      if (filter === "active") {
        return report.status !== "returned";
      }

      if (filter === "returned") {
        return report.status === "returned";
      }

      return true;
    });

  // ========================================
  // Counts
  // ========================================

  const totalReports =
    reports.length;

  const activeReports =
    reports.filter(
      (report) =>
        report.status !== "returned"
    ).length;

  const returnedReports =
    reports.filter(
      (report) =>
        report.status === "returned"
    ).length;

  // ========================================
  // Loading
  // ========================================

  if (loading) {
    return (
      <div className="reports-page">

        <div className="empty-report">

          <h2>
            📋 Loading Your Reports...
          </h2>

          <p>
            Please wait while we load
            your reports.
          </p>

        </div>

      </div>
    );
  }

  // ========================================
  // Page
  // ========================================

  return (
    <div className="reports-page">

      {/* ================================== */}
      {/* Heading */}
      {/* ================================== */}

      <h1>
        📋 My Reports
      </h1>

      <p className="reports-subtitle">
        View and manage the Lost & Found
        reports submitted by you.
      </p>


      {/* ================================== */}
      {/* Report Summary */}
      {/* ================================== */}

      <div className="dashboard-grid">

        <div className="dashboard-card">

          <div className="icon">
            📋
          </div>

          <h2>
            {totalReports}
          </h2>

          <p>
            Total Reports
          </p>

        </div>


        <div className="dashboard-card">

          <div className="icon">
            🟢
          </div>

          <h2>
            {activeReports}
          </h2>

          <p>
            Active Reports
          </p>

        </div>


        <div className="dashboard-card">

          <div className="icon">
            ✅
          </div>

          <h2>
            {returnedReports}
          </h2>

          <p>
            Returned Reports
          </p>

        </div>

      </div>


      {/* ================================== */}
      {/* Filters */}
      {/* ================================== */}

      <div
        style={{
          textAlign: "center",
          margin: "30px 0",
        }}
      >

        <button
          onClick={() =>
            setFilter("all")
          }
          disabled={filter === "all"}
        >
          📋 All ({totalReports})
        </button>

        {" "}

        <button
          onClick={() =>
            setFilter("active")
          }
          disabled={filter === "active"}
        >
          🟢 Active ({activeReports})
        </button>

        {" "}

        <button
          onClick={() =>
            setFilter("returned")
          }
          disabled={
            filter === "returned"
          }
        >
          ✅ Returned ({returnedReports})
        </button>

        {" "}

        <button
          onClick={fetchReports}
        >
          🔄 Refresh
        </button>

      </div>


      {/* ================================== */}
      {/* No Reports */}
      {/* ================================== */}

      {filteredReports.length === 0 ? (

        <div className="empty-report">

          <h2>
            {filter === "returned"
              ? "✅ No Returned Reports"
              : filter === "active"
              ? "🟢 No Active Reports"
              : "📋 No Reports Yet"}
          </h2>

          <p>
            {filter === "returned"
              ? "You don't have any returned reports."
              : filter === "active"
              ? "You don't have any active reports."
              : "You have not submitted any Lost or Found reports yet."}
          </p>

          {filter === "all" && (
            <>
              <Link to="/report-lost">
                <button>
                  📦 Report Lost Item
                </button>
              </Link>

              {" "}

              <Link to="/report-found">
                <button>
                  📍 Report Found Item
                </button>
              </Link>
            </>
          )}

        </div>

      ) : (

        /* ================================== */
        /* Reports Grid */
        /* ================================== */

        <div className="reports-grid">

          {filteredReports.map(
            (report) => {

              const isReturned =
                report.status ===
                "returned";

              return (
                <div
                  className="report-card"
                  key={report._id}
                >

                  {/* ======================== */}
                  {/* Status */}
                  {/* ======================== */}

                  <div
                    style={{
                      textAlign:
                        "center",
                      marginBottom:
                        "15px",
                    }}
                  >

                    <span
                      className={
                        isReturned
                          ? "status returned-status"
                          : "status active-status"
                      }
                    >
                      {isReturned
                        ? "✅ RETURNED"
                        : "🟢 ACTIVE"}
                    </span>

                  </div>


                  {/* ======================== */}
                  {/* Image */}
                  {/* ======================== */}

                  {report.image && (
                    <img
                      src={`http://localhost:5000${report.image}`}
                      alt={
                        report.itemName
                      }
                      className="report-image"
                    />
                  )}


                  {/* ======================== */}
                  {/* Report Information */}
                  {/* ======================== */}

                  <h2>
                    {report.itemName}
                  </h2>

                  <p>
                    <strong>
                      Type:
                    </strong>{" "}
                    <span
                      style={{
                        textTransform:
                          "uppercase",
                      }}
                    >
                      {report.reportType}
                    </span>
                  </p>

                  <p>
                    <strong>
                      Category:
                    </strong>{" "}
                    {report.category}
                  </p>

                  <p>
                    <strong>
                      Location:
                    </strong>{" "}
                    {report.location}
                  </p>

                  <p>
                    <strong>
                      Date:
                    </strong>{" "}
                    {report.date}
                  </p>

                  <p>
                    <strong>
                      Description:
                    </strong>{" "}
                    {report.description}
                  </p>


                  {/* ======================== */}
                  {/* Returned Date */}
                  {/* ======================== */}

                  {isReturned &&
                    report.returnedAt && (
                      <p>
                        <strong>
                          Returned On:
                        </strong>{" "}
                        {new Date(
                          report.returnedAt
                        ).toLocaleDateString()}
                      </p>
                    )}


                  {/* ======================== */}
                  {/* Actions */}
                  {/* ======================== */}

                  <div
                    style={{
                      marginTop:
                        "20px",
                    }}
                  >

                    {/* Active Report Actions */}

                    {!isReturned && (
                      <>
                        <Link
                          to={`/edit-report/${report._id}`}
                        >
                          <button>
                            ✏️ Edit
                          </button>
                        </Link>

                        {" "}

                        <button
                          onClick={() =>
                            handleReturned(
                              report._id
                            )
                          }
                        >
                          ✅ Mark Returned
                        </button>
                      </>
                    )}


                    {/* Delete */}

                    {" "}

                    <button
                      onClick={() =>
                        handleDelete(
                          report._id
                        )
                      }
                    >
                      🗑️ Delete
                    </button>

                  </div>


                  {/* ======================== */}
                  {/* Returned Information */}
                  {/* ======================== */}

                  {isReturned && (
                    <div
                      style={{
                        marginTop:
                          "15px",
                        padding:
                          "10px",
                        borderRadius:
                          "8px",
                        background:
                          "#e8f5e9",
                      }}
                    >

                      <strong>
                        🔒 Report Locked
                      </strong>

                      <p>
                        This report has been
                        marked as returned and
                        can no longer be edited.
                      </p>

                    </div>
                  )}

                </div>
              );
            }
          )}

        </div>

      )}

    </div>
  );
}

export default MyReports;