export async function downloadSalarySlipPdf(element, employeeCode, month) {
  if (!element) return;
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf")
  ]);
  const slip = element.matches?.("#salary-slip-print-area") ? element : element.querySelector?.("#salary-slip-print-area");
  if (!slip) return;

  const canvas = await html2canvas(slip, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    width: 794,
    windowWidth: 794,
    scrollX: 0,
    scrollY: 0,
    onclone: (documentClone) => {
      const cloned = documentClone.querySelector("#salary-slip-print-area");
      if (cloned) {
        cloned.style.width = "794px";
        cloned.style.maxWidth = "none";
        cloned.style.margin = "0";
        cloned.style.boxShadow = "none";
      }
    }
  });
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297);
  pdf.save(`SALARY-SLIP-${employeeCode || "EMPLOYEE"}-${month || "PAYROLL"}.pdf`);
}
