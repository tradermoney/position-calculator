/**
 * 凯利公式计算工具
 * Kelly Criterion calculations for optimal position sizing
 */

// 交易记录接口
export interface TradeRecord {
  id: number;
  profit: number; // 盈利金额（正数为盈利，负数为亏损）
  enabled: boolean; // 是否启用此记录参与计算
}

// 基础凯利公式参数
export interface BasicKellyParams {
  winRate: number; // 胜率 (0-1)
  odds: number; // 赔率（盈利倍数）
}

// 交易版凯利公式参数
export interface TradingKellyParams {
  winRate: number; // 胜率 (0-1)
  avgWin: number; // 平均盈利金额
  avgLoss: number; // 平均亏损金额
}

// 历史数据分析参数
export interface HistoricalKellyParams {
  trades: TradeRecord[]; // 历史交易记录
}

// 凯利公式计算结果
export interface KellyResult {
  kellyPercentage: number; // 凯利比例 (0-1)
  fractionalKelly: number; // 分数凯利比例
  winRate: number; // 胜率
  avgWin: number; // 平均盈利
  avgLoss: number; // 平均亏损
  profitFactor: number; // 盈利因子
  expectedReturn: number; // 预期收益率
  riskOfRuin: number; // 破产概率估算
  recommendation: string; // 建议
  isValid: boolean; // 结果是否有效
  warnings: string[]; // 警告信息
}

// 风险调整选项
export interface RiskAdjustment {
  fractionalFactor: number; // 分数凯利系数 (0-1)
  maxPosition: number; // 最大仓位限制 (0-1)
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'; // 风险偏好
}

/**
 * 计算基础凯利公式
 * f* = (bp - q) / b
 * 其中：f* = 最优投注比例，b = 赔率，p = 胜率，q = 败率
 */
export function calculateBasicKelly(params: BasicKellyParams): number {
  const { winRate, odds } = params;
  
  if (winRate <= 0 || winRate >= 1 || odds <= 0) {
    return 0;
  }
  
  const lossRate = 1 - winRate;
  const kellyFraction = (odds * winRate - lossRate) / odds;
  
  return Math.max(0, kellyFraction); // 确保不为负数
}

/**
 * 计算交易版凯利公式
 * f* = (胜率 × 平均盈利 - 败率 × 平均亏损) / 平均盈利
 */
export function calculateTradingKelly(params: TradingKellyParams): number {
  const { winRate, avgWin, avgLoss } = params;
  
  if (winRate <= 0 || winRate >= 1 || avgWin <= 0 || avgLoss <= 0) {
    return 0;
  }
  
  const lossRate = 1 - winRate;
  const kellyFraction = (winRate * avgWin - lossRate * avgLoss) / avgWin;
  
  return Math.max(0, kellyFraction);
}

/**
 * 基于历史数据计算凯利公式
 */
export function calculateHistoricalKelly(params: HistoricalKellyParams): KellyResult {
  const { trades } = params;
  const enabledTrades = trades.filter(trade => trade.enabled);
  
  if (enabledTrades.length === 0) {
    return {
      kellyPercentage: 0,
      fractionalKelly: 0,
      winRate: 0,
      avgWin: 0,
      avgLoss: 0,
      profitFactor: 0,
      expectedReturn: 0,
      riskOfRuin: 1,
      recommendation: '无有效交易数据',
      isValid: false,
      warnings: ['请添加至少一笔交易记录']
    };
  }
  
  // 分析交易数据
  const winningTrades = enabledTrades.filter(trade => trade.profit > 0);
  const losingTrades = enabledTrades.filter(trade => trade.profit < 0);
  
  const totalTrades = enabledTrades.length;
  const winCount = winningTrades.length;
  const lossCount = losingTrades.length;
  
  const winRate = winCount / totalTrades;
  const avgWin = winCount > 0 ? winningTrades.reduce((sum, trade) => sum + trade.profit, 0) / winCount : 0;
  const avgLoss = lossCount > 0 ? Math.abs(losingTrades.reduce((sum, trade) => sum + trade.profit, 0) / lossCount) : 0;
  
  // 计算凯里比例
  let kellyPercentage = 0;
  if (avgWin > 0 && avgLoss > 0) {
    kellyPercentage = calculateTradingKelly({ winRate, avgWin, avgLoss });
  }
  
  // 计算其他指标
  const totalProfit = winningTrades.reduce((sum, trade) => sum + trade.profit, 0);
  const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.profit, 0));
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;
  const expectedReturn = (winRate * avgWin - (1 - winRate) * avgLoss) / 100; // 转换为百分比
  
  // 估算破产概率（简化版）
  const riskOfRuin = kellyPercentage > 0.25 ? 0.1 : kellyPercentage > 0.1 ? 0.05 : 0.01;
  
  // 生成建议和警告
  const warnings: string[] = [];
  let recommendation = '';
  
  if (totalTrades < 30) {
    warnings.push('建议至少有30笔交易记录以获得更可靠的结果');
  }
  
  if (kellyPercentage > 0.25) {
    warnings.push('凯利比例过高，建议使用分数凯利降低风险');
    recommendation = '建议使用25%的分数凯利比例';
  } else if (kellyPercentage > 0.1) {
    recommendation = '建议使用50%的分数凯利比例';
  } else if (kellyPercentage > 0.05) {
    recommendation = '可以使用75%的分数凯利比例';
  } else if (kellyPercentage > 0) {
    recommendation = '可以使用完整的凯利比例';
  } else {
    recommendation = '当前策略不适合使用凯利公式';
    warnings.push('负的凯利比例表明该策略预期亏损');
  }
  
  return {
    kellyPercentage,
    fractionalKelly: kellyPercentage * 0.5, // 默认50%分数凯利
    winRate,
    avgWin,
    avgLoss,
    profitFactor,
    expectedReturn,
    riskOfRuin,
    recommendation,
    isValid: kellyPercentage > 0 && totalTrades > 0,
    warnings
  };
}

/**
 * 应用风险调整
 */
export function applyRiskAdjustment(kellyPercentage: number, adjustment: RiskAdjustment): number {
  let adjustedKelly = kellyPercentage * adjustment.fractionalFactor;
  
  // 应用最大仓位限制
  adjustedKelly = Math.min(adjustedKelly, adjustment.maxPosition);
  
  // 根据风险偏好进一步调整
  switch (adjustment.riskTolerance) {
    case 'conservative':
      adjustedKelly *= 0.5;
      break;
    case 'moderate':
      adjustedKelly *= 0.75;
      break;
    case 'aggressive':
      // 保持原值
      break;
  }
  
  return Math.max(0, adjustedKelly);
}

/**
 * 格式化百分比
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return (value * 100).toFixed(decimals) + '%';
}

/**
 * 格式化数字
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toFixed(decimals);
}

/**
 * 验证输入参数
 */
export function validateKellyParams(winRate: number, avgWin: number, avgLoss: number): string[] {
  const errors: string[] = [];
  
  if (winRate <= 0 || winRate >= 1) {
    errors.push('胜率必须在0-100%之间');
  }
  
  if (avgWin <= 0) {
    errors.push('平均盈利必须大于0');
  }
  
  if (avgLoss <= 0) {
    errors.push('平均亏损必须大于0');
  }
  
  return errors;
}
