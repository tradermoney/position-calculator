/**
 * 金字塔加仓计算函数
 */

import { PyramidOrderParams, PyramidOrderResult, PyramidStep, CalculationResult, PositionSide, PyramidStrategy } from '../../types';
import { 
  calculateLiquidationPriceOriginal, 
  calculateMarginRatioOriginal, 
  calculateDistanceToLiquidation 
} from './basicCalculations';
import { calculateRiskLevel } from './riskAnalysis';

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
    liquidationPrice: calculateLiquidationPriceOriginal(
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
    const liquidationPrice = calculateLiquidationPriceOriginal(
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
  const totalValue = finalStep.cumulativeQuantity * finalStep.averagePrice;
  const marginRatio = calculateMarginRatioOriginal(finalStep.cumulativeMargin, totalValue);
  const distanceToLiquidation = calculateDistanceToLiquidation(finalStep.averagePrice, finalStep.liquidationPrice, params.side);
  const riskLevel = calculateRiskLevel(marginRatio, params.leverage, distanceToLiquidation);

  const finalResult: CalculationResult = {
    averagePrice: finalStep.averagePrice,
    totalQuantity: finalStep.cumulativeQuantity,
    totalMargin: finalStep.cumulativeMargin,
    liquidationPrice: finalStep.liquidationPrice,
    unrealizedPnl: 0, // 初始状态下未实现盈亏为0
    roe: 0,
    totalValue,
    marginRatio,
    riskLevel,
    distanceToLiquidation
  };
  
  return {
    params,
    steps,
    finalResult
  };
}
