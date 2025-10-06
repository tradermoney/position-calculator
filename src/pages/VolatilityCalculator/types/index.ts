import { VolatilityRecord as StoredVolatilityRecord } from '../../../utils/indexedDBStorage';

// 使用存储模块中的接口
export type VolatilityRecord = StoredVolatilityRecord;

// 计算模式枚举
export enum CalculationMode {
  FORWARD = 'forward',   // 正向计算：起始价格 + 目标价格 → 波动率
  REVERSE = 'reverse'    // 反向计算：起始价格 + 波动率 → 目标价格
}

// 投资金额波动计算结果
export interface InvestmentVolatility {
  amount: number;
  volatilityAmount: number;
  upperBound: number;
  lowerBound: number;
}

// 波动率计算结果接口
export interface VolatilityResult {
  volatility: number;
  sign: '+' | '-';
  difference: number;
  maxPrice: number;
  formula: string;
  investmentVolatility?: InvestmentVolatility;
}

// 价格波动范围接口
export interface PriceVolatilityRange {
  upperPrice: number;  // 上限价格
  lowerPrice: number;  // 下限价格
  startPrice: number;  // 起始价格
}

// 反向计算结果接口
export interface ReverseCalculationResult {
  targetPrice: number;
  volatility: number;
  sign: '+' | '-';
  difference: number;
  formula: string;
  priceRange: PriceVolatilityRange;  // 价格波动范围
  investmentVolatility?: InvestmentVolatility;
}
