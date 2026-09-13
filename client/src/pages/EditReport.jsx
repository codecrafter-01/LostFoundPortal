import {
  useState,
  useEffect,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import axios from "axios";

function EditReport() {
  const navigate =
    useNavigate();

  const { id } =
    useParams();


  const [formData, setFormData] =
    useState({
      itemName: "",
      category: "",
      location: "",
      date: "",
      description: "",
    });


  // ==============================
  // Load Report
  // ==============================

  useEffect(() => {
    fetchReport();
  }, []);


  const fetchReport = async () => {

    try {

      const response =
        await axios.get(
          "http://localhost:5000/api/reports"
        );


      const report =
        response.data.find(
          (item) =>
            item._id === id
        );


      if (!report) {

        alert(
          "Report not found."
        );

        navigate(
          "/my-reports"
        );

        return;
      }


      setFormData({
        itemName:
          report.itemName,

        category:
          report.category,

        location:
          report.location,

        date:
          report.date.substring(
            0,
            10
          ),

        description:
          report.description,
      });

    } catch (error) {

      console.error(
        "Fetch Report Error:",
        error
      );

      alert(
        "Failed to load report."
      );

      navigate(
        "/my-reports"
      );
    }
  };


  // ==============================
  // Handle Input
  // ==============================

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });

  };


  // ==============================
  // Update Report
  // ==============================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const token =
        localStorage.getItem(
          "token"
        );


      if (!token) {

        alert(
          "Please login again."
        );

        navigate("/login");

        return;
      }


      await axios.put(
        `http://localhost:5000/api/reports/${id}`,
        formData,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );


      alert(
        "Report Updated Successfully!"
      );


      navigate(
        "/my-reports"
      );

    } catch (error) {

      console.error(
        "Update Report Error:",
        error
      );


      if (
        error.response?.status === 401
      ) {

        localStorage.removeItem(
          "token"
        );

        localStorage.removeItem(
          "user"
        );

        alert(
          "Session expired. Please login again."
        );

        navigate(
          "/login"
        );

        return;
      }


      alert(
        error.response?.data?.message ||
          "Failed to update report."
      );
    }
  };


  return (
    <div className="form-page">

      <div className="form-card">

        <h1>
          ✏ Edit Report
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


          <input
            type="text"
            name="category"
            placeholder="Category"
            value={
              formData.category
            }
            onChange={
              handleChange
            }
            required
          />


          <input
            type="text"
            name="location"
            placeholder="Location"
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
            placeholder="Description"
            value={
              formData.description
            }
            onChange={
              handleChange
            }
            required
          />


          <button type="submit">
            💾 Save Changes
          </button>

        </form>

      </div>

    </div>
  );
}

export default EditReport;