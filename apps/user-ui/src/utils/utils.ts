/**
 * Formats a number into a string representation with a specified number of fraction digits,
 * using the 'en-US' locale.
 *
 * This utility uses `Intl.NumberFormat` to ensure consistent formatting, typically used for
 * displaying prices or monetary values.
 *
 * @param price - The number to be formatted.
 * @param removeZeroDecimal - If true, removes decimal part if it's zero (e.g., 100.00 -> 100). Defaults to false.
 * @param fractionDigits - The number of fraction digits to use (both min and max). Defaults to 2.
 * @returns A string representing the formatted number.
 *
 * @example
 * // Basic usage with defaults (2 decimal places)
 * formatPrice(1234.5); // Returns "1,234.50"
 *
 * @example
 * // Custom fraction digits
 * formatPrice(1234.5678, false, 3); // Returns "1,234.568"
 *
 * @example
 * // Remove zero decimals
 * formatPrice(100, true); // Returns "100"
 * formatPrice(100.50, true); // Returns "100.50"
 */
const formatPrice = (
  price: number,
  removeZeroDecimal: boolean = false,
  fractionDigits: number = 2
): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(price);

  if (removeZeroDecimal && price % 1 === 0) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }

  return formatted;
};
export { formatPrice };
