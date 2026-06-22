import React from "react";
import { MetricCard, Panel, formatCurrency } from "../components/StudentUI.jsx";

export function StudentDashboard({ data }) {
  const { student, dashboard } = data;
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
    </div>
  );
}
