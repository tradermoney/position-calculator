/**
 * 仓位相关计算函数
 */

import { Position, CalculationResult, AddPositionParams, AddPositionResult, PyramidOrderParams, PyramidOrderResult, PyramidStep } from '../../types';
import { 
  calculateAveragePrice, 
  calculateUnrealizedPnl, 
  calculateLiquidationPriceOriginal, 
  calculateROE, 
  calculateMarginRatioOriginal, 
  calculateDistanceToLiquidation,
  calculateTotalValue
} from './basicCalculations';
import { calculateRiskLevel } from './riskAnalysis';

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
  
  const liquidationPrice = calculateLiquidationPriceOriginal(
    position.side,
    position.leverage,
    position.entryPrice,
    position.margin,
    position.quantity
  );
  
  const roe = calculateROE(unrealizedPnl, position.margin);
  
  const totalValue = position.quantity * price;
  const marginRatio = calculateMarginRatioOriginal(position.margin, totalValue);
  const distanceToLiquidation = calculateDistanceToLiquidation(price, liquidationPrice, position.side);
  const riskLevel = calculateRiskLevel(marginRatio, position.leverage, distanceToLiquidation);

  return {
    averagePrice: position.entryPrice,
    totalQuantity: position.quantity,
    totalMargin: position.margin,
    liquidationPrice,
    unrealizedPnl,
    roe,
    totalValue,
    marginRatio,
    riskLevel,
    distanceToLiquidation
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
  const liquidationPrice = calculateLiquidationPriceOriginal(
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
  const totalValue = newTotalQuantity * price;
  const marginRatio = calculateMarginRatioOriginal(newTotalMargin, totalValue);
  const distanceToLiquidation = calculateDistanceToLiquidation(price, liquidationPrice, originalPosition.side);
  const riskLevel = calculateRiskLevel(marginRatio, originalPosition.leverage, distanceToLiquidation);

  return {
    originalPosition,
    addParams,
    newPosition,
    averagePrice: newAveragePrice,
    totalQuantity: newTotalQuantity,
    totalMargin: newTotalMargin,
    liquidationPrice,
    unrealizedPnl,
    roe,
    totalValue,
    marginRatio,
    riskLevel,
    distanceToLiquidation
  };
}

/**
 * 计算增强版的仓位结果（包含风险分析）
 * @param position 仓位信息
 * @param currentPrice 当前价格
 * @returns 增强版计算结果
 */
export function calculateEnhancedPositionResult(
  position: Position,
  currentPrice: number = position.entryPrice
): CalculationResult {
  const basicResult = calculatePositionResult(position, currentPrice);
  const totalValue = calculateTotalValue(position.quantity, currentPrice);
  const marginRatio = calculateMarginRatioOriginal(position.margin, totalValue);
  const distanceToLiquidation = calculateDistanceToLiquidation(
    currentPrice, 
    basicResult.liquidationPrice, 
    position.side
  );
  const riskLevel = calculateRiskLevel(marginRatio, position.leverage, distanceToLiquidation);

  return {
    ...basicResult,
    totalValue,
    marginRatio,
    riskLevel,
    distanceToLiquidation
  };
}
