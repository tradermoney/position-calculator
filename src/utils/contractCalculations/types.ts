/**
 * 合约计算器通用类型定义
 */

export enum PositionSide {
  LONG = 'long',
  SHORT = 'short'
}

export enum MarginMode {
  CROSS = 'cross',
  ISOLATED = 'isolated'
}

export enum PositionMode {
  ONE_WAY = 'one_way',
  HEDGE = 'hedge'
}

export interface ExitOrder {
  id: string;
  price: number;
  quantity: number;
  enabled: boolean;
}

export interface ExitOrderResult {
  id: string;
  price: number;
  quantity: number;
  pnl: number;
  roe: number;
  margin: number;
}

export interface PnLCalculatorParams {
  side: PositionSide;
  leverage: number;
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  quantityUsdt?: number;
  exitOrders?: ExitOrder[];
}

export interface PnLCalculatorResult {
  initialMargin: number;
  pnl: number;
  roe: number;
  positionValue: number;
  exitOrderResults?: ExitOrderResult[];
  totalExitQuantity: number;
  remainingQuantity: number;
}

export interface TargetPriceCalculatorParams {
  side: PositionSide;
  entryPrice: number;
  targetROE: number;
  leverage?: number;
}

export interface TargetPriceCalculatorResult {
  targetPrice: number;
}

export interface LiquidationPriceCalculatorParams {
  side: PositionSide;
  marginMode: MarginMode;
  positionMode: PositionMode;
  leverage: number;
  entryPrice: number;
  quantity: number;
  walletBalance: number;
  maintenanceMarginRate?: number;
}

export interface LiquidationPriceCalculatorResult {
  liquidationPrice: number;
}

export interface MaxPositionCalculatorParams {
  side: PositionSide;
  leverage: number;
  entryPrice: number;
  walletBalance: number;
}

export interface MaxPositionCalculatorResult {
  maxQuantity: number;
  maxPositionValue: number;
}

export interface EntryPriceCalculatorParams {
  positions: Array<{
    price: number;
    quantity: number;
  }>;
}

export interface EntryPriceCalculatorResult {
  averageEntryPrice: number;
  totalQuantity: number;
  totalValue: number;
}
