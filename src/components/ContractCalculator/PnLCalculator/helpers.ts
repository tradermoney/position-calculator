import { PositionType, Position } from './types';

export const NUMBER_REGEX = /^\d*\.?\d*$/;

export const createEmptyPosition = (id: number, type: PositionType = PositionType.OPEN): Position => ({
  id,
  type,
  price: 0,
  quantity: 0,
  quantityUsdt: 0,
  marginUsdt: 0,
  enabled: true,
});

export const generateId = () => Date.now() + Math.random();

export const parseNumericInput = (value: string): number => {
  if (value === '' || value === '.') return 0;
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : 0;
};

/**
 * 解析包含单位的数值字符串，如 "65.8274 币" -> 65.8274
 * 支持格式：
 * - "65.8274 币"
 * - "65.8274币"
 * - "65.8274"
 * - "65.8274 USDT"
 * - "65.8274USDT"
 */
export const parseValueWithUnit = (value: string): number => {
  if (!value || typeof value !== 'string') return 0;
  
  // 移除所有空格
  const trimmed = value.trim();
  if (trimmed === '' || trimmed === '.') return 0;
  
  // 提取数字部分（包括小数点和负号）
  const match = trimmed.match(/^-?\d*\.?\d*/);
  if (!match) return 0;
  
  const num = parseFloat(match[0]);
  return Number.isFinite(num) ? num : 0;
};
