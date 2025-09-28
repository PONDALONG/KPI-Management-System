import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar({ open }) {
  const { isAdmin } = useAuth();

  return (
    <aside className={`sidebar ${open ? "open" : ""}`}>
      <nav className="side-nav">
        <NavLink to="/dashboard" className="side-link">📊 Dashboard</NavLink>

        {isAdmin && (
          <>
            <div className="side-section">Admin</div>
            <NavLink to="/admin/users" className="side-link">👤 Users</NavLink>
            <NavLink to="/kpiform" className="side-link">➕ Create KPI</NavLink>
          </>
        )}
      </nav>
      <div className="side-footer"></div>
    </aside>
  );
}
