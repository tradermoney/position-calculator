import { MarginMode, PositionSide } from './types';
import type {
  LiquidationPriceCalculatorParams,
  LiquidationPriceCalculatorResult,
} from './types';

/**
 * 强平价格计算
 */
export function calculateLiquidationPrice(
  params: LiquidationPriceCalculatorParams,
): LiquidationPriceCalculatorResult {
  const {
    side,
    marginMode,
    leverage,
    entryPrice,
    quantity,
    walletBalance,
    maintenanceMarginRate = 0.0065,
  } = params;

  const positionValue = entryPrice * quantity;
  const initialMargin = positionValue / leverage;
  const maintenanceMargin = positionValue * maintenanceMarginRate;

  let liquidationPrice: number;

  if (marginMode === MarginMode.CROSS) {
    const availableBalance = walletBalance - initialMargin;

    const ratio = (availableBalance - maintenanceMargin) / positionValue;
    liquidationPrice = side === PositionSide.LONG
      ? entryPrice * (1 - ratio)
      : entryPrice * (1 + ratio);
  } else {
    const adjustment = (initialMargin - maintenanceMargin) / quantity;
    liquidationPrice = side === PositionSide.LONG
      ? entryPrice - adjustment
      : entryPrice + adjustment;
  }

  return {
    liquidationPrice: Math.max(0, liquidationPrice),
  };
}
