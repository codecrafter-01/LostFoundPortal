import { useState } from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import api from "../api";

function Login() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });

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
  // Login
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response =
        await api.post(
          "/auth/login",
          {
            email:
              formData.email,
            password:
              formData.password,
          }
        );

      // Store JWT token
      localStorage.setItem(
        "token",
        response.data.token
      );

      // Store user information
      localStorage.setItem(
        "user",
        JSON.stringify(
          response.data.user
        )
      );

      alert(
        response.data.message
      );

      // Go to dashboard
      navigate("/dashboard");

    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Login Failed"
      );
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <h1>
          🎓 University Portal
        </h1>

        <h2>
          Student Login
        </h2>

        <form
          onSubmit={handleSubmit}
        >

          {/* ============================== */}
          {/* Email */}
          {/* ============================== */}

          <input
            type="email"
            name="email"
            placeholder="University Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* ============================== */}
          {/* Password */}
          {/* ============================== */}

          <div className="password-box">

            <input
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              placeholder="Password"
              value={
                formData.password
              }
              onChange={
                handleChange
              }
              required
            />

            <button
              type="button"
              className="show-btn"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              {showPassword
                ? "Hide"
                : "Show"}
            </button>

          </div>

          {/* ============================== */}
          {/* Login Options */}
          {/* ============================== */}

          <div className="login-options">

            <label>
              <input
                type="checkbox"
              />
              Remember Me
            </label>

            <a href="#">
              Forgot Password?
            </a>

          </div>

          {/* ============================== */}
          {/* Login Button */}
          {/* ============================== */}

          <button
            type="submit"
            className="login-submit"
          >
            Login
          </button>

          {/* ============================== */}
          {/* Register */}
          {/* ============================== */}

          <p className="register-link">

            Don't have an account?

            <Link to="/register">
              {" "}Register
            </Link>

          </p>

        </form>

      </div>

    </div>
  );
}

export default Login;