/**
 * 风险分析计算函数
 */

import { Position, RiskLevel, RiskAnalysisResult } from '../../types';
import { 
  calculateTotalValue, 
  calculateMarginRatioOriginal, 
  calculateLiquidationPriceOriginal, 
  calculateDistanceToLiquidation 
} from './basicCalculations';

/**
 * 计算风险等级
 * @param marginRatio 保证金率
 * @param leverage 杠杆倍数
 * @param distanceToLiquidation 距离爆仓的距离百分比
 * @returns 风险等级
 */
export function calculateRiskLevel(
  marginRatio: number,
  leverage: number,
  distanceToLiquidation: number
): RiskLevel {
  // 计算风险评分
  const riskScore = calculateRiskScore(marginRatio, leverage, distanceToLiquidation);

  if (riskScore < 25) return RiskLevel.LOW;
  if (riskScore < 50) return RiskLevel.MEDIUM;
  if (riskScore < 75) return RiskLevel.HIGH;
  return RiskLevel.EXTREME;
}

/**
 * 计算风险评分
 * @param marginRatio 保证金率
 * @param leverage 杠杆倍数
 * @param distanceToLiquidation 距离爆仓的距离百分比
 * @returns 风险评分 (0-100)
 */
export function calculateRiskScore(
  marginRatio: number,
  leverage: number,
  distanceToLiquidation: number
): number {
  // 杠杆风险 (0-40分)
  const leverageRisk = Math.min((leverage / 125) * 40, 40);

  // 保证金率风险 (0-30分)
  const marginRisk = Math.max(0, (1 - marginRatio) * 30);

  // 爆仓距离风险 (0-30分)
  const liquidationRisk = Math.max(0, (1 - distanceToLiquidation / 100) * 30);

  return Math.min(leverageRisk + marginRisk + liquidationRisk, 100);
}

/**
 * 进行风险分析
 * @param position 仓位信息
 * @param currentPrice 当前价格
 * @returns 风险分析结果
 */
export function performRiskAnalysis(
  position: Position,
  currentPrice: number = position.entryPrice
): RiskAnalysisResult {
  const totalValue = calculateTotalValue(position.quantity, currentPrice);
  const marginRatio = calculateMarginRatioOriginal(position.margin, totalValue);
  const liquidationPrice = calculateLiquidationPriceOriginal(
    position.side,
    position.leverage,
    position.entryPrice,
    position.margin,
    position.quantity
  );
  const distanceToLiquidation = calculateDistanceToLiquidation(
    currentPrice,
    liquidationPrice,
    position.side
  );

  const riskScore = calculateRiskScore(marginRatio, position.leverage, distanceToLiquidation);
  const riskLevel = calculateRiskLevel(marginRatio, position.leverage, distanceToLiquidation);

  // 计算各项风险评分
  const leverageRisk = Math.min((position.leverage / 125) * 100, 100);
  const concentrationRisk = 50; // 简化处理，实际应该根据仓位集中度计算

  // 生成风险建议
  const recommendations: string[] = [];
  if (riskLevel === RiskLevel.HIGH || riskLevel === RiskLevel.EXTREME) {
    recommendations.push('建议降低杠杆倍数');
    recommendations.push('考虑设置止损价格');
  }
  if (distanceToLiquidation < 10) {
    recommendations.push('距离爆仓价格过近，建议增加保证金');
  }
  if (position.leverage > 20) {
    recommendations.push('杠杆倍数较高，注意风险控制');
  }

  return {
    riskLevel,
    riskScore,
    marginRatio,
    leverageRisk,
    concentrationRisk,
    liquidationDistance: distanceToLiquidation,
    recommendations
  };
}
