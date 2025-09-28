import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar({ onToggleSidebar }) {
  const { user, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    if (window.confirm("คุณต้องการออกจากระบบหรือไม่?")) {
      logout();
      alert("ออกจากระบบเรียบร้อยแล้ว ✅");
    }
  };

  return (
    <header className="nav-top">
      <button
        className="icon-btn"
        onClick={onToggleSidebar}
        aria-label="toggle sidebar"
      >
        ☰
      </button>

      <Link to="/dashboard" className="brand">
        KPI <span>Management</span>
      </Link>

      <div className="nav-actions">
        {isAdmin && <span className="role-badge">Admin</span>}
        {user && <span className="me">{user.name}</span>}
        {user ? (
          <button className="btn small" onClick={handleLogout}>
            Logout
          </button>
        ) : (
          <>
            <Link className="btn small ghost" to="/login">
              Login
            </Link>
            <Link className="btn small primary" to="/register">
              Register
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
