import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaClipboardCheck, FaMapPin } from "react-icons/fa";
import "../components/MasterForm.css";

export default function MasterForm() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role = localStorage.getItem("userRole"); // 👈 get user role

  const handleLogout = () => {
    localStorage.clear();
    setSidebarOpen(false);
    navigate("/");
  };

  const toggleMenu = (menu) => {
    setOpenMenu(openMenu === menu ? null : menu);
  };

  const toggleSidebar = () => {
    setSidebarOpen((s) => !s);
  };

  // close sidebar on ESC
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // helper to close sidebar when navigating (mobile)
  const handleLinkClick = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="master-layout">
      {/* hamburger visible only on mobile */}
      <button
        className={`hamburger ${sidebarOpen ? "is-open" : ""}`}
        onClick={toggleSidebar}
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
      >
        ☰
      </button>

      {/* overlay for mobile */}
      <div
        className={`overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <ul className="main-menu">
          {/* Dashboard - always show */}

          <li>
  <button
    className={`menu-btn admin-btn ${openMenu === "dashboard" ? "open" : ""}`}
    onClick={() => toggleMenu("dashboard")}
    aria-expanded={openMenu === "dashboard"}
  >
    <i className="fa fa-bar-chart menu-icon"></i>
    <span>Dashboard</span>
    <span className="expand-icon">
      {openMenu === "dashboard" ? "▼" : "▶"}
    </span>
  </button>
<ul className={`submenu ${openMenu === "dashboard" ? "open" : ""}`}>
          <li>
            <Link
              to="/master/dashboard"
              className="menu-btn admin-btn ins"
              onClick={handleLinkClick}
            >
              <span>Loco Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/master/locouploaded"
              className="menu-btn admin-btn ins"
              onClick={handleLinkClick}
            >
              <span>Loco Uploaded Details</span>
            </Link>
          </li>
          <li>
            <Link
              to="/master/wagondashboard"
              className="menu-btn admin-btn ins"
              onClick={handleLinkClick}
            >
              
              <span>Wagon Dashboard</span>
            </Link>
          </li>
          <li>
            <Link
              to="/master/wagonuploaded"
              className="menu-btn admin-btn ins"
              onClick={handleLinkClick}
            >
              <span>Wagon Uploaded Details</span>
            </Link>
          </li>
          </ul>
         </li>
{/* REPORTS MENU (new) */}
<li>
  <button
    className={`menu-btn admin-btn ${openMenu === "reports" ? "open" : ""}`}
    onClick={() => toggleMenu("reports")}
    aria-expanded={openMenu === "reports"}
  >
    <i className="fa fa-bar-chart menu-icon"></i>
    <span>Reports</span>
    <span className="expand-icon">
      {openMenu === "reports" ? "▼" : "▶"}
    </span>
  </button>

  <ul className={`submenu ${openMenu === "reports" ? "open" : ""}`}>
    <li>
      <Link to="/master/inspection-status" onClick={handleLinkClick}>
        Inspection Overview
      </Link>
    </li>
    <li>
      <Link to="/master/locostatus" onClick={handleLinkClick}>
        Loco Status
      </Link>
    </li>
    <li>
      <Link to="/master/wagonstatus" onClick={handleLinkClick}>
        Wagon Status
      </Link>
    </li>
  </ul>
</li>

          <li>
            <Link
              to="/master/map"
              className="menu-btn admin-btn ins"
              onClick={handleLinkClick}
            >
              <FaMapPin className="menu-icon" />
              <span>Live Tracking</span>
            </Link>
          </li>

          {/* Show other menus only if NOT Assessor */}
          {role !== "Assessor" && role !=="Asset Monitor" && (
            <>
              {/* Admin with Submenu */}
              <li>
                <button
                  className={`menu-btn admin-btn ${
                    openMenu === "admin" ? "open" : ""
                  }`}
                  onClick={() => toggleMenu("admin")}
                  aria-expanded={openMenu === "admin"}
                >
                  <FaUsers className="menu-icon" />
                  <span>Admin</span>
                  <span className="expand-icon">
                    {openMenu === "admin" ? "▼" : "▶"}
                  </span>
                </button>

                <ul className={`submenu ${openMenu === "admin" ? "open" : ""}`}>
                  <li>
                    <Link to="/master/usercreation" onClick={handleLinkClick}>
                      User Creation
                    </Link>
                  </li>
                  <li>
                    <Link to="/master/users" onClick={handleLinkClick}>
                      Users Maintenance
                    </Link>
                  </li>
                  <li>
                    <Link to="/master/teamcreation" onClick={handleLinkClick}>
                      Team Creation
                    </Link>
                  </li>
                  <li>
                    <Link to="/master/teams" onClick={handleLinkClick}>
                      Teams Maintenance
                    </Link>
                  </li>
                </ul>
              </li>

              {/* Inspection */}
              <li>
                <Link
                  to="/master/choose"
                  className="menu-btn admin-btn ins"
                  onClick={handleLinkClick}
                >
                  <FaClipboardCheck className="menu-icon" />
                  <span>Inspection</span>
                </Link>
              </li>
            </>
          )}
        </ul>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
