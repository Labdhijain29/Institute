import React, { useEffect, useState } from "react";
import { Download, Eye, Printer } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { ReceiptModal } from "../components/ReceiptModal.jsx";
import { fetchReceipt, fetchReceipts } from "../store/receiptsSlice.js";

const money = (value) => `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;
const date = (value) => (value ? new Date(value).toLocaleDateString("en-IN") : "-");

export function ReceiptsPage({ embedded = false }) {
  const dispatch = useDispatch();
  const { items, loading, error, selected } = useSelector((state) => state.receipts);
  const [modalOpen, setModalOpen] = useState(false);
  const [downloadOnReady, setDownloadOnReady] = useState(false);

  useEffect(() => {
    dispatch(fetchReceipts());
  }, [dispatch]);

  async function openReceipt(id, action = "view") {
    setModalOpen(true);
    setDownloadOnReady(action === "download");
    await dispatch(fetchReceipt(id)).unwrap();
    if (action === "print") setTimeout(() => window.print(), 150);
  }

  return (
    <div className="space-y-5">
      {!embedded && (
        <section className="no-print flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold">Fee Receipts</h2>
            <p className="text-sm text-slate-500">View, edit, print and export institute fee receipts.</p>
          </div>
          <div className="rounded-md bg-[#111315] px-4 py-2 text-sm font-semibold text-white">A4 ready</div>
        </section>
      )}

      {error && <p className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="table-wrap rounded-lg border border-slate-200 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Student Name</th>
              <th className="px-4 py-3 font-semibold">Student ID</th>
              <th className="px-4 py-3 font-semibold">Course</th>
              <th className="px-4 py-3 font-semibold">Amount Paid</th>
              <th className="px-4 py-3 font-semibold">Payment Date</th>
              <th className="px-4 py-3 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((receipt) => {
              const student = receipt.student || {};
              return (
                <tr key={receipt._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold">{student.name || "-"}</td>
                  <td className="px-4 py-3">{student.studentId || "-"}</td>
                  <td className="px-4 py-3">{student.course?.name || "-"}</td>
                  <td className="px-4 py-3 font-bold">{money(receipt.amountPaid || receipt.totalAmount)}</td>
                  <td className="px-4 py-3">{date(receipt.paymentDate)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => openReceipt(receipt._id)} className="inline-flex items-center gap-1 rounded-md bg-[#f97316] px-3 py-2 text-xs font-semibold text-white hover:bg-[#111315]">
                        <Eye size={14} /> View Receipt
                      </button>
                      <button onClick={() => openReceipt(receipt._id, "print")} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold">
                        <Printer size={14} /> Print
                      </button>
                      <button onClick={() => openReceipt(receipt._id, "download")} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-2 text-xs font-semibold">
                        <Download size={14} /> Download PDF
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!items.length && (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500" colSpan={6}>
                  {loading ? "Loading receipts..." : "No receipts found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ReceiptModal
        open={modalOpen || Boolean(selected)}
        downloadOnReady={downloadOnReady}
        onDownloaded={() => setDownloadOnReady(false)}
        onClose={() => {
          setDownloadOnReady(false);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
