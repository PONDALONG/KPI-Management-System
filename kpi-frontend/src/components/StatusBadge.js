import React from "react";

export default function StatusBadge({ status }) {
  let color = "";
  let icon = "●"; 

  switch (status) {
    case "On Track":
      color = "green";
      break;
    case "At Risk":
      color = "orange";
      break;
    case "Off Track":
      color = "red";
      break;
    default:
      color = "gray";
  }

  return (
    <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ color, fontSize: "14px" }}>{icon}</span>
      <span style={{ color: "#111827", fontWeight: 500 }}>{status}</span>
    </span>
  );
}
