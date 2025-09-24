/**
 * 金字塔加仓相关类型定义
 */

export enum PositionSide {
  LONG = 'long',
  SHORT = 'short'
}

export enum PyramidStrategy {
  EQUAL_RATIO = 'equal_ratio',    // 等比加仓
  DOUBLE_DOWN = 'double_down'     // 加倍加仓
}

export interface PyramidParams {
  symbol: string;
  side: PositionSide;
  leverage: number | '';
  initialPrice: number | '';
  initialQuantity: number | '';
  initialMargin: number | '';
  pyramidLevels: number | '';
  strategy: PyramidStrategy;
  priceDropPercent: number | '';  // 每次加仓的价格下跌百分比
  ratioMultiplier: number | '';   // 等比加仓的倍数
}

export interface PyramidLevel {
  level: number;
  price: number;
  quantity: number;
  margin: number;
  cumulativeQuantity: number;
  cumulativeMargin: number;
  averagePrice: number;
  liquidationPrice: number;
  priceDropFromPrevious: number;
}

export interface PyramidResult {
  params: PyramidParams;
  levels: PyramidLevel[];
  totalQuantity: number;
  totalMargin: number;
  finalAveragePrice: number;
  finalLiquidationPrice: number;
  maxDrawdown: number;
}

export interface NumericPyramidParams {
  symbol: string;
  side: PositionSide;
  leverage: number;
  initialPrice: number;
  initialQuantity: number;
  initialMargin: number;
  pyramidLevels: number;
  strategy: PyramidStrategy;
  priceDropPercent: number;
  ratioMultiplier: number;
}
