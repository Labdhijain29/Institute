const safeFilePart = (value) => String(value || "Draft").trim().replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "") || "Draft";

export async function downloadOfferPdf(element, offerOrStudentId) {
  if (!element) return;
  const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf")
  ]);

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pages = Array.from(element.querySelectorAll(".offer-letter-page"));
  const targets = pages.length ? pages : [element];

  for (const [index, target] of targets.entries()) {
    const canvas = await html2canvas(target, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      windowWidth: target.scrollWidth,
      windowHeight: target.scrollHeight
    });
    const imgData = canvas.toDataURL("image/png");
    if (index > 0) pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight);
  }

  const offer = typeof offerOrStudentId === "object" ? offerOrStudentId : { studentId: offerOrStudentId };
  pdf.save(`OfferLetter_${safeFilePart(offer.studentId)}_${safeFilePart(offer.studentName)}.pdf`);
}
