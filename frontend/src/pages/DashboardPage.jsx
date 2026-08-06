import React from "react";
import { useEffect, useState } from "react";
import { Plus, ReceiptIndianRupee } from "lucide-react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext.jsx";
import { ReceiptBuilderModal } from "../components/ReceiptBuilderModal.jsx";
import { EmployeeDashboardWidget } from "../components/EmployeeDashboardWidget.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { roleDashboards } from "../data/roleConfig.js";
import { CreateLeadModal, normalizeLeadPayload } from "./LeadsPage.jsx";

const emptyLead = {
  name: "",
  mobile: "",
  courseInterested: "",
  leadDate: new Date().toISOString().slice(0, 10),
  college: "",
  source: "Website",
  priority: "Warm",
  remarks: ""
};

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
}

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString("en-IN") : "-";
}

function minutes(value) {
  if (!value) return "-";
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return `${hours}h ${mins}m`;
}

function FacultyAttendanceDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const month = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    api(`/employee/me?month=${month}`).then(setData).catch((err) => setError(err.message));
  }, [month]);

  if (error) return <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>;
  if (!data) return <section className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">Loading faculty attendance...</section>;

  const rows = data.attendance || [];
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase text-[#f97316]">Faculty Attendance</p>
          <h3 className="mt-1 text-xl font-bold">My attendance dashboard</h3>
        </div>
        <p className="text-sm text-slate-500">{data.employee?.name}</p>
      </div>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-6">
        {[
          ["Today", data.todayAttendance?.status || "Not logged"],
          ["Login", formatTime(data.todayAttendance?.loginTime)],
          ["Logout", formatTime(data.todayAttendance?.logoutTime)],
          ["Working", minutes(data.todayAttendance?.totalWorkingMinutes)],
          ["Present", data.monthlySummary?.present ?? 0],
          ["Late", data.monthlySummary?.late ?? 0]
        ].map(([label, value]) => (
          <div key={label} className="rounded-md bg-slate-50 px-3 py-3">
            <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
            <p className="mt-1 font-black">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Login</th><th className="px-4 py-3">Logout</th><th className="px-4 py-3">Working</th><th className="px-4 py-3">Remarks</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.slice(0, 8).map((row) => (
              <tr key={row._id}><td className="px-4 py-3">{formatDate(row.date)}</td><td className="px-4 py-3 font-semibold">{row.status}</td><td className="px-4 py-3">{formatTime(row.loginTime)}</td><td className="px-4 py-3">{formatTime(row.logoutTime)}</td><td className="px-4 py-3">{minutes(row.totalWorkingMinutes)}</td><td className="px-4 py-3">{row.remarks || "-"}</td></tr>
            ))}
            {!rows.length && <tr><td colSpan={6} className="px-4 py-6 text-center text-slate-500">No attendance records found.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function DashboardPage({ module }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [createLeadOpen, setCreateLeadOpen] = useState(false);
  const [leadForm, setLeadForm] = useState(emptyLead);
  const [courses, setCourses] = useState([]);
  const [message, setMessage] = useState("");
  const dashboardRole = module?.dashboardRole || user.role;
  const items = roleDashboards[dashboardRole] || [];
  const showReceiptManager = ["Admin", "Manager"].includes(dashboardRole);

  useEffect(() => {
    api("/reports/dashboard").then(setSummary).catch(() => setSummary(null));
  }, []);

  useEffect(() => {
    if (!showReceiptManager) {
      setCourses([]);
      return;
    }
    api("/courses?limit=100")
      .then((data) => setCourses(data.items || []))
      .catch((error) => setMessage(error.message));
  }, [showReceiptManager]);

  const createLead = async (event) => {
    event.preventDefault();
    try {
      await api("/leads", { method: "POST", body: JSON.stringify(normalizeLeadPayload(leadForm)) });
      setLeadForm(emptyLead);
      setCreateLeadOpen(false);
      setMessage("Lead created successfully");
      const nextSummary = await api("/reports/dashboard");
      setSummary(nextSummary);
    } catch (error) {
      setMessage(error.message);
    }
  };

  const metricValue = (label, index) => {
    const currency = (value) => `₹${Number(value || 0).toLocaleString("en-IN")}`;
    const values = {
      "Total branches": summary?.totalBranches ?? 0,
      "Total revenue": currency(summary?.totalRevenue),
      "Total users": summary?.totalUsers ?? 0,
      "Total students": summary?.totalStudents ?? 0,
      "Total leads": summary?.totalLeads ?? 0,
      "Branch-wise reports": summary?.totalBranches ?? 0,
      "Total employees": summary?.totalEmployees ?? 0,
      "Present today": summary?.presentEmployeesToday ?? 0,
      "Absent today": summary?.absentEmployeesToday ?? 0,
      "Late today": summary?.lateEmployeesToday ?? 0,
      "Pending leaves": summary?.pendingLeaveRequests ?? 0,
      "Salary payable": currency(summary?.salaryPayableThisMonth),
      "Pending salary approvals": summary?.pendingSalaryApprovals ?? 0,
      "Lecture reports today": summary?.lectureReportsToday ?? 0,
      "Fees collection": currency(summary?.totalRevenue),
      "Pending fees": currency(summary?.pendingFees),
      "Total admissions": summary?.totalStudents ?? 0,
      "Total staff": summary?.totalEmployees ?? 0
    };
    return values[label] ?? Math.floor(20 + index * 11);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[#f97316]">{dashboardRole} Dashboard</p>
            <h2 className="mt-1 text-2xl font-bold">Today&apos;s institute command center</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {showReceiptManager && (
              <button onClick={() => setReceiptOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315]">
                <ReceiptIndianRupee size={17} />
                Fee Receipt
              </button>
            )}
            {showReceiptManager && (
              <button onClick={() => setCreateLeadOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-md bg-[#111315] px-4 py-2 text-sm font-semibold text-white hover:bg-[#f97316]">
                <Plus size={17} />
                Create Lead
              </button>
            )}
          </div>
        </div>
      </section>

      {message && <p className="rounded-md border border-[#f97316]/20 bg-[#fff3e8] px-4 py-3 text-sm font-semibold text-[#c2410c]">{message}</p>}

      <EmployeeDashboardWidget />

      {dashboardRole === "Faculty" && <FacultyAttendanceDashboard />}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <StatCard key={item} label={item} value={metricValue(item, index)} tone={["pine", "coral", "amber", "ink"][index % 4]} />
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
                  <div className="h-2 rounded-full bg-[#f97316]" style={{ width: `${72 + index * 6}%` }} />
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

      <ReceiptBuilderModal open={receiptOpen} onClose={() => setReceiptOpen(false)} />
      <CreateLeadModal open={createLeadOpen} form={leadForm} setForm={setLeadForm} courses={courses} onSubmit={createLead} onClose={() => setCreateLeadOpen(false)} />
    </div>
  );
}
