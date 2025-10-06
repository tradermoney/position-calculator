import type {
  EntryPriceCalculatorParams,
  EntryPriceCalculatorResult,
} from './types';

/**
 * 计算平均开仓价格
 */
export function calculateEntryPrice(
  params: EntryPriceCalculatorParams,
): EntryPriceCalculatorResult {
  const { positions } = params;

  if (positions.length === 0) {
    return {
      averageEntryPrice: 0,
      totalQuantity: 0,
      totalValue: 0,
    };
  }

  let totalValue = 0;
  let totalQuantity = 0;

  for (const position of positions) {
    totalValue += position.price * position.quantity;
    totalQuantity += position.quantity;
  }

  const averageEntryPrice = totalQuantity > 0 ? totalValue / totalQuantity : 0;

  return {
    averageEntryPrice,
    totalQuantity,
    totalValue,
  };
}
