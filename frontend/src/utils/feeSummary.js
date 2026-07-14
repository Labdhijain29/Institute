const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function calculateFeeSummary(receipt, alreadyPaid = 0) {
  const netPayable = Math.max(
    number(receipt.tuitionFee) +
      number(receipt.registrationFee) +
      number(receipt.studyMaterialFee) +
      number(receipt.examFee) +
      number(receipt.otherCharges) -
      number(receipt.discount),
    0
  );
  const paidBefore = Math.max(number(alreadyPaid), 0);
  const currentPayment = Math.max(number(receipt.currentPayment), 0);
  const dueBeforePayment = Math.max(netPayable - paidBefore, 0);
  const totalPaid = Math.min(paidBefore + currentPayment, netPayable);
  const remainingDue = Math.max(netPayable - totalPaid, 0);
  const paymentStatus = totalPaid === 0 ? "Unpaid" : remainingDue > 0 ? "Partially Paid" : "Paid";

  return {
    netPayable,
    alreadyPaid: paidBefore,
    currentPayment,
    dueBeforePayment,
    totalPaid,
    remainingDue,
    paymentStatus,
    hasOverpayment: currentPayment > dueBeforePayment
  };
}

