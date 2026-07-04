import React from "react";

export function DataTable({ columns, rows }) {
  return (
    <div className="table-wrap rounded-lg border border-slate-200 bg-white">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="px-4 py-3 font-semibold">{column.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, index) => (
            <tr key={row._id || index} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td key={column.key} className={`px-4 py-3 ${column.key === "actions" ? "whitespace-nowrap" : ""}`}>{column.render ? column.render(row) : row[column.key] || "-"}</td>
              ))}
            </tr>
          ))}
          {!rows.length && (
            <tr>
              <td className="px-4 py-8 text-center text-slate-500" colSpan={columns.length}>No records found</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
