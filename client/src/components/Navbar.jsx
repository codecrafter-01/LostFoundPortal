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

  useEffect(() => {
    const photo = localStorage.getItem("studentPhoto");
    setStudentPhoto(photo || "");
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("studentPhoto");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar-template">
      {/* Left Logo */}
      <Link to="/" className="logo-template">
        <div className="logo-icon-bg">
          <span className="logo-pin">📍</span>
        </div>
        <div className="logo-text-group">
          <span className="logo-main-text">Vignan Lost & Found</span>
          <span className="logo-sub-text">Student Portal</span>
        </div>
      </Link>

      {/* Center Menu Links */}
      <ul className="menu-template">
        <li>
          <Link to="/" className={isActive("/") ? "active-tab" : ""}>
            Home
          </Link>
        </li>
        <li>
          <Link to="/report-lost" className={isActive("/report-lost") ? "active-tab" : ""}>
            Report Lost
          </Link>
        </li>
        <li>
          <Link to="/report-found" className={isActive("/report-found") ? "active-tab" : ""}>
            Report Found
          </Link>
        </li>
        <li>
          <Link to="/matches" className={isActive("/matches") ? "active-tab" : ""}>
            Smart Match
          </Link>
        </li>
        {token && (
          <>
            <li>
              <Link to="/my-reports" className={isActive("/my-reports") ? "active-tab" : ""}>
                My Reports
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className={isActive("/dashboard") ? "active-tab" : ""}>
                Dashboard
              </Link>
            </li>
          </>
        )}
      </ul>

      {/* Right Auth / Profile Controls */}
      <div className="navbar-controls-template">
        {!token ? (
          <>
            <Link to="/login" className="btn-text-login">
              Login
            </Link>
            <Link to="/register">
              <button className="btn-pill-register">Register</button>
            </Link>
          </>
        ) : (
          <>
            {user?.name && (
              <Link to="/profile" title="View Student Profile" style={{ textDecoration: "none" }}>
                <span className="profile-pill-badge">
                  {studentPhoto ? (
                    <img
                      src={studentPhoto}
                      alt="Student Profile"
                      className="profile-avatar-img"
                    />
                  ) : (
                    <span className="avatar-icon-fallback">👤</span>
                  )}
                  <span className="profile-user-name">{user.name}</span>
                </span>
              </Link>
            )}

            <button className="btn-logout-template" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;