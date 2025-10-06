import { VolatilityResult, ReverseCalculationResult, InvestmentVolatility } from '../types';
import { validateForwardInputs, validateReverseInputs } from './validation';

// 计算投资金额波动
const calculateInvestmentVolatility = (
  investmentAmount: string,
  volatility: number
): InvestmentVolatility | undefined => {
  if (!investmentAmount || parseFloat(investmentAmount) <= 0) {
    return undefined;
  }

  const amount = parseFloat(investmentAmount);
  const volatilityAmount = (amount * volatility) / 100;
  const upperBound = amount + volatilityAmount;
  const lowerBound = amount - volatilityAmount;

  return {
    amount,
    volatilityAmount,
    upperBound,
    lowerBound
  };
};

// 计算波动率（正向计算）
export const calculateVolatility = (
  price1: string,
  price2: string,
  investmentAmount: string
): VolatilityResult | null => {
  const validationErrors = validateForwardInputs(price1, price2);
  if (validationErrors.length > 0) {
    return null;
  }

  const p1 = parseFloat(price1);
  const p2 = parseFloat(price2);

  // 计算差值和符号（目标价格 - 起始价格）
  const difference = p2 - p1;
  const sign: '+' | '-' = difference >= 0 ? '+' : '-';

  // 计算波动率：|目标价格-起始价格|/max(起始价格,目标价格)*100
  const maxPrice = Math.max(p1, p2);
  const volatility = (Math.abs(difference) / maxPrice) * 100;

  // 生成计算公式
  const formula = `|${p2} - ${p1}| / max(${p1}, ${p2}) × 100 = ${Math.abs(difference).toFixed(4)} / ${maxPrice} × 100`;

  // 计算投资金额波动
  const investmentVolatility = calculateInvestmentVolatility(investmentAmount, volatility);

  return {
    volatility,
    sign,
    difference: Math.abs(difference),
    maxPrice,
    formula,
    investmentVolatility
  };
};

// 计算目标价格（反向计算）
export const calculateTargetPrice = (
  price1: string,
  volatilityInput: string,
  investmentAmount: string
): ReverseCalculationResult | null => {
  const validationErrors = validateReverseInputs(price1, volatilityInput);
  if (validationErrors.length > 0) {
    return null;
  }

  const p1 = parseFloat(price1);
  const vol = parseFloat(volatilityInput);

  // 反向计算公式推导：
  // 波动率 = |目标价格 - 起始价格| / max(起始价格, 目标价格) * 100
  // 设目标价格为 p2，则：
  // vol/100 = |p2 - p1| / max(p1, p2)

  // 分两种情况：
  // 1. 如果 p2 > p1，则 max(p1, p2) = p2，公式变为：vol/100 = (p2 - p1) / p2
  //    解得：p2 = p1 / (1 - vol/100)
  // 2. 如果 p2 < p1，则 max(p1, p2) = p1，公式变为：vol/100 = (p1 - p2) / p1
  //    解得：p2 = p1 * (1 - vol/100)

  // 计算两种可能的目标价格
  const targetPriceUp = p1 / (1 - vol / 100);   // 上涨情况
  const targetPriceDown = p1 * (1 - vol / 100); // 下跌情况

  // 默认选择上涨情况，用户可以通过符号选择器来切换
  const targetPrice = targetPriceUp;
  const difference = Math.abs(targetPrice - p1);
  const sign: '+' | '-' = targetPrice >= p1 ? '+' : '-';

  // 生成计算公式
  const formula = `${p1} / (1 - ${vol}/100) = ${p1} / ${(1 - vol/100).toFixed(4)} = ${targetPrice.toFixed(4)}`;

  // 计算价格波动范围：起始价格的上下波动范围
  // 上限：起始价格上涨 vol%
  // 下限：起始价格下跌 vol%
  const priceRange = {
    upperPrice: targetPriceUp,    // 上涨到的价格
    lowerPrice: targetPriceDown,  // 下跌到的价格
    startPrice: p1                // 起始价格
  };

  // 计算投资金额波动
  const investmentVolatility = calculateInvestmentVolatility(investmentAmount, vol);

  return {
    targetPrice,
    volatility: vol,
    sign,
    difference,
    formula,
    priceRange,
    investmentVolatility
  };
};
