import React from "react";
import StatusBadge from "./StatusBadge.js";
import ProgressBar from "./ProgressBar.js";

export default function KPITable({ items, onEdit, onDelete, sort, onSort }) {
  const Th = ({ id, children }) => {
    const active = sort.key === id;
    return (
      <th onClick={() => onSort(id)}>
        <span style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
          {children} {active ? (sort.asc ? "▲" : "▼") : ""}
        </span>
      </th>
    );
  };
  return (
    <div className="card table-wrap">
      <table className="table">
        <thead>
          <tr>
            <Th id="title">Title</Th>
            <th>Description</th>
            <Th id="targetValue">Target</Th>
            <Th id="actualValue">Actual</Th>
            <th>Progress</th>
            <Th id="status">Status</Th>
            <Th id="assignedUser.name">Assigned</Th>
            <Th id="startDate">Start</Th>
            <Th id="endDate">End</Th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan={10} style={{ padding: 16, color: "#9fb0d9" }}>
                No KPI found.
              </td>
            </tr>
          ) : (
            items.map((k) => {
              const t = Number(k.targetValue),
                a = Number(k.actualValue);
              const pct = t > 0 && !isNaN(t) && !isNaN(a) ? (a / t) * 100 : 0;
              return (
                <tr key={k._id}>
                  <td style={{ fontWeight: 700 }}>{k.title}</td>
                  <td
                    title={k.description}
                    style={{
                      maxWidth: 340,
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                    }}
                  >
                    {k.description}
                  </td>
                  <td>{k.targetValue ?? "-"}</td>
                  <td>{k.actualValue ?? "-"}</td>
                  <td>
                    <ProgressBar value={pct} />
                  </td>
                  <td>
                    <StatusBadge status={k.status} />
                  </td>
                  <td>{k.assignedUser?.name || "-"}</td>
                  <td>{k.startDate?.slice(0, 10) || "-"}</td>
                  <td>{k.endDate?.slice(0, 10) || "-"}</td>
                  <td>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn" onClick={() => onEdit(k)}>
                        Edit
                      </button>
                      <button
                        className="btn"
                        onClick={() =>
                          window.confirm("Delete?") && onDelete(k._id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
