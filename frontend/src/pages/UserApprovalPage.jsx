import React, { useEffect, useMemo, useState } from "react";
import { Check, RotateCcw, X } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { DataTable } from "../components/DataTable.jsx";

export function UserApprovalPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("Pending");
  const [message, setMessage] = useState("");

  const load = () => api("/users?limit=100").then((data) => setUsers(data.items || []));
  useEffect(() => { load().catch((error) => setMessage(error.message)); }, []);

  const review = async (row, nextStatus) => {
    try {
      const result = await api(`/users/${row._id}/approval`, { method: "PATCH", body: JSON.stringify({ status: nextStatus }) });
      setMessage(result.message);
      await load();
    } catch (error) { setMessage(error.message); }
  };

  const filtered = useMemo(() => users.filter((row) => {
    const approval = row.role === "Student" ? "Not Required" : (row.approvalStatus || "Approved");
    const matchesStatus = !status || approval === status;
    const term = search.toLowerCase();
    return matchesStatus && (!term || [row.name, row.email, row.mobile, row.role].some((value) => String(value || "").toLowerCase().includes(term)));
  }), [users, search, status]);

  const columns = [
    { key: "name", label: "Name" }, { key: "email", label: "Email" }, { key: "mobile", label: "Mobile" }, { key: "role", label: "Role" },
    { key: "approval", label: "Approval", render: (row) => row.role === "Student" ? "Not Required" : (row.approvalStatus || "Approved") },
    { key: "active", label: "Account", render: (row) => row.isActive ? "Active" : "Inactive" },
    { key: "actions", label: "Actions", render: (row) => {
      if (row.role === "Student") return <span className="text-xs text-slate-400">Automatic access</span>;
      if (String(row._id) === String(currentUser.id || currentUser._id)) return <span className="text-xs text-slate-400">Current account</span>;
      return <div className="flex gap-2">
        <button onClick={() => review(row, "Approved")} className="inline-flex items-center gap-1 rounded-md border border-emerald-200 px-2 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"><Check size={14} /> Approve</button>
        <button onClick={() => review(row, "Rejected")} className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"><X size={14} /> Reject</button>
        {row.approvalStatus === "Rejected" && <button onClick={() => review(row, "Pending")} className="rounded-md border border-slate-200 p-1.5 text-slate-600" title="Move to pending"><RotateCcw size={14} /></button>}
      </div>;
    } }
  ];

  return <div className="space-y-5">
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-xl font-bold">User Approvals</h2><p className="text-sm text-slate-500">Approve non-student registrations before they can login. Student access remains automatic.</p></section>
    <section className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-4 sm:flex-row"><input className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#f97316]" placeholder="Search name, email, mobile or role" value={search} onChange={(e) => setSearch(e.target.value)} /><select className="rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#f97316]" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All approvals</option><option>Pending</option><option>Approved</option><option>Rejected</option><option>Not Required</option></select></section>
    {message && <p className="rounded-md border border-[#f97316]/20 bg-[#fff3e8] px-4 py-3 text-sm font-semibold text-[#c2410c]">{message}</p>}
    <DataTable columns={columns} rows={filtered} />
  </div>;
}
