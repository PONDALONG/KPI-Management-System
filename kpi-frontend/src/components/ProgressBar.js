import React from "react";
export default function ProgressBar({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="progress">
      <div style={{ width: `${pct}%` }} />
    </div>
  );
}
