/**
 * 基础计算函数
 */

import { PositionSide } from '../../types';

/**
 * 计算平均成本价
 * @param positions 仓位数组或价格数量对数组
 * @returns 平均成本价
 */
export function calculateAveragePrice(
  positions: Array<{ price: number; quantity: number }>
): number {
  const totalValue = positions.reduce((sum, pos) => sum + pos.price * pos.quantity, 0);
  const totalQuantity = positions.reduce((sum, pos) => sum + pos.quantity, 0);
  
  return totalQuantity === 0 ? 0 : totalValue / totalQuantity;
}

/**
 * 计算爆仓价格 - 简化接口用于测试
 */
interface LiquidationPriceParams {
  entryPrice: number;
  quantity: number;
  leverage: number;
  side: 'long' | 'short';
  margin: number;
  maintenanceMarginRate: number;
}

export function calculateLiquidationPrice(params: LiquidationPriceParams): number {
  const { entryPrice, leverage, side, maintenanceMarginRate } = params;

  if (leverage <= 0) {
    throw new Error('杠杆倍数必须大于0');
  }

  if (side === 'long') {
    return entryPrice * (1 - (1 / leverage) + maintenanceMarginRate);
  } else {
    return entryPrice * (1 + (1 / leverage) - maintenanceMarginRate);
  }
}

/**
 * 计算盈亏 - 简化接口用于测试
 */
interface PnLParams {
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  side: 'long' | 'short';
}

export function calculatePnL(params: PnLParams): number {
  const { entryPrice, currentPrice, quantity, side } = params;

  if (side === 'long') {
    return (currentPrice - entryPrice) * quantity;
  } else {
    return (entryPrice - currentPrice) * quantity;
  }
}

/**
 * 计算保证金比率 - 简化接口用于测试
 */
interface MarginRatioParams {
  margin: number;
  unrealizedPnL: number;
  positionValue: number;
}

export function calculateMarginRatio(params: MarginRatioParams): number {
  const { margin, unrealizedPnL, positionValue } = params;

  if (positionValue <= 0) return 0;
  return (margin + unrealizedPnL) / positionValue;
}

/**
 * 计算所需保证金 - 简化接口用于测试
 */
interface RequiredMarginParams {
  price: number;
  quantity: number;
  leverage: number;
}

export function calculateRequiredMargin(params: RequiredMarginParams): number {
  const { price, quantity, leverage } = params;
  return (price * quantity) / leverage;
}

/**
 * 计算爆仓价格 - 原有接口保持兼容
 * @param side 仓位方向
 * @param leverage 杠杆倍数
 * @param averagePrice 平均成本价
 * @param totalMargin 总保证金
 * @param totalQuantity 总数量
 * @returns 爆仓价格
 */
export function calculateLiquidationPriceOriginal(
  side: PositionSide,
  leverage: number,
  averagePrice: number,
  totalMargin: number,
  totalQuantity: number
): number {
  const maintenanceMarginRate = 0.005; // 0.5% 维持保证金率
  
  if (side === PositionSide.LONG) {
    return averagePrice - (totalMargin - totalQuantity * averagePrice * maintenanceMarginRate) / totalQuantity;
  } else {
    return averagePrice + (totalMargin - totalQuantity * averagePrice * maintenanceMarginRate) / totalQuantity;
  }
}

/**
 * 计算未实现盈亏
 * @param side 仓位方向
 * @param averagePrice 平均成本价
 * @param currentPrice 当前价格
 * @param quantity 持有数量
 * @returns 未实现盈亏
 */
export function calculateUnrealizedPnl(
  side: PositionSide,
  averagePrice: number,
  currentPrice: number,
  quantity: number
): number {
  if (side === PositionSide.LONG) {
    return (currentPrice - averagePrice) * quantity;
  } else {
    return (averagePrice - currentPrice) * quantity;
  }
}

/**
 * 计算收益率
 * @param unrealizedPnl 未实现盈亏
 * @param totalMargin 总保证金
 * @returns 收益率（百分比）
 */
export function calculateROE(unrealizedPnl: number, totalMargin: number): number {
  if (totalMargin === 0) return 0;
  return (unrealizedPnl / totalMargin) * 100;
}

/**
 * 计算保证金率 - 原有接口保持兼容
 * @param margin 保证金
 * @param totalValue 总价值
 * @returns 保证金率
 */
export function calculateMarginRatioOriginal(margin: number, totalValue: number): number {
  if (totalValue <= 0) return 0;
  return margin / totalValue;
}

/**
 * 计算总价值
 * @param quantity 数量
 * @param currentPrice 当前价格
 * @returns 总价值
 */
export function calculateTotalValue(quantity: number, currentPrice: number): number {
  return quantity * currentPrice;
}

/**
 * 计算距离爆仓的百分比
 * @param currentPrice 当前价格
 * @param liquidationPrice 爆仓价格
 * @param side 仓位方向
 * @returns 距离爆仓的百分比
 */
export function calculateDistanceToLiquidation(
  currentPrice: number,
  liquidationPrice: number,
  side: PositionSide
): number {
  if (currentPrice <= 0 || liquidationPrice <= 0) return 0;
  
  if (side === PositionSide.LONG) {
    return ((currentPrice - liquidationPrice) / currentPrice) * 100;
  } else {
    return ((liquidationPrice - currentPrice) / currentPrice) * 100;
  }
}
