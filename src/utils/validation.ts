import {
  Position,
  PositionSide,
  AddPositionParams,
  PyramidOrderParams,
  PyramidStrategy,
  ValidationError,
  CONSTANTS
} from '../types';

/**
 * 验证仓位数据
 * @param position 仓位数据
 * @returns 验证错误数组
 */
export function validatePosition(position: Partial<Position>): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // 币种符号验证
  if (!position.symbol || position.symbol.trim() === '') {
    errors.push({ field: 'symbol', message: '币种符号不能为空' });
  } else if (!/^[A-Z]+\/[A-Z]+$/.test(position.symbol.toUpperCase())) {
    errors.push({ field: 'symbol', message: '币种符号格式不正确，应为 BTC/USDT 格式' });
  }
  
  // 仓位方向验证
  if (!position.side || !Object.values(PositionSide).includes(position.side)) {
    errors.push({ field: 'side', message: '请选择有效的仓位方向' });
  }
  
  // 杠杆倍数验证
  if (!position.leverage || position.leverage < CONSTANTS.MIN_LEVERAGE || position.leverage > CONSTANTS.MAX_LEVERAGE) {
    errors.push({ 
      field: 'leverage', 
      message: `杠杆倍数必须在${CONSTANTS.MIN_LEVERAGE}-${CONSTANTS.MAX_LEVERAGE}之间` 
    });
  }
  
  // 开仓价格验证
  if (!position.entryPrice || position.entryPrice < CONSTANTS.MIN_PRICE || position.entryPrice > CONSTANTS.MAX_PRICE) {
    errors.push({ 
      field: 'entryPrice', 
      message: `开仓价格必须在${CONSTANTS.MIN_PRICE}-${CONSTANTS.MAX_PRICE}之间` 
    });
  }
  
  // 持有数量验证
  if (!position.quantity || position.quantity < CONSTANTS.MIN_QUANTITY || position.quantity > CONSTANTS.MAX_QUANTITY) {
    errors.push({ 
      field: 'quantity', 
      message: `持有数量必须在${CONSTANTS.MIN_QUANTITY}-${CONSTANTS.MAX_QUANTITY}之间` 
    });
  }
  
  // 保证金验证
  if (!position.margin || position.margin <= 0) {
    errors.push({ field: 'margin', message: '保证金必须大于0' });
  }
  
  // 止损价格验证（如果设置）
  if (position.stopLoss !== undefined && position.stopLoss !== null) {
    if (position.stopLoss <= 0) {
      errors.push({ field: 'stopLoss', message: '止损价格必须大于0' });
    } else if (position.entryPrice && position.side) {
      const isValidStopLoss = position.side === PositionSide.LONG 
        ? position.stopLoss < position.entryPrice
        : position.stopLoss > position.entryPrice;
      
      if (!isValidStopLoss) {
        errors.push({ 
          field: 'stopLoss', 
          message: position.side === PositionSide.LONG 
            ? '多头止损价格应低于开仓价格' 
            : '空头止损价格应高于开仓价格'
        });
      }
    }
  }
  
  // 止盈价格验证（如果设置）
  if (position.takeProfit !== undefined && position.takeProfit !== null) {
    if (position.takeProfit <= 0) {
      errors.push({ field: 'takeProfit', message: '止盈价格必须大于0' });
    } else if (position.entryPrice && position.side) {
      const isValidTakeProfit = position.side === PositionSide.LONG 
        ? position.takeProfit > position.entryPrice
        : position.takeProfit < position.entryPrice;
      
      if (!isValidTakeProfit) {
        errors.push({ 
          field: 'takeProfit', 
          message: position.side === PositionSide.LONG 
            ? '多头止盈价格应高于开仓价格' 
            : '空头止盈价格应低于开仓价格'
        });
      }
    }
  }
  
  return errors;
}

/**
 * 验证补仓参数
 * @param params 补仓参数
 * @param originalPosition 原始仓位
 * @returns 验证错误数组
 */
