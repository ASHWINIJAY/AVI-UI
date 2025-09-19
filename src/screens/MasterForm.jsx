import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { FaTachometerAlt, FaUsers, FaClipboardCheck } from "react-icons/fa";
import "../components/MasterForm.css";

export default function MasterForm() {
  const navigate = useNavigate();
  const [openMenu, setOpenMenu] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
  {/* Dashboard */}
  <li>
    <Link
      to="/master/dashboard"
      className="menu-btn admin-btn ins"
      onClick={handleLinkClick}
    >
      <FaTachometerAlt className="menu-icon" />
      <span>Dashboard</span>
    </Link>
  </li>

  {/* Admin with Submenu */}
  <li>
    <button
      className={`menu-btn admin-btn ${openMenu === "admin" ? "open" : ""}`}
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
          Users Manintenance
        </Link>
      </li>
    </ul>
  </li>

  {/* Inspection (no submenu) */}
  <li>
    <Link
      to="/master/landing"
      className="menu-btn admin-btn ins"
      onClick={handleLinkClick}
    >
      <FaClipboardCheck className="menu-icon" />
      <span>Inspection</span>
    </Link>
  </li>
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
