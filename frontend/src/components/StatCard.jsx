import React from "react";

export function StatCard({ label, value, tone = "pine" }) {
  const tones = {
    pine: "border-pine/20 bg-pine/10 text-pine",
    coral: "border-coral/20 bg-coral/10 text-coral",
    amber: "border-amberline/30 bg-amberline/15 text-amber-700",
    ink: "border-ink/15 bg-ink/10 text-ink"
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
