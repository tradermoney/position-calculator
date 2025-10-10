/**
 * 保本回报率计算器核心计算逻辑
 */

export interface BreakEvenInputs {
  /** 杠杆倍数 */
  leverage: number;
  /** 开仓手续费率（百分比，如0.05表示0.05%） */
  openFeeRate: number;
  /** 平仓手续费率（百分比，如0.05表示0.05%） */
  closeFeeRate: number;
  /** 资金费率（百分比，如0.01表示0.01%） */
  fundingRate: number;
  /** 资金费率结算周期（小时） */
  fundingPeriod: number;
  /** 持仓时间（小时） */
  holdingTime: number;
  /** 交易对 */
  symbol: string;
  /** 开仓方向：'long' | 'short' */
  positionDirection: 'long' | 'short';
}

export interface BreakEvenResult {
  /** 总的保本回报率（百分比） */
  totalBreakEvenRate: number;
  /** 开仓成本占比（百分比） */
  openCostRate: number;
  /** 平仓成本占比（百分比） */
  closeCostRate: number;
  /** 资金费率成本占比（百分比） */
  fundingCostRate: number;
  /** 总手续费成本占比（百分比） */
  totalFeeRate: number;
  /** 成本明细 */
  costBreakdown: {
    openCost: number;
    closeCost: number;
    fundingCost: number;
    totalCost: number;
  };
}

/**
 * 计算保本回报率
 * @param inputs 输入参数
 * @returns 计算结果
 */
export function calculateBreakEvenRate(inputs: BreakEvenInputs): BreakEvenResult {
  const { leverage, openFeeRate, closeFeeRate, fundingRate, fundingPeriod, holdingTime } = inputs;

  // 输入验证
  if (leverage <= 0) {
    throw new Error('杠杆倍数必须大于0');
  }
  if (openFeeRate < 0 || closeFeeRate < 0) {
    throw new Error('手续费率不能为负数');
  }
  if (fundingPeriod <= 0) {
    throw new Error('资金费率结算周期必须大于0');
  }
  if (holdingTime < 0) {
    throw new Error('持仓时间不能为负数');
  }

  // 计算开仓成本占本金的百分比
  // 开仓成本 = 开仓价格 × 数量 × 开仓手续费率
  // 开仓成本占本金比例 = (开仓价格 × 数量 × 开仓手续费率) / (开仓价格 × 数量 / 杠杆倍数)
  // 简化后 = 开仓手续费率 × 杠杆倍数
  const openCostRate = (openFeeRate / 100) * leverage * 100; // 转换为百分比

  // 计算平仓成本占本金的百分比
  // 平仓成本计算逻辑与开仓相同
  const closeCostRate = (closeFeeRate / 100) * leverage * 100; // 转换为百分比

  // 计算资金费率成本占本金的百分比
  // 资金费率成本 = 仓位价值 × 资金费率 × (持仓时间 / 资金费率结算周期)
  // 资金费率成本占本金比例 = (仓位价值 × 资金费率 × 次数) / (仓位价值 / 杠杆倍数)
  // 简化后 = 资金费率 × 杠杆倍数 × (持仓时间 / 资金费率结算周期)
  const fundingPeriods = holdingTime / fundingPeriod;
  const fundingCostRate = (fundingRate / 100) * leverage * fundingPeriods * 100; // 转换为百分比

  // 计算总手续费成本
  const totalFeeRate = openCostRate + closeCostRate;

  // 计算总的保本回报率
  const totalBreakEvenRate = openCostRate + closeCostRate + fundingCostRate;

  // 成本明细（以1000USDT本金为例进行计算）
  const principal = 1000;
  const positionValue = principal * leverage;

  const openCost = positionValue * (openFeeRate / 100);
  const closeCost = positionValue * (closeFeeRate / 100);
  const fundingCost = positionValue * (fundingRate / 100) * fundingPeriods;
  const totalCost = openCost + closeCost + fundingCost;

  return {
    totalBreakEvenRate: Math.round(totalBreakEvenRate * 10000) / 10000, // 保留4位小数
    openCostRate: Math.round(openCostRate * 10000) / 10000,
    closeCostRate: Math.round(closeCostRate * 10000) / 10000,
    fundingCostRate: Math.round(fundingCostRate * 10000) / 10000,
    totalFeeRate: Math.round(totalFeeRate * 10000) / 10000,
    costBreakdown: {
      openCost: Math.round(openCost * 100) / 100,
      closeCost: Math.round(closeCost * 100) / 100,
      fundingCost: Math.round(fundingCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
    },
  };
}

/**
 * 获取默认输入值
 */
export function getDefaultBreakEvenInputs(): BreakEvenInputs {
  return {
    leverage: 100,
    openFeeRate: 0.05, // 0.05%
    closeFeeRate: 0.05, // 0.05%
    fundingRate: 0.01, // 0.01%
    fundingPeriod: 8, // 8小时
    holdingTime: 24, // 24小时
    symbol: 'BTCUSDT',
    positionDirection: 'long',
  };
}

/**
 * 验证输入参数
 */
export function validateBreakEvenInputs(inputs: Partial<BreakEvenInputs>): string[] {
  const errors: string[] = [];

  if (inputs.leverage !== undefined) {
    if (inputs.leverage <= 0) {
      errors.push('杠杆倍数必须大于0');
    }
    if (inputs.leverage > 1000) {
      errors.push('杠杆倍数不能超过1000倍');
    }
  }

  if (inputs.openFeeRate !== undefined) {
    if (inputs.openFeeRate < 0) {
      errors.push('开仓手续费率不能为负数');
    }
    if (inputs.openFeeRate > 10) {
      errors.push('开仓手续费率不能超过10%');
    }
  }

  if (inputs.closeFeeRate !== undefined) {
    if (inputs.closeFeeRate < 0) {
      errors.push('平仓手续费率不能为负数');
    }
    if (inputs.closeFeeRate > 10) {
      errors.push('平仓手续费率不能超过10%');
    }
  }

  if (inputs.fundingRate !== undefined) {
    if (inputs.fundingRate < -1) {
      errors.push('资金费率不能低于-1%');
    }
    if (inputs.fundingRate > 1) {
      errors.push('资金费率不能超过1%');
    }
  }

  if (inputs.fundingPeriod !== undefined) {
    if (inputs.fundingPeriod <= 0) {
      errors.push('资金费率结算周期必须大于0');
    }
    if (inputs.fundingPeriod > 24) {
      errors.push('资金费率结算周期不能超过24小时');
    }
  }

  if (inputs.holdingTime !== undefined) {
    if (inputs.holdingTime < 0) {
      errors.push('持仓时间不能为负数');
    }
    if (inputs.holdingTime > 8760) { // 一年
      errors.push('持仓时间不能超过一年');
    }
  }

  return errors;
}