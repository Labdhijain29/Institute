export async function downloadRegistrationPdf(element, studentId) {
  if (!element) return;
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf")
  ]);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    width: 794,
    windowWidth: 1200,
    scrollX: 0,
    scrollY: 0,
    onclone: (documentClone) => {
      const form = documentClone.querySelector("#student-registration-print-area");
      if (!form) return;
      form.style.width = "794px";
      form.style.maxWidth = "none";
      form.style.margin = "0";
      form.style.boxShadow = "none";
    }
  });

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const margin = 8;
  const availableWidth = pdf.internal.pageSize.getWidth() - margin * 2;
  const availableHeight = pdf.internal.pageSize.getHeight() - margin * 2;
  const ratio = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
  const width = canvas.width * ratio;
  const height = canvas.height * ratio;
  pdf.addImage(canvas.toDataURL("image/png"), "PNG", (pdf.internal.pageSize.getWidth() - width) / 2, margin, width, height);
  pdf.save(`REGISTRATION-${studentId || "STUDENT"}.pdf`);
}
