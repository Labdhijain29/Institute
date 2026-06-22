import React from "react";

export function Panel({ title, children }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {title && <h2 className="mb-4 text-lg font-bold">{title}</h2>}
      {children}
    </section>
  );
}

export function MetricCard({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#111315]">{value}</p>
    </div>
  );
}

export function EmptyState({ children = "No records available." }) {
  return <p className="rounded-md bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">{children}</p>;
}

export function formatCurrency(value) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);
}

export function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("en-IN") : "-";
}
