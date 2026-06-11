import React from "react";
import { useEffect, useState } from "react";
import { Send, UserCheck } from "lucide-react";
import { api } from "../api/client";
import { DataTable } from "../components/DataTable.jsx";

const emptyLead = {
  name: "",
  mobile: "",
  email: "",
  source: "Website",
  priority: "Warm",
  remarks: ""
};

export function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState(emptyLead);
  const [message, setMessage] = useState("");

  const load = () => api("/leads").then((data) => setLeads(data.items || []));

  useEffect(() => {
    load().catch((err) => setMessage(err.message));
  }, []);

  const createLead = async (event) => {
    event.preventDefault();
    await api("/leads", { method: "POST", body: JSON.stringify(form) });
    setForm(emptyLead);
    setMessage("Lead created");
    load();
  };

  const forward = async (lead) => {
    const counsellorAssigned = window.prompt("Counsellor user id");
    if (!counsellorAssigned) return;
    await api(`/leads/${lead._id}/forward`, { method: "POST", body: JSON.stringify({ counsellorAssigned, remarks: "Forwarded for counselling" }) });
    setMessage("Lead forwarded to counsellor");
    load();
  };

  const convert = async (lead) => {
    const course = window.prompt("Course id");
    const totalFees = Number(window.prompt("Total fees") || 0);
    if (!course || !totalFees) return;
    await api(`/leads/${lead._id}/convert`, { method: "POST", body: JSON.stringify({ course, totalFees, initialPayment: 0 }) });
    setMessage("Lead converted to student admission");
    load();
  };

  const columns = [
    { key: "name", label: "Name" },
    { key: "mobile", label: "Mobile" },
    { key: "priority", label: "Priority" },
    { key: "status", label: "Status" },
    { key: "followUpDate", label: "Follow-up", render: (row) => (row.followUpDate ? new Date(row.followUpDate).toLocaleDateString() : "-") },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex gap-2">
          <button onClick={() => forward(row)} className="rounded-md border border-slate-200 p-2 text-pine hover:bg-pine/10" title="Forward to counsellor">
            <Send size={16} />
          </button>
          <button onClick={() => convert(row)} className="rounded-md border border-slate-200 p-2 text-coral hover:bg-coral/10" title="Convert admission">
            <UserCheck size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
      <form onSubmit={createLead} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold">New Lead</h2>
        <div className="mt-4 space-y-3">
          {["name", "mobile", "email", "source"].map((field) => (
            <input key={field} className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-pine" placeholder={field} value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
          ))}
          <select className="w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-pine" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
            <option>Hot</option>
            <option>Warm</option>
            <option>Cold</option>
          </select>
          <textarea className="min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-pine" placeholder="remarks" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
          <button className="w-full rounded-md bg-ink px-4 py-2.5 font-semibold text-white hover:bg-pine">Create Lead</button>
        </div>
        {message && <p className="mt-4 rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-700">{message}</p>}
      </form>
      <section className="min-w-0 space-y-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold">Lead Forwarding & Admission Flow</h2>
          <p className="mt-1 text-sm text-slate-500">Telecallers update interest, forward qualified leads to counsellors, and counsellors convert them into students with fee records.</p>
        </div>
        <DataTable columns={columns} rows={leads} />
      </section>
    </div>
  );
}
