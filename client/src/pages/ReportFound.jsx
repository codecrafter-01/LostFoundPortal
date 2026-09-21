import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useNotification } from "../context/NotificationContext";

function ReportFound() {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    location: "",
    date: "",
    time: "",
    description: "",
    verificationQuestion: "",
    custodyType: "with_reporter",
    custodyLocation: "",
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // ==============================
  // Handle Input
  // ==============================

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ==============================
  // Handle Image
  // ==============================

  const handleImage = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // ==============================
  // Submit Report
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        showNotification({
          title: "Authentication Required",
          message: "Please login before submitting a report.",
          type: "error",
        });

        navigate("/login");

        return;
      }

      const data = new FormData();

      data.append("itemName", formData.itemName);
      data.append("category", formData.category);
      data.append("location", formData.location);
      data.append("date", formData.date);
      data.append("time", formData.time || "");
      data.append("description", formData.description);
      data.append("reportType", "found");
      data.append("verificationQuestion", formData.verificationQuestion);
      data.append("custodyType", formData.custodyType);
      data.append("custodyLocation", formData.custodyType === "college_desk" ? formData.custodyLocation : "");

      if (image) {
        data.append("image", image);
      }

      // =====================================
      // Send Report To Render Backend
      // =====================================

      const response = await api.post("/reports", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Top-of-screen Pop-up Email Notification Banner
      showNotification({
        title: "📧 Email Alert Dispatched",
        message: response.data.message || "Found report submitted! Confirmation email has been sent to your student inbox.",
        type: "success",
        isEmail: true,
      });

      // Reset form
      setFormData({
        itemName: "",
        category: "",
        location: "",
        date: "",
        time: "",
        description: "",
        verificationQuestion: "",
        custodyType: "with_reporter",
        custodyLocation: "",
      });

      setImage(null);
      setPreview(null);

      // Go to My Reports
      navigate("/my-reports");

    } catch (error) {
      console.error("Create Found Report Error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        showNotification({
          title: "Session Expired",
          message: "Session expired. Please login again.",
          type: "error",
        });

        navigate("/login");

        return;
      }

      showNotification({
        title: "Submission Error",
        message: error.response?.data?.message || "Failed to submit found report.",
        type: "error",
      });
    }
  };

  return (
    <div className="form-page">

      <div className="form-card">

        <h1>
          📍 Report Found Item
        </h1>

        <form
          onSubmit={handleSubmit}
        >

          <input
            type="text"
            name="itemName"
            placeholder="Item Name"
            value={
              formData.itemName
            }
            onChange={
              handleChange
            }
            required
          />

          <select
            name="category"
            value={
              formData.category
            }
            onChange={
              handleChange
            }
            required
          >

            <option value="">
              Select Category
            </option>

            <option>
              🎒 Bag
            </option>

            <option>
              💻 Laptop
            </option>

            <option>
              📱 Mobile Phone
            </option>

            <option>
              ⚡ Electronics
            </option>

            <option>
              🔑 Keys
            </option>

            <option>
              💳 ID Card
            </option>

            <option>
              📚 Books
            </option>

            <option>
              🎧 Earphones
            </option>

            <option>
              ⌚ Watch
            </option>

            <option>
              💧 Water Bottle
            </option>

            <option>
              👕 Clothing
            </option>

            <option>
              📄 Documents
            </option>

            <option>
              🎓 Others
            </option>

          </select>

          <input
            type="text"
            name="location"
            placeholder="Found Location"
            value={
              formData.location
            }
            onChange={
              handleChange
            }
            required
          />

          <div className="form-row-2col">
            <div>
              <label style={{ fontSize: "12.5px", fontWeight: "600", color: "#475569", marginBottom: "6px", display: "block", textAlign: "left" }}>
                📅 Date Found *
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label style={{ fontSize: "12.5px", fontWeight: "600", color: "#475569", marginBottom: "6px", display: "block", textAlign: "left" }}>
                ⏰ Time Found (Optional)
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
              />
            </div>
          </div>

          <textarea
            name="description"
            rows="5"
            placeholder="Describe the item..."
            value={
              formData.description
            }
            onChange={
              handleChange
            }
            required
          />

          <div style={{ margin: "14px 0", textAlign: "left" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#334155", marginBottom: "6px" }}>
              🔒 Secret Verification Question (Proof of Ownership)
            </label>
            <input
              type="text"
              name="verificationQuestion"
              placeholder="e.g. What is the lock screen wallpaper / brand / sticker inside?"
              value={formData.verificationQuestion}
              onChange={handleChange}
              style={{ marginBottom: "4px" }}
            />
            <small style={{ display: "block", color: "#64748b", fontSize: "12px", lineHeight: "1.4" }}>
              💡 Recommended: Ask a question only the true owner can answer before you release the item.
            </small>
          </div>

          {/* Autonomous College Physical Custody Selector */}
          <div style={{ margin: "18px 0", textAlign: "left", background: "#f8fafc", padding: "16px", borderRadius: "14px", border: "1px solid #e2e8f0" }}>
            <label style={{ display: "block", fontSize: "14px", fontWeight: "700", color: "#1e293b", marginBottom: "8px" }}>
              🏛️ Where is this item physically located right now?
            </label>

            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", marginBottom: formData.custodyType === "college_desk" ? "12px" : "0" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600", cursor: "pointer", color: "#334155" }}>
                <input
                  type="radio"
                  name="custodyType"
                  value="with_reporter"
                  checked={formData.custodyType === "with_reporter"}
                  onChange={handleChange}
                />
                🟢 With Me (Direct Handover)
              </label>

              <label style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", fontWeight: "600", cursor: "pointer", color: "#334155" }}>
                <input
                  type="radio"
                  name="custodyType"
                  value="college_desk"
                  checked={formData.custodyType === "college_desk"}
                  onChange={handleChange}
                />
                🏛️ Deposited at College Support Desk
              </label>
            </div>

            {formData.custodyType === "college_desk" && (
              <div style={{ marginTop: "12px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "700", color: "#475569", marginBottom: "6px" }}>
                  Select College Drop-off Counter:
                </label>
                <select
                  name="custodyLocation"
                  value={formData.custodyLocation}
                  onChange={handleChange}
                  required={formData.custodyType === "college_desk"}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "13.5px", background: "#ffffff", color: "#0f172a", outline: "none" }}
                >
                  <option value="">-- Choose Campus Drop-off Counter --</option>
                  <option value="Main Security Office (Gate 1)">🛡️ Main Security Office (Gate 1)</option>
                  <option value="Central Library Circulation Desk">📚 Central Library Circulation Desk</option>
                  <option value="Admin Office / Dean Student Affairs (Room 102)">🏛️ Admin Office / Dean Student Affairs (Room 102)</option>
                  <option value="Department Staff Room / Lab In-Charge">🔬 Department Staff Room / Lab In-Charge</option>
                </select>
                <small style={{ display: "block", color: "#059669", fontSize: "12px", marginTop: "6px", fontWeight: "600" }}>
                  ✅ The item will be marked as in safe campus custody. The owner can collect it directly from this counter!
                </small>
              </div>
            )}
          </div>

          {/* ============================== */}
          {/* Image Upload */}
          {/* ============================== */}

          <label className="upload-box">

            <input
              type="file"
              hidden
              accept="image/*"
              onChange={
                handleImage
              }
            />

            {preview ? (

              <div className="image-preview">

                <img
                  src={preview}
                  alt="Preview"
                />

                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => {
                    setImage(null);
                    setPreview(null);
                  }}
                >
                  ❌ Remove Image
                </button>

              </div>

            ) : (

              <>

                <div className="upload-icon">
                  📷
                </div>

                <h3>
                  Upload Item Photo
                </h3>

                <p>
                  Click anywhere in this box to choose an image.
                </p>

                <small>
                  Supported: JPG, JPEG, PNG
                </small>

              </>

            )}

          </label>

          <button type="submit">
            Submit Report
          </button>

        </form>

      </div>

    </div>
  );
}

export default ReportFound;