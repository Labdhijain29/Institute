import React from "react";

export function StatCard({ label, value, tone = "pine" }) {
  const tones = {
    pine: "border-[#f97316]/25 bg-[#fff3e8] text-[#c2410c]",
    coral: "border-[#111315]/15 bg-[#111315]/5 text-[#111315]",
    amber: "border-[#f59e0b]/25 bg-[#fffbeb] text-[#b45309]",
    ink: "border-slate-300 bg-slate-100 text-slate-700"
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-sm text-slate-500">{label}</p>
      <div className="mt-4 flex items-end justify-between">
        <p className="text-2xl font-bold">{value}</p>
        <span className={`rounded-md border px-2 py-1 text-xs font-semibold ${tones[tone]}`}>Live</span>
      </div>
    </div>
  );
}
