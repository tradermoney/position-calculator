/**
 * 币安API辅助工具函数
 */

import type { KlineInterval } from '../../../types/binance';

/**
 * 时间间隔转毫秒数
 */
export function intervalToMilliseconds(interval: KlineInterval): number {
  const intervals: Record<KlineInterval, number> = {
    '1m': 60 * 1000,
    '3m': 3 * 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '30m': 30 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '2h': 2 * 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '6h': 6 * 60 * 60 * 1000,
    '8h': 8 * 60 * 60 * 1000,
    '12h': 12 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
    '3d': 3 * 24 * 60 * 60 * 1000,
    '1w': 7 * 24 * 60 * 60 * 1000,
    '1M': 30 * 24 * 60 * 60 * 1000,
  };

  return intervals[interval];
}

/**
 * 格式化价格（移除尾随的零）
 */
export function formatPrice(price: string | number): string {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return num.toString();
}

/**
 * 格式化数量（移除尾随的零）
 */
export function formatQuantity(quantity: string | number): string {
  const num = typeof quantity === 'string' ? parseFloat(quantity) : quantity;
  return num.toString();
}

/**
 * 计算百分比变化
 */
export function calculatePercentChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * 格式化百分比
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * 格式化大数字（K, M, B）
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1e9) {
    return `${(num / 1e9).toFixed(2)}B`;
  }
  if (num >= 1e6) {
    return `${(num / 1e6).toFixed(2)}M`;
  }
  if (num >= 1e3) {
    return `${(num / 1e3).toFixed(2)}K`;
  }
  return num.toFixed(2);
}

/**
 * 时间戳转日期字符串
 */
export function timestampToDate(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

/**
 * 日期字符串转时间戳
 */
export function dateToTimestamp(date: string | Date): number {
  return new Date(date).getTime();
}

/**
 * 计算时间范围内的K线数量
 */
export function calculateKlineCount(
  startTime: number,
  endTime: number,
  interval: KlineInterval
): number {
  const intervalMs = intervalToMilliseconds(interval);
  return Math.ceil((endTime - startTime) / intervalMs);
}

/**
 * 验证交易对格式
 */
export function isValidSymbol(symbol: string): boolean {
  // 交易对格式通常是 BTCUSDT, ETHUSDT 等
  return /^[A-Z0-9]{3,}USDT?$/i.test(symbol);
}

/**
 * 标准化交易对名称
 */
export function normalizeSymbol(symbol: string): string {
  return symbol.toUpperCase().replace(/[^A-Z0-9]/g, '');
}

/**
 * 解析交易对
 */
export interface ParsedSymbol {
  base: string;
  quote: string;
}

export function parseSymbol(symbol: string): ParsedSymbol | null {
  const normalized = normalizeSymbol(symbol);
  
  // 尝试匹配常见的报价货币
  const quoteAssets = ['USDT', 'BUSD', 'USDC', 'BTC', 'ETH', 'BNB'];
  
  for (const quote of quoteAssets) {
    if (normalized.endsWith(quote)) {
      const base = normalized.slice(0, -quote.length);
      if (base.length > 0) {
        return { base, quote };
      }
    }
  }
  
  return null;
}

/**
 * 精度处理
 */
export function roundToPrecision(value: number, precision: number): number {
  const multiplier = Math.pow(10, precision);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * 格式化到指定精度
 */
export function formatToPrecision(value: number, precision: number): string {
  return value.toFixed(precision);
}

/**
 * 计算价格步长
 */
export function calculatePriceStep(tickSize: string): number {
  return parseFloat(tickSize);
}

/**
 * 计算数量步长
 */
export function calculateQuantityStep(stepSize: string): number {
  return parseFloat(stepSize);
}

/**
 * 验证价格是否符合步长
 */
export function isValidPrice(price: number, tickSize: string): boolean {
  const step = calculatePriceStep(tickSize);
  const remainder = price % step;
  return Math.abs(remainder) < 1e-8; // 使用小误差值避免浮点数精度问题
}

/**
 * 验证数量是否符合步长
 */
export function isValidQuantity(quantity: number, stepSize: string): boolean {
  const step = calculateQuantityStep(stepSize);
  const remainder = quantity % step;
  return Math.abs(remainder) < 1e-8;
}

/**
 * 调整价格到合法步长
 */
export function adjustPriceToTickSize(price: number, tickSize: string): number {
  const step = calculatePriceStep(tickSize);
  return Math.round(price / step) * step;
}

/**
 * 调整数量到合法步长
 */
export function adjustQuantityToStepSize(quantity: number, stepSize: string): number {
  const step = calculateQuantityStep(stepSize);
  return Math.round(quantity / step) * step;
}

/**
 * 计算订单价值
 */
export function calculateOrderValue(price: number, quantity: number): number {
  return price * quantity;
}

/**
 * 计算手续费
 */
export function calculateFee(value: number, feeRate: number): number {
  return value * feeRate;
}

/**
 * 生成时间范围
 */
export function generateTimeRange(
  startTime: Date | number,
  endTime: Date | number,
  interval: KlineInterval
): number[] {
  const start = typeof startTime === 'number' ? startTime : startTime.getTime();
  const end = typeof endTime === 'number' ? endTime : endTime.getTime();
  const intervalMs = intervalToMilliseconds(interval);
  
  const timestamps: number[] = [];
  for (let time = start; time <= end; time += intervalMs) {
    timestamps.push(time);
  }
  
  return timestamps;
}

/**
 * 延迟函数
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 批量处理数据
 */
export async function batchProcess<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  batchSize: number = 10,
  delayMs: number = 100
): Promise<R[]> {
  const results: R[] = [];
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
    
    // 添加延迟避免速率限制
    if (i + batchSize < items.length) {
      await sleep(delayMs);
    }
  }
  
  return results;
}

/**
 * 安全的JSON解析
 */
export function safeJsonParse<T>(json: string, defaultValue: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * 深拷贝对象
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 合并对象（深度合并）
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  
  const source = sources.shift();
  
  if (source && typeof source === 'object') {
    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = target[key];
      
      if (
        sourceValue &&
        typeof sourceValue === 'object' &&
        !Array.isArray(sourceValue) &&
        targetValue &&
        typeof targetValue === 'object' &&
        !Array.isArray(targetValue)
      ) {
        target[key] = deepMerge(
          targetValue as Record<string, unknown>,
          sourceValue as Record<string, unknown>
        ) as T[Extract<keyof T, string>];
      } else {
        target[key] = sourceValue as T[Extract<keyof T, string>];
      }
    }
  }
  
  return deepMerge(target, ...sources);
}

/**
 * 节流函数
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let lastRan = 0;
  
  return function (this: unknown, ...args: Parameters<T>) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => {
        if (Date.now() - lastRan >= wait) {
          func.apply(this, args);
          lastRan = Date.now();
        }
      }, wait - (Date.now() - lastRan));
    }
  };
}

/**
 * 防抖函数
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

