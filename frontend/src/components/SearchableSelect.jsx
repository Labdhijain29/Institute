import React, { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

export function SearchableSelect({ options, value, onChange, placeholder = "Select...", searchPlaceholder = "Search...", disabled = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);
  const selected = options.find((option) => option.value === value);
  const filteredOptions = useMemo(() => {
    const search = query.trim().toLocaleLowerCase("en-IN");
    return search ? options.filter((option) => option.label.toLocaleLowerCase("en-IN").includes(search)) : options;
  }, [options, query]);

  useEffect(() => {
    const close = (event) => {
      if (event.key === "Escape" || (event.type === "mousedown" && !rootRef.current?.contains(event.target))) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", close); };
  }, []);

  return (
    <div ref={rootRef} className="relative mt-1.5 normal-case tracking-normal">
      <button
        type="button"
        disabled={disabled}
        onClick={() => { setOpen((current) => !current); setQuery(""); }}
        className={`flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 text-left text-sm outline-none transition disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 ${open ? "border-[#f97316] ring-2 ring-[#f97316]/10" : "border-slate-300"}`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? "text-[#111315]" : "text-slate-400"}>{selected?.label || placeholder}</span>
        <ChevronDown size={16} className={`shrink-0 transition ${open ? "rotate-180 text-[#f97316]" : "text-slate-500"}`} />
      </button>

      {open && !disabled && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[70] rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
          <div className="flex h-10 items-center gap-2 rounded-md border border-slate-300 px-3 focus-within:border-[#f97316]">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input autoFocus className="w-full bg-transparent text-sm outline-none" placeholder={searchPlaceholder} value={query} onChange={(event) => setQuery(event.target.value)} />
          </div>
          <div className="mt-2 max-h-64 space-y-1 overflow-y-auto pr-1" role="listbox">
            {filteredOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  key={option.value}
                  onClick={() => { onChange(option.value); setOpen(false); setQuery(""); }}
                  className={`flex w-full items-center justify-between rounded-md px-3 py-2.5 text-left text-sm ${isSelected ? "bg-[#fff3e8] font-semibold text-[#ea580c]" : "text-slate-700 hover:bg-slate-50"}`}
                >
                  <span>{option.label}</span>{isSelected && <Check size={16} />}
                </button>
              );
            })}
            {!filteredOptions.length && <p className="px-3 py-5 text-center text-sm text-slate-500">No results found</p>}
          </div>
        </div>
      )}
    </div>
  );
}
