export async function downloadReceiptPdf(element, receiptNumber) {
  if (!element) return;
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf")
  ]);

  // Callers sometimes pass the preview wrapper. Capturing that wrapper also
  // captures its (much wider) modal layout, which makes the actual receipt a
  // small strip in the generated PDF. Always capture the paper itself.
  const receipt = element.matches?.("#fee-receipt-print-area")
    ? element
    : element.querySelector?.("#fee-receipt-print-area");
  if (!receipt) return;

  const exportWidth = 794; // 210 mm at the browser's standard 96 dpi
  const canvas = await html2canvas(receipt, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    width: exportWidth,
    windowWidth: 1200,
    scrollX: 0,
    scrollY: 0,
    onclone: (documentClone) => {
      const clonedReceipt = documentClone.querySelector("#fee-receipt-print-area");
      if (!clonedReceipt) return;
      clonedReceipt.style.width = `${exportWidth}px`;
      clonedReceipt.style.maxWidth = "none";
      clonedReceipt.style.margin = "0";
      clonedReceipt.style.boxShadow = "none";
    }
  });

  const imgData = canvas.toDataURL("image/png");
  const pageMargin = 8;
  const pageWidthMm = 210;
  const contentWidthMm = pageWidthMm - pageMargin * 2;
  const contentHeightMm = contentWidthMm * (canvas.height / canvas.width);
  // Use the receipt's actual height instead of leaving the rest of an A4 page
  // blank below a compact receipt.
  const pageHeightMm = contentHeightMm + pageMargin * 2;
  const pdf = new jsPDF({
    orientation: pageHeightMm >= pageWidthMm ? "portrait" : "landscape",
    unit: "mm",
    format: [pageWidthMm, pageHeightMm]
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const availableWidth = pageWidth - pageMargin * 2;
  const availableHeight = pageHeight - pageMargin * 2;
  const ratio = Math.min(availableWidth / canvas.width, availableHeight / canvas.height);
  const width = canvas.width * ratio;
  const height = canvas.height * ratio;
  const x = (pageWidth - width) / 2;
  const y = pageMargin;

  pdf.addImage(imgData, "PNG", x, y, width, height);
  pdf.save(`RECEIPT-${receiptNumber || "DRAFT"}.pdf`);
}