export function validateAddPositionParams(
  params: AddPositionParams,
  originalPosition?: Position
): ValidationError[] {
  const errors: ValidationError[] = [];
  
  if (!params.positionId || params.positionId.trim() === '') {
    errors.push({ field: 'positionId', message: '仓位ID不能为空' });
  }
  
  if (!params.addPrice || params.addPrice <= 0) {
    errors.push({ field: 'addPrice', message: '补仓价格必须大于0' });
  }
  
  if (!params.addQuantity || params.addQuantity <= 0) {
    errors.push({ field: 'addQuantity', message: '补仓数量必须大于0' });
  }
  
  if (!params.addMargin || params.addMargin <= 0) {
    errors.push({ field: 'addMargin', message: '补仓保证金必须大于0' });
  }
  
  // 如果有原始仓位信息，进行更详细的验证
  if (originalPosition) {
    // 验证补仓方向是否合理
    const isReasonableAddPrice = originalPosition.side === PositionSide.LONG
      ? params.addPrice < originalPosition.entryPrice  // 多头应该在价格下跌时补仓
      : params.addPrice > originalPosition.entryPrice; // 空头应该在价格上涨时补仓
    
    if (!isReasonableAddPrice) {
      errors.push({
        field: 'addPrice',
        message: originalPosition.side === PositionSide.LONG
          ? '多头建议在价格低于开仓价时补仓'
          : '空头建议在价格高于开仓价时补仓'
      });
    }
  }
  
  return errors;
}

/**
 * 验证金字塔加仓参数
 * @param params 金字塔加仓参数
 * @returns 验证错误数组
 */
export function validatePyramidOrderParams(params: PyramidOrderParams): ValidationError[] {
  const errors: ValidationError[] = [];
  
  // 基础字段验证
  if (!params.symbol || params.symbol.trim() === '') {
    errors.push({ field: 'symbol', message: '币种符号不能为空' });
  }
  
  if (!params.side || !Object.values(PositionSide).includes(params.side)) {
    errors.push({ field: 'side', message: '请选择有效的仓位方向' });
  }
  
  if (!params.leverage || params.leverage < 1 || params.leverage > 125) {
    errors.push({ field: 'leverage', message: '杠杆倍数必须在1-125之间' });
  }
  
  if (!params.initialPrice || params.initialPrice <= 0) {
    errors.push({ field: 'initialPrice', message: '初始价格必须大于0' });
  }
  
  if (!params.initialQuantity || params.initialQuantity <= 0) {
    errors.push({ field: 'initialQuantity', message: '初始数量必须大于0' });
  }
  
  if (!params.initialMargin || params.initialMargin <= 0) {
    errors.push({ field: 'initialMargin', message: '初始保证金必须大于0' });
  }
  
  if (!params.addTimes || params.addTimes < 1 || params.addTimes > 10) {
    errors.push({ field: 'addTimes', message: '加仓次数必须在1-10之间' });
  }
  
  if (!params.strategy || !Object.values(PyramidStrategy).includes(params.strategy)) {
    errors.push({ field: 'strategy', message: '请选择有效的加仓策略' });
  }
  
  if (!params.priceStep || params.priceStep <= 0 || params.priceStep > 50) {
    errors.push({ field: 'priceStep', message: '价格步长必须在0-50%之间' });
  }
  
  // 自定义策略验证
  if (params.strategy === PyramidStrategy.CUSTOM) {
    if (!params.customRatios || params.customRatios.length !== params.addTimes) {
      errors.push({ 
        field: 'customRatios', 
        message: '自定义比例数量必须与加仓次数一致' 
      });
    } else {
      const hasInvalidRatio = params.customRatios.some(ratio => ratio <= 0 || ratio > 10);
      if (hasInvalidRatio) {
        errors.push({ 
          field: 'customRatios', 
          message: '自定义比例必须在0-10之间' 
        });
      }
    }
  }
  
  // 最大保证金限制验证
  if (params.maxTotalMargin && params.maxTotalMargin < params.initialMargin) {
    errors.push({ 
      field: 'maxTotalMargin', 
      message: '最大总保证金不能小于初始保证金' 
    });
  }
  
  return errors;
}

/**
 * 验证数字范围
 * @param value 数值
 * @param min 最小值
 * @param max 最大值
 * @param fieldName 字段名
 * @returns 验证错误或null
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): ValidationError | null {
  if (isNaN(value) || !isFinite(value)) {
    return { field: fieldName, message: `${fieldName}必须是有效数字` };
  }
  
  if (value < min || value > max) {
    return { field: fieldName, message: `${fieldName}必须在${min}-${max}之间` };
  }
  
  return null;
}

/**
 * 验证必填字段
 * @param value 值
 * @param fieldName 字段名
 * @returns 验证错误或null
 */
export function validateRequired(value: any, fieldName: string): ValidationError | null {
  if (value === undefined || value === null || value === '') {
    return { field: fieldName, message: `${fieldName}不能为空` };
  }
  return null;
}
