import React from "react";
import { MetricCard, Panel } from "../components/StudentUI.jsx";

export function StudentAttendance({ data }) {
  const attendance = data.attendance;
  return (
    <div className="space-y-5">
      <Panel title="Attendance"><p className="text-sm text-slate-500">Your attendance summary for the current course and batch.</p></Panel>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Classes" value={attendance.totalClasses} />
        <MetricCard label="Present Classes" value={attendance.presentClasses} />
        <MetricCard label="Absent Classes" value={attendance.absentClasses} />
        <MetricCard label="Attendance Percentage" value={`${attendance.attendancePercentage}%`} />
      </div>
    </div>
  );
}
