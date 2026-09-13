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
      [e.target.name]: e.target.value,
    });
  };

  // ==============================
  // Login
  // ==============================

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(
        "/auth/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      localStorage.setItem(
        "token",
        response.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      alert(response.data.message);

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

        <form onSubmit={handleSubmit}>

          {/* ==============================
              EMAIL
              ============================== */}

          <input
            type="email"
            name="email"
            placeholder="University Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* ==============================
              PASSWORD
              ============================== */}

          <div className="password-wrapper">

            <input
              className="password-input"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />

            <button
              type="button"
              className="password-toggle"
              onClick={() =>
                setShowPassword(
                  (previous) => !previous
                )
              }
              aria-label={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
            >
              {showPassword
                ? "Hide"
                : "Show"}
            </button>

          </div>

          {/* ==============================
              LOGIN OPTIONS
              ============================== */}

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

          {/* ==============================
              LOGIN BUTTON
              ============================== */}

          <button
            type="submit"
            className="login-submit"
          >
            Login
          </button>

          {/* ==============================
              REGISTER
              ============================== */}

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