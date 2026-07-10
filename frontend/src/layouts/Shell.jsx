import React from "react";
import { useMemo, useState } from "react";
import { ChevronDown, LogOut, Menu, Search } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { menuForRole, sidebarGroups } from "../data/roleConfig.js";
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
import { BrandLockup } from "../components/BrandLogo.jsx";

export function Shell() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState("dashboard");
  const [open, setOpen] = useState(false);
  const menu = useMemo(() => menuForRole(user.role), [user.role]);
  const visibleGroups = useMemo(() => sidebarGroups.map((group) => ({
    ...group,
    items: group.items.map((groupItem) => {
      const menuItem = menu.find((item) => item.path === groupItem.path);
      return menuItem ? { ...menuItem, navigationLabel: groupItem.label } : null;
    }).filter(Boolean)
  })).filter((group) => group.items.length), [menu]);
  const [expandedGroups, setExpandedGroups] = useState(() => new Set(sidebarGroups.map((group) => group.label)));
  const activeItem = menu.find((item) => item.path === active) || menu[0];
  const isLeadWorkflow = Boolean(activeItem.workflowRole);
  const isDashboard = active === "dashboard" || Boolean(activeItem.dashboardRole);
  const canManageEnrollment = ["Super Admin", "Admin"].includes(user.role);
  const isEmployeeOperations = ["employee-desk", "employee-reports", "payroll", "leave-requests", "lecture-reports", "office-ips"].includes(active);

  const Page = active === "offers" ? OfferLettersPage : active === "certificates" ? CertificatesPage : active === "receipts" ? ReceiptsPage : active === "attendance" ? AttendanceDashboardPage : active === "admissions" ? AdmissionsDashboardPage : isEmployeeOperations ? EmployeeOperationsPage : canManageEnrollment && active === "users" ? UserApprovalPage : canManageEnrollment && active === "digital-marketing-management" ? DigitalMarketingManagementPage : canManageEnrollment && active === "courses" ? CourseManagementPage : canManageEnrollment && active === "batches" ? BatchManagementPage : canManageEnrollment && active === "students" ? StudentManagementPage : isDashboard ? DashboardPage : isLeadWorkflow ? LeadsPage : ModulePage;

  return (
    <div className="min-h-screen bg-[#f8f5ef] text-[#111315] lg:grid lg:grid-cols-[270px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-30 w-[270px] border-r border-slate-200 bg-white transition lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-20 items-center border-b border-slate-200 px-5">
          <div>
            <BrandLockup logoClassName="h-11 w-auto" variant="light" />
            <p className="mt-1 text-[11px] font-semibold text-slate-400">ERP Control Panel</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {menu.filter((item) => item.path === "dashboard").map((item) => {
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
          {visibleGroups.map((group) => {
            const GroupIcon = group.icon;
            const expanded = expandedGroups.has(group.label);
            const hasActiveItem = group.items.some((item) => item.path === active);
            return (
              <div key={group.label}>
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setExpandedGroups((current) => {
                    const next = new Set(current);
                    next.has(group.label) ? next.delete(group.label) : next.add(group.label);
                    return next;
                  })}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold hover:bg-[#fff3e8] hover:text-[#c2410c] ${hasActiveItem ? "text-[#c2410c]" : "text-slate-700"}`}
                >
                  <GroupIcon size={18} />
                  <span className="flex-1">{group.label}</span>
                  <ChevronDown size={16} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                </button>
                <div className={`grid transition-[grid-template-rows] duration-200 ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden">
                    <div className="space-y-1 pb-1 pl-4 pt-1">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const selected = active === item.path;
                        return (
                          <button
                            key={item.path}
                            onClick={() => { setActive(item.path); setOpen(false); }}
                            className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium ${selected ? "bg-[#f97316] text-white shadow-sm" : "text-slate-700 hover:bg-[#fff3e8] hover:text-[#c2410c]"}`}
                          >
                            <Icon size={18} />
                            {item.navigationLabel || item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
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
