import { PositionSide } from '../../../utils/contractCalculations';
import { PnLResult, Position, PositionStat, PositionType } from './types';

// 浮点数比较的容差值（epsilon），用于处理浮点数精度问题
// 版本：2025-10-06-v4 修复浮点数精度边界问题，进一步调整容差值
const EPSILON = 1e-4;

const getValidPositions = (positions: Position[]) =>
  positions.filter((position) => position.enabled && position.price > 0 && position.quantity > 0);

export const validatePositions = (positions: Position[], capital?: number): string[] => {
  const errors: string[] = [];
  const validPositions = getValidPositions(positions);

  if (validPositions.length === 0) {
    errors.push('至少需要一个有效的仓位（价格和数量都大于0）');
    return errors;
  }

  // 检查基本字段
  validPositions.forEach((position, index) => {
    if (position.price <= 0) {
      errors.push(`第${index + 1}个仓位的价格必须大于0`);
    }
    if (position.quantity <= 0) {
      errors.push(`第${index + 1}个仓位的数量必须大于0`);
    }
  });

  // 检查平仓数量是否超过持仓，以及资金使用情况
  let currentHoldings = 0;
  let usedCapital = 0;
  let positionIndex = 0;

  positions.forEach((position) => {
    if (position.enabled && position.price > 0 && position.quantity > 0) {
      positionIndex++;

      if (position.type === PositionType.OPEN) {
        // 开仓：增加持仓，消耗资金（保证金）
        currentHoldings += position.quantity;
        usedCapital += position.marginUsdt;

        // 检查是否超过总资金
        if (capital && capital > 0 && usedCapital > capital) {
          const excess = usedCapital - capital;
          errors.push(
            `第${positionIndex}个仓位(开仓)：累计使用保证金 ${usedCapital.toFixed(2)} USDT 超过总资金 ${capital.toFixed(2)} USDT，超出 ${excess.toFixed(2)} USDT`
          );
        }
      } else {
        // 平仓：减少持仓，释放资金（不检查资金，因为平仓是释放资金）
        // 使用 EPSILON 容差处理浮点数精度问题
        const actualDeficit = position.quantity - currentHoldings;
        const hasDeficit = position.quantity > currentHoldings + EPSILON;
        
        // 调试日志（可在控制台查看）
        if (Math.abs(actualDeficit) < 0.001) {
          console.log(`[PnL调试] 第${positionIndex}个仓位(平仓):`, {
            平仓数量: position.quantity,
            当前持仓: currentHoldings,
            实际差值: actualDeficit,
            '是否超出(带容差)': hasDeficit,
            EPSILON容差: EPSILON,
            版本: '2025-10-06-v2'
          });
        }
        
        if (hasDeficit) {
          errors.push(
            `第${positionIndex}个仓位(平仓)：平仓数量 ${position.quantity.toFixed(4)} 超过当前持仓 ${currentHoldings.toFixed(4)}，超出 ${actualDeficit.toFixed(4)}`
          );
        }
        currentHoldings -= Math.min(position.quantity, currentHoldings);
      }
    }
  });

  return errors;
};

export const calculatePnL = (positions: Position[], side: PositionSide): PnLResult => {
  const validPositions = getValidPositions(positions);
  const openPositions = validPositions.filter(position => position.type === PositionType.OPEN);
  const closePositions = validPositions.filter(position => position.type === PositionType.CLOSE);

  const totalOpenCost = openPositions.reduce((sum, position) => sum + position.price * position.quantity, 0);
  const totalOpenQuantity = openPositions.reduce((sum, position) => sum + position.quantity, 0);
  const totalCloseCost = closePositions.reduce((sum, position) => sum + position.price * position.quantity, 0);
  const totalCloseQuantity = closePositions.reduce((sum, position) => sum + position.quantity, 0);

  const quantityRatio = totalOpenQuantity === 0 ? 0 : totalCloseQuantity / totalOpenQuantity;

  const totalPnL = side === PositionSide.LONG
    ? totalCloseCost - totalOpenCost * quantityRatio
    : totalOpenCost * quantityRatio - totalCloseCost;

  // 计算总保证金（初始投入）
  const totalMargin = openPositions.reduce((sum, position) => sum + position.marginUsdt, 0);
  const totalInvestment = totalOpenCost;
  // ROE = 盈亏 / 保证金 × 100%
  const roe = totalMargin > 0 ? (totalPnL / totalMargin) * 100 : 0;

  return {
    totalPnL,
    totalInvestment,
    totalReturn: totalInvestment + totalPnL,
    roe,
    openPositions,
    closePositions,
  };
};

