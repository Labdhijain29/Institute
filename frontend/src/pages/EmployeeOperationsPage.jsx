import React, { useEffect, useMemo, useState } from "react";
import { Download, Edit3, Eye, FileText, Plus, RefreshCw, Save, ScanLine, Trash2 } from "lucide-react";
import { api } from "../api/client.js";
import { useAuth } from "../auth/AuthContext.jsx";
import { DataTable } from "../components/DataTable.jsx";
import { StatCard } from "../components/StatCard.jsx";
import { SalarySlipModal } from "../components/SalarySlipModal.jsx";

const inputClass = "h-10 w-full rounded-md border border-slate-300 px-3 text-sm outline-none focus:border-[#f97316]";
const buttonClass = "inline-flex items-center justify-center gap-2 rounded-md bg-[#f97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#111315]";
const secondaryButtonClass = "inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-[#f97316] hover:text-[#c2410c]";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function monthNow() {
  return new Date().toISOString().slice(0, 7);
}

function payrollDefaults() {
  return { user: "", month: monthNow(), employeeCode: "", department: "", designation: "", dateOfJoining: "", uan: "", workingDays: 0, paidLeave: 0, basicSalary: 0, hra: 0, specialAllowance: 0, leaveDeduction: 0, deductions: 0, advanceSalary: 0 };
}

function dateInput(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}

function formatTime(value) {
  return value ? new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "-";
}

function minutes(value) {
  if (!value) return "-";
  const hours = Math.floor(value / 60);
  const mins = value % 60;
  return `${hours}h ${mins}m`;
}

function downloadFile(name, text, type = "text/csv") {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows = []) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]).filter((key) => !["_id", "__v"].includes(key));
  const cell = (value) => `"${String(typeof value === "object" && value !== null ? JSON.stringify(value) : value ?? "").replace(/"/g, '""')}"`;
  return [keys.join(","), ...rows.map((row) => keys.map((key) => cell(row[key])).join(","))].join("\n");
}

