/**
 * 补仓计算相关函数
 */

import { PositionSide, Position, AddPositionParams, AddPositionResult } from '../types/addPosition';

/**
 * 计算平均成本价
 */
export const calculateAveragePrice = (
  originalPrice: number,
  originalQuantity: number,
  addPrice: number,
  addQuantity: number
): number => {
  const totalValue = originalPrice * originalQuantity + addPrice * addQuantity;
  const totalQuantity = originalQuantity + addQuantity;
  return totalQuantity > 0 ? totalValue / totalQuantity : 0;
};

/**
 * 计算爆仓价格
 */
export const calculateLiquidationPrice = (
  side: PositionSide,
  leverage: number,
  averagePrice: number,
  totalMargin: number,
  totalQuantity: number
): number => {
  if (totalQuantity === 0 || totalMargin === 0) return 0;

  const maintenanceMarginRate = 0.005;

  if (side === PositionSide.LONG) {
    return averagePrice * (1 - 1/leverage + maintenanceMarginRate);
  } else {
    return averagePrice * (1 + 1/leverage - maintenanceMarginRate);
  }
};

/**
 * 验证补仓参数
 */
export const validateAddParams = (
  selectedPosition: Position | undefined,
  addParams: AddPositionParams
): string[] => {
  const errors: string[] = [];

  if (!selectedPosition) {
    errors.push('请选择要补仓的仓位');
    return errors;
  }

  if (addParams.addPrice <= 0) {
    errors.push('补仓价格必须大于0');
  }

  if (addParams.addQuantity <= 0) {
    errors.push('补仓数量必须大于0');
  }

  if (addParams.addMargin <= 0) {
    errors.push('补仓保证金必须大于0');
  }

  // 验证补仓方向是否合理
  if (selectedPosition && addParams.addPrice > 0) {
    const isReasonableAddPrice = selectedPosition.side === PositionSide.LONG
      ? addParams.addPrice < selectedPosition.entryPrice  // 多头应该在价格下跌时补仓
      : addParams.addPrice > selectedPosition.entryPrice; // 空头应该在价格上涨时补仓

    if (!isReasonableAddPrice) {
      errors.push(
        selectedPosition.side === PositionSide.LONG
          ? '多头建议在价格低于开仓价时补仓'
          : '空头建议在价格高于开仓价时补仓'
      );
    }
  }

  return errors;
};

/**
 * 计算补仓结果
 */
export const calculateAddPositionResult = (
  selectedPosition: Position,
  addParams: AddPositionParams
): AddPositionResult => {
  const newAveragePrice = calculateAveragePrice(
    selectedPosition.entryPrice,
    selectedPosition.quantity,
    addParams.addPrice,
    addParams.addQuantity
  );

  const newTotalQuantity = selectedPosition.quantity + addParams.addQuantity;
  const newTotalMargin = selectedPosition.margin + addParams.addMargin;

  const newLiquidationPrice = calculateLiquidationPrice(
    selectedPosition.side,
    selectedPosition.leverage,
    newAveragePrice,
    newTotalMargin,
    newTotalQuantity
  );

  const priceImprovement = selectedPosition.side === PositionSide.LONG
    ? ((newAveragePrice - selectedPosition.entryPrice) / selectedPosition.entryPrice) * 100
    : ((selectedPosition.entryPrice - newAveragePrice) / selectedPosition.entryPrice) * 100;

  const marginIncrease = ((newTotalMargin - selectedPosition.margin) / selectedPosition.margin) * 100;

  return {
    originalPosition: selectedPosition,
    addParams,
    newAveragePrice,
    newTotalQuantity,
    newTotalMargin,
    newLiquidationPrice,
    priceImprovement,
    marginIncrease,
  };
};
