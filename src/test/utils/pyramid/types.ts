// 金字塔加仓计算逻辑类型定义
export interface PyramidLayer {
  level: number;
  price: number;
  quantity: number;
  margin: number;
  cumulativeQuantity: number;
  cumulativeMargin: number;
  averagePrice: number;
  liquidationPrice: number;
  priceChange: number;
}

export interface PyramidParams {
  symbol: string;
  side: 'long' | 'short';
  leverage: number;
  initialPrice: number;
  initialQuantity: number;
  initialMargin: number;
  layers: number;
  strategy: 'geometric' | 'double_down';
  priceChangePercent: number;
  geometricMultiplier?: number;
}

export interface PyramidResult {
  layers: PyramidLayer[];
  totalQuantity: number;
  totalMargin: number;
  finalAveragePrice: number;
  finalLiquidationPrice: number;
  maxDrawdown: number;
}
