import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // Dynamic student photo state
  const [studentPhoto, setStudentPhoto] = useState(
    localStorage.getItem("studentPhoto") || ""
  );

  // Mobile menu toggle state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sync photo & close mobile menu whenever location changes
  useEffect(() => {
    const photo = localStorage.getItem("studentPhoto");
    setStudentPhoto(photo || "");
    setMobileMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("studentPhoto");
    setMobileMenuOpen(false);
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-header">
        {/* Logo */}
        <Link to="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
          <img
            src="/vignan_logo.jpg"
            alt="Vignan Logo"
            className="logo-img"
          />
          <span className="logo-text">Vignan Lost & Found</span>
        </Link>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className={`hamburger-bar ${mobileMenuOpen ? "open" : ""}`}></span>
          <span className={`hamburger-bar ${mobileMenuOpen ? "open" : ""}`}></span>
          <span className={`hamburger-bar ${mobileMenuOpen ? "open" : ""}`}></span>
        </button>
      </div>

      {/* Navigation Menu & User Actions */}
      <div className={`navbar-content ${mobileMenuOpen ? "mobile-open" : ""}`}>
        <ul className="menu">
          <li>
            <Link to="/" className={isActive("/") ? "active-link" : ""}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/lost" className={isActive("/lost") ? "active-link" : ""}>
              Lost Items
            </Link>
          </li>
          <li>
            <Link to="/found" className={isActive("/found") ? "active-link" : ""}>
              Found Items
            </Link>
          </li>
          {token && (
            <>
              <li>
                <Link to="/dashboard" className={isActive("/dashboard") ? "active-link" : ""}>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/my-reports" className={isActive("/my-reports") ? "active-link" : ""}>
                  My Reports
                </Link>
              </li>
              <li>
                <Link to="/matches" className={isActive("/matches") ? "active-link" : ""}>
                  🤝 Matches
                </Link>
              </li>
            </>
          )}
        </ul>

        {/* Authentication & User Info Badge */}
        <div className="navbar-right">
          {!token ? (
            <>
              <Link to="/login">
                <button className="login-btn">Login</button>
              </Link>
              <Link to="/register">
                <button className="register-btn">Register</button>
              </Link>
            </>
          ) : (
            <>
              {user?.name && (
                <Link to="/profile" title="Click to view Student Profile" style={{ textDecoration: "none" }}>
                  <span className="user-name">
                    {studentPhoto ? (
                      <img
                        src={studentPhoto}
                        alt="Student Profile"
                        className="user-avatar-img"
                      />
                    ) : (
                      <span className="user-avatar-icon">👤</span>
                    )}
                    <span>{user.name}</span>
                  </span>
                </Link>
              )}

              <button className="logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;