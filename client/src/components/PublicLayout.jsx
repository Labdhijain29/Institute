import React, { useState } from "react";
import { BookOpen, LogIn, Menu, Moon, Sun, X } from "lucide-react";
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
      <div className="min-h-screen bg-[#f7f9f4] text-ink dark:bg-[#101417] dark:text-white">
        <header className="sticky top-0 z-40 border-b border-black/5 bg-white/88 backdrop-blur-xl dark:border-white/10 dark:bg-[#101417]/88">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <button onClick={() => go("/")} className="flex items-center gap-3 text-left" aria-label="Go home">
              <span className="grid h-10 w-10 place-items-center rounded-md bg-pine text-white">
                <BookOpen size={21} />
              </span>
              <span>
                <span className="block text-sm font-black">CodeVista Institute</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400">Learn. Build. Get hired.</span>
              </span>
            </button>

            <nav className="hidden items-center gap-1 lg:flex">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => go(item.path)}
                  className={`rounded-md px-3 py-2 text-sm font-semibold ${path === item.path ? "bg-pine text-white" : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/10"}`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDark((value) => !value)}
                className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-white/10 dark:bg-white/5 dark:text-white"
                aria-label="Toggle theme"
                title="Toggle theme"
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={() => go("/login")} className="hidden h-10 items-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-white hover:bg-pine sm:flex dark:bg-white dark:text-ink">
                <LogIn size={17} />
                Login
              </button>
              <button onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 lg:hidden dark:border-white/10" aria-label="Open menu">
                <Menu size={20} />
              </button>
            </div>
          </div>

          {open && (
            <div className="border-t border-slate-200 bg-white p-4 lg:hidden dark:border-white/10 dark:bg-[#101417]">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold">Menu</span>
                <button onClick={() => setOpen(false)} className="rounded-md p-2 hover:bg-slate-100 dark:hover:bg-white/10" aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>
              <div className="grid gap-2">
                {navItems.map((item) => (
                  <button key={item.path} onClick={() => go(item.path)} className={`rounded-md px-3 py-3 text-left text-sm font-semibold ${path === item.path ? "bg-pine text-white" : "bg-slate-50 dark:bg-white/5"}`}>
                    {item.label}
                  </button>
                ))}
                <button onClick={() => go("/login")} className="mt-1 rounded-md bg-ink px-3 py-3 text-left text-sm font-bold text-white dark:bg-white dark:text-ink">
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
    <footer className="border-t border-slate-200 bg-white dark:border-white/10 dark:bg-[#12181c]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_0.8fr_1fr_1fr] lg:px-8">
        <div>
          <p className="text-lg font-black">CodeVista Institute</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600 dark:text-slate-300">Professional coding programs, lead management, admissions, and student success workflows under one roof.</p>
        </div>
        <div>
          <p className="text-sm font-bold">Quick Links</p>
          <div className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-slate-300">
            {navItems.map((item) => (
              <button key={item.path} onClick={() => go(item.path)} className="text-left hover:text-pine">
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold">Contact</p>
          <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <p>+91 98765 43210</p>
            <p>admissions@codevista.in</p>
            <p>2nd Floor, Tech Park Road, New Delhi</p>
          </div>
        </div>
        <div>
          <p className="text-sm font-bold">Newsletter</p>
          <form className="mt-3 flex overflow-hidden rounded-md border border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5">
            <input type="email" placeholder="Email address" className="min-w-0 flex-1 bg-transparent px-3 py-2 text-sm outline-none" />
            <button className="bg-pine px-4 text-sm font-bold text-white">Join</button>
          </form>
          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">LinkedIn · Instagram · YouTube · Facebook</p>
        </div>
      </div>
    </footer>
  );
}
