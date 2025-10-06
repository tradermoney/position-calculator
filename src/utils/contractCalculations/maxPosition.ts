import type {
  MaxPositionCalculatorParams,
  MaxPositionCalculatorResult,
} from './types';

/**
 * 计算最大可开仓位
 */
export function calculateMaxPosition(
  params: MaxPositionCalculatorParams,
): MaxPositionCalculatorResult {
  const { leverage, entryPrice, walletBalance } = params;

  const maxPositionValue = walletBalance * leverage;
  const maxQuantity = maxPositionValue / entryPrice;

  return {
    maxQuantity,
    maxPositionValue,
  };
}