export const calculatePositionUsage = (positions: Position[], capital: number): number => {
  if (capital <= 0) return 0;
  const totalMargin = positions
    .filter(position => position.enabled && position.type === PositionType.OPEN && position.price > 0 && position.quantity > 0)
    .reduce((sum, position) => sum + position.marginUsdt, 0);
  return (totalMargin / capital) * 100;
};

// 计算爆仓价格（包含2%强平清算费用）
export const calculateLiquidationPrice = (
  entryPrice: number,
  leverage: number,
  side: PositionSide,
  liquidationFeeRate: number = 0.02 // 2%强平清算费用
): number => {
  if (leverage <= 0 || entryPrice <= 0) return 0;

  // 计算维持保证金率（1/杠杆 - 强平清算费用）
  const maintenanceMarginRate = (1 / leverage) - liquidationFeeRate;
  
  if (maintenanceMarginRate <= 0) return 0;

  if (side === PositionSide.LONG) {
    // 做多爆仓价格 = 开仓价格 × (1 - 维持保证金率)
    return entryPrice * (1 - maintenanceMarginRate);
  } else {
    // 做空爆仓价格 = 开仓价格 × (1 + 维持保证金率)
    return entryPrice * (1 + maintenanceMarginRate);
  }
};

export const buildPositionStats = (positions: Position[], side: PositionSide, capital: number = 0, leverage: number = 10): Map<number, PositionStat> => {
  let currentQuantity = 0;
  let totalCost = 0;
  let cumulativePnL = 0;
  let usedCapital = 0; // 累计已使用的保证金
  let totalOpenQuantity = 0; // 累计开仓数量，用于计算平仓时释放的保证金比例
  let totalOpenMargin = 0; // 累计开仓保证金
  let lastPrice: number | null = null; // 上一个仓位的价格，用于计算波动率
  const stats = new Map<number, PositionStat>();

  const getAveragePrice = () => (currentQuantity > 0 ? totalCost / currentQuantity : null);

  positions.forEach((position) => {
    let isActive = false;
    let priceVolatility: number | null = null;

    if (position.enabled && position.price > 0 && position.quantity > 0) {
      isActive = true;
      
      // 计算币价波动率（相对于上一个仓位的价格波动百分比）
      if (lastPrice !== null && lastPrice > 0) {
        priceVolatility = ((position.price - lastPrice) / lastPrice) * 100;
      }
      
      // 更新上一个价格
      lastPrice = position.price;

      if (position.type === PositionType.OPEN) {
        totalCost += position.price * position.quantity;
        currentQuantity += position.quantity;
        usedCapital += position.marginUsdt; // 累加保证金
        totalOpenQuantity += position.quantity; // 累计开仓数量
        totalOpenMargin += position.marginUsdt; // 累计开仓保证金
      } else {
        const averagePrice = getAveragePrice() ?? position.price;
        const executableQuantity = Math.min(position.quantity, currentQuantity);

        if (executableQuantity > 0) {
          const pnlDelta = (position.price - averagePrice) * executableQuantity * (side === PositionSide.SHORT ? -1 : 1);
          cumulativePnL += pnlDelta;
          totalCost -= averagePrice * executableQuantity;
          currentQuantity -= executableQuantity;
          
          // 平仓时释放相应比例的保证金
          // 释放的保证金 = 总保证金 × (平仓数量 / 总开仓数量)
          if (totalOpenQuantity > 0) {
            const releasedMargin = totalOpenMargin * (executableQuantity / totalOpenQuantity);
            usedCapital -= releasedMargin;
            totalOpenQuantity -= executableQuantity;
            totalOpenMargin -= releasedMargin;
            
            // 处理浮点数精度：如果剩余量非常小，清零
            if (Math.abs(currentQuantity) < EPSILON) {
              currentQuantity = 0;
              totalCost = 0;
            }
            if (Math.abs(totalOpenQuantity) < EPSILON) {
              totalOpenQuantity = 0;
            }
            if (Math.abs(totalOpenMargin) < EPSILON) {
              totalOpenMargin = 0;
            }
            if (Math.abs(usedCapital) < EPSILON) {
              usedCapital = 0;
            }
          }
        }
      }
    }

    const capitalUsageRate = capital > 0 ? usedCapital / capital : 0;
    
    // 计算爆仓价格（仅对开仓仓位计算）
    let liquidationPrice: number | null = null;
    if (isActive && position.type === PositionType.OPEN && position.price > 0) {
      liquidationPrice = calculateLiquidationPrice(position.price, leverage, side);
    }

    stats.set(position.id, {
      holdings: side === PositionSide.SHORT ? -currentQuantity : currentQuantity,
      averagePrice: getAveragePrice(),
      cumulativePnL,
      isActive,
      usedCapital, // 当前累计占用的保证金
      capitalUsageRate, // 使用率
      priceVolatility, // 币价波动率
      liquidationPrice, // 爆仓价格
    });
  });

  return stats;
};
