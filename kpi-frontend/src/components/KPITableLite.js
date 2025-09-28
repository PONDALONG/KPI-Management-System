// components/KPITableLite.js
import React from "react";
import StatusBadge from "./StatusBadge";
import Papa from "papaparse";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/* ---------------- Utils ---------------- */
function fmt(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}
function fmtNum(v) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "-";
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function assignedLabel(au) {
  if (!au) return "-";
  if (typeof au === "string") return "—";
  return au.name || au.username || au.email || "-";
}

/* ✅ คำนวณสถานะจาก % ของ Target (ใหม่) */
function computeStatus(actual, target) {
  const a = Number(actual) || 0;
  const t = Number(target);
  if (!Number.isFinite(t) || t <= 0) {
    return a > 0 ? "On Track" : "Off Track";
  }
  const pct = (a / t) * 100;
  if (pct <= 15) return "Off Track";   // ≤15%
  if (pct < 70)  return "At Risk";     // 16–69%
  return "On Track";                   // ≥70%
}

// ArrayBuffer → base64 (ใช้ฝังฟอนต์ไทยใน jsPDF)
function arrayBufferToBase64(buf) {
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

/** โหลดฟอนต์ไทย Sarabun (มี fallback เป็น helvetica) */
async function ensureThaiFont(doc) {
  try {
    const resReg = await fetch("/fonts/Sarabun-Regular.ttf?v=1");
    if (!resReg.ok) throw new Error("Sarabun-Regular.ttf not found");
    const regBase64 = arrayBufferToBase64(await resReg.arrayBuffer());
    doc.addFileToVFS("Sarabun-Regular.ttf", regBase64);
    doc.addFont("Sarabun-Regular.ttf", "Sarabun", "normal");

    try {
      const resBold = await fetch("/fonts/Sarabun-Bold.ttf?v=1");
      if (resBold.ok) {
        const boldBase64 = arrayBufferToBase64(await resBold.arrayBuffer());
        doc.addFileToVFS("Sarabun-Bold.ttf", boldBase64);
        doc.addFont("Sarabun-Bold.ttf", "Sarabun", "bold");
      }
    } catch {}

    doc.setFont("Sarabun", "normal");
    const list = doc.getFontList();
    if (!Object.keys(list).some((f) => f.toLowerCase() === "sarabun")) {
      throw new Error("Sarabun not registered");
    }
    return "Sarabun";
  } catch (e) {
    console.warn("Load Thai font failed. Fallback to helvetica:", e);
    doc.setFont("helvetica", "normal");
    return "helvetica";
  }
}

/* --------------- Component --------------- */
export default function KPITableLite({
  items,
  page,
  setPage,
  perPage,
  setPerPage,
  totalPages,
  totalItems,
  onEdit,
  onDelete,
  showEditDelete = true,       // true = admin
  showUpdateButton = false,    // true = user
  onSelectForUpdate,
  editingKpiId,
  showViewUpdatesButton = false,
  onViewUpdates,
}) {
  const isAdmin = !!showEditDelete;

  // === Export ===
  const exportCSV = () => {
    const rows = items.map((k, i) => {
      const statusCalc = computeStatus(k.actualValue, k.targetValue);
      const base = {
        No: (page - 1) * perPage + (i + 1),
        Title: k.title,
        Status: statusCalc,
      };
      if (isAdmin) {
        return {
          ...base,
          Assigned: assignedLabel(k.assignedUser),
          StartDate: String(fmt(k.startDate)),
          EndDate: String(fmt(k.endDate)),
        };
      }
      // user view
      return {
        ...base,
        TargetValue: fmtNum(k.targetValue),
        ActualValue: fmtNum(k.actualValue),
        EndDate: String(fmt(k.endDate)),
      };
    });

    const csv = Papa.unparse(rows);
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kpis.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportPDF = async () => {
    const doc = new jsPDF();
    const fontName = await ensureThaiFont(doc);

    doc.setFont(fontName, "normal");
    doc.text("KPI Report", 14, 16);

    const head = isAdmin
      ? [["#", "Title", "Status", "Assigned", "Start Date", "End Date"]]
      : [["#", "Title", "Status", "Target Value", "Actual Value", "End Date"]];

    const body = items.map((k, i) => {
      const statusCalc = computeStatus(k.actualValue, k.targetValue);
      return isAdmin
        ? [
            (page - 1) * perPage + (i + 1),
            k.title,
            statusCalc,
            assignedLabel(k.assignedUser),
            fmt(k.startDate),
            fmt(k.endDate),
          ]
        : [
            (page - 1) * perPage + (i + 1),
            k.title,
            statusCalc,
            fmtNum(k.targetValue),
            fmtNum(k.actualValue),
            fmt(k.endDate),
          ];
    });

    autoTable(doc, {
      startY: 20,
      head,
      body,
      styles: { font: fontName, fontSize: 10 },
      headStyles: { font: fontName, fontStyle: "bold" },
    });

    doc.save("kpis.pdf");
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 10 }}>
        <button style={{ color: "green" }} className="btn small" onClick={exportCSV}>Export CSV</button>
        <button style={{ color: "red" }} className="btn small" onClick={exportPDF}>Export PDF</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 60 }}>No.</th>
              <th>Title</th>
              <th>Status</th>

              {/* admin columns */}
              {isAdmin && <th>Assigned User</th>}
              {isAdmin && <th>Start Date</th>}

              {/* user columns */}
              {!isAdmin && <th>Target Value</th>}
              {!isAdmin && <th>Actual Value</th>}

              <th>End Date</th>
              <th style={{ width: 300, textAlign: "center" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: 16, color: "#6b7280" }}>
                  ไม่พบข้อมูล
                </td>
              </tr>
            ) : (
              items.map((k, idx) => {
                const id = String(k._id || k.id || "");
                const isEditing = editingKpiId && editingKpiId === id;
                const statusCalc = computeStatus(k.actualValue, k.targetValue);

                return (
                  <tr key={id || idx}>
                    <td>{(page - 1) * perPage + (idx + 1)}</td>
                    <td>{k.title}</td>
                    <td><StatusBadge status={statusCalc} /></td>

                    {isAdmin && <td>{assignedLabel(k.assignedUser)}</td>}
                    {isAdmin && <td>{fmt(k.startDate)}</td>}

                    {!isAdmin && <td>{fmtNum(k.targetValue)}</td>}
                    {!isAdmin && <td>{fmtNum(k.actualValue)}</td>}

                    <td>{fmt(k.endDate)}</td>

                    <td>
                      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                        {isAdmin && (
                          <>
                            <button
                              style={{ color: "#FF9900" }}
                              className="btn small"
                              onClick={() => onEdit ? onEdit(k) : null}
                            >
                              Edit
                            </button>
                            <button
                              className="btn small" style={{ color: "red" }}
                              onClick={() => {
                                if (!onDelete) return;
                                if (window.confirm("ต้องการลบรายการนี้ใช่ไหม?")) onDelete(k);
                              }}
                            >
                              Delete
                            </button>
                          </>
                        )}

                        {!isAdmin && typeof onSelectForUpdate === "function" && (
                          <button
                            className="btn small" style={{ color: "blue" }}
                            onClick={() => onSelectForUpdate(isEditing ? null : k)}
                          >
                            {isEditing ? "Cancel" : "Update"}
                          </button>
                        )}

                        {showViewUpdatesButton && typeof onViewUpdates === "function" && (
                          <button style={{ color: "blue" }} className="btn small" onClick={() => onViewUpdates(k)}>
                            Updates
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
        <div>
          แสดงแถว:
          <select
            className="select"
            style={{ width: 80, marginLeft: 6 }}
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
          >
            <option>5</option>
            <option>10</option>
            <option>20</option>
          </select>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
          <button className="btn small" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            ก่อนหน้า
          </button>
          <span>หน้า {page} / {totalPages}</span>
          <button className="btn small" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            ถัดไป
          </button>
        </div>

        <div style={{ color: "#6b7280" }}>รวม {totalItems} รายการ</div>
      </div>
    </div>
  );
}
