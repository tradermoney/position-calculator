/**
 * 验证工具函数
 */

import { Position } from '../../types';

/**
 * 验证仓位数据
 * @param position 仓位数据
 * @returns 验证错误数组
 */
export function validatePosition(position: Partial<Position>): string[] {
  const errors: string[] = [];
  
  if (!position.symbol || position.symbol.trim() === '') {
    errors.push('币种符号不能为空');
  }
  
  if (!position.leverage || position.leverage <= 0 || position.leverage > 125) {
    errors.push('杠杆倍数必须在1-125之间');
  }
  
  if (!position.entryPrice || position.entryPrice <= 0) {
    errors.push('开仓价格必须大于0');
  }
  
  if (!position.quantity || position.quantity <= 0) {
    errors.push('持有数量必须大于0');
  }
  
  if (!position.margin || position.margin <= 0) {
    errors.push('保证金必须大于0');
  }
  
  return errors;
}

/**
 * 验证价格数据
 * @param price 价格
 * @param fieldName 字段名称
 * @returns 验证错误信息，无错误返回null
 */
export function validatePrice(price: number, fieldName: string = '价格'): string | null {
  if (isNaN(price) || !isFinite(price)) {
    return `${fieldName}必须是有效数字`;
  }
  
  if (price <= 0) {
    return `${fieldName}必须大于0`;
  }
  
  if (price > 1e10) {
    return `${fieldName}过大，请输入合理的价格`;
  }
  
  return null;
}

/**
 * 验证数量数据
 * @param quantity 数量
 * @param fieldName 字段名称
 * @returns 验证错误信息，无错误返回null
 */
export function validateQuantity(quantity: number, fieldName: string = '数量'): string | null {
  if (isNaN(quantity) || !isFinite(quantity)) {
    return `${fieldName}必须是有效数字`;
  }
  
  if (quantity <= 0) {
    return `${fieldName}必须大于0`;
  }
  
  if (quantity > 1e12) {
    return `${fieldName}过大，请输入合理的数量`;
  }
  
  return null;
}

/**
 * 验证杠杆倍数
 * @param leverage 杠杆倍数
 * @returns 验证错误信息，无错误返回null
 */
export function validateLeverage(leverage: number): string | null {
  if (isNaN(leverage) || !isFinite(leverage)) {
    return '杠杆倍数必须是有效数字';
  }
  
  if (leverage <= 0) {
    return '杠杆倍数必须大于0';
  }
  
  if (leverage > 125) {
    return '杠杆倍数不能超过125倍';
  }
  
  return null;
}

/**
 * 验证保证金
 * @param margin 保证金
 * @param positionValue 仓位价值（可选）
 * @returns 验证错误信息，无错误返回null
 */
export function validateMargin(margin: number, positionValue?: number): string | null {
  if (isNaN(margin) || !isFinite(margin)) {
    return '保证金必须是有效数字';
  }
  
  if (margin <= 0) {
    return '保证金必须大于0';
  }
  
  if (positionValue && margin > positionValue) {
    return '保证金不能超过仓位价值';
  }
  
  return null;
}

/**
 * 验证百分比
 * @param percentage 百分比
 * @param fieldName 字段名称
 * @param min 最小值
 * @param max 最大值
 * @returns 验证错误信息，无错误返回null
 */
export function validatePercentage(
  percentage: number, 
  fieldName: string = '百分比',
  min: number = 0,
  max: number = 100
): string | null {
  if (isNaN(percentage) || !isFinite(percentage)) {
    return `${fieldName}必须是有效数字`;
  }
  
  if (percentage < min) {
    return `${fieldName}不能小于${min}%`;
  }
  
  if (percentage > max) {
    return `${fieldName}不能大于${max}%`;
  }
  
  return null;
}

/**
 * 验证币种符号
 * @param symbol 币种符号
 * @returns 验证错误信息，无错误返回null
 */
export function validateSymbol(symbol: string): string | null {
  if (!symbol || symbol.trim() === '') {
    return '币种符号不能为空';
  }
  
  if (symbol.length > 20) {
    return '币种符号长度不能超过20个字符';
  }
  
  if (!/^[A-Z0-9]+$/.test(symbol.toUpperCase())) {
    return '币种符号只能包含字母和数字';
  }
  
  return null;
}
