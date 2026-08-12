import React, { useEffect, useState } from "react";
import { LogIn, LogOut, RefreshCw } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";

const buttonClass = "inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315]";
const secondaryButtonClass = "inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#f97316] hover:text-[#c2410c]";

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
}

function minutes(value) {
  if (!value) return "-";
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return `${hours}h ${mins}m`;
}

export function EmployeeDashboardWidget({ compact = false }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [message, setMessage] = useState("");
  const month = new Date().toISOString().slice(0, 7);
  // Every non-student user has an individual attendance record.  Keep this
  // widget role-neutral so it is available on the main and role-specific
  // staff dashboards alike.
  const isEmployeeView = !["Student", "Parent"].includes(user.role);

  const load = async () => {
    if (!isEmployeeView) return;
    try {
      setMessage("");
      setData(await api(`/employee/me?month=${month}`));
    } catch (error) {
      setMessage(error.message);
    }
  };

  useEffect(() => {
    load();
  }, [user.role]);

  const mark = async (type) => {
    try {
      const result = await api(`/employee/attendance/${type}`, { method: "POST", body: JSON.stringify({}) });
      setMessage(result.message);
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  };

  if (!isEmployeeView) return null;

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[#f97316]">My Employee Dashboard</p>
          <h2 className="mt-1 text-xl font-bold">Today&apos;s attendance and work status</h2>
          {message && <p className="mt-2 text-sm font-semibold text-[#c2410c]">{message}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => mark("login")} className={buttonClass}><LogIn size={16} /> Login</button>
          <button onClick={() => mark("logout")} className={secondaryButtonClass}><LogOut size={16} /> Logout</button>
          <button onClick={load} className={secondaryButtonClass}><RefreshCw size={16} /> Refresh</button>
        </div>
      </div>
      <div className={`mt-5 grid gap-3 text-sm ${compact ? "sm:grid-cols-3" : "sm:grid-cols-2 xl:grid-cols-6"}`}>
        {[
          ["Status", data?.todayAttendance?.status || "Not logged"],
          ["Login", formatTime(data?.todayAttendance?.loginTime)],
          ["Logout", formatTime(data?.todayAttendance?.logoutTime)],
          ["Working", minutes(data?.todayAttendance?.totalWorkingMinutes)],
          ["Late This Month", data?.monthlySummary?.late ?? 0],
          ["Leaves This Month", data?.monthlySummary?.leave ?? 0]
        ].map(([label, value]) => (
          <div key={label} className="rounded-md bg-slate-50 px-3 py-3">
            <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
            <p className="mt-1 font-black">{value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
