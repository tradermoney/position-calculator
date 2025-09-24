/**
 * 金字塔加仓计算工具函数
 */

import { PositionSide, PyramidParams, PyramidLevel, PyramidResult, PyramidStrategy, NumericPyramidParams } from '../types/pyramid';

/**
 * 计算爆仓价格
 */
export const calculateLiquidationPrice = (
  side: PositionSide,
  leverage: number,
  averagePrice: number
): number => {
  const maintenanceMarginRate = 0.005;

  if (side === PositionSide.LONG) {
    return averagePrice * (1 - 1/leverage + maintenanceMarginRate);
  } else {
    return averagePrice * (1 + 1/leverage - maintenanceMarginRate);
  }
};

/**
 * 验证参数
 */
export const validatePyramidParams = (params: PyramidParams): string[] => {
  const errors: string[] = [];

  if (!params.symbol.trim()) {
    errors.push('请输入交易对');
  }

  const leverage = typeof params.leverage === 'number' ? params.leverage : parseFloat(params.leverage as string);
  if (isNaN(leverage) || leverage < 1 || leverage > 125) {
    errors.push('杠杆倍数必须在1-125倍之间');
  }

  const initialPrice = typeof params.initialPrice === 'number' ? params.initialPrice : parseFloat(params.initialPrice as string);
  if (isNaN(initialPrice) || initialPrice <= 0) {
    errors.push('初始价格必须大于0');
  }

  const initialQuantity = typeof params.initialQuantity === 'number' ? params.initialQuantity : parseFloat(params.initialQuantity as string);
  if (isNaN(initialQuantity) || initialQuantity <= 0) {
    errors.push('初始数量必须大于0');
  }

  const initialMargin = typeof params.initialMargin === 'number' ? params.initialMargin : parseFloat(params.initialMargin as string);
  if (isNaN(initialMargin) || initialMargin <= 0) {
    errors.push('初始保证金必须大于0');
  }

  const pyramidLevels = typeof params.pyramidLevels === 'number' ? params.pyramidLevels : parseInt(params.pyramidLevels as string);
  if (isNaN(pyramidLevels) || pyramidLevels < 2 || pyramidLevels > 10) {
    errors.push('建仓档位数必须在2-10档之间');
  }

  const priceDropPercent = typeof params.priceDropPercent === 'number' ? params.priceDropPercent : parseFloat(params.priceDropPercent as string);
  if (isNaN(priceDropPercent) || priceDropPercent <= 0 || priceDropPercent > 50) {
    errors.push('加仓触发间距必须在0.1%-50%之间');
  }

  if (params.strategy === PyramidStrategy.EQUAL_RATIO) {
    const ratioMultiplier = typeof params.ratioMultiplier === 'number' ? params.ratioMultiplier : parseFloat(params.ratioMultiplier as string);
    if (isNaN(ratioMultiplier) || ratioMultiplier <= 1 || ratioMultiplier > 5) {
      errors.push('仓位递增倍数必须在1.1-5倍之间');
    }
  }

  return errors;
};

/**
 * 转换参数为数值类型
 */
export const convertToNumericParams = (params: PyramidParams): NumericPyramidParams => {
  return {
    symbol: params.symbol,
    side: params.side,
    leverage: typeof params.leverage === 'number' ? params.leverage : parseFloat(params.leverage as string),
    initialPrice: typeof params.initialPrice === 'number' ? params.initialPrice : parseFloat(params.initialPrice as string),
    initialQuantity: typeof params.initialQuantity === 'number' ? params.initialQuantity : parseFloat(params.initialQuantity as string),
    initialMargin: typeof params.initialMargin === 'number' ? params.initialMargin : parseFloat(params.initialMargin as string),
    pyramidLevels: typeof params.pyramidLevels === 'number' ? params.pyramidLevels : parseInt(params.pyramidLevels as string),
    strategy: params.strategy,
    priceDropPercent: typeof params.priceDropPercent === 'number' ? params.priceDropPercent : parseFloat(params.priceDropPercent as string),
    ratioMultiplier: typeof params.ratioMultiplier === 'number' ? params.ratioMultiplier : parseFloat(params.ratioMultiplier as string),
  };
};

