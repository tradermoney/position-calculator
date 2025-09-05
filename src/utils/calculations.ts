import {
  Position,
  PositionSide,
  AddPositionParams,
  AddPositionResult,
  PyramidOrderParams,
  PyramidOrderResult,
  PyramidStep,
  PyramidStrategy,
  CalculationResult
} from '../types';

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
  
  if (totalQuantity === 0) return 0;
  return totalValue / totalQuantity;
}

/**
 * 计算爆仓价格
 * @param position 仓位信息
 * @param averagePrice 平均成本价
 * @param totalMargin 总保证金
 * @param totalQuantity 总数量
 * @returns 爆仓价格
 */
export function calculateLiquidationPrice(
  side: PositionSide,
  leverage: number,
  averagePrice: number,
  totalMargin: number,
  totalQuantity: number
): number {
  if (totalQuantity === 0 || totalMargin === 0) return 0;
  
  // 维持保证金率通常为0.5%
  const maintenanceMarginRate = 0.005;
  
  if (side === PositionSide.LONG) {
    // 多头爆仓价格 = 平均价格 * (1 - 1/杠杆 + 维持保证金率)
    return averagePrice * (1 - 1/leverage + maintenanceMarginRate);
  } else {
    // 空头爆仓价格 = 平均价格 * (1 + 1/杠杆 - 维持保证金率)
    return averagePrice * (1 + 1/leverage - maintenanceMarginRate);
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
 * 计算单个仓位的完整结果
 * @param position 仓位信息
 * @param currentPrice 当前价格（可选）
 * @returns 计算结果
 */
export function calculatePositionResult(
  position: Position,
  currentPrice?: number
): CalculationResult {
  const price = currentPrice || position.entryPrice;
  const unrealizedPnl = calculateUnrealizedPnl(
    position.side,
    position.entryPrice,
    price,
    position.quantity
  );
  
  const liquidationPrice = calculateLiquidationPrice(
    position.side,
    position.leverage,
    position.entryPrice,
    position.margin,
    position.quantity
  );
  
  const roe = calculateROE(unrealizedPnl, position.margin);
  
  return {
    averagePrice: position.entryPrice,
    totalQuantity: position.quantity,
    totalMargin: position.margin,
    liquidationPrice,
    unrealizedPnl,
    roe
  };
}

/**
 * 计算补仓结果
 * @param originalPosition 原始仓位
 * @param addParams 补仓参数
 * @param currentPrice 当前价格（可选）
 * @returns 补仓计算结果
 */
export function calculateAddPositionResult(
  originalPosition: Position,
  addParams: AddPositionParams,
  currentPrice?: number
): AddPositionResult {
  // 计算新的平均价格
  const positions = [
    { price: originalPosition.entryPrice, quantity: originalPosition.quantity },
    { price: addParams.addPrice, quantity: addParams.addQuantity }
  ];
  
  const newAveragePrice = calculateAveragePrice(positions);
  const newTotalQuantity = originalPosition.quantity + addParams.addQuantity;
  const newTotalMargin = originalPosition.margin + addParams.addMargin;
  
  // 创建新仓位
  const newPosition: Position = {
    ...originalPosition,
    entryPrice: newAveragePrice,
    quantity: newTotalQuantity,
    margin: newTotalMargin,
    updatedAt: new Date()
  };
  
  // 计算爆仓价格
  const liquidationPrice = calculateLiquidationPrice(
    originalPosition.side,
    originalPosition.leverage,
    newAveragePrice,
    newTotalMargin,
    newTotalQuantity
  );
  
  // 计算盈亏
  const price = currentPrice || newAveragePrice;
  const unrealizedPnl = calculateUnrealizedPnl(
    originalPosition.side,
    newAveragePrice,
    price,
    newTotalQuantity
  );
  
  const roe = calculateROE(unrealizedPnl, newTotalMargin);
  
  return {
    originalPosition,
    addParams,
    newPosition,
    averagePrice: newAveragePrice,
    totalQuantity: newTotalQuantity,
    totalMargin: newTotalMargin,
    liquidationPrice,
    unrealizedPnl,
    roe
  };
}

/**
 * 计算金字塔加仓结果
 * @param params 金字塔加仓参数
 * @returns 金字塔加仓计算结果
 */
export function calculatePyramidOrderResult(params: PyramidOrderParams): PyramidOrderResult {
  const steps: PyramidStep[] = [];
  let cumulativeQuantity = params.initialQuantity;
  let cumulativeMargin = params.initialMargin;
  let cumulativeValue = params.initialPrice * params.initialQuantity;
  
  // 第一步（初始仓位）
  steps.push({
    step: 1,
    price: params.initialPrice,
    quantity: params.initialQuantity,
    margin: params.initialMargin,
    cumulativeQuantity,
    cumulativeMargin,
    averagePrice: params.initialPrice,
    liquidationPrice: calculateLiquidationPrice(
      params.side,
      params.leverage,
      params.initialPrice,
      params.initialMargin,
      params.initialQuantity
    )
  });
  
  // 计算后续加仓步骤
  for (let i = 1; i <= params.addTimes; i++) {
    let stepPrice: number;
    let stepQuantity: number;
    let stepMargin: number;
    
    // 根据仓位方向和策略计算价格
    if (params.side === PositionSide.LONG) {
      // 多头向下加仓
      stepPrice = params.initialPrice * (1 - (params.priceStep / 100) * i);
    } else {
      // 空头向上加仓
      stepPrice = params.initialPrice * (1 + (params.priceStep / 100) * i);
    }
    
    // 根据策略计算数量
    if (params.strategy === PyramidStrategy.EQUAL_RATIO) {
      stepQuantity = params.initialQuantity;
      stepMargin = params.initialMargin;
    } else { // DOUBLE
      stepQuantity = params.initialQuantity * Math.pow(2, i);
      stepMargin = params.initialMargin * Math.pow(2, i);
    }
    
    cumulativeQuantity += stepQuantity;
    cumulativeMargin += stepMargin;
    cumulativeValue += stepPrice * stepQuantity;
    
    const averagePrice = cumulativeValue / cumulativeQuantity;
    const liquidationPrice = calculateLiquidationPrice(
      params.side,
      params.leverage,
      averagePrice,
      cumulativeMargin,
      cumulativeQuantity
    );
    
    steps.push({
      step: i + 1,
      price: stepPrice,
      quantity: stepQuantity,
      margin: stepMargin,
      cumulativeQuantity,
      cumulativeMargin,
      averagePrice,
      liquidationPrice
    });
  }
  
  const finalStep = steps[steps.length - 1];
  const finalResult: CalculationResult = {
    averagePrice: finalStep.averagePrice,
    totalQuantity: finalStep.cumulativeQuantity,
    totalMargin: finalStep.cumulativeMargin,
    liquidationPrice: finalStep.liquidationPrice,
    unrealizedPnl: 0, // 初始状态下未实现盈亏为0
    roe: 0
  };
  
  return {
    params,
    steps,
    finalResult
  };
}

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
