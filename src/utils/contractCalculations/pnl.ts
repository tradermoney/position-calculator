import { PositionSide } from './types';
import type {
  ExitOrderResult,
  PnLCalculatorParams,
  PnLCalculatorResult,
} from './types';

/**
 * 盈亏计算器 - 支持多次分批平仓
 */
export function calculatePnL(params: PnLCalculatorParams): PnLCalculatorResult {
  const { side, leverage, entryPrice, exitPrice, quantity, exitOrders } = params;

  const positionValue = entryPrice * quantity;
  const initialMargin = positionValue / leverage;

  if (exitOrders && exitOrders.length > 0) {
    return calculateMultipleExitPnL(params, initialMargin, positionValue);
  }

  const pnl = side === PositionSide.LONG
    ? (exitPrice - entryPrice) * quantity
    : (entryPrice - exitPrice) * quantity;

  const roe = (pnl / initialMargin) * 100;

  return {
    initialMargin,
    pnl,
    roe,
    positionValue,
    totalExitQuantity: quantity,
    remainingQuantity: 0,
  };
}

function calculateMultipleExitPnL(
  params: PnLCalculatorParams,
  initialMargin: number,
  positionValue: number,
): PnLCalculatorResult {
  const { side, leverage, entryPrice, quantity, exitOrders = [] } = params;

  const enabledOrders = exitOrders.filter(order => order.enabled);

  let totalPnl = 0;
  let totalExitQuantity = 0;
  const exitOrderResults: ExitOrderResult[] = [];

  for (const order of enabledOrders) {
    const actualQuantity = Math.min(order.quantity, quantity - totalExitQuantity);

    if (actualQuantity <= 0) {
      continue;
    }

    const orderPnl = side === PositionSide.LONG
      ? (order.price - entryPrice) * actualQuantity
      : (entryPrice - order.price) * actualQuantity;

    const orderMargin = (entryPrice * actualQuantity) / leverage;
    const orderRoe = orderMargin > 0 ? (orderPnl / orderMargin) * 100 : 0;

    totalPnl += orderPnl;
    totalExitQuantity += actualQuantity;

    exitOrderResults.push({
      id: order.id,
      price: order.price,
      quantity: actualQuantity,
      pnl: orderPnl,
      roe: orderRoe,
      margin: orderMargin,
    });
  }

  const totalRoe = initialMargin > 0 ? (totalPnl / initialMargin) * 100 : 0;
  const remainingQuantity = quantity - totalExitQuantity;

  return {
    initialMargin,
    pnl: totalPnl,
    roe: totalRoe,
    positionValue,
    exitOrderResults,
    totalExitQuantity,
    remainingQuantity,
  };
}
