import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";
import "./Login.css"; // import css แยก

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);
      navigate("/dashboard");
    } catch (err) {
      alert(
        "เข้าสู่ระบบไม่สำเร็จ: " + (err.response?.data?.message || err.message)
      );
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h1 className="login-title">เข้าสู่ระบบ</h1>
        <form onSubmit={handleLogin} className="login-form">
          <label>อีเมล</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>รหัสผ่าน</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="btn primary">
            Login
          </button>
          <p style={{ marginTop: 10, textAlign: "center" }}>
            ยังไม่มีบัญชี? <a href="/register">สมัครสมาชิก</a>
          </p>
        </form>
      </div>
    </div>
  );
}
