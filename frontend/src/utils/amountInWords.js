const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function underHundred(value) {
  if (value < 20) return ones[value];
  return `${tens[Math.floor(value / 10)]} ${ones[value % 10]}`.trim();
}

function underThousand(value) {
  const hundred = Math.floor(value / 100);
  const rest = value % 100;
  return `${hundred ? `${ones[hundred]} Hundred` : ""} ${rest ? underHundred(rest) : ""}`.trim();
}

export function amountInWords(amount = 0) {
  let value = Math.round(Number(amount || 0));
  if (!value) return "Zero Rupees Only";

  const crore = Math.floor(value / 10000000);
  value %= 10000000;
  const lakh = Math.floor(value / 100000);
  value %= 100000;
  const thousand = Math.floor(value / 1000);
  value %= 1000;

  const parts = [
    crore ? `${underThousand(crore)} Crore` : "",
    lakh ? `${underThousand(lakh)} Lakh` : "",
    thousand ? `${underThousand(thousand)} Thousand` : "",
    value ? underThousand(value) : ""
  ].filter(Boolean);

  return `${parts.join(" ")} Rupees Only`;
}
