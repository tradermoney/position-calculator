/**
 * 资金费率计算器类型定义
 */

export interface FundingRateData {
  symbol: string;
  fundingRate: string;
  fundingTime: number;
  markPrice?: string;
}

export interface PositionData {
  side: 'long' | 'short';
  size: number;
}

export interface CalculationResult {
  totalCost: number;
  longCost: number;
  shortCost: number;
  netCost: number;
  periods: number;
  avgRate: number;
  avgRate7d: number;
  currentRate: number;
}

