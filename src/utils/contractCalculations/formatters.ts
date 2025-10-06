export function formatNumber(value: number, decimals: number = 4): string {
  if (isNaN(value) || !isFinite(value)) {
    return '0';
  }
  return value.toFixed(decimals);
}

export function formatPercentage(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) {
    return '0';
  }
  return value.toFixed(decimals);
}
