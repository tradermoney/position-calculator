import { Exchange, OrderType, PositionSide, PositionStatus, RiskLevel } from './enums';

/**
 * 仓位及仓位操作相关类型
 */
export interface Position {
  id: string;
  symbol: string;
  side: PositionSide;
  leverage: number;
  entryPrice: number;
  quantity: number;
  margin: number;
  status: PositionStatus;
  exchange?: Exchange;
  riskLevel?: RiskLevel;
  stopLoss?: number;
  takeProfit?: number;
  notes?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

export interface AddPositionParams {
  positionId: string;
  addPrice: number;
  addQuantity: number;
  addMargin: number;
  orderType?: OrderType;
  notes?: string;
}

export interface ClosePositionParams {
  positionId: string;
  closePrice: number;
  closeQuantity: number;
  orderType?: OrderType;
  reason?: string;
  notes?: string;
}

export interface StopLossTakeProfitParams {
  positionId: string;
  stopLoss?: number;
  takeProfit?: number;
  trailingStop?: number;
}
