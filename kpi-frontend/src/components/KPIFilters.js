import React from "react";
const STATUSES = ["On Track", "At Risk", "Off Track"];
export default function KPIFilters({
  query,
  status,
  user,
  users,
  onQuery,
  onStatus,
  onUser,
}) {
  return (
    <div className="card">
      <div className="row two">
        <div>
          <div className="label">Search</div>
          <input
            className="input"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Title / description / user"
          />
        </div>
        <div className="row two">
          <div>
            <div className="label">Status</div>
            <select
              className="select"
              value={status}
              onChange={(e) => onStatus(e.target.value)}
            >
              <option value="">All</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <div className="label">User</div>
            <select
              className="select"
              value={user}
              onChange={(e) => onUser(e.target.value)}
            >
              <option value="">All</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
