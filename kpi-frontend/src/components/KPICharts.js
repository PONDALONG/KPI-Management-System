// components/KPICharts.js
import React, { useMemo } from "react";
import { Pie, Line } from "react-chartjs-2";
import "chart.js/auto";

/** เกณฑ์สถานะจาก % Target (ใหม่) */
function computeStatus(actual, target) {
  const a = Number(actual) || 0;
  const t = Number(target);
  if (!Number.isFinite(t) || t <= 0) return a > 0 ? "On Track" : "Off Track";
  const pct = (a / t) * 100;
  if (pct <= 15) return "Off Track";   // ≤15%
  if (pct < 70)  return "At Risk";     // 16–69%
  return "On Track";                   // ≥70%
}

const STATUS_LABELS = ["On Track", "At Risk", "Off Track"];
const STATUS_COLORS = {
  "On Track": "#3b82f6", // ฟ้า
  "At Risk":  "#f59e0b", // ส้ม
  "Off Track":"#ef4444", // แดง
};

function buildStatusCounts(items = []) {
  const c = { "On Track": 0, "At Risk": 0, "Off Track": 0 };
  items.forEach((k) => {
    const s = computeStatus(k.actualValue, k.targetValue);
    c[s] += 1;
  });
  return c;
}

function buildMonthlyCounts(items = []) {
  const m = new Map(); // key: YYYY-MM -> count
  items.forEach((k) => {
    const raw = k.startDate || k.createdAt || k.updatedAt;
    if (!raw) return;
    const d = new Date(raw);
    if (isNaN(d.getTime())) return;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    m.set(key, (m.get(key) || 0) + 1);
  });
  const labels = [...m.keys()].sort().slice(-6);
  return { labels, data: labels.map((L) => m.get(L) || 0) };
}

export default function KPICharts({ items = [], activeStatus = "All" }) {
  const counts = useMemo(() => buildStatusCounts(items), [items]);

  // ------- PIE (ไม่ทำให้สีอื่นเป็นเทาแล้ว) -------
  const pieData = useMemo(() => {
    const labels = STATUS_LABELS;
    const data = labels.map((l) => counts[l]);
    const bg = labels.map((l) => STATUS_COLORS[l]); // <— เปลี่ยนแค่บรรทัดนี้
    return {
      labels,
      datasets: [{ data, backgroundColor: bg, borderColor: bg, borderWidth: 1 }],
    };
  }, [counts]);

  // ------- LINE (คงเดิม: ใช้สีของสถานะที่เลือก ถ้า All ใช้ฟ้า) -------
  const month = useMemo(() => buildMonthlyCounts(items), [items]);
  const lineColor = activeStatus === "All" ? "#3b82f6" : STATUS_COLORS[activeStatus];

  const lineData = useMemo(
    () => ({
      labels: month.labels,
      datasets: [
        {
          label: "จำนวน KPI ต่อเดือน",
          data: month.data,
          borderColor: lineColor,
          backgroundColor: "transparent",
          tension: 0.3,
        },
      ],
    }),
    [month, lineColor]
  );

  const lineOpts = {
    responsive: true,
    plugins: { legend: { display: true }, tooltip: { enabled: true } },
    scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
  };

  return (
    <div className="row two" style={{ gap: 16 }}>
      <div className="card">
        <div className="h2" style={{ fontSize: 16, marginBottom: 8 }}>KPI Overview</div>
        <Pie data={pieData} />
      </div>
      <div className="card">
        <div className="h2" style={{ fontSize: 16, marginBottom: 8 }}>KPI Trends (รายเดือน)</div>
        <Line data={lineData} options={lineOpts} />
      </div>
    </div>
  );
}
