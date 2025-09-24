/**
 * 盈亏分析计算函数
 */

import { Position, PnlAnalysisResult, RiskLevel } from '../../types';
import { calculatePositionResult } from './positionCalculations';

/**
 * 计算多个仓位的盈亏分析
 * @param positions 仓位数组
 * @param currentPrices 当前价格映射
 * @returns 盈亏分析结果
 */
export function calculatePnlAnalysis(
  positions: Position[],
  currentPrices: Record<string, number> = {}
): PnlAnalysisResult {
  let totalPnl = 0;
  let realizedPnl = 0;
  let unrealizedPnl = 0;
  let totalMargin = 0;
  let winCount = 0;
  let lossCount = 0;
  let totalWin = 0;
  let totalLoss = 0;
  let maxDrawdown = 0;

  positions.forEach(position => {
    const currentPrice = currentPrices[position.symbol] || position.entryPrice;
    const result = calculatePositionResult(position, currentPrice);

    totalMargin += position.margin;

    if (position.status === 'closed') {
      realizedPnl += result.unrealizedPnl;
      if (result.unrealizedPnl > 0) {
        winCount++;
        totalWin += result.unrealizedPnl;
      } else {
        lossCount++;
        totalLoss += Math.abs(result.unrealizedPnl);
      }
    } else {
      unrealizedPnl += result.unrealizedPnl;
    }

    totalPnl += result.unrealizedPnl;

    // 简化的最大回撤计算
    if (result.unrealizedPnl < 0) {
      maxDrawdown = Math.min(maxDrawdown, result.unrealizedPnl);
    }
  });

  const totalTrades = winCount + lossCount;
  const winRate = totalTrades > 0 ? (winCount / totalTrades) * 100 : 0;
  const avgWin = winCount > 0 ? totalWin / winCount : 0;
  const avgLoss = lossCount > 0 ? totalLoss / lossCount : 0;
  const profitFactor = totalLoss > 0 ? totalWin / totalLoss : 0;
  const totalRoe = totalMargin > 0 ? (totalPnl / totalMargin) * 100 : 0;

  return {
    totalPnl,
    realizedPnl,
    unrealizedPnl,
    totalRoe,
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    maxDrawdown: Math.abs(maxDrawdown)
  };
}

/**
 * 计算单个仓位的详细盈亏信息
 * @param position 仓位信息
 * @param currentPrice 当前价格
 * @returns 详细盈亏信息
 */
export function calculateDetailedPnl(position: Position, currentPrice?: number) {
  const result = calculatePositionResult(position, currentPrice);
  const price = currentPrice || position.entryPrice;
  
  return {
    position,
    currentPrice: price,
    unrealizedPnl: result.unrealizedPnl,
    roe: result.roe,
    pnlPercentage: result.roe,
    isProfit: result.unrealizedPnl > 0,
    riskLevel: result.riskLevel,
    liquidationPrice: result.liquidationPrice,
    distanceToLiquidation: result.distanceToLiquidation
  };
}

/**
 * 计算投资组合风险指标
 * @param positions 仓位数组
 * @param currentPrices 当前价格映射
 * @returns 风险指标
 */
export function calculatePortfolioRisk(
  positions: Position[],
  currentPrices: Record<string, number> = {}
) {
  let totalValue = 0;
  let totalMargin = 0;
  let highRiskPositions = 0;
  let leverageWeightedSum = 0;
  
  const positionRisks = positions.map(position => {
    const currentPrice = currentPrices[position.symbol] || position.entryPrice;
    const result = calculatePositionResult(position, currentPrice);
    const positionValue = position.quantity * currentPrice;
    
    totalValue += positionValue;
    totalMargin += position.margin;
    leverageWeightedSum += position.leverage * positionValue;
    
    if (result.riskLevel === RiskLevel.HIGH || result.riskLevel === RiskLevel.EXTREME) {
      highRiskPositions++;
    }
    
    return {
      symbol: position.symbol,
      riskLevel: result.riskLevel,
      leverage: position.leverage,
      marginRatio: result.marginRatio,
      distanceToLiquidation: result.distanceToLiquidation
    };
  });
  
  const avgLeverage = totalValue > 0 ? leverageWeightedSum / totalValue : 0;
  const portfolioMarginRatio = totalValue > 0 ? totalMargin / totalValue : 0;
  const highRiskRatio = positions.length > 0 ? (highRiskPositions / positions.length) * 100 : 0;
  
  return {
    totalValue,
    totalMargin,
    portfolioMarginRatio,
    avgLeverage,
    highRiskPositions,
    highRiskRatio,
    positionCount: positions.length,
    positionRisks
  };
}
