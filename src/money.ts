export type Line = { amount: number };

// Cache of formatters keyed by currency code. Each currency's number of
// decimal places is its ISO 4217 minor-unit exponent (0 for JPY, 2 for USD,
// 3 for KWD/BHD/JOD, 4 for CLF, ...). We read it from the CLDR data that
// ships with the runtime instead of hardcoding 2, then format with exactly
// that many digits.
const formatters = new Map<string, Intl.NumberFormat>();

function currencyFormatter(currency: string): Intl.NumberFormat {
  const code = currency.toUpperCase();
  let formatter = formatters.get(code);
  if (!formatter) {
    // A currency-style formatter resolves the ISO 4217 default fraction
    // digits for the code; an unknown code throws a RangeError here rather
    // than silently falling back to a guessed default.
    const probe = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: code,
    });
    const digits = probe.resolvedOptions().maximumFractionDigits;
    formatter = new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    formatters.set(code, formatter);
  }
  return formatter;
}

export function formatTotal(lines: Line[], currency: string): string {
  const sum = lines.reduce((total, line) => total + line.amount, 0);
  return currencyFormatter(currency).format(sum);
}
