import React, { useRef } from "react";
import { Download, Edit3, Printer, Trash2, X } from "lucide-react";
import { BrandLogo } from "./BrandLogo.jsx";
import { amountInWords } from "../utils/amountInWords.js";
import { downloadSalarySlipPdf } from "../utils/salarySlipPdf.js";

const company = {
  name: "Coding Walla",
  address: "First Floor, 91 Ratna Lok Colony Road, near Medanta Hospital, Vijay Nagar, Indore, Madhya Pradesh 452010",
  phone: "+91 8435104032",
  email: "info@codingwalla.com"
};
const numeric = (value) => Number(value || 0);
const money = (value) => numeric(value).toLocaleString("en-IN", { maximumFractionDigits: 2 });
const date = (value) => value ? new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "-";
const payrollMonth = (value) => value ? new Date(`${value}-01T00:00:00`).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "-";
const detail = (value) => value || "Not Available";

export function SalarySlipModal({ open, onClose, onEdit, onDelete, data, loading }) {
  const printRef = useRef(null);
  if (!open) return null;
  const payroll = data?.payroll || {};
  const employee = data?.employee || {};
  const staff = data?.staff || {};
  const basic = numeric(payroll.basicSalary || payroll.monthlySalary || payroll.grossAmount);
  const hra = numeric(payroll.hra);
  const specialAllowance = numeric(payroll.specialAllowance) || numeric(payroll.bonus) + numeric(payroll.incentives);
  const gross = basic + hra + specialAllowance;
  const leaveDeduction = payroll.leaveDeduction == null ? numeric(payroll.deductions) - numeric(payroll.otherDeduction) : numeric(payroll.leaveDeduction);
  const otherDeduction = payroll.otherDeduction == null ? Math.max(numeric(payroll.deductions) - leaveDeduction, 0) : numeric(payroll.otherDeduction);
  const advance = numeric(payroll.advanceSalary);
  const totalDeduction = leaveDeduction + advance + otherDeduction;
  const net = gross - totalDeduction;
  const employeeCode = payroll.employeeCode || employee.employeeId || staff.employeeCode || "-";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-3 print:static print:bg-white print:p-0">
      <div className="mx-auto flex max-h-[96vh] max-w-6xl flex-col rounded-lg bg-white shadow-xl print:max-h-none print:max-w-none print:rounded-none print:shadow-none">
        <div className="no-print flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-lg font-black">Salary Slip Preview</h2><p className="text-sm text-slate-500">{employee.name || "Employee payroll"} · {payrollMonth(payroll.month)}</p></div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => window.print()} disabled={loading} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"><Printer size={16} /> Print Salary Slip</button>
            <button onClick={() => downloadSalarySlipPdf(printRef.current, employeeCode, payroll.month)} disabled={loading} className="inline-flex items-center gap-2 rounded-md bg-[#f97316] px-3 py-2 text-sm font-semibold text-white hover:bg-[#c2410c]"><Download size={16} /> Download PDF</button>
            <button onClick={onEdit} disabled={loading} className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold hover:bg-slate-50"><Edit3 size={16} /> Edit</button>
            <button onClick={onDelete} disabled={loading} className="inline-flex items-center gap-2 rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"><Trash2 size={16} /> Delete</button>
            <button onClick={onClose} className="rounded-md border border-slate-200 p-2 hover:bg-slate-50" aria-label="Close salary slip"><X size={18} /></button>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-100 p-4 print:overflow-visible print:bg-white print:p-0">
          {loading ? <div className="grid min-h-[480px] place-items-center text-sm text-slate-500">Loading salary slip...</div> : (
            <article ref={printRef} id="salary-slip-print-area" className="salary-slip-paper mx-auto border border-black bg-white p-3 text-[#111315] shadow-sm">
              <header className="grid grid-cols-[112px_1fr] items-center gap-4 p-1">
                <BrandLogo type="full" className="h-[88px] w-[112px] object-contain" />
                <div className="text-center"><h1 className="text-[27px] font-black leading-tight">{company.name}</h1><p className="mx-auto mt-1 max-w-[460px] text-[13px] leading-5">{company.address}</p><p className="mt-1 text-[13px]">Ph: {company.phone} <span className="mx-2">|</span> Email: {company.email}</p></div>
              </header>
              <section className="mt-3 overflow-hidden border border-black"><div className="grid grid-cols-3">{[
                ["Name", detail(employee.name)], ["Employee Code", detail(employeeCode)], ["Date of Joining", date(payroll.dateOfJoining || employee.dateOfJoining || staff.joiningDate)],
                ["Department", detail(payroll.department || employee.department || staff.department)], ["Payroll Month", payrollMonth(payroll.month)], ["UAN", detail(payroll.uan)],
                ["Designation", detail(payroll.designation || employee.designation || staff.designation)], ["Working Days", payroll.workingDays ?? payroll.payableDays], ["Paid Leave", payroll.paidLeave ?? payroll.leaveDays]
              ].map(([label, value], index) => <div key={label} className={`grid grid-cols-[1fr_1.15fr] border-black text-[12px] ${index % 3 !== 2 ? "border-r" : ""} ${index < 6 ? "border-b" : ""}`}><strong className="border-r border-black px-2 py-2">{label}</strong><span className="px-2 py-2">{value ?? "-"}</span></div>)}</div></section>
              <section className="mt-3 grid grid-cols-2 gap-3">
                <SlipTable title="EARNINGS" rows={[["Basic Salary", basic], ["HRA", hra], ["Special Allowance", specialAllowance]]} total={["GROSS SALARY", gross]} />
                <SlipTable title="DEDUCTIONS" rows={[["Leave Deduction", leaveDeduction], ["Advance", advance], ["Other", otherDeduction]]} total={["Total Deduction", totalDeduction]} net={net} />
              </section>
              <section className="mt-3 grid grid-cols-2 border border-black text-[12px]"><div className="border-r border-black p-3"><strong>NET SALARY (In Words):</strong><p className="mt-2">{amountInWords(net)}</p></div><div className="p-3"><strong>NET SALARY (In Figures):</strong><p className="mt-2 text-[15px] font-black text-[#d65f11]">Rs. {money(net)}/-</p></div></section>
              <footer className="pt-6 text-[12px]"><div className="grid grid-cols-3 text-center"><Signature label="HR Signature" /><Signature label="Authorized Signatory" /><Signature label="Employee Signature" /></div><p className="mt-5 text-right">This is computer generated slip. <span className="font-semibold text-[#d65f11]">No signature required.</span></p><p className="mt-4 text-center font-medium">--- End of Slip ---</p></footer>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}

function SlipTable({ title, rows, total, net }) { return <div className="overflow-hidden border border-black text-[12px]"><div className="grid grid-cols-[1.65fr_0.85fr] border-b border-black font-black text-[#d65f11]"><div className="border-r border-black px-3 py-2">{title}</div><div className="px-3 py-2 text-center">AMOUNT (RS.)</div></div>{rows.map(([label, value]) => <div key={label} className="grid grid-cols-[1.65fr_0.85fr] border-b border-black"><div className="border-r border-black px-3 py-2">{label}</div><div className="px-3 py-2 text-center">{money(value)}</div></div>)}<div className="grid grid-cols-[1.65fr_0.85fr] font-bold"><div className="border-r border-black px-3 py-2 text-[#d65f11]">{total[0]}</div><div className="px-3 py-2 text-center text-[#d65f11]">{money(total[1])}</div></div>{net != null && <div className="grid grid-cols-[1.65fr_0.85fr] border-t border-black font-black"><div className="border-r border-black px-3 py-2 text-[#d65f11]">NET SALARY</div><div className="px-3 py-2 text-center text-[#d65f11]">{money(net)}</div></div>}</div>; }
function Signature({ label }) { return <div><p>{label}:</p><p className="mt-3 tracking-[3px]">----------------</p></div>; }
