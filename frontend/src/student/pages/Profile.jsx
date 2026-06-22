import React, { useState } from "react";
import { api } from "../../api/client.js";
import { Panel } from "../components/StudentUI.jsx";

export function StudentProfile({ data }) {
  const student = data.student;
  const [form, setForm] = useState({ currentPassword: "", newPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const submit = async (event) => {
    event.preventDefault(); setMessage(""); setError("");
    try {
      const result = await api("/student-portal/change-password", { method: "PATCH", body: JSON.stringify(form) });
      setMessage(result.message); setForm({ currentPassword: "", newPassword: "" });
    } catch (err) { setError(err.message); }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel title="Profile">
        <div className="flex flex-col items-center text-center">
          {student.profilePicture ? <img src={student.profilePicture} alt={student.name} className="h-24 w-24 rounded-full object-cover" /> : <div className="grid h-24 w-24 place-items-center rounded-full bg-[#fff3e8] text-3xl font-bold text-[#f97316]">{student.name.charAt(0).toUpperCase()}</div>}
          <h2 className="mt-4 text-xl font-bold">{student.name}</h2><p className="text-sm text-slate-500">{student.studentId}</p>
        </div>
        <div className="mt-6 space-y-3 text-sm"><p><span className="text-slate-500">Email:</span> <strong>{student.email}</strong></p><p><span className="text-slate-500">Mobile Number:</span> <strong>{student.mobile || '-'}</strong></p></div>
      </Panel>
      <Panel title="Change Password">
        <form onSubmit={submit} className="space-y-4">
          <label className="block text-sm font-semibold">Current Password<input required type="password" className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316]" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} /></label>
          <label className="block text-sm font-semibold">New Password<input required minLength="6" type="password" className="mt-1.5 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-[#f97316]" value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} /></label>
          {message && <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}{error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button className="rounded-md bg-[#111315] px-4 py-2 text-sm font-semibold text-white hover:bg-[#f97316]">Change Password</button>
        </form>
      </Panel>
    </div>
  );
}
