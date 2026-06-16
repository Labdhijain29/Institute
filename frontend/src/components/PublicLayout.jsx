import React, { useState } from "react";
import { LogIn, Menu, Moon, Sun, X } from "lucide-react";
import logoMarkDark from "../assets/coding-wallah-mark-transparent.png";
import logoMarkLight from "../assets/coding-wallah-mark-charcoal.png";
import { navItems } from "../data/publicContent.js";

export function navigateTo(path) {
  window.history.pushState({}, "", path);
  window.dispatchEvent(new Event("popstate"));
}

export function PublicLayout({ children, path, dark, setDark }) {
  const [open, setOpen] = useState(false);

  const go = (nextPath) => {
    navigateTo(nextPath);
    setOpen(false);
  };

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-[#f8f5ef] text-[#111315] dark:bg-[#0f1011] dark:text-white">
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 shadow-[0_10px_28px_rgba(17,19,21,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-[#141618]/95">
          <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button onClick={() => go("/")} className="flex items-center gap-3 text-left" aria-label="Go home">
              <span className="grid h-12 w-[76px] place-items-center overflow-hidden p-0">
                <img src={dark ? logoMarkDark : logoMarkLight} alt="Coding Wallah logo" className="h-full w-full object-contain" />
              </span>
              <span>
                <span className="block text-base font-black leading-tight text-[#111315] dark:text-white">Coding Wallah</span>
                <span className="block text-xs font-medium text-slate-500 dark:text-slate-300">Learn. Build. Get hired.</span>
              </span>
            </button>

            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className={`rounded-md px-3.5 py-2 text-sm font-bold transition ${path === item.path ? "bg-[#f97316] text-white shadow-sm" : "text-slate-700 hover:bg-[#fff3e8] hover:text-[#c2410c] dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDark((value) => !value)}
                className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 transition hover:border-[#f97316] hover:text-[#f97316] dark:border-white/10 dark:bg-white/5 dark:text-white"
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => go("/login")} className="hidden h-10 items-center gap-2 rounded-md bg-[#111315] px-4 text-sm font-bold text-white shadow-sm transition hover:bg-[#f97316] sm:flex">
                <LogIn size={17} />
                Login
              </button>
              <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-700 lg:hidden dark:border-white/10 dark:text-white" aria-label="Open menu">
                <Menu size={20} />
              </button>
            </div>
          </div>

          {open && (
            <div className="border-t border-slate-200 bg-white p-4 text-[#111315] lg:hidden dark:border-white/10 dark:bg-[#141618] dark:text-white">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold">Menu</span>
                <button onClick={() => setOpen(false)} className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>
              <div className="grid gap-2">
                {navItems.map((item) => (
                  <button key={item.path} onClick={() => go(item.path)} className={`rounded-md px-3 py-3 text-left text-sm font-bold ${path === item.path ? "bg-[#f97316] text-white" : "bg-slate-50 dark:bg-white/5"}`}>
                    {item.label}
                  </button>
                ))}
                <button onClick={() => go("/login")} className="mt-1 rounded-md bg-[#111315] px-3 py-3 text-left text-sm font-bold text-white dark:bg-[#f97316]">
                  Login
                </button>
              </div>
            </div>
          )}
        </header>

        {children}
      </div>
    </div>
  );
}

export function Footer() {
  const go = (path) => navigateTo(path);

  return (
    <footer className="border-t border-white/10 bg-ink text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-lg font-black">Coding Wallah</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-300">Professional coding programs, lead management, admissions, and student success workflows under one roof.</p>
        </div>
        <div>
          <p className="text-sm font-bold">Quick Links</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-300">
            {navItems.map((item) => (
              <button key={item.path} onClick={() => go(item.path)} className="text-left hover:text-[#fdba74]">
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold">Contact</p>
          <div className="mt-3 space-y-2 text-sm text-slate-300">
            <p>+91 9098875825</p>
            <p>info@codingwallah.com</p>
            <p>1nd Floor, 91, Ratna Lok Colony RD, Near Medanta Hospital, Vijay nagar, Indore, MP, 452010</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold">Newsletter</p>
          <form className="mt-3 flex overflow-hidden rounded-md border border-white/10 bg-white/10">
            <input type="email" placeholder="Email address" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none" />
            <button className="bg-[#f97316] px-4 text-sm font-bold text-white">Join</button>
          </form>
          <p className="mt-4 text-sm text-slate-300">LinkedIn · Instagram · YouTube · Facebook</p>
        </div>
      </div>
    </footer>
  );
}
