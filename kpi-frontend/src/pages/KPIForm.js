import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation, useParams } from "react-router-dom"; 

const STATUSES = ["On Track", "At Risk", "Off Track"];

export default function KPIForm({ editing }) {
  const [users, setUsers] = useState([]);
  const { isAdmin, user } = useAuth();
  const navigate = useNavigate();

  
  const { state } = useLocation();
  const passedKpi = state?.kpi || null;

  
  const { id } = useParams();

  
  const editingData = editing || passedKpi || null;

  const [form, setForm] = useState(
    editingData || {
      title: "",
      description: "",
      targetValue: "",
      actualValue: "",
      status: "On Track",
      assignedUser: "",
      startDate: "",
      endDate: "",
    }
  );

  // โหลดรายชื่อผู้ใช้
  useEffect(() => {
    let mounted = true;
    api
      .get("/users")
      .then((r) => {
        if (!mounted) return;
        setUsers(Array.isArray(r.data) ? r.data : []);
      })
      .catch(() => {
        if (!mounted) return;
        setUsers([]);
      });
    return () => {
        mounted = false;
    };
  }, []);

 
  useEffect(() => {
    if (!editingData) return;
    setForm((prev) => {
      const au = editingData.assignedUser;
      const assignedUserId =
        typeof au === "string" ? au : au?._id || au?.id || "";
      return {
        ...prev,
        ...editingData,
        assignedUser: assignedUserId,
        startDate: editingData.startDate ? editingData.startDate.slice(0, 10) : "",
        endDate: editingData.endDate ? editingData.endDate.slice(0, 10) : "",
        targetValue:
          editingData.targetValue === undefined ? "" : String(editingData.targetValue),
        actualValue:
          editingData.actualValue === undefined ? "" : String(editingData.actualValue),
      };
    });
  }, [editingData]);

  
  useEffect(() => {
    const loadIfNeeded = async () => {
      if (!id || editingData) return;
      try {
        const { data } = await api.get(`/kpis/${id}`);
        const au = data.assignedUser;
        const assignedUserId =
          typeof au === "string" ? au : au?._id || au?.id || "";
        setForm({
          title: data.title ?? "",
          description: data.description ?? "",
          status: data.status ?? "On Track",
          targetValue: data.targetValue === undefined ? "" : String(data.targetValue),
          actualValue: data.actualValue === undefined ? "" : String(data.actualValue),
          assignedUser: assignedUserId,
          startDate: data.startDate ? data.startDate.slice(0, 10) : "",
          endDate: data.endDate ? data.endDate.slice(0, 10) : "",
        });
      } catch (e) {
        
        navigate("/dashboard");
      }
    };
    loadIfNeeded();
  }, [id, editingData, navigate]);

  const change = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();

    const assignedUserId = isAdmin ? form.assignedUser : user?.id || user?._id;
    if (!assignedUserId) {
      alert("กรุณาเลือกผู้รับผิดชอบ (Assigned User)");
      return;
    }

    if (form.startDate && form.endDate) {
      const s = new Date(form.startDate);
      const d = new Date(form.endDate);
      if (s > d) {
        alert("Start date ต้องไม่มากกว่า End date");
        return;
      }
    }

    const toNum = (v) => {
      if (v === "" || v === null || v === undefined) return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? n : undefined;
    };

    const payload = {
      title: form.title?.trim(),
      description: form.description?.trim() || undefined,
      status: form.status || "On Track",
      targetValue: toNum(form.targetValue),
      actualValue: toNum(form.actualValue),
      assignedUser: assignedUserId,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
    };

    try {
      if (editingData?._id || id) {
        
        const kpiId = editingData?._id || id;
        await api.put(`/kpis/${kpiId}`, payload);
        alert("✅ KPI updated successfully");
      } else {
        await api.post("/kpis", payload);
        alert("✅ KPI created successfully");
      }
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.message || err?.message || "Unknown error";
      const details = err?.response?.data?.details;
      alert(
        `❌ Error: ${msg}${
          Array.isArray(details) ? " - " + details.join(", ") : ""
        }`
      );
    }
  };

  const cancel = () => navigate("/dashboard");

  return (
    <div className="card">
      <h2 className="h2">{editingData || id ? "Edit KPI" : "Create KPI"}</h2>

      <form onSubmit={submit} className="row two">
       
        <Field label="Title*">
          <input
            className="input"
            name="title"
            value={form.title}
            onChange={change}
            placeholder="เช่น Monthly Sales Target"
            autoComplete="off"
            required
          />
        </Field>

        {/* Status */}
        <Field label="Status">
          <select
            className="select"
            name="status"
            value={form.status}
            onChange={change}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </Field>

        {/* Description */}
        <Field label="Description" className="full">
          <textarea
            className="textarea"
            name="description"
            value={form.description}
            onChange={change}
            placeholder="รายละเอียด KPI, เกณฑ์นับผลงาน ฯลฯ"
          />
        </Field>

        {/* Target */}
        <Field label="Target Value">
          <input
            className="input"
            type="number"
            name="targetValue"
            value={form.targetValue}
            onChange={change}
            min="0"
            step="any"
            placeholder="เช่น 50000"
            inputMode="decimal"
          />
        </Field>

        {/* Actual */}
        <Field label="Actual Value">
          <input
            className="input"
            type="number"
            name="actualValue"
            value={form.actualValue}
            onChange={change}
            min="0"
            step="any"
            placeholder="ค่าปัจจุบัน (ใส่ภายหลังก็ได้)"
            inputMode="decimal"
          />
        </Field>

        {/* Assigned User */}
        <Field label={`Assigned User${isAdmin ? "*" : ""}`}>
          <select
            className="select"
            name="assignedUser"
            value={isAdmin ? form.assignedUser : user?.id || user?._id || ""}
            onChange={change}
            disabled={!isAdmin}
            required={isAdmin}
          >
            <option value="">{isAdmin ? "Select user" : "(You)"}</option>
            {users.map((u) => (
              <option key={u.id || u._id} value={u.id || u._id}>
                {u.name || u.username || u.email}
              </option>
            ))}
          </select>
        </Field>

        {/* Dates */}
        <Field label="Start">
          <input
            className="input"
            type="date"
            name="startDate"
            value={form.startDate || ""}
            onChange={change}
          />
        </Field>

        <Field label="End">
          <input
            className="input"
            type="date"
            name="endDate"
            value={form.endDate || ""}
            onChange={change}
          />
        </Field>

        <div className="form-actions">
          <button type="submit" className="btn primary">
            {editingData || id ? "Update" : "Create"}
          </button>
          <button type="button" className="btn" onClick={cancel}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children, ...rest }) {
  return (
    <div {...rest}>
      <div className="label">{label}</div>
      {children}
    </div>
  );
}
