/**
 * 补仓计算器相关类型定义
 */

export enum PositionSide {
  LONG = 'long',
  SHORT = 'short'
}

export enum PositionStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  LIQUIDATED = 'liquidated',
  PARTIAL = 'partial'
}

export interface Position {
  id: string;
  symbol: string;
  side: PositionSide;
  leverage: number;
  entryPrice: number;
  quantity: number;
  margin: number;
  status: PositionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ManualPositionInputs {
  symbol: string;
  side: PositionSide;
  leverage: number | '';
  entryPrice: number | '';
  quantity: number | '';
  margin: number | '';
}

export interface AddPositionParams {
  addPrice: number;
  addQuantity: number;
  addMargin: number;
}

export interface AddPositionResult {
  originalPosition: Position;
  addParams: AddPositionParams;
  newAveragePrice: number;
  newTotalQuantity: number;
  newTotalMargin: number;
  newLiquidationPrice: number;
  priceImprovement: number;
  marginIncrease: number;
}
