import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const token =
    localStorage.getItem("token");

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  );


  // ==============================
  // Logout
  // ==============================

  const handleLogout = () => {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    navigate("/login");
  };


  return (
    <nav className="navbar">

      {/* ================================== */}
      {/* Logo */}
      {/* ================================== */}

      <div className="logo">
        🎓 Lost & Found
      </div>


      {/* ================================== */}
      {/* Menu */}
      {/* ================================== */}

      <ul className="menu">

        <li>
          <Link to="/">
            Home
          </Link>
        </li>


        <li>
          <Link to="/lost">
            Lost Items
          </Link>
        </li>


        <li>
          <Link to="/found">
            Found Items
          </Link>
        </li>


        {token && (
          <>

            <li>
              <Link to="/dashboard">
                Dashboard
              </Link>
            </li>


            <li>
              <Link to="/my-reports">
                My Reports
              </Link>
            </li>


            <li>
              <Link to="/matches">
                🤝 Matches
              </Link>
            </li>

          </>
        )}

      </ul>


      {/* ================================== */}
      {/* Authentication */}
      {/* ================================== */}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >

        {!token ? (

          <>

            <Link to="/login">
              <button className="login-btn">
                Login
              </button>
            </Link>


            <Link to="/register">
              <button className="login-btn">
                Register
              </button>
            </Link>

          </>

        ) : (

          <>

            {user?.name && (
              <span
                style={{
                  fontWeight: "600",
                }}
              >
                👋 {user.name}
              </span>
            )}


            <button
              className="login-btn"
              onClick={handleLogout}
            >
              Logout
            </button>

          </>

        )}

      </div>

    </nav>
  );
}

export default Navbar;