function Panel({ title, children, action }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmployeeOperationsPage({ module }) {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [me, setMe] = useState(null);
  const [rows, setRows] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(monthNow());
  const path = module?.path || "employee-desk";
  const canPayroll = ["Super Admin", "Admin", "HR", "Accountant"].includes(user.role);
  const canOfficeIp = ["Super Admin", "Admin"].includes(user.role);
  const canSubmitLectureReport = ["Super Admin", "Admin", "Faculty"].includes(user.role);
  const pageDescription = path === "employee-reports"
    ? "View all employee profiles, departments, roles, salary basics, and staff status in one place."
    : "Attendance, leave, payroll, lecture reports, and role-wise staff reporting.";

  const [leaveForm, setLeaveForm] = useState({ leaveType: "Casual", fromDate: today(), toDate: today(), days: 1, reason: "" });
  const [lectureForm, setLectureForm] = useState({ date: today(), courseName: "", batchName: "", classTiming: "", topicTaught: "", durationMinutes: 60, studentAttendanceCount: 0, notes: "" });
  const [payrollForm, setPayrollForm] = useState(payrollDefaults);
  const [ipForm, setIpForm] = useState({ label: "", ipAddress: "", remarks: "" });
  const [salarySlip, setSalarySlip] = useState({ open: false, loading: false, data: null });
  const [editingPayroll, setEditingPayroll] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState(null);

  const loadBase = async () => {
    setLoading(true);
    setMessage("");
    try {
      const [summaryData, meData] = await Promise.all([
        ["Super Admin", "Admin", "Manager", "HR", "Accountant"].includes(user.role) ? api(`/employee/summary?month=${month}`) : Promise.resolve(null),
        api(`/employee/me?month=${month}`)
      ]);
      setSummary(summaryData);
      setMe(meData);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadRows = async () => {
    try {
      const endpoint = path === "payroll"
        ? `/salaries?limit=100`
        : path === "leave-requests"
          ? `/employee/leaves`
          : path === "lecture-reports"
            ? `/employee/lecture-reports`
            : path === "office-ips"
              ? `/office-ips?limit=100`
              : path === "employee-reports"
                ? `/employee/employees`
              : `/attendance?limit=100`;
      const data = await api(endpoint);
      setRows(data.items || []);
    } catch (error) {
      setRows([]);
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadBase();
  }, [month]);

  useEffect(() => {
    loadRows();
  }, [path]);

  useEffect(() => {
    if (!canPayroll) return;
    api("/employee/payroll-employees")
      .then((data) => setUsers(data.items || []))
      .catch(() => setUsers([]));
  }, [canPayroll]);

  useEffect(() => {
    if (!canPayroll || !payrollForm.user || !payrollForm.month) { setAttendanceSummary(null); return; }
    api(`/attendance/monthly/${payrollForm.user}?month=${payrollForm.month}`)
      .then((data) => {
        setAttendanceSummary(data);
        setPayrollForm((current) => current.user === payrollForm.user && current.month === payrollForm.month
          ? { ...current, workingDays: data.workingDays, paidLeave: data.paidLeave }
          : current);
      })
      .catch(() => setAttendanceSummary(null));
  }, [canPayroll, payrollForm.user, payrollForm.month]);

  const attendanceColumns = [
    { key: "date", label: "Date", render: (row) => row.date?.slice(0, 10) || "-" },
    { key: "loginTime", label: "Login", render: (row) => formatTime(row.loginTime) },
    { key: "logoutTime", label: "Logout", render: (row) => formatTime(row.logoutTime) },
    { key: "totalWorkingMinutes", label: "Hours", render: (row) => minutes(row.totalWorkingMinutes) },
    { key: "status", label: "Status" },
    { key: "ipAddress", label: "IP" },
    { key: "remarks", label: "Remarks" }
  ];

  const columns = useMemo(() => {
    if (path === "payroll") return [
      { key: "month", label: "Month" },
      { key: "monthlySalary", label: "Monthly", render: (row) => `₹${Number(row.monthlySalary || row.grossAmount || 0).toLocaleString("en-IN")}` },
      { key: "deductions", label: "Deductions", render: (row) => `₹${Number(row.deductions || 0).toLocaleString("en-IN")}` },
      { key: "netAmount", label: "Payable", render: (row) => `₹${Number(row.netAmount || 0).toLocaleString("en-IN")}` },
      { key: "status", label: "Status" },
      { key: "actions", label: "Actions", render: (row) => <div className="flex items-center gap-2"><button onClick={() => openSalarySlip(row)} className="inline-flex items-center gap-1 rounded border border-[#f97316]/30 px-2 py-1 text-xs font-semibold text-[#c2410c] hover:bg-[#fff3e8]"><Eye size={14} /> View</button><button onClick={() => editPayroll(row)} className="inline-flex items-center gap-1 rounded border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"><Edit3 size={14} /> Edit</button><button onClick={() => deletePayroll(row)} className="inline-flex items-center gap-1 rounded border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"><Trash2 size={14} /> Delete</button></div> }
    ];
    if (path === "leave-requests") return [
      { key: "leaveType", label: "Type" },
      { key: "fromDate", label: "From", render: (row) => row.fromDate?.slice(0, 10) || "-" },
      { key: "toDate", label: "To", render: (row) => row.toDate?.slice(0, 10) || "-" },
      { key: "days", label: "Days" },
      { key: "status", label: "Status" },
      { key: "reason", label: "Reason" }
    ];
    if (path === "lecture-reports") return [
      { key: "date", label: "Date", render: (row) => row.date?.slice(0, 10) || "-" },
      { key: "courseName", label: "Course" },
      { key: "batchName", label: "Batch" },
      { key: "topicTaught", label: "Topic" },
      { key: "durationMinutes", label: "Duration" },
      { key: "studentAttendanceCount", label: "Students" }
    ];
    if (path === "office-ips") return [
      { key: "label", label: "Office" },
      { key: "ipAddress", label: "IP Address" },
      { key: "isActive", label: "Active", render: (row) => row.isActive === false ? "No" : "Yes" },
      { key: "remarks", label: "Remarks" }
    ];
    if (path === "employee-reports") return [
      { key: "employeeId", label: "Employee ID" },
      { key: "name", label: "Name" },
      { key: "mobile", label: "Mobile" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role" },
      { key: "department", label: "Department" },
      { key: "designation", label: "Designation" },
      { key: "monthlySalary", label: "Monthly Salary", render: (row) => `₹${Number(row.monthlySalary || 0).toLocaleString("en-IN")}` },
      { key: "status", label: "Status" }
    ];
    return attendanceColumns;
  }, [path]);

  const submitLeave = async (event) => {
    event.preventDefault();
    try {
      await api("/employee/leaves", { method: "POST", body: JSON.stringify(leaveForm) });
      setLeaveForm({ leaveType: "Casual", fromDate: today(), toDate: today(), days: 1, reason: "" });
      setMessage("Leave request submitted");
      await loadRows();
      await loadBase();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const submitLecture = async (event) => {
    event.preventDefault();
    try {
      await api("/employee/lecture-reports", { method: "POST", body: JSON.stringify(lectureForm) });
      setLectureForm({ date: today(), courseName: "", batchName: "", classTiming: "", topicTaught: "", durationMinutes: 60, studentAttendanceCount: 0, notes: "" });
      setMessage("Lecture report submitted");
      await loadRows();
      await loadBase();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const calculatePayroll = async (event) => {
    event.preventDefault();
    try {
      await api("/employee/payroll/calculate", { method: "POST", body: JSON.stringify(payrollForm) });
      setMessage(editingPayroll ? "Payroll updated" : "Payroll calculated");
      setEditingPayroll(null);
      await loadRows();
      await loadBase();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const editPayroll = (payroll) => {
    setPayrollForm({
      user: payroll.user?._id || payroll.user || "",
      month: payroll.month || monthNow(),
      basicSalary: Number(payroll.basicSalary || payroll.monthlySalary || 0),
      hra: Number(payroll.hra || 0),
      specialAllowance: Number(payroll.specialAllowance || 0),
      leaveDeduction: Number(payroll.leaveDeduction || 0),
      deductions: Number(payroll.otherDeduction ?? payroll.deductions ?? 0),
      advanceSalary: Number(payroll.advanceSalary || 0),
      employeeCode: payroll.employeeCode || "",
      department: payroll.department || "",
      designation: payroll.designation || "",
      dateOfJoining: dateInput(payroll.dateOfJoining),
      uan: payroll.uan || "",
      workingDays: Number(payroll.workingDays || 0),
      paidLeave: Number(payroll.paidLeave || 0)
    });
    setEditingPayroll(payroll);
    setSalarySlip({ open: false, loading: false, data: null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deletePayroll = async (payroll) => {
    if (!window.confirm(`Delete payroll for ${payroll.month}? This cannot be undone.`)) return;
    try {
      await api(`/salaries/${payroll._id}`, { method: "DELETE" });
      setMessage("Payroll record deleted");
      setSalarySlip({ open: false, loading: false, data: null });
      await loadRows();
      await loadBase();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const payrollPreview = useMemo(() => {
    const basic = Number(payrollForm.basicSalary || 0);
    const hra = Number(payrollForm.hra || 0);
    const specialAllowance = Number(payrollForm.specialAllowance || 0);
    const gross = basic + hra + specialAllowance;
    const manualDeductions = Number(payrollForm.leaveDeduction || 0) + Number(payrollForm.deductions || 0) + Number(payrollForm.advanceSalary || 0);
    return { basic, hra, specialAllowance, gross, manualDeductions, estimated: Math.max(gross - manualDeductions, 0) };
  }, [payrollForm]);

  const selectPayrollEmployee = (employeeId) => {
    const employee = users.find((item) => item._id === employeeId);
    const monthDays = new Date(Number((payrollForm.month || monthNow()).slice(0, 4)), Number((payrollForm.month || monthNow()).slice(5, 7)), 0).getDate();
    setPayrollForm((current) => ({ ...current, user: employeeId, basicSalary: Number(employee?.monthlySalary || 0), employeeCode: employee?.employeeCode || "", department: employee?.department || "", designation: employee?.designation || "", dateOfJoining: dateInput(employee?.dateOfJoining), workingDays: monthDays }));
  };

  const openSalarySlip = async (payroll) => {
    setSalarySlip({ open: true, loading: true, data: null });
    try {
      const data = await api(`/employee/payroll/${payroll._id}/slip`);
      setSalarySlip({ open: true, loading: false, data });
    } catch (error) {
      setSalarySlip({ open: false, loading: false, data: null });
      setMessage(error.message);
    }
  };

  const saveIp = async (event) => {
    event.preventDefault();
    try {
      await api("/office-ips", { method: "POST", body: JSON.stringify(ipForm) });
      setIpForm({ label: "", ipAddress: "", remarks: "" });
      setMessage("Office IP added");
      await loadRows();
    } catch (error) {
      setMessage(error.message);
    }
  };

  const exportReport = async (type, format) => {
    try {
      const result = await api(`/employee/reports/export?type=${type}&month=${month}&format=${format}`);
      if (format === "excel") downloadFile(`${type}-${month}.csv`, toCsv(result.items || []));
      else downloadFile(`${type}-${month}.json`, JSON.stringify(result.items || [], null, 2), "application/json");
    } catch (error) {
      setMessage(error.message);
    }
  };

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase text-[#f97316]">{module?.label || "Employee Desk"}</p>
            <h2 className="mt-1 text-2xl font-bold">{path === "employee-reports" ? "All employee details" : "Employee activity and operations"}</h2>
            <p className="mt-1 text-sm text-slate-500">{pageDescription}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input type="month" className={inputClass} value={month} onChange={(event) => setMonth(event.target.value)} />
            <button onClick={loadBase} className={secondaryButtonClass}><RefreshCw size={16} /> Refresh</button>
          </div>
        </div>
      </section>

      {message && <p className="rounded-md border border-[#f97316]/20 bg-[#fff3e8] px-4 py-3 text-sm font-semibold text-[#c2410c]">{message}</p>}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Employees" value={summary?.totalEmployees ?? me?.employee?.role ?? "-"} tone="ink" />
        <StatCard label="Present Today" value={summary?.today?.present ?? me?.todayAttendance?.status ?? "Not logged"} tone="pine" />
        <StatCard label="Late Today" value={summary?.today?.late ?? me?.monthlySummary?.late ?? 0} tone="amber" />
        <StatCard label="Payroll Payable" value={summary ? `₹${Number(summary.salarySummary?.payable || 0).toLocaleString("en-IN")}` : me?.salary?.status || "-"} tone="coral" />
      </section>

      {path === "employee-desk" && (
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
          <Panel title="Today Attendance">
            <a href="/attendance/scan" className={buttonClass}><ScanLine size={16} /> Open QR Scanner</a>
            <p className="mt-3 text-sm text-slate-500">Use the employee QR code to check in and check out. Your signed-in account is used automatically.</p>
            <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <p><span className="text-slate-500">Status:</span> <strong>{me?.todayAttendance?.status || "Not logged"}</strong></p>
              <p><span className="text-slate-500">Login:</span> <strong>{formatTime(me?.todayAttendance?.loginTime)}</strong></p>
              <p><span className="text-slate-500">Logout:</span> <strong>{formatTime(me?.todayAttendance?.logoutTime)}</strong></p>
              <p><span className="text-slate-500">Working:</span> <strong>{minutes(me?.todayAttendance?.totalWorkingMinutes)}</strong></p>
            </div>
          </Panel>
          <Panel title="Employee Profile">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              {[
                ["Employee ID", me?.employee?.id],
                ["Name", me?.employee?.name],
                ["Role", me?.employee?.role],
                ["Department", me?.employee?.department],
                ["Designation", me?.employee?.designation],
                ["Monthly Salary", me?.employee?.monthlySalary ? `₹${Number(me.employee.monthlySalary).toLocaleString("en-IN")}` : "-"]
              ].map(([label, value]) => <p key={label}><span className="text-slate-500">{label}:</span> <strong>{value || "-"}</strong></p>)}
            </div>
          </Panel>
        </div>
      )}

      {path === "leave-requests" && (
        <Panel title="Apply Leave">
          <form onSubmit={submitLeave} className="grid gap-3 md:grid-cols-5">
            <select className={inputClass} value={leaveForm.leaveType} onChange={(event) => setLeaveForm({ ...leaveForm, leaveType: event.target.value })}>{["Casual", "Sick", "Paid", "Unpaid"].map((item) => <option key={item}>{item}</option>)}</select>
            <input type="date" className={inputClass} value={leaveForm.fromDate} onChange={(event) => setLeaveForm({ ...leaveForm, fromDate: event.target.value })} />
            <input type="date" className={inputClass} value={leaveForm.toDate} onChange={(event) => setLeaveForm({ ...leaveForm, toDate: event.target.value })} />
            <input type="number" min="1" className={inputClass} value={leaveForm.days} onChange={(event) => setLeaveForm({ ...leaveForm, days: Number(event.target.value) })} />
            <button className={buttonClass}><Plus size={16} /> Apply</button>
            <input className={`${inputClass} md:col-span-5`} placeholder="Reason" value={leaveForm.reason} onChange={(event) => setLeaveForm({ ...leaveForm, reason: event.target.value })} />
          </form>
        </Panel>
      )}

      {path === "lecture-reports" && canSubmitLectureReport && (
        <Panel title="Submit Faculty Lecture Report">
          <form onSubmit={submitLecture} className="grid gap-3 md:grid-cols-3">
            <input type="date" className={inputClass} value={lectureForm.date} onChange={(event) => setLectureForm({ ...lectureForm, date: event.target.value })} />
            <input className={inputClass} placeholder="Course name" value={lectureForm.courseName} onChange={(event) => setLectureForm({ ...lectureForm, courseName: event.target.value })} />
            <input className={inputClass} placeholder="Batch name" value={lectureForm.batchName} onChange={(event) => setLectureForm({ ...lectureForm, batchName: event.target.value })} />
            <input className={inputClass} placeholder="Class timing" value={lectureForm.classTiming} onChange={(event) => setLectureForm({ ...lectureForm, classTiming: event.target.value })} />
            <input required className={inputClass} placeholder="Topic taught" value={lectureForm.topicTaught} onChange={(event) => setLectureForm({ ...lectureForm, topicTaught: event.target.value })} />
            <input type="number" className={inputClass} placeholder="Duration minutes" value={lectureForm.durationMinutes} onChange={(event) => setLectureForm({ ...lectureForm, durationMinutes: Number(event.target.value) })} />
            <input type="number" className={inputClass} placeholder="Student attendance count" value={lectureForm.studentAttendanceCount} onChange={(event) => setLectureForm({ ...lectureForm, studentAttendanceCount: Number(event.target.value) })} />
            <input className={`${inputClass} md:col-span-2`} placeholder="Notes / remarks" value={lectureForm.notes} onChange={(event) => setLectureForm({ ...lectureForm, notes: event.target.value })} />
            <button className={buttonClass}><Save size={16} /> Submit Report</button>
          </form>
        </Panel>
      )}

      {path === "payroll" && canPayroll && (
        <Panel title={editingPayroll ? "Edit Payroll" : "Calculate Payroll"} action={editingPayroll ? <button type="button" onClick={() => { setEditingPayroll(null); setPayrollForm(payrollDefaults()); }} className="text-sm font-semibold text-[#c2410c]">Cancel Edit</button> : null}>
          <p className="mb-4 text-sm text-slate-500">Complete all employee and salary fields for a proper payslip. Salary is reduced only by the deductions you explicitly enter below.</p>
          {attendanceSummary && <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-950"><p className="font-bold">Attendance summary · {attendanceSummary.month}</p><div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4"><span>Present: <strong>{attendanceSummary.presentDays}</strong></span><span>Absent: <strong>{attendanceSummary.absentDays}</strong></span><span>Late: <strong>{attendanceSummary.lateDays}</strong></span><span>Working: <strong>{attendanceSummary.totalHours}h</strong></span><span>Paid leave: <strong>{attendanceSummary.paidLeave}</strong></span><span>Half days: <strong>{attendanceSummary.halfDays}</strong></span><span>Unpaid leave: <strong>{attendanceSummary.unpaidLeave}</strong></span><span>Working days: <strong>{attendanceSummary.workingDays}</strong></span></div></div>}
          <form onSubmit={calculatePayroll} className="grid gap-3 md:grid-cols-4">
            <PayrollField label="Employee"><select required className={inputClass} value={payrollForm.user} onChange={(event) => selectPayrollEmployee(event.target.value)}><option value="">Select employee</option>{users.map((item) => <option key={item._id} value={item._id}>{item.name} ({item.role})</option>)}</select></PayrollField>
            <PayrollField label="Payroll Month"><input type="month" className={inputClass} value={payrollForm.month} onChange={(event) => setPayrollForm({ ...payrollForm, month: event.target.value })} /></PayrollField>
            <PayrollField label="Employee Code"><input className={inputClass} placeholder="Optional" value={payrollForm.employeeCode} onChange={(event) => setPayrollForm({ ...payrollForm, employeeCode: event.target.value })} /></PayrollField>
            <PayrollField label="Date of Joining"><input type="date" className={inputClass} value={payrollForm.dateOfJoining} onChange={(event) => setPayrollForm({ ...payrollForm, dateOfJoining: event.target.value })} /></PayrollField>
            <PayrollField label="Department"><input className={inputClass} placeholder="Optional" value={payrollForm.department} onChange={(event) => setPayrollForm({ ...payrollForm, department: event.target.value })} /></PayrollField>
            <PayrollField label="Designation"><input className={inputClass} placeholder="Optional" value={payrollForm.designation} onChange={(event) => setPayrollForm({ ...payrollForm, designation: event.target.value })} /></PayrollField>
            <PayrollField label="UAN"><input className={inputClass} placeholder="Optional" value={payrollForm.uan} onChange={(event) => setPayrollForm({ ...payrollForm, uan: event.target.value })} /></PayrollField>
            <PayrollField label="Working Days"><input type="number" min="0" className={inputClass} value={payrollForm.workingDays} onChange={(event) => setPayrollForm({ ...payrollForm, workingDays: Number(event.target.value) })} /></PayrollField>
            <PayrollField label="Paid Leave"><input type="number" min="0" className={inputClass} value={payrollForm.paidLeave} onChange={(event) => setPayrollForm({ ...payrollForm, paidLeave: Number(event.target.value) })} /></PayrollField>
            <PayrollField label="Basic Salary (₹)" hint="Auto-filled from employee profile"><input type="number" min="0" required className={inputClass} value={payrollForm.basicSalary} onChange={(event) => setPayrollForm({ ...payrollForm, basicSalary: Number(event.target.value) })} /></PayrollField>
            <PayrollField label="HRA (₹)"><input type="number" min="0" className={inputClass} value={payrollForm.hra} onChange={(event) => setPayrollForm({ ...payrollForm, hra: Number(event.target.value) })} /></PayrollField>
            <PayrollField label="Special Allowance (₹)"><input type="number" min="0" className={inputClass} value={payrollForm.specialAllowance} onChange={(event) => setPayrollForm({ ...payrollForm, specialAllowance: Number(event.target.value) })} /></PayrollField>
            <PayrollField label="Leave Deduction (₹)"><input type="number" min="0" className={inputClass} value={payrollForm.leaveDeduction} onChange={(event) => setPayrollForm({ ...payrollForm, leaveDeduction: Number(event.target.value) })} /></PayrollField>
            <PayrollField label="Other Deduction (₹)" hint="Manual deduction besides leave"><input type="number" min="0" className={inputClass} value={payrollForm.deductions} onChange={(event) => setPayrollForm({ ...payrollForm, deductions: Number(event.target.value) })} /></PayrollField>
            <PayrollField label="Advance Salary (₹)" hint="Salary advance already paid"><input type="number" min="0" className={inputClass} value={payrollForm.advanceSalary} onChange={(event) => setPayrollForm({ ...payrollForm, advanceSalary: Number(event.target.value) })} /></PayrollField>
            <div className="rounded-md border border-orange-100 bg-orange-50 px-3 py-2 text-sm md:col-span-2"><p className="font-semibold text-slate-800">Gross Salary: ₹{payrollPreview.gross.toLocaleString("en-IN")} · Estimated Net Salary: ₹{payrollPreview.estimated.toLocaleString("en-IN")}</p><p className="mt-1 text-xs text-slate-600">Gross = Basic ₹{payrollPreview.basic.toLocaleString("en-IN")} + HRA ₹{payrollPreview.hra.toLocaleString("en-IN")} + Special Allowance ₹{payrollPreview.specialAllowance.toLocaleString("en-IN")}. Leave deduction will be applied on Calculate.</p></div>
            <button className={buttonClass}><Save size={16} /> {editingPayroll ? "Update Payroll" : "Calculate Payroll"}</button>
          </form>
        </Panel>
      )}

      {path === "office-ips" && canOfficeIp && (
        <Panel title="Allowed Office IP">
          <form onSubmit={saveIp} className="grid gap-3 md:grid-cols-4">
            <input required className={inputClass} placeholder="Office label" value={ipForm.label} onChange={(event) => setIpForm({ ...ipForm, label: event.target.value })} />
            <input required className={inputClass} placeholder="IP address" value={ipForm.ipAddress} onChange={(event) => setIpForm({ ...ipForm, ipAddress: event.target.value })} />
            <input className={inputClass} placeholder="Remarks" value={ipForm.remarks} onChange={(event) => setIpForm({ ...ipForm, remarks: event.target.value })} />
            <button className={buttonClass}><Plus size={16} /> Add IP</button>
          </form>
        </Panel>
      )}

      {path === "employee-reports" && (
        <Panel title="Exports">
          <div className="flex flex-wrap gap-2">
            {["attendance", "salary", "lecture"].map((type) => (
              <React.Fragment key={type}>
                <button onClick={() => exportReport(type, "excel")} className={secondaryButtonClass}><Download size={16} /> {type} Excel</button>
                <button onClick={() => exportReport(type, "pdf")} className={secondaryButtonClass}><Download size={16} /> {type} PDF Data</button>
              </React.Fragment>
            ))}
          </div>
        </Panel>
      )}

      <Panel title={path === "employee-desk" ? "Monthly Attendance" : "Records"} action={loading ? <span className="text-sm text-slate-500">Loading...</span> : null}>
        <DataTable columns={path === "employee-desk" ? attendanceColumns : columns} rows={path === "employee-desk" ? (me?.attendance || []) : rows} />
      </Panel>
      <SalarySlipModal open={salarySlip.open} loading={salarySlip.loading} data={salarySlip.data} onClose={() => setSalarySlip({ open: false, loading: false, data: null })} onEdit={() => salarySlip.data?.payroll && editPayroll(salarySlip.data.payroll)} onDelete={() => salarySlip.data?.payroll && deletePayroll(salarySlip.data.payroll)} />
    </div>
  );
}

function PayrollField({ label, hint, children }) {
  return <label className="block text-sm font-semibold text-slate-700"><span>{label}</span>{hint && <span className="ml-1 text-xs font-normal text-slate-400">({hint})</span>}<div className="mt-1">{children}</div></label>;
}
