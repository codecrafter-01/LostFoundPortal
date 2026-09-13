import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      {/* Logo with Vignan Avatar */}
      <Link to="/" className="logo">
        <img
          src="/vignan_logo.jpg"
          alt="Vignan Logo"
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "2px solid #ffffff",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
          }}
        />
        <span>Vignan Lost & Found</span>
      </Link>

      {/* Menu */}
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

      {/* Authentication & User Info */}
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
              <span className="user-name" style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <img
                  src="/vignan_logo.jpg"
                  alt="User Avatar"
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "1.5px solid #ffffff",
                  }}
                />
                {user.name}
              </span>
            )}
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;