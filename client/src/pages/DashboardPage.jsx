import React from "react";
import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { roleDashboards } from "../data/roleConfig.js";

export function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const items = roleDashboards[user.role] || [];

  useEffect(() => {
    api("/reports/dashboard").then(setSummary).catch(() => setSummary(null));
  }, []);

  const values = [
    summary?.totalBranches ?? 0,
    `₹${summary?.totalRevenue ?? 0}`,
    summary?.totalUsers ?? 0,
    summary?.totalStudents ?? 0,
    summary?.totalLeads ?? 0,
    `₹${summary?.pendingFees ?? 0}`
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-pine">{user.role} Dashboard</p>
            <h2 className="mt-1 text-2xl font-bold">Today&apos;s institute command center</h2>
          </div>
          <div className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">Branch-aware RBAC enabled</div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <StatCard key={item} label={item} value={values[index] ?? Math.floor(20 + index * 11)} tone={["pine", "coral", "amber", "ink"][index % 4]} />
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-bold">Workflow Health</h3>
          <div className="mt-5 space-y-4">
            {["Lead response", "Admission conversion", "Fees recovery", "Attendance quality"].map((label, index) => (
              <div key={label}>
                <div className="mb-2 flex justify-between text-sm">
                  <span>{label}</span>
                  <span className="font-semibold">{72 + index * 6}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div className="h-2 rounded-full bg-pine" style={{ width: `${72 + index * 6}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <h3 className="font-bold">Priority Queue</h3>
          <div className="mt-4 space-y-3">
            {["Follow-up reminders", "Pending fee calls", "Demo class confirmations", "Faculty attendance review"].map((item) => (
              <div key={item} className="rounded-md border border-slate-100 bg-slate-50 px-3 py-3 text-sm font-medium">{item}</div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
