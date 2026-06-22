import React from "react";
import { EmptyState, MetricCard, Panel, formatCurrency, formatDate } from "../components/StudentUI.jsx";

export function StudentFees({ data }) {
  const fees = data.fees;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-3"><MetricCard label="Total Fees" value={formatCurrency(fees.totalFees)} /><MetricCard label="Paid Fees" value={formatCurrency(fees.paidFees)} /><MetricCard label="Remaining Fees" value={formatCurrency(fees.remainingFees)} /></div>
      <Panel title="Payment History">
        {!fees.payments.length ? <EmptyState>No payments recorded yet.</EmptyState> : (
          <div className="table-wrap"><table className="w-full min-w-[620px] text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="px-3 py-3">Date</th><th className="px-3 py-3">Receipt No.</th><th className="px-3 py-3">Mode</th><th className="px-3 py-3">Amount</th></tr></thead><tbody>{fees.payments.map((payment) => <tr key={payment.id} className="border-b border-slate-100"><td className="px-3 py-4">{formatDate(payment.paidAt)}</td><td className="px-3 py-4 font-semibold">{payment.receiptNo}</td><td className="px-3 py-4">{payment.mode}</td><td className="px-3 py-4">{formatCurrency(payment.amount)}</td></tr>)}</tbody></table></div>
        )}
      </Panel>
    </div>
  );
}
