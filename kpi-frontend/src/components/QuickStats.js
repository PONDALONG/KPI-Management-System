// components/QuickStats.js
import React, { useMemo } from "react";

export default function QuickStats({ items }) {
  // คำนวณสถานะจากเปอร์เซ็นต์ของ Target (ใหม่)
  const computeStatus = (actual, target) => {
    const a = Number(actual) || 0;
    const t = Number(target);
    if (!Number.isFinite(t) || t <= 0) {
      return a > 0 ? "On Track" : "Off Track";
    }
    const pct = (a / t) * 100;
    if (pct <= 15) return "Off Track";   // ≤15%
    if (pct < 70)  return "At Risk";     // 16–69%
    return "On Track";                   // ≥70%
  };

  const s = useMemo(() => {
    const total = items.length;

    // นับสถานะจาก actual/target แบบ real-time
    let on = 0, risk = 0, off = 0;
    items.forEach((i) => {
      const st = computeStatus(i.actualValue, i.targetValue);
      if (st === "On Track") on++;
      else if (st === "At Risk") risk++;
      else off++;
    });

    // คำนวณ Average Progress (จำกัดสูงสุด 100%)
    const nums = items
      .map((i) => {
        const t = Number(i.targetValue), a = Number(i.actualValue);
        if (!t || isNaN(t) || isNaN(a)) return null;
        return Math.min(100, Math.round((a / t) * 100));
      })
      .filter((v) => v !== null);

    const avg = nums.length
      ? Math.round(nums.reduce((x, y) => x + y, 0) / nums.length)
      : 0;

    return { total, on, risk, off, avg };
  }, [items]);

  return (
    <div className="stats">
      <div className="card stat">
        <div className="k">Total KPIs</div>
        <div className="v">{s.total}</div>
      </div>
      <div className="card stat">
        <div className="k">On Track</div>
        <div className="v">{s.on}</div>
      </div>
      <div className="card stat">
        <div className="k">At Risk</div>
        <div className="v">{s.risk}</div>
      </div>
      <div className="card stat">
        <div className="k">Off Track</div>
        <div className="v">{s.off}</div>
      </div>
      <div className="card" style={{ gridColumn: "1 / -1" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div className="k">Average Progress</div>
          <div className="k" style={{ fontWeight: 700, color: "#fff" }}>
            {s.avg}%
          </div>
        </div>
        <div className="progress">
          <div style={{ width: `${s.avg}%` }} />
        </div>
      </div>
    </div>
  );
}
