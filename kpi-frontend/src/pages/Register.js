import React, { useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./Register.css";

export default function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const { register } = useAuth();
  const nav = useNavigate();

  const emailValid = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const usernameValid = useMemo(() => username.trim().length >= 3, [username]);

  const submit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    const nextErr = {};
    if (!usernameValid) nextErr.username = "อย่างน้อย 3 ตัวอักษร";
    if (!emailValid) nextErr.email = "รูปแบบอีเมลไม่ถูกต้อง";
    if (password.length < 6) nextErr.password = "รหัสผ่านอย่างน้อย 6 ตัว";
    setErrors(nextErr);
    if (Object.keys(nextErr).length) return;

    try {
      setSubmitting(true);
      await register({ username: username.trim(), email: email.trim(), password, name: username.trim() });
      alert("สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ");
      nav("/login");
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Register failed";
      if (msg.toLowerCase().includes("exists") || String(err?.response?.status) === "409") {
        setErrors({ form: "อีเมลหรือชื่อผู้ใช้นี้ถูกใช้แล้ว" });
      } else if (String(err?.response?.status) === "404") {
        setErrors({ form: "ติดต่อเซิร์ฟเวอร์ไม่ถูกต้อง (404). โปรดตรวจพอร์ต/Proxy ไปยัง backend" });
      } else {
        setErrors({ form: msg });
      }
      console.error("Register error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h2 className="register-heading">สมัครสมาชิก</h2>

        {errors.form && <div className="alert-error">{errors.form}</div>}

        <form onSubmit={submit} className="register-form" noValidate>
          <Field label="อีเมล" error={errors.email}>
            <input
              type="email"
              className={`input${errors.email ? " is-error" : ""}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              inputMode="email"
              autoComplete="email"
              required
            />
          </Field>

          <Field label="ชื่อผู้ใช้" hint="อย่างน้อย 3 ตัวอักษร (a–z, 0–9, _)" error={errors.username}>
            <input
              className={`input${errors.username ? " is-error" : ""}`}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="เช่น admin_y"
              autoComplete="username"
              required
            />
          </Field>

          <Field label="รหัสผ่าน" error={errors.password}>
            <div className="password-wrapper">
              <input
                type={showPw ? "text" : "password"}
                className={`input${errors.password ? " is-error" : ""}`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                minLength={6}
                autoComplete="new-password"
                required
              />
              <button type="button" className="btn-toggle" onClick={() => setShowPw((s) => !s)}>
                {showPw ? "Hide" : "Show"}
              </button>
            </div>
          </Field>

          <button className="primary-btn" type="submit" disabled={submitting}>
            {submitting ? "Creating..." : "Create Account"}
          </button>

          <div className="foot-note">
            มีบัญชีอยู่แล้ว?{" "}
            <Link to="/login" className="link">
              เข้าสู่ระบบ
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div className="field">
      <label className="field-label">{label}</label>
      {children}
      {hint && <div className="field-hint">{hint}</div>}
      {error && <div className="field-error">{error}</div>}
    </div>
  );
}
