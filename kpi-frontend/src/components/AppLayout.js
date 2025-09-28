import React, { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppLayout({ children }) {
  const [open, setOpen] = useState(true);
  const toggle = () => setOpen((o) => !o);

  return (
    <div className={`shell ${open ? "has-sidebar" : ""}`}>
      <Navbar onToggleSidebar={toggle} />
      <Sidebar open={open} />
      <main className="main">{children}</main>
    </div>
  );
}
