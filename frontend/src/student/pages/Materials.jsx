import React from "react";
import { ExternalLink, FileText } from "lucide-react";
import { EmptyState, Panel } from "../components/StudentUI.jsx";

export function StudentMaterials({ data }) {
  return (
    <Panel title="Study Material">
      {!data.materials.length ? <EmptyState>No study material is available yet.</EmptyState> : (
        <div className="grid gap-3 md:grid-cols-2">
          {data.materials.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-4">
              <div className="flex min-w-0 items-center gap-3"><FileText className="shrink-0 text-[#f97316]" size={20} /><div className="min-w-0"><p className="truncate font-semibold">{item.title}</p><p className="text-xs text-slate-500">{item.type}</p></div></div>
              <a href={item.url} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[#ea580c]">View <ExternalLink size={14} /></a>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
