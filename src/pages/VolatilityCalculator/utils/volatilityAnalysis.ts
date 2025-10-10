/**
 * 波动率分析和建议工具函数
 * 从VolatilityStatsCard.tsx拆分出来
 */

import type { VolatilityResult } from '../../../services/binance';
import type { ExtraVolatilityStats } from './volatilityStats';

/**
 * 波动率水平判断结果
 */
export interface VolatilityLevel {
  level: string;
  color: string;
  icon: string;
}

/**
 * 风险等级结果
 */
export interface RiskLevel {
  level: string;
  color: 'error' | 'warning' | 'info' | 'success';
  icon: string;
}

/**
 * 判断波动率水平
 */
export function getVolatilityLevel(value: number): VolatilityLevel {
  if (value < 0.5) {
    return { level: '极低', color: '#4caf50', icon: 'TrendingDown' };
  } else if (value < 1) {
    return { level: '低', color: '#8bc34a', icon: 'TrendingDown' };
  } else if (value < 2) {
    return { level: '中等', color: '#ff9800', icon: 'ShowChart' };
  } else if (value < 3) {
    return { level: '高', color: '#ff5722', icon: 'TrendingUp' };
  } else {
    return { level: '极高', color: '#f44336', icon: 'TrendingUp' };
  }
}

/**
 * 获取风险等级
 */
export function getRiskLevel(average: number): RiskLevel {
  if (average >= 3) {
    return { level: '极高风险', color: 'error', icon: 'PriorityHigh' };
  } else if (average >= 2) {
    return { level: '高风险', color: 'warning', icon: 'Warning' };
  } else if (average >= 1) {
    return { level: '中等风险', color: 'info', icon: 'ShowChart' };
  } else {
    return { level: '低风险', color: 'success', icon: 'CheckCircle' };
  }
}

/**
 * 生成波动率分析结论
 */
export function getAnalysis(
  volatility: VolatilityResult,
  extraStats: ExtraVolatilityStats
): string {
  const avg = volatility.average;
  
  if (avg < 0.5) {
    return `市场波动极小（平均${avg.toFixed(2)}%），价格相对稳定。${extraStats.stableRatio > 60 ? '超过60%的时间段价格稳定，' : ''}适合网格交易、做市策略或低风险套利。建议使用小止损间距，捕捉小幅波动利润。`;
  } else if (avg < 1) {
    return `市场波动较小（平均${avg.toFixed(2)}%），价格变化温和。${extraStats.stableRatio > 50 ? '市场较为稳定，' : ''}适合稳健型交易策略、趋势跟踪或震荡区间交易。可以适度使用杠杆，建议3-5倍。`;
  } else if (avg < 2) {
    return `市场波动适中（平均${avg.toFixed(2)}%），存在较好的交易机会。${extraStats.highVolRatio > 20 ? '存在较多高波动时段，' : ''}适合日内交易和波段操作。建议合理控制仓位（单次不超过30%），设置动态止损。`;
  } else if (avg < 3) {
    return `市场波动较大（平均${avg.toFixed(2)}%），价格变化剧烈。${extraStats.highVolRatio > 30 ? '高波动时段占比超过30%，' : ''}风险显著增加。建议降低仓位（单次不超过20%），严格止损，避免重仓和高杠杆。`;
  } else {
    return `市场波动极大（平均${avg.toFixed(2)}%），风险很高。${extraStats.highVolRatio > 40 ? '高波动时段频繁出现，' : ''}建议降低杠杆至1-2倍或观望为主，仓位控制在10%以内，设置紧密止损。不建议新手操作。`;
  }
}

/**
 * 获取止损建议
 */
export function getStopLossAdvice(average: number): string {
  if (average < 0.5) {
    return `建议止损幅度：0.3-0.5%（约${(average * 0.8).toFixed(2)}-${average.toFixed(2)}%）`;
  } else if (average < 1) {
    return `建议止损幅度：0.5-1%（约${(average * 0.8).toFixed(2)}-${(average * 1.2).toFixed(2)}%）`;
  } else if (average < 2) {
    return `建议止损幅度：1-2%（约${average.toFixed(2)}-${(average * 1.5).toFixed(2)}%）`;
  } else if (average < 3) {
    return `建议止损幅度：2-3%（约${(average * 0.8).toFixed(2)}-${(average * 1.2).toFixed(2)}%）`;
  } else {
    return `建议止损幅度：3-5%（约${average.toFixed(2)}-${(average * 1.5).toFixed(2)}%）`;
  }
}

/**
 * 获取杠杆建议
 */
export function getLeverageAdvice(average: number): string {
  if (average < 0.5) return '5-10倍';
  if (average < 1) return '3-5倍';
  if (average < 2) return '2-3倍';
  if (average < 3) return '1-2倍';
  return '1倍或现货';
}

/**
 * 获取仓位建议
 */
export function getPositionAdvice(average: number): string {
  if (average < 0.5) return '30-50%';
  if (average < 1) return '20-30%';
  if (average < 2) return '10-20%';
  if (average < 3) return '5-10%';
  return '≤5%';
}

/**
 * 获取持仓时长建议
 */
export function getHoldingPeriodAdvice(average: number): string {
  if (average < 1) return '数天-数周';
  if (average < 2) return '数小时-1天';
  if (average < 3) return '分钟-小时';
  return '快进快出';
}

