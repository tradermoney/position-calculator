/**
 * 波动率统计计算工具函数
 * 从VolatilityStatsCard.tsx拆分出来
 */

import type { VolatilityResult } from '../../../services/binance';

/**
 * 扩展统计指标接口
 */
export interface ExtraVolatilityStats {
  median: number;
  q1: number;
  q3: number;
  iqr: number;
  range: number;
  cv: number;
  skewness: number;
  kurtosis: number;
  var95: number;
  cvar95: number;
  highVolRatio: number;
  lowVolRatio: number;
  stableRatio: number;
  maxConsecutiveHigh: number;
  maxConsecutiveLow: number;
  autoCorrelation: number;
  trendSlope: number;
  trendStrength: number;
  hhi: number;
  outlierRatio: number;
  risingRatio: number;
  momentumChange: number;
}

/**
 * 计算扩展统计指标
 */
export function calculateExtraStats(volatility: VolatilityResult): ExtraVolatilityStats {
  const values = volatility.values;
  const n = values.length;
  const avg = volatility.average;
  const std = volatility.stdDev;
  
  // 计算中位数和四分位数
  const sortedValues = [...values].sort((a, b) => a - b);
  const median = sortedValues.length % 2 === 0
    ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
    : sortedValues[Math.floor(sortedValues.length / 2)];
  
  const q1Index = Math.ceil(n * 0.25) - 1;
  const q3Index = Math.ceil(n * 0.75) - 1;
  const q1 = sortedValues[q1Index];
  const q3 = sortedValues[q3Index];
  const iqr = q3 - q1;
  
  // 波动率范围
  const range = volatility.max - volatility.min;
  
  // 变异系数（CV）
  const cv = (std / avg) * 100;
  
  // 偏度（Skewness）
  const skewness = values.reduce((sum, v) => sum + Math.pow((v - avg) / std, 3), 0) / n;
  
  // 峰度（Kurtosis）
  const kurtosis = values.reduce((sum, v) => sum + Math.pow((v - avg) / std, 4), 0) / n - 3;
  
  // VaR (Value at Risk) - 95%置信水平（修正分位数索引）
  const var95Index = Math.ceil(n * 0.95) - 1;
  const var95 = sortedValues[var95Index];
  
  // CVaR (Conditional VaR)
  const cvar95 = sortedValues.slice(var95Index).reduce((sum, v) => sum + v, 0) / (n - var95Index);
  
  // 高波动周期占比
  const highVolThreshold = avg + std;
  const highVolCount = values.filter(v => v > highVolThreshold).length;
  const highVolRatio = (highVolCount / n) * 100;
  
  // 低波动周期占比
  const lowVolThreshold = Math.max(0, avg - std);
  const lowVolCount = values.filter(v => v < lowVolThreshold).length;
  const lowVolRatio = (lowVolCount / n) * 100;
  
  // 稳定周期占比
  const stableCount = values.filter(v => 
    v >= avg - 0.5 * std && v <= avg + 0.5 * std
  ).length;
  const stableRatio = (stableCount / n) * 100;
  
  // 最大连续高波动周期
  let maxConsecutiveHigh = 0;
  let currentConsecutiveHigh = 0;
  values.forEach(v => {
    if (v > highVolThreshold) {
      currentConsecutiveHigh++;
      maxConsecutiveHigh = Math.max(maxConsecutiveHigh, currentConsecutiveHigh);
    } else {
      currentConsecutiveHigh = 0;
    }
  });
  
  // 最大连续低波动周期
  let maxConsecutiveLow = 0;
  let currentConsecutiveLow = 0;
  values.forEach(v => {
    if (v < lowVolThreshold) {
      currentConsecutiveLow++;
      maxConsecutiveLow = Math.max(maxConsecutiveLow, currentConsecutiveLow);
    } else {
      currentConsecutiveLow = 0;
    }
  });
  
  // 自相关（Lag-1）
  let autoCorrelation = 0;
  if (n > 1) {
    const diffs = values.slice(0, -1).map((v, i) => (v - avg) * (values[i + 1] - avg));
    autoCorrelation = diffs.reduce((sum, d) => sum + d, 0) / ((n - 1) * std * std);
  }
  
  // 趋势强度
  const xMean = (n - 1) / 2;
  const yMean = avg;
  let numerator = 0;
  let denominator = 0;
  values.forEach((v, i) => {
    numerator += (i - xMean) * (v - yMean);
    denominator += Math.pow(i - xMean, 2);
  });
  const trendSlope = denominator !== 0 ? numerator / denominator : 0;
  const trendStrength = Math.abs(trendSlope) / avg * 100;
  
  // 赫芬达尔指数（HHI）
  const sum = values.reduce((s, v) => s + v, 0);
  const hhi = values.reduce((s, v) => s + Math.pow(v / sum, 2), 0) * 10000;
  
  // 异常值检测
  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;
  const outliers = values.filter(v => v < lowerBound || v > upperBound).length;
  const outlierRatio = (outliers / n) * 100;
  
  // 上升趋势周期数
  let risingPeriods = 0;
  for (let i = 1; i < n; i++) {
    if (values[i] > values[i - 1]) risingPeriods++;
  }
  const risingRatio = (risingPeriods / (n - 1)) * 100;
  
  // 动量变化
  const recentCount = Math.max(Math.floor(n * 0.1), 1);
  const recentAvg = values.slice(-recentCount).reduce((s, v) => s + v, 0) / recentCount;
  const earlyAvg = values.slice(0, recentCount).reduce((s, v) => s + v, 0) / recentCount;
  const momentumChange = ((recentAvg - earlyAvg) / earlyAvg) * 100;
  
  return {
    median,
    q1,
    q3,
    iqr,
    range,
    cv,
    skewness,
    kurtosis,
    var95,
    cvar95,
    highVolRatio,
    lowVolRatio,
    stableRatio,
    maxConsecutiveHigh,
    maxConsecutiveLow,
    autoCorrelation,
    trendSlope,
    trendStrength,
    hhi,
    outlierRatio,
    risingRatio,
    momentumChange,
  };
}

