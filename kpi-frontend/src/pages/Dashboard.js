import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import DashboardFilters from "../components/DashboardFilters";
import KPICharts from "../components/KPICharts";
import KPITableLite from "../components/KPITableLite";
import QuickStats from "../components/QuickStats";
import { useAuth } from "../context/AuthContext";

function computeStatus(actual, target) {
  const a = Number(actual) || 0;
  const t = Number(target);

  // ถ้าไม่มี target ให้ถือว่ามีผลงาน > 0 = On Track, ไม่งั้น Off Track
  if (!Number.isFinite(t) || t <= 0) {
    return a > 0 ? "On Track" : "Off Track";
  }

  const pct = (a / t) * 100;

  if (pct <= 15) return "Off Track"; // ≤15%
  if (pct < 70) return "At Risk"; // 16–69%
  return "On Track"; // ≥70%
}

const uid = (v) => String(v ?? "");

// สำหรับแปลง updatedBy -> ชื่อจริง
const idOf = (v) => {
  if (!v) return "";
  if (typeof v === "string") return v;
  return String(v._id || v.id || v.userId || "");
};
const nameFromObj = (u) => {
  if (!u || typeof u !== "object") return "";
  return (
    u.name ||
    u.fullName ||
    [u.firstName, u.lastName].filter(Boolean).join(" ") ||
    u.displayName ||
    ""
  );
};
const resolveUserName = (updatedBy, userMap) => {
  const direct = nameFromObj(updatedBy);
  if (direct) return direct;

  const key = idOf(updatedBy);
  const found = userMap.get(key);
  if (found) {
    return (
      found.name ||
      found.fullName ||
      [found.firstName, found.lastName].filter(Boolean).join(" ") ||
      found.displayName ||
      found.username ||
      found.email ||
      key
    );
  }
  if (updatedBy && typeof updatedBy === "object") {
    return updatedBy.username || updatedBy.email || key || "-";
  }
  return key || "-";
};

