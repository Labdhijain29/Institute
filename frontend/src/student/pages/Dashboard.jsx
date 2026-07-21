import React from "react";
import { FileDown } from "lucide-react";
import { MetricCard, Panel, formatCurrency, formatDate } from "../components/StudentUI.jsx";

function openRegistrationForm() {
  window.history.pushState({}, "", "/student/registration-form");
  window.dispatchEvent(new Event("popstate"));
}

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
}

function minutes(value) {
  if (!value) return "-";
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return `${hours}h ${mins}m`;
}

export function StudentDashboard({ data }) {
  const { student, dashboard, attendance } = data;
  return (
    <div className="space-y-5">
      <Panel>
        <p className="text-sm font-semibold uppercase text-[#f97316]">Student Dashboard</p>
        <h1 className="mt-1 text-2xl font-bold">Welcome, {student.name}</h1>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <p><span className="text-slate-500">Student ID:</span> <strong>{student.studentId}</strong></p>
          <p><span className="text-slate-500">Course:</span> <strong>{student.courseName}</strong></p>
          <p><span className="text-slate-500">Batch:</span> <strong>{student.batchName}</strong></p>
        </div>
      </Panel>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard label="Attendance Percentage" value={`${dashboard.attendancePercentage}%`} />
        <MetricCard label="Pending Assignments" value={dashboard.pendingAssignments} />
        <MetricCard label="Remaining Fees" value={formatCurrency(dashboard.remainingFees)} />
      </div>

      <Panel>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-bold">Registration Form</p>
            <p className="mt-1 text-sm text-slate-500">Review your submitted registration details or save a copy for your records.</p>
          </div>
          <button onClick={openRegistrationForm} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-[#111315] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#f97316]">
            <FileDown size={17} /> Review Form
          </button>
        </div>
      </Panel>

      <Panel title="My Attendance">
        <div className="grid gap-3 text-sm sm:grid-cols-4">
          <div className="rounded-md bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">Total Classes</p><p className="mt-1 text-xl font-black">{attendance.totalClasses}</p></div>
          <div className="rounded-md bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">Present</p><p className="mt-1 text-xl font-black">{attendance.presentClasses}</p></div>
          <div className="rounded-md bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">Absent</p><p className="mt-1 text-xl font-black">{attendance.absentClasses}</p></div>
          <div className="rounded-md bg-slate-50 p-3"><p className="text-xs font-bold uppercase text-slate-500">Percentage</p><p className="mt-1 text-xl font-black">{attendance.attendancePercentage}%</p></div>
        </div>
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">In</th><th className="px-4 py-3">Out</th><th className="px-4 py-3">Working</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(attendance.recent || []).map((row) => (
                <tr key={row.id}><td className="px-4 py-3">{formatDate(row.date)}</td><td className="px-4 py-3 font-semibold">{row.status}</td><td className="px-4 py-3">{formatTime(row.loginTime)}</td><td className="px-4 py-3">{formatTime(row.logoutTime)}</td><td className="px-4 py-3">{minutes(row.totalWorkingMinutes)}</td></tr>
              ))}
              {!attendance.recent?.length && <tr><td colSpan={5} className="px-4 py-6 text-center text-slate-500">No attendance records yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
