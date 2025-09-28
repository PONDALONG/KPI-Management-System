import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import UsersAdmin from "./pages/UsersAdmin";
import KPIForm from "./pages/KPIForm";     // << เพิ่ม
import KPIList from "./pages/KPIList";     // << เพิ่ม
import AppLayout from "./components/AppLayout";
import "./styles/kpi.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              <AppLayout>
                <Navigate to="/dashboard" />
              </AppLayout>
            }
          />

          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={
              <AppLayout>
                <RequireAuth>
                  <Dashboard />
                </RequireAuth>
              </AppLayout>
            }
          />

          {/* KPI List */}
          <Route
            path="/kpis"
            element={
              <AppLayout>
                <RequireAuth>
                  <KPIList />
                </RequireAuth>
              </AppLayout>
            }
          />

          {/* Create KPI (รองรับทั้ง /kpiform และ /kpis/new) */}
          <Route
            path="/kpiform"
            element={
              <AppLayout>
                <RequireAuth>
                  <KPIForm />
                </RequireAuth>
              </AppLayout>
            }
          />
          <Route
            path="/kpis/new"
            element={
              <AppLayout>
                <RequireAuth>
                  <KPIForm />
                </RequireAuth>
              </AppLayout>
            }
          />

          {/* Edit KPI */}
          <Route
            path="/kpis/:id/edit"
            element={
              <AppLayout>
                <RequireAuth>
                  <KPIForm />
                </RequireAuth>
              </AppLayout>
            }
          />

          {/* Admin: Users */}
          <Route
            path="/admin/users"
            element={
              <AppLayout>
                <RequireAdmin>
                  <UsersAdmin />
                </RequireAdmin>
              </AppLayout>
            }
          />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 404 -> dashboard */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function RequireAdmin({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) return <div>Loading…</div>;
  return user && isAdmin ? children : <Navigate to="/dashboard" replace />;
}

