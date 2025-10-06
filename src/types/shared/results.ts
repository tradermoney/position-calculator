import { RiskLevel } from './enums';
import { AddPositionParams, Position } from './positions';

/**
 * 合约计算相关结果类型
 */
export interface CalculationResult {
  averagePrice: number;
  totalQuantity: number;
  totalMargin: number;
  liquidationPrice: number;
  unrealizedPnl: number;
  roe: number;
  totalValue: number;
  marginRatio: number;
  riskLevel: RiskLevel;
  distanceToLiquidation: number;
}

export interface RiskAnalysisResult {
  riskLevel: RiskLevel;
  riskScore: number;
  marginRatio: number;
  leverageRisk: number;
  concentrationRisk: number;
  liquidationDistance: number;
  recommendations: string[];
}

export interface PnlAnalysisResult {
  totalPnl: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalRoe: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  profitFactor: number;
  maxDrawdown: number;
}

export interface AddPositionResult extends CalculationResult {
  originalPosition: Position;
  addParams: AddPositionParams;
  newPosition: Position;
}
