import { PositionSide } from './types';
import type {
  TargetPriceCalculatorParams,
  TargetPriceCalculatorResult,
} from './types';

/**
 * 目标价格计算器
 */
export function calculateTargetPrice(
  params: TargetPriceCalculatorParams,
): TargetPriceCalculatorResult {
  const { side, entryPrice, targetROE, leverage = 1 } = params;

  const adjustment = targetROE / leverage / 100;
  const targetPrice = side === PositionSide.LONG
    ? entryPrice * (1 + adjustment)
    : entryPrice * (1 - adjustment);

  return { targetPrice };
}
