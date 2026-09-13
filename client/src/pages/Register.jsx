import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    studentId: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/register",
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }
      );

      alert(response.data.message);

      navigate("/login");

    } catch (error) {
      console.log("Registration Error:", error);

      if (error.response) {
        console.log("Response:", error.response.data);
        console.log("Status:", error.response.status);

        alert(error.response.data.message);
      } else if (error.request) {
        console.log("No response received:", error.request);

        alert("Cannot connect to the server.");
      } else {
        console.log("Error:", error.message);

        alert(error.message);
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">

        <h1>🎓 University Portal</h1>
        <h2>Create Student Account</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="University Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="studentId"
            placeholder="Student ID"
            value={formData.studentId}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button
            type="submit"
            className="login-submit"
          >
            Register
          </button>

          <p className="register-link">
            Already have an account?
            <Link to="/login"> Login</Link>
          </p>

        </form>

      </div>
    </div>
  );
}

export default Register;