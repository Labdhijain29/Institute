import React from "react";
import { Panel } from "../components/StudentUI.jsx";

export function StudentCourse({ data }) {
  return (
    <Panel title="My Course">
      <div className="grid gap-4 sm:grid-cols-3">
        {[['Course Name', data.course.name], ['Duration', data.course.duration], ['Status', data.course.status]].map(([label, value]) => (
          <div key={label} className="rounded-md bg-slate-50 p-4">
            <p className="text-sm text-slate-500">{label}</p><p className="mt-1 font-bold">{value}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}
