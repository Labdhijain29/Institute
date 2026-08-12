import React from "react";
import { MetricCard, Panel } from "../components/StudentUI.jsx";

export function StudentAttendance({ data }) {
  const attendance = data.attendance;
  return (
    <div className="space-y-5">
      <Panel title="My Attendance"><p className="text-sm text-slate-500">Course attendance is recorded by your faculty. QR check-in is for employees only.</p></Panel>
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Total Classes" value={attendance.totalClasses || 0} />
        <MetricCard label="Present Classes" value={attendance.presentClasses || 0} />
        <MetricCard label="Attendance Percentage" value={`${attendance.attendancePercentage || 0}%`} />
      </div>
    </div>
  );
}
