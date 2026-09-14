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
    description: "",
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
      data.append("description", formData.description);
      data.append("reportType", "found");

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
        description: "",
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

          <input
            type="date"
            name="date"
            value={
              formData.date
            }
            onChange={
              handleChange
            }
            required
          />

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