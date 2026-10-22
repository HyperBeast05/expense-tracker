import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  FaChartPie,
  FaReceipt,
  FaRightFromBracket,
  FaTags,
  FaUser,
  FaWallet,
} from "react-icons/fa6";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();

      toast.success("Logged out successfully");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Unable to logout. Please try again.");
    }
  };

  const getNavLinkClass = ({ isActive }) => {
    return `nav-link d-flex align-items-center text-white 
    ${isActive ? "active fw-semibold bg-primary rounded px-3" : "px-3"}`;
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark border-bottom shadow-sm">
      <div className="container">
        {/* Brand */}
        <Link
          to="/dashboard"
          className="navbar-brand fw-bold d-flex align-items-center"
        >
          <FaWallet className="me-2 text-primary" />
          Expense Tracker
        </Link>

        {/* Mobile Toggle */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Context */}
        <div className="collapse navbar-collapse" id="mainNavbar">
          {/* Navigation Links */}
          <ul className="navbar-nav me-auto me-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/dashboard" className={getNavLinkClass}>
                <FaChartPie className="me-2" />
                Dashboard
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/transactions" className={getNavLinkClass}>
                <FaReceipt className="me-2" />
                Transactions
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink to="/categories" className={getNavLinkClass}>
                <FaTags className="me-2" />
                Categories
              </NavLink>
            </li>
          </ul>

          {/* User Section */}
          <div className="d-flex align-items-center gap-3">
            <NavLink to="/profile" className={getNavLinkClass}>
              <FaUser className="me-2" />
              {user?.name || "Profile"}
            </NavLink>

            <button
              type="button"
              className="btn btn-outline-light btn-sm"
              onClick={handleLogout}
            >
              <FaRightFromBracket className="me-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
