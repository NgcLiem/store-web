export function formatPrice(value, { currency = 'đ', decimals = 0 } = {}) {
  if (value == null) return '';

  // If the value is a string that already contains non-digit characters (like '3.000.000đ' or '3,000,000'), try to extract digits
  const numeric = typeof value === 'number' ? value : Number(String(value).replace(/[^0-9.-]+/g, ''));
  if (Number.isNaN(numeric)) return String(value);

  // Format with dot as thousand separator
  const parts = Math.round(numeric).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${parts}${currency ? ' ' + currency : ''}`;
}
