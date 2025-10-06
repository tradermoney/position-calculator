/**
 * 格式化工具函数
 */

/**
 * 格式化数字显示
 * @param value 数值
 * @param decimals 小数位数
 * @returns 格式化后的字符串
 */
export function formatNumber(value: number, decimals: number = 4): string {
  if (isNaN(value) || !isFinite(value)) return '0';
  return value.toFixed(decimals);
}

/**
 * 格式化百分比显示
 * @param value 数值
 * @param decimals 小数位数
 * @returns 格式化后的百分比字符串
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0.00%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * 格式化货币显示
 * @param value 数值
 * @param currency 货币符号
 * @param decimals 小数位数
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(value: number, currency: string = 'USDT', decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return `0.00 ${currency}`;
  return `${value.toFixed(decimals)} ${currency}`;
}

/**
 * 格式化大数字显示（K, M, B）
 * @param value 数值
 * @param decimals 小数位数
 * @returns 格式化后的字符串
 */
export function formatLargeNumber(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1e9) {
    return `${sign}${(absValue / 1e9).toFixed(decimals)}B`;
  } else if (absValue >= 1e6) {
    return `${sign}${(absValue / 1e6).toFixed(decimals)}M`;
  } else if (absValue >= 1e3) {
    return `${sign}${(absValue / 1e3).toFixed(decimals)}K`;
  } else {
    return `${sign}${absValue.toFixed(decimals)}`;
  }
}

/**
 * 格式化价格显示
 * @param value 价格
 * @returns 格式化后的价格字符串
 */
export function formatPrice(value: number): string {
  if (isNaN(value) || !isFinite(value)) return '0.0000';

  // 根据价格大小自动调整小数位数
  if (value >= 1000) {
    return value.toFixed(2);
  } else if (value >= 1) {
    return value.toFixed(4);
  } else {
    return value.toFixed(6);
  }
}

/**
 * 格式化数量显示
 * @param value 数量
 * @param decimals 小数位数
 * @returns 格式化后的数量字符串
 */
export function formatQuantity(value: number, decimals: number = 8): string {
  if (isNaN(value) || !isFinite(value)) return '0';
  
  // 移除尾随的零
  const formatted = value.toFixed(decimals);
  return formatted.replace(/\.?0+$/, '');
}
