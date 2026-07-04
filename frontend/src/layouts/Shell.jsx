import React from "react";
import { useMemo, useState } from "react";
import { LogOut, Menu, Search } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { menuForRole } from "../data/roleConfig.js";
import { DashboardPage } from "../pages/DashboardPage.jsx";
import { ModulePage } from "../pages/ModulePage.jsx";
import { LeadsPage } from "../pages/LeadsPage.jsx";
import { ReceiptsPage } from "../pages/ReceiptsPage.jsx";
import { CertificatesPage } from "../pages/CertificatesPage.jsx";
import { OfferLettersPage } from "../pages/OfferLettersPage.jsx";
import { CourseManagementPage } from "../pages/CourseManagementPage.jsx";
import { BatchManagementPage } from "../pages/BatchManagementPage.jsx";
import { StudentManagementPage } from "../pages/StudentManagementPage.jsx";
import { AttendanceDashboardPage } from "../pages/AttendanceDashboardPage.jsx";
import { AdmissionsDashboardPage } from "../pages/AdmissionsDashboardPage.jsx";
import { DigitalMarketingManagementPage } from "../pages/DigitalMarketingManagementPage.jsx";
import { EmployeeOperationsPage } from "../pages/EmployeeOperationsPage.jsx";
import { UserApprovalPage } from "../pages/UserApprovalPage.jsx";
import logoMark from "../assets/coding-wallah-mark-charcoal.png";

export function Shell() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState("dashboard");
  const [open, setOpen] = useState(false);
  const menu = useMemo(() => menuForRole(user.role), [user.role]);
  const activeItem = menu.find((item) => item.path === active) || menu[0];
  const isLeadWorkflow = Boolean(activeItem.workflowRole);
  const isDashboard = active === "dashboard" || Boolean(activeItem.dashboardRole);
  const canManageEnrollment = ["Super Admin", "Admin"].includes(user.role);
  const isEmployeeOperations = ["employee-desk", "employee-reports", "payroll", "leave-requests", "lecture-reports", "office-ips"].includes(active);

  const Page = active === "offers" ? OfferLettersPage : active === "certificates" ? CertificatesPage : active === "receipts" ? ReceiptsPage : active === "attendance" ? AttendanceDashboardPage : active === "admissions" ? AdmissionsDashboardPage : isEmployeeOperations ? EmployeeOperationsPage : canManageEnrollment && active === "users" ? UserApprovalPage : canManageEnrollment && active === "digital-marketing-management" ? DigitalMarketingManagementPage : canManageEnrollment && active === "courses" ? CourseManagementPage : canManageEnrollment && active === "batches" ? BatchManagementPage : canManageEnrollment && active === "students" ? StudentManagementPage : isDashboard ? DashboardPage : isLeadWorkflow ? LeadsPage : ModulePage;

  return (
    <div className="min-h-screen bg-[#f8f5ef] text-[#111315] lg:grid lg:grid-cols-[270px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-30 w-[270px] border-r border-slate-200 bg-white transition lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center border-b border-slate-200 px-5">
          <div className="grid h-10 w-14 place-items-center overflow-hidden rounded-md bg-white p-1">
            <img src={logoMark} alt="Coding Walla" className="h-full w-full object-contain" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-bold">Coding Walla</p>
            <p className="text-xs text-slate-500">ERP Control Panel</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {menu.map((item) => {
            if (item.section) {
              return (
                <div key={item.label} className="px-3 pb-1 pt-4 text-[11px] font-black uppercase tracking-wide text-slate-400">
                  {item.label}
                </div>
              );
            }
            const Icon = item.icon;
            const selected = active === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  setActive(item.path);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium ${selected ? "bg-[#f97316] text-white shadow-sm" : "text-slate-700 hover:bg-[#fff3e8] hover:text-[#c2410c]"}`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button className="rounded-md border border-slate-200 p-2 hover:border-[#f97316] hover:text-[#f97316] lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold">{activeItem.label}</h1>
              <p className="text-xs text-slate-500">{user.role} workspace</p>
            </div>
          </div>
          <div className="hidden min-w-[300px] items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex">
            <Search size={17} className="text-slate-400" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="Search records" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <button onClick={logout} className="rounded-md border border-slate-200 p-2 hover:border-[#f97316] hover:text-[#f97316]" aria-label="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <div className="p-4 md:p-6">
          <Page module={activeItem} />
        </div>
      </main>
    </div>
  );
}