export default function Dashboard() {
  const { user, isAdmin } = useAuth();
  const nav = useNavigate();

  // เช็คสิทธิ์ admin หลายรูปแบบ
  const isAdminFlag = useMemo(() => {
    const u = user || {};
    return Boolean(
      isAdmin ||
        u.isAdmin ||
        u.role === "admin" ||
        (Array.isArray(u.roles) && u.roles.includes("admin"))
    );
  }, [isAdmin, user]);

  const meId = uid(user?._id || user?.id);

  const [kpis, setKpis] = useState([]);
  const [users, setUsers] = useState([]);

  // ฟิลเตอร์สำหรับแอดมิน
  const [status, setStatus] = useState(""); // "", "On Track", "At Risk", "Off Track"
  const [userId, setUserId] = useState(""); // id/_id ของผู้ใช้

  // ตาราง
  const [perPage, setPerPage] = useState(5);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // ฟอร์มอัปเดต (ฝั่ง user)
  const [editingKpi, setEditingKpi] = useState(null);
  const [updatedValue, setUpdatedValue] = useState("");
  const [comment, setComment] = useState("");

  // แผง Updates (ฝั่ง admin)
  const [adminViewKpi, setAdminViewKpi] = useState(null);
  const [adminUpdates, setAdminUpdates] = useState([]);
  const [loadingUpdates, setLoadingUpdates] = useState(false);

  // map สำหรับ id -> user (ไว้ resolve ชื่อในคอลัมน์ By)
  const userMap = useMemo(() => {
    const m = new Map();
    (users || []).forEach((u) => {
      const key = uid(u?._id || u?.id || u?.userId);
      if (key) m.set(key, u);
    });
    return m;
  }, [users]);

  // โหลดข้อมูล
  const load = async () => {
    setLoading(true);
    try {
      const [kpiRes, usersRes] = await Promise.all([
        api.get("/kpis"),
        isAdminFlag ? api.get("/users") : Promise.resolve({ data: [] }),
      ]);

      const raw = kpiRes.data || [];
      const mineOnly = isAdminFlag
        ? raw
        : raw.filter((it) => {
            const assignedId = uid(
              it?.assignedUser?._id ??
                it?.assignedUser?.id ??
                it?.userId ??
                it?.assignedUser
            );
            return assignedId === meId;
          });

      setKpis(mineOnly);
      setUsers(usersRes.data || []);
    } catch (e) {
      console.error(e);
      alert("โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminFlag, meId]);

  // reset หน้าเมื่อเปลี่ยน filter
  useEffect(() => {
    setPage(1);
  }, [status, userId, perPage]);

  // กรองข้อมูลสำหรับแสดง (ผู้ใช้ + สถานะจาก % ของ target)
  const filtered = useMemo(() => {
    return (kpis || []).filter((k) => {
      const assignedId = uid(
        k?.assignedUser?._id ??
          k?.assignedUser?.id ??
          k?.userId ??
          k?.assignedUser
      );
      const matchesUser = !userId || assignedId === uid(userId);
      const derivedStatus = computeStatus(k.actualValue, k.targetValue);
      const matchesStatus = !status || derivedStatus === status;
      return matchesUser && matchesStatus;
    });
  }, [kpis, status, userId]);

  // แบ่งหน้า
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = useMemo(() => {
    const start = (page - 1) * perPage;
    return filtered.slice(start, start + perPage);
  }, [filtered, page, perPage]);

  // เลือก/ยกเลิก KPI ที่จะอัปเดต (user)
  const onSelectForUpdate = (itemOrNull) => {
    setEditingKpi(itemOrNull);
    if (itemOrNull) {
      setUpdatedValue(itemOrNull.actualValue ?? "");
      setComment("");
    } else {
      setUpdatedValue("");
      setComment("");
    }
  };

  // ส่งอัปเดต (user) — เพิ่ม PUT /kpis/:id เพื่อให้อัปเดต Actual จริง
  const submitUpdate = async (e) => {
    e.preventDefault();
    if (!editingKpi) return;

    const kpiId = uid(editingKpi._id || editingKpi.id);
    const delta = Number(updatedValue);
    if (!Number.isFinite(delta)) {
      alert("กรุณากรอก Updated Value เป็นตัวเลข");
      return;
    }

    try {
      // บันทึกบรรทัด update (ฝั่ง backend จะเก็บประวัติ)
      await api.post(`/kpi-update/${kpiId}/updates`, {
        updatedValue: delta,
        comment: comment?.trim() || "",
      });

      // คำนวณค่าใหม่จากของเดิมใน state (ไม่เรียก GET /kpis/:id)
      const latest = editingKpi;
      const currentActual = Number(latest.actualValue) || 0;
      const target = Number(latest.targetValue) || 0;
      const newActual = currentActual + delta;
      const newStatus = computeStatus(newActual, target);

      const payload = {
        ...latest,
        actualValue: newActual,
        status: newStatus,

        assignedUser:
          typeof latest.assignedUser === "object"
            ? latest.assignedUser?._id ||
              latest.assignedUser?.id ||
              latest.assignedUser
            : latest.assignedUser,
      };
      await api.put(`/kpis/${kpiId}`, payload);

      setKpis((prev) =>
        prev.map((k) =>
          uid(k._id || k.id) === kpiId
            ? { ...k, actualValue: newActual, status: newStatus }
            : k
        )
      );
      onSelectForUpdate(null);

      // 5) reload เพื่อความชัวร์ และรีโหลดแผง updates ถ้ากำลังเปิดของ KPI นี้อยู่
      await load();
      if (
        isAdminFlag &&
        adminViewKpi &&
        uid(adminViewKpi._id || adminViewKpi.id) === kpiId
      ) {
        await fetchUpdatesForAdmin(adminViewKpi);
      }
    } catch (err) {
      console.error("Update KPI failed:", err);
      alert(err?.response?.data?.message || "อัปเดตไม่สำเร็จ");
    }
  };

  // เปิด/โหลด Updates (admin)
  const onViewUpdates = async (kpiItem) => {
    setAdminViewKpi(kpiItem);
    await fetchUpdatesForAdmin(kpiItem);
  };
  const fetchUpdatesForAdmin = async (kpiItem) => {
    if (!kpiItem) return;
    const kpiId = uid(kpiItem._id || kpiItem.id);
    setLoadingUpdates(true);
    try {
      const { data } = await api.get(`/kpi-update/${kpiId}/updates`);
      setAdminUpdates(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert("โหลดรายการ Updates ไม่สำเร็จ");
    } finally {
      setLoadingUpdates(false);
    }
  };

  // แอดมิน: แก้ไข/ลบ KPI
  const onEditKpi = (item) => {
    const id = uid(item._id || item.id);
    nav(`/kpis/${id}/edit`, { state: { kpi: item } });
  };
  const onDeleteKpi = async (item) => {
    const id = uid(item._id || item.id);
    if (!window.confirm("ต้องการลบ KPI นี้ใช่ไหม?")) return;
    try {
      await api.delete(`/kpis/${id}`);
      await load();
      if (adminViewKpi && uid(adminViewKpi._id || adminViewKpi.id) === id) {
        setAdminViewKpi(null);
        setAdminUpdates([]);
      }
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "ลบไม่สำเร็จ");
    }
  };

  // % Achieved จากชุดที่ถูกกรอง
  const achievedPctText = useMemo(() => {
    if (!filtered.length) return "0.00%";
    const achieved = filtered.filter(
      (k) => computeStatus(k.actualValue, k.targetValue) === "On Track"
    ).length;
    const pct = Math.round((achieved / filtered.length) * 100);
    return `${pct.toFixed(2)}%`;
  }, [filtered]);

  return (
    <div className="container">
      <h1 className="h1">KPI Dashboard</h1>

      {isAdminFlag && (
        <>
          <DashboardFilters
            status={status}
            onStatus={setStatus}
            userId={userId}
            onUserId={setUserId}
            users={users}
          />

          <QuickStats items={filtered} />
          <KPICharts items={filtered} activeStatus={status || "All"} />

          <div
            style={{
              textAlign: "center",
              margin: "14px 0 8px",
              color: "#6b7280",
            }}
          >
            <b>Achieved KPIs:</b> {achievedPctText}
          </div>
        </>
      )}

      <KPITableLite
        items={paged}
        page={page}
        setPage={setPage}
        perPage={perPage}
        setPerPage={setPerPage}
        totalPages={totalPages}
        totalItems={filtered.length}
        showEditDelete={isAdminFlag}
        showUpdateButton={!isAdminFlag}
        onSelectForUpdate={
          !isAdminFlag ? (v) => onSelectForUpdate(v) : undefined
        }
        editingKpiId={editingKpi ? uid(editingKpi._id || editingKpi.id) : null}
        showViewUpdatesButton={isAdminFlag}
        onViewUpdates={isAdminFlag ? onViewUpdates : undefined}
        onEdit={isAdminFlag ? onEditKpi : undefined}
        onDelete={isAdminFlag ? onDeleteKpi : undefined}
      />

      {!isAdminFlag && editingKpi && (
        <form
          onSubmit={submitUpdate}
          className="card"
          style={{ marginTop: 16 }}
        >
          <div style={{ marginBottom: 8, fontWeight: 600 }}>
            อัปเดต KPI: {editingKpi.title || editingKpi.name}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 4 }}>
              Updated Value
            </label>
            <input
              type="number"
              step="any"
              value={updatedValue}
              onChange={(e) => setUpdatedValue(e.target.value)}
              className="input"
              placeholder="เช่น 2.5"
              required
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 4 }}>Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="input"
              rows={3}
              placeholder="หมายเหตุ (ถ้ามี)"
            />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" className="btn btn-primary">
              อัปเดต KPI
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onSelectForUpdate(null)}
            >
              ยกเลิก
            </button>
          </div>
        </form>
      )}

      {isAdminFlag && adminViewKpi && (
        <div className="card" style={{ marginTop: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <div style={{ fontWeight: 600 }}>
              Updates for: {adminViewKpi.title || adminViewKpi.name}{" "}
              <span style={{ color: "#6b7280" }}>
                (Actual: {Number(adminViewKpi.actualValue || 0).toFixed(2)})
              </span>
            </div>
            <button
              className="btn small"
              onClick={() => {
                setAdminViewKpi(null);
                setAdminUpdates([]);
              }}
            >
              ปิด
            </button>
          </div>

          {loadingUpdates ? (
            <div>Loading updates…</div>
          ) : adminUpdates.length === 0 ? (
            <div style={{ color: "#6b7280" }}>ยังไม่มีการอัปเดตจากผู้ใช้</div>
          ) : (
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>No.</th>
                    <th>Updated Value</th>
                    <th>Comment</th>
                    <th>By</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {adminUpdates.map((u, i) => (
                    <tr key={u._id || i}>
                      <td>{i + 1}</td>
                      <td>{Number(u.updatedValue).toFixed(2)}</td>
                      <td>{u.comment || "-"}</td>
                      {/*แสดงชื่อจริงของผู้ใช้ */}
                      <td>{resolveUserName(u.updatedBy, userMap)}</td>
                      <td>
                        {new Date(u.updatedAt || u.createdAt).toLocaleString(
                          "th-TH"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {loading && <div style={{ marginTop: 10 }}>Loading...</div>}
    </div>
  );
}
