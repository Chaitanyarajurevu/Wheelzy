/**
 * Wheelzy Indian Rupee (INR) Currency Utilities
 * Formats monetary amounts across the platform adhering to Indian numbering and fixed ₹100/hr campus rates.
 */

export function formatCurrency(
  amount: number | string | null | undefined,
  forceDecimals = false
): string {
  if (amount === null || amount === undefined || amount === "") {
    return "₹0";
  }

  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(numericAmount)) {
    return "₹0";
  }

  const hasFractions = numericAmount % 1 !== 0;

  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: forceDecimals ? 2 : hasFractions ? 2 : 0,
    maximumFractionDigits: forceDecimals || hasFractions ? 2 : 0,
  }).format(numericAmount);

  // Clean non-breaking spaces or double spaces between symbol and number e.g. "₹ 100" -> "₹100"
  return formatted.replace(/\s+/g, "");
}

export function formatINR(
  amount: number | string | null | undefined,
  forceDecimals = false
): string {
  return formatCurrency(amount, forceDecimals);
}

