import React from "react";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { api } from "../api/client";
import { DataTable } from "../components/DataTable.jsx";

const endpointMap = {
  admissions: "/students",
  hr: "/staff",
  materials: "/study-materials",
  reports: "/reports/dashboard",
  permissions: "/permissions"
};

export function ModulePage({ module }) {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const endpoint = endpointMap[module.path] || `/${module.path}`;

  useEffect(() => {
    setError("");
    api(endpoint)
      .then((data) => setRows(Array.isArray(data.items) ? data.items : [data]))
      .catch((err) => {
        setRows([]);
        setError(err.message);
      });
  }, [endpoint]);

  const columns = useMemo(() => {
    const sample = rows[0] || {};
    const keys = Object.keys(sample).filter((key) => !["_id", "__v", "password"].includes(key)).slice(0, 5);
    return keys.length ? keys.map((key) => ({ key, label: key.replace(/([A-Z])/g, " $1") })) : [{ key: "name", label: "Name" }, { key: "status", label: "Status" }, { key: "createdAt", label: "Created" }];
  }, [rows]);

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-bold">{module.label}</h2>
          <p className="text-sm text-slate-500">Search, filters, pagination and CRUD APIs are ready for this module.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315]">
          <Plus size={17} />
          New Record
        </button>
      </section>
      {error && <p className="rounded-md border border-amberline/40 bg-amberline/15 px-4 py-3 text-sm text-amber-800">{error}</p>}
      <DataTable columns={columns} rows={rows} />
    </div>
  );
}
