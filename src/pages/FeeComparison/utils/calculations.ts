import { ExchangeFeeConfig, FeeComparisonInput, FeeComparisonResult } from '../types';

/**
 * 计算单个交易所的费用对比结果
 */
export function calculateExchangeFee(
  exchange: ExchangeFeeConfig,
  input: FeeComparisonInput
): FeeComparisonResult {
  // 实际交易金额 = 本金 × 杠杆
  const actualTradeAmount = input.tradeAmount * input.leverage;

  // Maker订单金额
  const makerAmount = actualTradeAmount * (input.makerRatio / 100);
  // Taker订单金额
  const takerAmount = actualTradeAmount * (input.takerRatio / 100);

  // 计算费用
  const makerFee = makerAmount * (exchange.makerFee / 100);
  const takerFee = takerAmount * (exchange.takerFee / 100);
  const totalFee = makerFee + takerFee;

  // 综合费率 = 总费用 / 实际交易金额 * 100
  const feeRate = actualTradeAmount > 0 ? (totalFee / actualTradeAmount) * 100 : 0;

  return {
    exchange,
    makerFee,
    takerFee,
    totalFee,
    actualTradeAmount,
    feeRate,
  };
}

/**
 * 计算多个交易所的费用对比结果
 */
export function calculateAllExchangeFees(
  exchanges: ExchangeFeeConfig[],
  input: FeeComparisonInput
): FeeComparisonResult[] {
  return exchanges.map(exchange => calculateExchangeFee(exchange, input));
}

/**
 * 验证输入参数
 */
export function validateInput(input: Partial<FeeComparisonInput>): string[] {
  const errors: string[] = [];

  if (!input.tradeAmount || input.tradeAmount <= 0) {
    errors.push('交易金额必须大于0');
  }

  if (!input.leverage || input.leverage <= 0) {
    errors.push('杠杆倍数必须大于0');
  }

  if (input.leverage && input.leverage > 125) {
    errors.push('杠杆倍数不能超过125倍');
  }

  const totalRatio = (input.makerRatio || 0) + (input.takerRatio || 0);
  if (totalRatio !== 100) {
    errors.push('Maker和Taker比例之和必须等于100%');
  }

  if (input.makerRatio !== undefined && input.makerRatio < 0) {
    errors.push('Maker比例不能小于0');
  }

  if (input.takerRatio !== undefined && input.takerRatio < 0) {
    errors.push('Taker比例不能小于0');
  }

  return errors;
}

/**
 * 验证自定义费率
 */
export function validateCustomFee(makerFee: string, takerFee: string): string[] {
  const errors: string[] = [];

  const maker = parseFloat(makerFee);
  const taker = parseFloat(takerFee);

  if (!makerFee || isNaN(maker) || maker < 0) {
    errors.push('Maker费率必须是大于等于0的数字');
  }

  if (!takerFee || isNaN(taker) || taker < 0) {
    errors.push('Taker费率必须是大于等于0的数字');
  }

  if (maker > 1) {
    errors.push('Maker费率不能超过1%');
  }

  if (taker > 1) {
    errors.push('Taker费率不能超过1%');
  }

  return errors;
}

