import React from "react";

const STATUS = [
  { label: "On Track", value: "On Track" },
  { label: "At Risk", value: "At Risk" },
  { label: "Off Track", value: "Off Track" },
];

// แปลงค่าให้เป็น string เสมอ ป้องกัน compare พลาด

export default function DashboardFilters({
  status = "",
  onStatus,
  userId = "",
  onUserId,
  users = [],
}) {
  const handleReset = () => {
    onStatus && onStatus("");
    onUserId && onUserId("");
  };

  return (
    <div className="card" style={{ marginBottom: 12 }}>
      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontWeight: 700 }}>สถานะ:</div>

          <button
            type="button"
            aria-pressed={status === ""}
            className={`btn small ${!status ? "primary" : ""}`}
            onClick={() => onStatus && onStatus("")}
          >
            All
          </button>

          {STATUS.map(({ label, value }) => (
            <button
              key={value}
              type="button"
              aria-pressed={status === value}
              className={`btn small ${status === value ? "primary" : ""}`}
              onClick={() => onStatus && onStatus(value)}
            >
              {label}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="label" style={{ minWidth: 96 }}>
            เลือกพนักงาน
          </div>
          <select
            className="select"
            value={userId}
            onChange={(e) => onUserId && onUserId(e.target.value)}
            style={{ minWidth: 220 }}
          >
            <option value="">ทั้งหมด</option>
            {users.map((u) => {
              const id = u?._id ?? u?.id ?? u?.userId ?? "";
              const label = u?.name || u?.username || u?.email || String(id);
              return (
                <option key={id} value={id}>
                  {label}
                </option>
              );
            })}
          </select>

          {(status || userId) && (
            <button type="button" className="btn small" onClick={handleReset}>
              รีเซ็ต
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
