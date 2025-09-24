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

// 平仓委托单
export interface ExitOrder {
  id: string;              // 委托单ID
  price: number;           // 平仓价格
  quantity: number;        // 平仓数量
  enabled: boolean;        // 是否启用（复选框状态）
}

// 单个委托单的盈亏结果
export interface ExitOrderResult {
  id: string;              // 委托单ID
  price: number;           // 平仓价格
  quantity: number;        // 平仓数量
  pnl: number;             // 该委托单的盈亏
  roe: number;             // 该委托单的回报率
  margin: number;          // 该委托单对应的保证金
}

// 盈亏计算器参数
export interface PnLCalculatorParams {
  side: PositionSide;
  leverage: number;
  entryPrice: number;
  exitPrice: number;       // 保留向后兼容
  quantity: number;
  exitOrders?: ExitOrder[]; // 多个平仓委托单
}

// 盈亏计算器结果
export interface PnLCalculatorResult {
  initialMargin: number;    // 起始保证金
  pnl: number;             // 总盈亏
  roe: number;             // 总回报率 (%)
  positionValue: number;   // 仓位价值
  exitOrderResults?: ExitOrderResult[]; // 各委托单详细结果
  totalExitQuantity: number; // 总平仓数量
  remainingQuantity: number; // 剩余持仓数量
}

// 目标价格计算器参数
export interface TargetPriceCalculatorParams {
  side: PositionSide;
  entryPrice: number;
  targetROE: number;       // 目标回报率 (%)
  leverage?: number;       // 杠杆倍数，默认为1
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
 * 盈亏计算器 - 支持多次分批平仓
 */
export function calculatePnL(params: PnLCalculatorParams): PnLCalculatorResult {
  const { side, leverage, entryPrice, exitPrice, quantity, exitOrders } = params;

  // 仓位价值
  const positionValue = entryPrice * quantity;

  // 起始保证金 = 仓位价值 / 杠杆
  const initialMargin = positionValue / leverage;

  // 如果有多个平仓委托单，使用新的计算逻辑
  if (exitOrders && exitOrders.length > 0) {
    return calculateMultipleExitPnL(params);
  }

  // 向后兼容：单一平仓价格的计算逻辑
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
    positionValue,
    totalExitQuantity: quantity,
    remainingQuantity: 0
  };
}

/**
 * 多次分批平仓的盈亏计算
 */
function calculateMultipleExitPnL(params: PnLCalculatorParams): PnLCalculatorResult {
  const { side, leverage, entryPrice, quantity, exitOrders = [] } = params;

  // 仓位价值
  const positionValue = entryPrice * quantity;

  // 起始保证金 = 仓位价值 / 杠杆
  const initialMargin = positionValue / leverage;

  // 过滤启用的委托单
  const enabledOrders = exitOrders.filter(order => order.enabled);

  let totalPnl = 0;
  let totalExitQuantity = 0;
  const exitOrderResults: ExitOrderResult[] = [];

  // 计算每个委托单的盈亏
  for (const order of enabledOrders) {
    // 确保平仓数量不超过剩余持仓
    const actualQuantity = Math.min(order.quantity, quantity - totalExitQuantity);

    if (actualQuantity <= 0) {
      // 如果没有剩余持仓，跳过此委托单
      continue;
    }

    // 计算该委托单的盈亏
    let orderPnl: number;
    if (side === PositionSide.LONG) {
      orderPnl = (order.price - entryPrice) * actualQuantity;
    } else {
      orderPnl = (entryPrice - order.price) * actualQuantity;
    }

    // 计算该委托单对应的保证金
    const orderMargin = (entryPrice * actualQuantity) / leverage;

    // 计算该委托单的回报率
    const orderRoe = orderMargin > 0 ? (orderPnl / orderMargin) * 100 : 0;

    totalPnl += orderPnl;
    totalExitQuantity += actualQuantity;

    exitOrderResults.push({
      id: order.id,
      price: order.price,
      quantity: actualQuantity,
      pnl: orderPnl,
      roe: orderRoe,
      margin: orderMargin
    });
  }

  // 计算总回报率
  const totalRoe = initialMargin > 0 ? (totalPnl / initialMargin) * 100 : 0;

  // 剩余持仓数量
  const remainingQuantity = quantity - totalExitQuantity;

  return {
    initialMargin,
    pnl: totalPnl,
    roe: totalRoe,
    positionValue,
    exitOrderResults,
    totalExitQuantity,
    remainingQuantity
  };
}

/**
 * 目标价格计算器
 * 注意：这里的回报率是基于保证金的回报率，需要考虑杠杆倍数
 * 公式：目标价格 = 开仓价格 * (1 ± 目标回报率 / 杠杆倍数 / 100)
 */
export function calculateTargetPrice(params: TargetPriceCalculatorParams): TargetPriceCalculatorResult {
  const { side, entryPrice, targetROE, leverage = 1 } = params;

  let targetPrice: number;

  if (side === PositionSide.LONG) {
    // 做多：目标价格 = 开仓价格 * (1 + 目标回报率 / 杠杆倍数 / 100)
    targetPrice = entryPrice * (1 + targetROE / leverage / 100);
  } else {
    // 做空：目标价格 = 开仓价格 * (1 - 目标回报率 / 杠杆倍数 / 100)
    targetPrice = entryPrice * (1 - targetROE / leverage / 100);
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
    maintenanceMarginRate = 0.0065 // 默认0.65%
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
    const positionValue = quantity * entryPrice;
    const availableBalance = walletBalance - initialMargin; // 可用余额 = 钱包余额 - 起始保证金

    if (side === PositionSide.LONG) {
      // 做多强平价格 = 开仓价格 × (1 - (可用余额 - 维持保证金) / 仓位价值)
      const ratio = (availableBalance - maintenanceMargin) / positionValue;
      liquidationPrice = entryPrice * (1 - ratio);
    } else {
      // 做空强平价格 = 开仓价格 × (1 + (可用余额 - 维持保证金) / 仓位价值)
      const ratio = (availableBalance - maintenanceMargin) / positionValue;
      liquidationPrice = entryPrice * (1 + ratio);
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
