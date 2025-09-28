import React from "react";

export default function EditUser({ user, form, setForm, onSave, onCancel }) {
  if (!user) return null;

  return (
    <div style={overlayStyle}>
      <div className="card" style={modalStyle}>
        <h3 style={{ marginTop: 0, marginBottom: 8 }}>แก้ไขผู้ใช้</h3>
        <form onSubmit={onSave} style={{ display: "grid", gap: 10 }}>
          {/* ✅ Username (ใหม่) */}
          <Field label="Username">
            <input
              className="input"
              value={form.username}
              onChange={(e) =>
                setForm({ ...form, username: e.target.value.trim() })
              }
              required
            />
          </Field>

          <Field label="Name">
            <input
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>

          <Field label="Email">
            <input
              className="input"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </Field>

          <Field label="Role">
            <select
              className="select"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </Field>

          <Field label="New Password (เว้นว่างได้)">
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </Field>

          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button className="btn primary" type="submit">
              Save
            </button>
            <button className="btn" type="button" onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div className="label">{label}</div>
      {children}
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.25)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
};

const modalStyle = { width: "100%", maxWidth: 520 };