/**
 * 计算金字塔加仓方案
 */
export const calculatePyramidLevels = (numericParams: NumericPyramidParams): PyramidLevel[] => {
  const levels: PyramidLevel[] = [];

  for (let i = 0; i < numericParams.pyramidLevels; i++) {
    const level = i + 1;
    let price: number;
    let quantity: number;
    let margin: number;

    if (level === 1) {
      // 第一层（初始仓位）
      price = numericParams.initialPrice;
      quantity = numericParams.initialQuantity;
      margin = numericParams.initialMargin;
    } else {
      // 后续层级
      const previousPrice = levels[i - 1].price;

      // 计算价格（根据方向和下跌百分比）
      if (numericParams.side === PositionSide.LONG) {
        price = previousPrice * (1 - numericParams.priceDropPercent / 100);
      } else {
        price = previousPrice * (1 + numericParams.priceDropPercent / 100);
      }

      // 计算数量（根据策略）
      if (numericParams.strategy === PyramidStrategy.EQUAL_RATIO) {
        quantity = numericParams.initialQuantity * Math.pow(numericParams.ratioMultiplier, level - 1);
      } else { // DOUBLE_DOWN
        quantity = numericParams.initialQuantity * Math.pow(2, level - 1);
      }

      // 计算保证金
      margin = (price * quantity) / numericParams.leverage;
    }

    // 计算累计数据
    const cumulativeQuantity = levels.reduce((sum, l) => sum + l.quantity, 0) + quantity;
    const cumulativeMargin = levels.reduce((sum, l) => sum + l.margin, 0) + margin;
    const totalValue = levels.reduce((sum, l) => sum + l.price * l.quantity, 0) + price * quantity;
    const averagePrice = totalValue / cumulativeQuantity;

    // 计算强平价格
    const liquidationPrice = calculateLiquidationPrice(numericParams.side, numericParams.leverage, averagePrice);

    // 计算价格下跌幅度
    const priceDropFromPrevious = level === 1 ? 0 : 
      numericParams.side === PositionSide.LONG 
        ? ((levels[i - 1].price - price) / levels[i - 1].price) * 100
        : ((price - levels[i - 1].price) / levels[i - 1].price) * 100;

    levels.push({
      level,
      price,
      quantity,
      margin,
      cumulativeQuantity,
      cumulativeMargin,
      averagePrice,
      liquidationPrice,
      priceDropFromPrevious,
    });
  }

  return levels;
};

/**
 * 格式化数字
 */
export const formatNumber = (value: number, decimals: number = 4): string => {
  if (isNaN(value) || !isFinite(value)) return '0';
  return value.toFixed(decimals);
};

/**
 * 格式化百分比
 */
export const formatPercentage = (value: number, decimals: number = 2): string => {
  if (isNaN(value) || !isFinite(value)) return '0.00%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * 导出建仓方案为CSV
 */
export const exportPyramidPlan = (result: PyramidResult): void => {
  const csvContent = [
    ['档位', '开仓价格', '仓位大小', '保证金', '累计持仓', '累计保证金', '持仓均价', '强平价格', '回撤幅度%'].join(','),
    ...result.levels.map(level => [
      `第${level.level}档`,
      level.price.toFixed(4),
      level.quantity.toFixed(4),
      level.margin.toFixed(2),
      level.cumulativeQuantity.toFixed(4),
      level.cumulativeMargin.toFixed(2),
      level.averagePrice.toFixed(4),
      level.liquidationPrice.toFixed(4),
      level.priceDropFromPrevious.toFixed(2) + '%'
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `分批建仓方案_${result.params.symbol.replace('/', '_')}_${Date.now()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
