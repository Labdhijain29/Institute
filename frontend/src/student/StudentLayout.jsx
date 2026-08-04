import React, { useEffect, useState } from "react";
import { BookOpen, ClipboardCheck, FileDown, FileText, GraduationCap, LayoutDashboard, LogOut, Menu, ReceiptIndianRupee, UserRound, X } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { BrandLockup } from "../components/BrandLogo.jsx";

export const studentMenu = [
  { label: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
  { label: "My Course", path: "/student/course", icon: GraduationCap },
  { label: "Attendance", path: "/student/attendance", icon: ClipboardCheck },
  { label: "Assignments", path: "/student/assignments", icon: FileText },
  { label: "Study Material", path: "/student/materials", icon: BookOpen },
  { label: "Fees", path: "/student/fees", icon: ReceiptIndianRupee },
  { label: "Registration Form", path: "/student/registration-form", icon: FileDown },
  { label: "Profile", path: "/student/profile", icon: UserRound }
];

function go(path, replace = false) {
  window.history[replace ? "replaceState" : "pushState"]({}, "", path);
  window.dispatchEvent(new Event("popstate"));
}

export function StudentLayout({ path, student, children }) {
  const { logout } = useAuth();
  const sidebarStorageKey = "crm_sidebar_collapsed_Student";
  const [menuOpen, setMenuOpen] = useState(() => window.innerWidth >= 1024 && localStorage.getItem(sidebarStorageKey) !== "true");
  const activeItem = studentMenu.find((item) => item.path === path) || studentMenu[0];

  useEffect(() => {
    if (window.innerWidth >= 1024) localStorage.setItem(sidebarStorageKey, String(!menuOpen));
  }, [menuOpen]);

  const closeMobileMenu = () => {
    if (window.innerWidth < 1024) setMenuOpen(false);
  };

  const signOut = () => {
    logout();
    go("/login", true);
  };

  return (
    <div className={`min-h-screen bg-[#f8f5ef] text-[#111315] lg:grid ${menuOpen ? "lg:grid-cols-[270px_minmax(0,1fr)]" : "lg:grid-cols-[0_minmax(0,1fr)]"}`}>
      {menuOpen && <button className="fixed inset-0 z-20 bg-black/30 lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close navigation" />}
      <aside className={`fixed inset-y-0 left-0 z-30 w-[270px] overflow-hidden border-r border-slate-200 bg-white transition-[transform,width] duration-300 ease-in-out lg:static ${menuOpen ? "translate-x-0 lg:translate-x-0 lg:w-[270px]" : "-translate-x-full lg:w-0"}`}>
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
          <div><BrandLockup logoClassName="h-11 w-auto" variant="light" /><p className="mt-1 text-[11px] font-semibold text-slate-400">Student Portal</p></div>
          <button className="lg:hidden" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X size={18} /></button>
        </div>
        <nav className="space-y-1 p-3">
          {studentMenu.map((item) => {
            const Icon = item.icon;
            const selected = activeItem.path === item.path;
            return <button key={item.path} onClick={() => { go(item.path); closeMobileMenu(); }} className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium ${selected ? "bg-[#f97316] text-white shadow-sm" : "text-slate-700 hover:bg-[#fff3e8] hover:text-[#c2410c]"}`}><Icon size={18} />{item.label}</button>;
          })}
        </nav>
      </aside>

      <main className="min-w-0">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3"><button className="rounded-md border border-slate-200 p-2" onClick={() => setMenuOpen((current) => !current)} aria-label={menuOpen ? "Close menu" : "Open menu"}><Menu size={18} /></button><div><h1 className="text-lg font-bold">{activeItem.label}</h1><p className="text-xs text-slate-500">Student workspace</p></div></div>
          <div className="flex items-center gap-3"><div className="hidden text-right sm:block"><p className="text-sm font-semibold">{student.name}</p><p className="text-xs text-slate-500">{student.studentId}</p></div><button onClick={signOut} className="rounded-md border border-slate-200 p-2 hover:border-[#f97316] hover:text-[#f97316]" aria-label="Logout"><LogOut size={18} /></button></div>
        </header>
        <div className="p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
