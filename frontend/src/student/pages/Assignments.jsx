import React from "react";
import { EmptyState, Panel, formatDate } from "../components/StudentUI.jsx";

export function StudentAssignments({ data }) {
  return (
    <Panel title="Assignments">
      {!data.assignments.length ? <EmptyState>No assignments have been assigned yet.</EmptyState> : (
        <div className="table-wrap">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-500"><tr><th className="px-3 py-3">Assignment Title</th><th className="px-3 py-3">Due Date</th><th className="px-3 py-3">Submission Status</th></tr></thead>
            <tbody>{data.assignments.map((item) => <tr key={item.id} className="border-b border-slate-100"><td className="px-3 py-4 font-semibold">{item.title}</td><td className="px-3 py-4">{formatDate(item.dueDate)}</td><td className="px-3 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.status === 'Submitted' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{item.status}</span></td></tr>)}</tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}
