/**
 * 合约计算器相关的计算函数
 */

export enum PositionSide {
  LONG = 'long',
  SHORT = 'short'
}

export enum MarginMode {
  CROSS = 'cross',    // 全仓
  ISOLATED = 'isolated' // 逐仓
}

export enum PositionMode {
  ONE_WAY = 'one_way',     // 单向持仓
  HEDGE = 'hedge'          // 双向持仓
}

// 盈亏计算器参数
export interface PnLCalculatorParams {
  side: PositionSide;
  leverage: number;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
}

// 盈亏计算器结果
export interface PnLCalculatorResult {
  initialMargin: number;    // 起始保证金
  pnl: number;             // 盈亏
  roe: number;             // 回报率 (%)
  positionValue: number;   // 仓位价值
}

// 目标价格计算器参数
export interface TargetPriceCalculatorParams {
  side: PositionSide;
  entryPrice: number;
  targetROE: number;       // 目标回报率 (%)
}

// 目标价格计算器结果
export interface TargetPriceCalculatorResult {
  targetPrice: number;
}

// 强平价格计算器参数
export interface LiquidationPriceCalculatorParams {
  side: PositionSide;
  marginMode: MarginMode;
  positionMode: PositionMode;
  leverage: number;
  entryPrice: number;
  quantity: number;
  walletBalance: number;
  maintenanceMarginRate?: number; // 维持保证金率，默认0.4%
}

// 强平价格计算器结果
export interface LiquidationPriceCalculatorResult {
  liquidationPrice: number;
}

// 可开计算器参数
export interface MaxPositionCalculatorParams {
  side: PositionSide;
  leverage: number;
  entryPrice: number;
  walletBalance: number;
}

// 可开计算器结果
export interface MaxPositionCalculatorResult {
  maxQuantity: number;      // 最大可开数量
  maxPositionValue: number; // 最大可开仓位价值
}

// 开仓价格计算器参数
export interface EntryPriceCalculatorParams {
  positions: Array<{
    price: number;
    quantity: number;
  }>;
}

// 开仓价格计算器结果
export interface EntryPriceCalculatorResult {
  averageEntryPrice: number;
  totalQuantity: number;
  totalValue: number;
}

/**
 * 盈亏计算器
 */
export function calculatePnL(params: PnLCalculatorParams): PnLCalculatorResult {
  const { side, leverage, entryPrice, exitPrice, quantity } = params;
  
  // 仓位价值
  const positionValue = entryPrice * quantity;
  
  // 起始保证金 = 仓位价值 / 杠杆
  const initialMargin = positionValue / leverage;
  
  // 计算盈亏
  let pnl: number;
  if (side === PositionSide.LONG) {
    pnl = (exitPrice - entryPrice) * quantity;
  } else {
    pnl = (entryPrice - exitPrice) * quantity;
  }
  
  // 回报率 = 盈亏 / 起始保证金 * 100%
  const roe = (pnl / initialMargin) * 100;
  
  return {
    initialMargin,
    pnl,
    roe,
    positionValue
  };
}

/**
 * 目标价格计算器
 * 注意：这里的回报率是基于价格变化的百分比，不是基于保证金的回报率
 */
export function calculateTargetPrice(params: TargetPriceCalculatorParams): TargetPriceCalculatorResult {
  const { side, entryPrice, targetROE } = params;

  let targetPrice: number;

  if (side === PositionSide.LONG) {
    // 做多：目标价格 = 开仓价格 * (1 + 目标回报率 / 100)
    targetPrice = entryPrice * (1 + targetROE / 100);
  } else {
    // 做空：目标价格 = 开仓价格 * (1 - 目标回报率 / 100)
    targetPrice = entryPrice * (1 - targetROE / 100);
  }

  return {
    targetPrice
  };
}

/**
 * 强平价格计算器
 */
export function calculateLiquidationPrice(params: LiquidationPriceCalculatorParams): LiquidationPriceCalculatorResult {
  const { 
    side, 
    marginMode, 
    leverage, 
    entryPrice, 
    quantity, 
    walletBalance,
    maintenanceMarginRate = 0.004 // 默认0.4%
  } = params;
  
  // 仓位价值
  const positionValue = entryPrice * quantity;
  
  // 起始保证金
  const initialMargin = positionValue / leverage;
  
  // 维持保证金
  const maintenanceMargin = positionValue * maintenanceMarginRate;
  
  let liquidationPrice: number;
  
  if (marginMode === MarginMode.CROSS) {
    // 全仓模式
    if (side === PositionSide.LONG) {
      // 做多强平价格 = (钱包余额 - 维持保证金) / 数量
      liquidationPrice = (walletBalance - maintenanceMargin) / quantity;
    } else {
      // 做空强平价格 = (钱包余额 + 维持保证金) / 数量
      liquidationPrice = (walletBalance + maintenanceMargin) / quantity;
    }
  } else {
    // 逐仓模式
    if (side === PositionSide.LONG) {
      // 做多强平价格 = 开仓价格 - (起始保证金 - 维持保证金) / 数量
      liquidationPrice = entryPrice - (initialMargin - maintenanceMargin) / quantity;
    } else {
      // 做空强平价格 = 开仓价格 + (起始保证金 - 维持保证金) / 数量
      liquidationPrice = entryPrice + (initialMargin - maintenanceMargin) / quantity;
    }
  }
  
  return {
    liquidationPrice: Math.max(0, liquidationPrice)
  };
}

/**
 * 可开计算器
 */
export function calculateMaxPosition(params: MaxPositionCalculatorParams): MaxPositionCalculatorResult {
  const { leverage, entryPrice, walletBalance } = params;
  
  // 最大仓位价值 = 钱包余额 * 杠杆
  const maxPositionValue = walletBalance * leverage;
  
  // 最大可开数量 = 最大仓位价值 / 开仓价格
  const maxQuantity = maxPositionValue / entryPrice;
  
  return {
    maxQuantity,
    maxPositionValue
  };
}

/**
 * 开仓价格计算器（平均价格计算）
 */
export function calculateEntryPrice(params: EntryPriceCalculatorParams): EntryPriceCalculatorResult {
  const { positions } = params;
  
  if (positions.length === 0) {
    return {
      averageEntryPrice: 0,
      totalQuantity: 0,
      totalValue: 0
    };
  }
  
  // 计算总价值和总数量
  let totalValue = 0;
  let totalQuantity = 0;
  
  for (const position of positions) {
    totalValue += position.price * position.quantity;
    totalQuantity += position.quantity;
  }
  
  // 平均开仓价格 = 总价值 / 总数量
  const averageEntryPrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;
  
  return {
    averageEntryPrice,
    totalQuantity,
    totalValue
  };
}

/**
 * 格式化数字显示
 */
export function formatNumber(value: number, decimals: number = 4): string {
  if (isNaN(value) || !isFinite(value)) return '0';
  return value.toFixed(decimals);
}

/**
 * 格式化百分比显示
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (isNaN(value) || !isFinite(value)) return '0';
  return value.toFixed(decimals);
}
