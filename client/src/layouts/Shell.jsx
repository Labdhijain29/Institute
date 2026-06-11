import React from "react";
import { useMemo, useState } from "react";
import { LogOut, Menu, Search } from "lucide-react";
import { useAuth } from "../auth/AuthContext.jsx";
import { menuForRole } from "../data/roleConfig.js";
import { DashboardPage } from "../pages/DashboardPage.jsx";
import { ModulePage } from "../pages/ModulePage.jsx";
import { LeadsPage } from "../pages/LeadsPage.jsx";

export function Shell() {
  const { user, logout } = useAuth();
  const [active, setActive] = useState("dashboard");
  const [open, setOpen] = useState(false);
  const menu = useMemo(() => menuForRole(user.role), [user.role]);
  const activeItem = menu.find((item) => item.path === active) || menu[0];

  const Page = active === "dashboard" ? DashboardPage : active === "leads" ? LeadsPage : ModulePage;

  return (
    <div className="min-h-screen bg-[#f6f8f7] text-ink lg:grid lg:grid-cols-[270px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-30 w-[270px] border-r border-slate-200 bg-white transition lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-16 items-center border-b border-slate-200 px-5">
          <div className="grid h-9 w-9 place-items-center rounded-md bg-pine font-black text-white">IT</div>
          <div className="ml-3">
            <p className="text-sm font-bold">Institute CRM</p>
            <p className="text-xs text-slate-500">ERP Control Panel</p>
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {menu.map((item) => {
            const Icon = item.icon;
            const selected = active === item.path;
            return (
              <button
                key={item.path}
                onClick={() => {
                  setActive(item.path);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium ${selected ? "bg-pine text-white" : "text-slate-700 hover:bg-slate-100"}`}
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
            <button className="rounded-md border border-slate-200 p-2 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-lg font-bold">{activeItem.label}</h1>
              <p className="text-xs text-slate-500">{user.role} workspace</p>
            </div>
          </div>
          <div className="hidden min-w-[300px] items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 md:flex">
            <Search size={17} className="text-slate-400" />
            <input className="w-full bg-transparent text-sm outline-none" placeholder="Search records" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">{user.name}</p>
              <p className="text-xs text-slate-500">{user.email}</p>
            </div>
            <button onClick={logout} className="rounded-md border border-slate-200 p-2 hover:bg-slate-100" aria-label="Logout">
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
