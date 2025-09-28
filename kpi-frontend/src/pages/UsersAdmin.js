import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import EditUser from "./EditUser";

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [keyword, setKeyword] = useState("");

  const [form, setForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const load = async () => {
    const res = await api.get("/users");
    setUsers(res.data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    await api.post("/auth/register", form);
    setForm({ username: "", name: "", email: "", password: "", role: "user" });
    load();
  };

  const updateRole = async (id, role) => {
    await api.put(`/users/${id}`, { role });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("ต้องการลบผู้ใช้นี้ใช่หรือไม่?")) return;
    await api.delete(`/users/${id}`);
    load();
  };

  const openEdit = (u) => {
    setEditing(u);
    setEditForm({
      username: u.username || "",
      name: u.name || "",
      email: u.email || "",
      password: "",
      role: u.role || "user",
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setEditForm({
      username: "",
      name: "",
      email: "",
      password: "",
      role: "user",
    });
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    const payload = { ...editForm };
    if (!payload.password) {
      delete payload.password;
    }
    await api.put(`/users/${editing.id}`, payload); // ✅ ใช้ id แทน _id
    alert("อัปเดตผู้ใช้สำเร็จ");
    closeEdit();
    load();
  };

  const filtered = useMemo(() => {
    const k = keyword.trim().toLowerCase();
    if (!k) return users;
    return users.filter((u) =>
      [u.username, u.name, u.email, u.role].some((v) =>
        String(v || "").toLowerCase().includes(k)
      )
    );
  }, [users, keyword]);

  return (
    <div>
      {/* Create User */}
      <div className="card">
        <h2 className="h2" style={{ fontSize: 18, margin: 0, marginBottom: 8 }}>
          Create User
        </h2>
        <form onSubmit={submit} className="row two">
          <Field label="Username">
            <input
              className="input"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
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
          <Field label="Password">
            <input
              className="input"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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
          <div style={{ gridColumn: "1 / -1" }}>
            <button className="btn primary" style={{ width: "100%" }}>
              Create
            </button>
          </div>
        </form>
      </div>

      {/* Users Table */}
      <div className="card mt20">
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <h2 className="h2" style={{ fontSize: 18, margin: 0 }}>
            All Users
          </h2>
          <div style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
            <input
              className="input"
              style={{ width: 220 }}
              placeholder="ค้นหา..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Username</th>
                <th>ชื่อ</th>
                <th>อีเมล</th>
                <th>บทบาท</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: 16 }}>
                    ไม่พบผู้ใช้
                  </td>
                </tr>
              ) : (
                filtered.map((u, i) => (
                  <tr key={u.id}>
                    <td>{i + 1}</td>
                    <td>{u.username}</td>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className="select"
                        value={u.role}
                        onChange={(e) => updateRole(u.id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button style={{ color: "#d6b51fff" }}
                          className="btn small"
                          onClick={() => openEdit(u)}
                        >
                          Edit
                        </button>
                        <button style={{ color: "#d40d0dff" }}
                          className="btn small"
                          onClick={() => remove(u.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <EditUser
        user={editing}
        form={editForm}
        setForm={setEditForm}
        onSave={saveEdit}
        onCancel={closeEdit}
      />
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
