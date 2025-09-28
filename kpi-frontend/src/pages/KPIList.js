import React, { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import KPIFilters from "../components/KPIFilters";
import KPITable from "../components/KPITable";
import QuickStats from "../components/QuickStats";
import KPIForm from "./KPIForm";

export default function KPIList() {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [user, setUser] = useState("");
  const [sort, setSort] = useState({ key: "title", asc: true });
  const [editing, setEditing] = useState(null);

  const load = async () => {
    const [k, u] = await Promise.all([
      api.get("/kpis"),
      api.get("/users").catch(() => ({ data: [] })),
    ]);
    setItems(k.data);
    setUsers(u.data || []);
  };
  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    const arr = items.filter((it) => {
      const hit =
        it.title.toLowerCase().includes(q) ||
        (it.description || "").toLowerCase().includes(q) ||
        (it.assignedUser?.name || "").toLowerCase().includes(q);
      const s = status ? it.status === status : true;
      const u = user ? String(it.assignedUser?._id) === user : true;
      return hit && s && u;
    });
    const get = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);
    arr.sort((a, b) => {
      const A = get(a, sort.key),
        B = get(b, sort.key);
      const na = Number(A),
        nb = Number(B);
      if (!isNaN(na) && !isNaN(nb)) return (na - nb) * (sort.asc ? 1 : -1);
      const sa = String(A || "").toLowerCase(),
        sb = String(B || "").toLowerCase();
      if (sa < sb) return sort.asc ? -1 : 1;
      if (sa > sb) return sort.asc ? 1 : -1;
      return 0;
    });
    return arr;
  }, [items, query, status, user, sort]);

  const onDelete = async (id) => {
    await api.delete(`/kpis/${id}`);
    load();
  };

  return (
    <div>
      <QuickStats items={filtered} />
      {editing ? (
        <KPIForm
          editing={editing}
          onSaved={() => {
            setEditing(null);
            load();
          }}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <KPIForm onSaved={load} />
      )}
      <div className="mt20" />
      <KPIFilters
        query={query}
        status={status}
        user={user}
        users={users}
        onQuery={setQuery}
        onStatus={setStatus}
        onUser={setUser}
      />
      <KPITable
        items={filtered}
        onEdit={setEditing}
        onDelete={onDelete}
        sort={sort}
        onSort={(key) =>
          setSort((s) =>
            s.key === key ? { key, asc: !s.asc } : { key, asc: true }
          )
        }
      />
    </div>
  );
}
