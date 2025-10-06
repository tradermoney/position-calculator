import { PositionSide, PyramidStrategy } from './enums';
import { CalculationResult } from './results';

/**
 * 金子塔加仓相关类型
 */
export interface PyramidOrderParams {
  symbol: string;
  side: PositionSide;
  leverage: number;
  initialPrice: number;
  initialQuantity: number;
  initialMargin: number;
  addTimes: number;
  strategy: PyramidStrategy;
  priceStep: number;
  maxTotalMargin?: number;
  minPriceGap?: number;
  customRatios?: number[];
  stopLoss?: number;
  takeProfit?: number;
  notes?: string;
}

export interface PyramidStep {
  step: number;
  price: number;
  quantity: number;
  margin: number;
  cumulativeQuantity: number;
  cumulativeMargin: number;
  averagePrice: number;
  liquidationPrice: number;
}

export interface PyramidOrderResult {
  params: PyramidOrderParams;
  steps: PyramidStep[];
  finalResult: CalculationResult;
}
