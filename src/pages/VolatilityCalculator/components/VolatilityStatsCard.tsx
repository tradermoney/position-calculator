/**
 * 波动率统计总结组件
 * 显示波动率的统计信息和分析结论
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ShowChartIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  PriorityHigh as PriorityHighIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';
import type { VolatilityStats } from '../../../services/binance';
import FieldTooltip from './FieldTooltip';

export interface VolatilityStatsCardProps {
  /** 波动率统计数据 */
  data: VolatilityStats;
}

/**
 * 波动率统计总结组件
 */
export function VolatilityStatsCard({ data }: VolatilityStatsCardProps) {
  const { symbol, interval, periods, volatility, timestamp } = data;

  // 计算额外的统计指标
  const extraStats = useMemo(() => {
    const values = volatility.values;
    const n = values.length;
    const avg = volatility.average;
    const std = volatility.stdDev;
    
    // 计算中位数和四分位数
    const sortedValues = [...values].sort((a, b) => a - b);
    const median = sortedValues.length % 2 === 0
      ? (sortedValues[sortedValues.length / 2 - 1] + sortedValues[sortedValues.length / 2]) / 2
      : sortedValues[Math.floor(sortedValues.length / 2)];
    
    const q1Index = Math.floor(n * 0.25);
    const q3Index = Math.floor(n * 0.75);
    const q1 = sortedValues[q1Index];
    const q3 = sortedValues[q3Index];
    const iqr = q3 - q1; // 四分位距
    
    // 波动率范围
    const range = volatility.max - volatility.min;
    
    // 变异系数（CV）
    const cv = (std / avg) * 100;
    
    // 偏度（Skewness）- 衡量分布的对称性
    const skewness = values.reduce((sum, v) => sum + Math.pow((v - avg) / std, 3), 0) / n;
    
    // 峰度（Kurtosis）- 衡量分布的尾部厚度
    const kurtosis = values.reduce((sum, v) => sum + Math.pow((v - avg) / std, 4), 0) / n - 3;
    
    // VaR (Value at Risk) - 95%置信水平的风险价值
    const var95Index = Math.floor(n * 0.95);
    const var95 = sortedValues[var95Index];
    
    // CVaR (Conditional VaR) - 超过VaR的平均值
    const cvar95 = sortedValues.slice(var95Index).reduce((sum, v) => sum + v, 0) / 
                   (n - var95Index);
    
    // 高波动周期占比（>平均值+标准差）
    const highVolThreshold = avg + std;
    const highVolCount = values.filter(v => v > highVolThreshold).length;
    const highVolRatio = (highVolCount / n) * 100;
    
    // 低波动周期占比（<平均值-标准差）
    const lowVolThreshold = Math.max(0, avg - std);
    const lowVolCount = values.filter(v => v < lowVolThreshold).length;
    const lowVolRatio = (lowVolCount / n) * 100;
    
    // 稳定周期占比（在平均值±0.5标准差范围内）
    const stableCount = values.filter(v => 
      v >= avg - 0.5 * std &&
      v <= avg + 0.5 * std
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
    
    // 波动聚集性分析（GARCH效应）- 计算相邻波动率的相关性
    let autoCorrelation = 0;
    if (n > 1) {
      const diffs = values.slice(0, -1).map((v, i) => (v - avg) * (values[i + 1] - avg));
      autoCorrelation = diffs.reduce((sum, d) => sum + d, 0) / ((n - 1) * std * std);
    }
    
    // 趋势强度 - 基于线性回归斜率
    const xMean = (n - 1) / 2;
    const yMean = avg;
    let numerator = 0;
    let denominator = 0;
    values.forEach((v, i) => {
      numerator += (i - xMean) * (v - yMean);
      denominator += Math.pow(i - xMean, 2);
    });
    const trendSlope = denominator !== 0 ? numerator / denominator : 0;
    const trendStrength = Math.abs(trendSlope) / avg * 100; // 归一化趋势强度
    
    // 赫芬达尔指数（HHI）- 衡量波动集中度
    const sum = values.reduce((s, v) => s + v, 0);
    const hhi = values.reduce((s, v) => s + Math.pow(v / sum, 2), 0) * 10000;
    
    // 异常值检测（基于IQR方法）
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    const outliers = values.filter(v => v < lowerBound || v > upperBound).length;
    const outlierRatio = (outliers / n) * 100;
    
    // 波动率上升趋势周期数
    let risingPeriods = 0;
    for (let i = 1; i < n; i++) {
      if (values[i] > values[i - 1]) risingPeriods++;
    }
    const risingRatio = (risingPeriods / (n - 1)) * 100;
    
    // 计算波动率衰减速度（最近10%数据vs最早10%数据）
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
  }, [volatility]);

  // 判断波动率水平
  const getVolatilityLevel = (value: number): { level: string; color: string; icon: React.ReactElement } => {
    if (value < 0.5) {
      return { 
        level: '极低', 
        color: '#4caf50',
        icon: <TrendingDownIcon />
      };
    } else if (value < 1) {
      return { 
        level: '低', 
        color: '#8bc34a',
        icon: <TrendingDownIcon />
      };
    } else if (value < 2) {
      return { 
        level: '中等', 
        color: '#ff9800',
        icon: <ShowChartIcon />
      };
    } else if (value < 3) {
      return { 
        level: '高', 
        color: '#ff5722',
        icon: <TrendingUpIcon />
      };
    } else {
      return { 
        level: '极高', 
        color: '#f44336',
        icon: <TrendingUpIcon />
      };
    }
  };

  const avgLevel = getVolatilityLevel(volatility.average);
  const maxLevel = getVolatilityLevel(volatility.max);

  // 生成分析结论
  const getAnalysis = (): string => {
    const avg = volatility.average;
    
    if (avg < 0.5) {
      return `市场波动极小（平均${volatility.average.toFixed(2)}%），价格相对稳定。${extraStats.stableRatio > 60 ? '超过60%的时间段价格稳定，' : ''}适合网格交易、做市策略或低风险套利。建议使用小止损间距，捕捉小幅波动利润。`;
    } else if (avg < 1) {
      return `市场波动较小（平均${volatility.average.toFixed(2)}%），价格变化温和。${extraStats.stableRatio > 50 ? '市场较为稳定，' : ''}适合稳健型交易策略、趋势跟踪或震荡区间交易。可以适度使用杠杆，建议3-5倍。`;
    } else if (avg < 2) {
      return `市场波动适中（平均${volatility.average.toFixed(2)}%），存在较好的交易机会。${extraStats.highVolRatio > 20 ? '存在较多高波动时段，' : ''}适合日内交易和波段操作。建议合理控制仓位（单次不超过30%），设置动态止损。`;
    } else if (avg < 3) {
      return `市场波动较大（平均${volatility.average.toFixed(2)}%），价格变化剧烈。${extraStats.highVolRatio > 30 ? '高波动时段占比超过30%，' : ''}风险显著增加。建议降低仓位（单次不超过20%），严格止损，避免重仓和高杠杆。`;
    } else {
      return `市场波动极大（平均${volatility.average.toFixed(2)}%），风险很高。${extraStats.highVolRatio > 40 ? '高波动时段频繁出现，' : ''}建议降低杠杆至1-2倍或观望为主，仓位控制在10%以内，设置紧密止损。不建议新手操作。`;
    }
  };

  // 标准差分析
  const getStdDevAnalysis = (): string => {
    const ratio = volatility.stdDev / volatility.average;
    const cv = extraStats.cv;
    
    if (ratio < 0.3) {
      return `波动率变异系数${cv.toFixed(1)}%，较为稳定。${extraStats.stableRatio > 60 ? `${extraStats.stableRatio.toFixed(0)}%的时段波动率稳定，` : ''}市场行为可预测性较高，适合技术分析和量化策略。`;
    } else if (ratio < 0.6) {
      return `波动率变异系数${cv.toFixed(1)}%，有一定波动。${extraStats.highVolRatio > 15 ? `约${extraStats.highVolRatio.toFixed(0)}%的时段出现高波动，` : ''}需要关注市场变化和重要消息面，建议使用移动止损。`;
    } else {
      return `波动率变异系数${cv.toFixed(1)}%，起伏较大。${extraStats.highVolRatio > 25 ? `高波动时段占${extraStats.highVolRatio.toFixed(0)}%，` : ''}市场不确定性高，可能处于趋势转折或重大事件影响期，需要密切关注并降低交易频率。`;
    }
  };

  // 获取风险等级
  const getRiskLevel = (): { level: string; color: 'error' | 'warning' | 'info' | 'success'; icon: React.ReactElement } => {
    const avg = volatility.average;
    if (avg >= 3) {
      return { level: '极高风险', color: 'error', icon: <PriorityHighIcon /> };
    } else if (avg >= 2) {
      return { level: '高风险', color: 'warning', icon: <WarningIcon /> };
    } else if (avg >= 1) {
      return { level: '中等风险', color: 'info', icon: <ShowChartIcon /> };
    } else {
      return { level: '低风险', color: 'success', icon: <CheckCircleIcon /> };
    }
  };

  // 获取交易策略建议
  const getTradingStrategies = (): string[] => {
    const avg = volatility.average;
    const strategies: string[] = [];
    
    if (avg < 0.5) {
      strategies.push('✅ 网格交易策略：设置密集网格，捕捉小幅波动');
      strategies.push('✅ 做市策略：提供流动性赚取价差');
      strategies.push('✅ 套利策略：跨期、跨平台套利');
      strategies.push('⚠️ 避免：追涨杀跌、高频短线');
    } else if (avg < 1) {
      strategies.push('✅ 趋势跟踪：中长期持仓，跟随主要趋势');
      strategies.push('✅ 震荡交易：在支撑阻力区间内低买高卖');
      strategies.push('✅ 定投策略：适合长期定期定额投资');
      strategies.push('⚠️ 避免：过度频繁交易、高杠杆');
    } else if (avg < 2) {
      strategies.push('✅ 日内波段：捕捉日内明显波动');
      strategies.push('✅ 突破交易：关键位置突破时入场');
      strategies.push('✅ 短线交易：快进快出，见好就收');
      strategies.push('⚠️ 避免：重仓持有、不设止损');
    } else if (avg < 3) {
      strategies.push('✅ 轻仓试探：小仓位测试市场');
      strategies.push('✅ 严格止损：及时止损，控制风险');
      strategies.push('⚠️ 谨慎：降低交易频率和仓位');
      strategies.push('❌ 避免：满仓、高杠杆、长时间持仓');
    } else {
      strategies.push('⚠️ 观望为主：等待市场稳定');
      strategies.push('⚠️ 极小仓位：如需操作，仓位<10%');
      strategies.push('⚠️ 无杠杆：使用1倍杠杆或现货');
      strategies.push('❌ 严禁：重仓、高杠杆、频繁交易');
    }
    
    return strategies;
  };

  // 获取止损建议
  const getStopLossAdvice = (): string => {
    const avg = volatility.average;
    
    if (avg < 0.5) {
      return `建议止损幅度：0.3-0.5%（约${(avg * 0.8).toFixed(2)}-${avg.toFixed(2)}%）`;
    } else if (avg < 1) {
      return `建议止损幅度：0.5-1%（约${(avg * 0.8).toFixed(2)}-${(avg * 1.2).toFixed(2)}%）`;
    } else if (avg < 2) {
      return `建议止损幅度：1-2%（约${avg.toFixed(2)}-${(avg * 1.5).toFixed(2)}%）`;
    } else if (avg < 3) {
      return `建议止损幅度：2-3%（约${(avg * 0.8).toFixed(2)}-${(avg * 1.2).toFixed(2)}%）`;
    } else {
      return `建议止损幅度：3-5%（约${avg.toFixed(2)}-${(avg * 1.5).toFixed(2)}%）`;
    }
  };

  const riskLevel = getRiskLevel();
  const strategies = getTradingStrategies();

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
      {/* 标题 */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <InfoIcon sx={{ mr: 1 }} />
        <Typography variant="h6">
          统计总结
        </Typography>
        <FieldTooltip
          title={
            <Box sx={{ p: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                统计总结说明
              </Typography>
              <Typography variant="body2" paragraph>
                这个卡片汇总了当前数据的关键统计指标和分析结论，帮助你快速了解市场波动情况。
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>包含内容：</strong><br/>
                • 基本信息 - 交易对、K线周期、数据量<br/>
                • 风险等级 - 根据波动率自动评估市场风险<br/>
                • 核心指标 - 平均、中位数、最大、最小、标准差等<br/>
                • 分布特征 - 偏度、峰度、分位数等统计学指标<br/>
                • 风险评估 - VaR、CVaR等风险价值指标<br/>
                • 交易建议 - 仓位管理、止损策略、适用交易方式
              </Typography>
              <Typography variant="body2">
                <strong>💡 使用：</strong>这些指标和建议基于历史数据统计，仅供参考，实际交易请结合市场环境综合判断。
              </Typography>
            </Box>
          }
          placement="right"
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* 基本信息 */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" display="block">
              交易对
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {symbol}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" display="block">
              K线周期
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {interval}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" display="block">
              数据量
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {periods} 个周期
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" display="block">
              计算时间
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {new Date(timestamp).toLocaleTimeString()}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* 风险等级警示 */}
      <Alert 
        severity={riskLevel.color} 
        icon={riskLevel.icon}
        sx={{ mb: 3, fontWeight: 'bold' }}
      >
        当前市场风险等级：{riskLevel.level}
      </Alert>

      {/* 核心统计数据 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* 平均波动率 */}
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'action.hover', 
              borderRadius: 2,
              borderLeft: `4px solid ${avgLevel.color}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ flex: 1 }}>
                平均波动率
              </Typography>
              <FieldTooltip
                title={
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      平均波动率
                    </Typography>
                    <Typography variant="body2" paragraph>
                      所有周期波动率的算术平均值，反映市场的整体波动水平。
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>计算公式：</strong><br/>
                      平均波动率 = Σ(各周期波动率) / 周期数
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>等级划分：</strong><br/>
                      • 极低(&lt;0.5%): 市场非常平静<br/>
                      • 低(0.5-1%): 波动温和<br/>
                      • 中等(1-2%): 正常波动<br/>
                      • 高(2-3%): 波动剧烈<br/>
                      • 极高(&gt;3%): 极度不稳定
                    </Typography>
                    <Typography variant="body2">
                      <strong>💡 应用：</strong>平均波动率是最重要的风险参考指标，用于确定止损幅度、杠杆倍数和仓位大小。
                    </Typography>
                  </Box>
                }
                placement="right"
              />
            </Box>
            <Typography variant="h5" fontWeight="bold" color={avgLevel.color}>
              {volatility.average.toFixed(4)}%
            </Typography>
            <Chip 
              label={avgLevel.level}
              size="small"
              icon={avgLevel.icon}
              sx={{ 
                mt: 1,
                bgcolor: avgLevel.color,
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          </Box>
        </Grid>

        {/* 中位数波动率 */}
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'action.hover', 
              borderRadius: 2,
              borderLeft: '4px solid #00bcd4',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ flex: 1 }}>
                中位数波动率
              </Typography>
              <FieldTooltip
                title={
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      中位数波动率
                    </Typography>
                    <Typography variant="body2" paragraph>
                      将所有波动率从小到大排序后，位于中间位置的值。中位数不受极端值影响，更能代表"典型"的波动水平。
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>计算方法：</strong><br/>
                      1. 将所有波动率从小到大排序<br/>
                      2. 取中间位置的值（数据个数为奇数时）<br/>
                      3. 或取中间两个值的平均（数据个数为偶数时）
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>与平均值的对比：</strong><br/>
                      • 中位数 &gt; 平均值：存在较多极端低波动<br/>
                      • 中位数 &lt; 平均值：存在较多极端高波动<br/>
                      • 中位数 ≈ 平均值：波动分布较为均匀
                    </Typography>
                    <Typography variant="body2">
                      <strong>💡 应用：</strong>中位数更能反映"常态"市场下的波动水平，适合用于日常交易决策。
                    </Typography>
                  </Box>
                }
                placement="right"
              />
            </Box>
            <Typography variant="h5" fontWeight="bold">
              {extraStats.median.toFixed(4)}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              更能代表典型水平
            </Typography>
          </Box>
        </Grid>

        {/* 最大波动率 */}
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'action.hover', 
              borderRadius: 2,
              borderLeft: `4px solid ${maxLevel.color}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ flex: 1 }}>
                最大波动率
              </Typography>
              <FieldTooltip
                title={
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      最大波动率
                    </Typography>
                    <Typography variant="body2" paragraph>
                      统计周期内出现的最大波动幅度，代表市场的极端波动水平和潜在风险。
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>风险意义：</strong><br/>
                      • 反映了"最坏情况"下可能的价格波动<br/>
                      • 用于压力测试和风险评估<br/>
                      • 决定最大止损距离的重要参考
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>实战应用：</strong><br/>
                      1. 止损设置至少应大于最大波动率<br/>
                      2. 仓位控制需考虑极端情况的冲击<br/>
                      3. 高最大波动率（&gt;3%）需降低杠杆
                    </Typography>
                    <Typography variant="body2">
                      <strong>💡 提示：</strong>如果最大波动率远高于平均值（超过3倍），说明市场存在突发性风险事件。
                    </Typography>
                  </Box>
                }
                placement="right"
              />
            </Box>
            <Typography variant="h5" fontWeight="bold" color={maxLevel.color}>
              {volatility.max.toFixed(4)}%
            </Typography>
            <Chip 
              label={maxLevel.level}
              size="small"
              icon={maxLevel.icon}
              sx={{ 
                mt: 1,
                bgcolor: maxLevel.color,
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          </Box>
        </Grid>

        {/* 最小波动率 */}
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'action.hover', 
              borderRadius: 2,
              borderLeft: '4px solid #4caf50',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ flex: 1 }}>
                最小波动率
              </Typography>
              <FieldTooltip
                title={
                  <Box sx={{ p: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      最小波动率
                    </Typography>
                    <Typography variant="body2" paragraph>
                      统计周期内出现的最小波动幅度，代表市场最平静的时段。
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>意义：</strong><br/>
                      • 反映市场最稳定时的波动水平<br/>
                      • 极低的最小波动率（&lt;0.1%）可能预示市场即将变盘<br/>
                      • 平静后往往伴随剧烈波动
                    </Typography>
                    <Typography variant="body2" paragraph>
                      <strong>交易策略：</strong><br/>
                      1. 最小波动时段适合建仓或调整仓位<br/>
                      2. 网格交易在低波动期效果较好<br/>
                      3. 警惕"暴风雨前的宁静"
                    </Typography>
                    <Typography variant="body2">
                      <strong>💡 提示：</strong>如果最小波动率接近0，市场可能正在蓄势待发，需做好两个方向的应对准备。
                    </Typography>
                  </Box>
                }
                placement="right"
              />
            </Box>
            <Typography variant="h5" fontWeight="bold">
              {volatility.min.toFixed(4)}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              最平静时段
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* 扩展统计指标 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* 波动率范围 */}
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'action.hover', 
              borderRadius: 2,
              borderLeft: '4px solid #666666',
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              波动率范围
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {extraStats.range.toFixed(4)}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              最大-最小差值
            </Typography>
          </Box>
        </Grid>

        {/* 标准差 */}
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'action.hover', 
              borderRadius: 2,
              borderLeft: '4px solid #888888',
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              标准差
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {volatility.stdDev.toFixed(4)}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              波动离散程度
            </Typography>
          </Box>
        </Grid>

        {/* 变异系数 */}
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'action.hover', 
              borderRadius: 2,
              borderLeft: '4px solid #777777',
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              变异系数 (CV)
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {extraStats.cv.toFixed(2)}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              相对波动强度
            </Typography>
          </Box>
        </Grid>

        {/* 四分位距 (IQR) */}
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'action.hover', 
              borderRadius: 2,
              borderLeft: '4px solid #555555',
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              四分位距 (IQR)
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {extraStats.iqr.toFixed(4)}%
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Q3 - Q1 = {extraStats.q3.toFixed(3)} - {extraStats.q1.toFixed(3)}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* 专业风险指标 */}
      <Box sx={{ mb: 3, p: 2.5, bgcolor: 'grey.100', borderRadius: 2, border: '1px solid', borderColor: 'grey.300' }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          ⚠️ 专业风险指标 (Advanced Risk Metrics)
        </Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                VaR (95%置信度)
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="error.main">
                {extraStats.var95.toFixed(4)}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                95%时间内最大波动
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                CVaR (条件VaR)
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="error.dark">
                {extraStats.cvar95.toFixed(4)}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                极端情况平均波动
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                最大连续高波动
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {extraStats.maxConsecutiveHigh} 周期
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                风险集中度指标
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                异常值占比
              </Typography>
              <Typography variant="h6" fontWeight="bold" color="warning.main">
                {extraStats.outlierRatio.toFixed(1)}%
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                基于IQR方法检测
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* 分布形态分析 */}
      <Box sx={{ mb: 3, p: 2.5, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          📐 分布形态分析 (Distribution Analysis)
        </Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                偏度 (Skewness): {extraStats.skewness.toFixed(3)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.abs(extraStats.skewness) < 0.5 
                  ? '✅ 分布基本对称，数据较为均衡，无明显偏向' 
                  : extraStats.skewness > 0 
                    ? `⚠️ 正偏分布（右偏），存在${Math.abs(extraStats.skewness) > 1 ? '较多' : '一些'}极端高波动时段，注意控制风险` 
                    : `⚠️ 负偏分布（左偏），存在${Math.abs(extraStats.skewness) > 1 ? '较多' : '一些'}极端低波动时段，市场可能异常平静`}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                峰度 (Kurtosis): {extraStats.kurtosis.toFixed(3)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.abs(extraStats.kurtosis) < 1 
                  ? '✅ 接近正态分布，波动率变化符合一般规律' 
                  : extraStats.kurtosis > 0 
                    ? `⚠️ 尖峰厚尾分布（${extraStats.kurtosis > 3 ? '强' : '中等'}），极端事件发生概率高于正态分布，存在"黑天鹅"风险` 
                    : '⚠️ 扁平分布，波动率变化较为分散，缺乏明确中心趋势'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* 波动率动态特征 */}
      <Box sx={{ mb: 3, p: 2.5, bgcolor: 'grey.100', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          📊 波动率动态特征 (Volatility Dynamics)
        </Typography>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                自相关系数 (Lag-1)
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {extraStats.autoCorrelation.toFixed(3)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {Math.abs(extraStats.autoCorrelation) > 0.3 
                  ? `⚠️ 存在${extraStats.autoCorrelation > 0 ? '正' : '负'}自相关，波动聚集性${Math.abs(extraStats.autoCorrelation) > 0.5 ? '强' : '中等'}（GARCH效应）` 
                  : '✅ 自相关性弱，波动率相对独立'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                趋势强度
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {extraStats.trendStrength.toFixed(2)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {extraStats.trendStrength < 1 
                  ? '✅ 无明显趋势，波动率基本稳定' 
                  : extraStats.trendSlope > 0 
                    ? `⚠️ 上升趋势${extraStats.trendStrength > 3 ? '明显' : ''}，波动率持续增加` 
                    : `✅ 下降趋势${extraStats.trendStrength > 3 ? '明显' : ''}，市场趋于平静`}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                动量变化 (近期vs早期)
              </Typography>
              <Typography variant="h6" fontWeight="bold" color={extraStats.momentumChange > 10 ? 'error.main' : extraStats.momentumChange < -10 ? 'success.main' : 'text.primary'}>
                {extraStats.momentumChange > 0 ? '+' : ''}{extraStats.momentumChange.toFixed(2)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {Math.abs(extraStats.momentumChange) < 10 
                  ? '✅ 波动率相对稳定，无显著变化' 
                  : extraStats.momentumChange > 0 
                    ? `⚠️ 近期波动率上升${Math.abs(extraStats.momentumChange) > 30 ? '显著' : '明显'}，警惕风险升级` 
                    : `✅ 近期波动率下降${Math.abs(extraStats.momentumChange) > 30 ? '显著' : '明显'}，市场趋于稳定`}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                上涨周期占比
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {extraStats.risingRatio.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {Math.abs(extraStats.risingRatio - 50) < 10 
                  ? '✅ 涨跌均衡，波动率无明确方向' 
                  : extraStats.risingRatio > 50 
                    ? `⚠️ 上涨主导（${extraStats.risingRatio.toFixed(0)}%），波动率趋于上升` 
                    : `✅ 下跌主导（${(100-extraStats.risingRatio).toFixed(0)}%），波动率趋于下降`}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                赫芬达尔指数 (HHI)
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {extraStats.hhi.toFixed(0)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {extraStats.hhi < 1500 
                  ? '✅ 波动分散均匀，无明显集中' 
                  : extraStats.hhi < 2500 
                    ? '⚠️ 波动适度集中，需关注重点时段' 
                    : '⚠️ 波动高度集中，少数时段主导市场'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                最大连续低波动
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {extraStats.maxConsecutiveLow} 周期
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {extraStats.maxConsecutiveLow > periods * 0.2 
                  ? '✅ 存在长期平静期，适合积累仓位' 
                  : '⚠️ 缺乏持续平静期，市场持续活跃'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* 波动分布情况 */}
      <Box sx={{ mb: 3, p: 2, bgcolor: 'action.hover', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <ShowChartIcon sx={{ mr: 0.5 }} />
          <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1 }}>
            波动分布情况
          </Typography>
          <FieldTooltip
            title={
              <Box sx={{ p: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  波动分布情况
                </Typography>
                <Typography variant="body2" paragraph>
                  根据波动率与平均值、标准差的关系，将所有周期分为三类，直观展示市场状态分布。
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>分类标准：</strong><br/>
                  • 高波动时段：波动率 &gt; 平均值 + 标准差<br/>
                  • 稳定时段：平均值 ± 0.5倍标准差范围内<br/>
                  • 低波动时段：波动率 &lt; 平均值 - 标准差
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>理想分布：</strong><br/>
                  • 稳定时段占比 &gt; 50%：市场可预测性高<br/>
                  • 高波动时段占比 &lt; 20%：风险可控<br/>
                  • 低波动时段占比适中：市场保持活力
                </Typography>
                <Typography variant="body2">
                  <strong>💡 应用：</strong>高波动时段过多（&gt;30%）需谨慎交易，稳定时段占比高适合稳健策略。
                </Typography>
              </Box>
            }
            placement="right"
          />
        </Box>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              高波动时段
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="error.main">
              {extraStats.highVolRatio.toFixed(1)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={extraStats.highVolRatio} 
              color="error"
              sx={{ mt: 0.5, height: 4, borderRadius: 1 }}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              稳定时段
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="success.main">
              {extraStats.stableRatio.toFixed(1)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={extraStats.stableRatio} 
              color="success"
              sx={{ mt: 0.5, height: 4, borderRadius: 1 }}
            />
          </Grid>
          <Grid item xs={4}>
            <Typography variant="caption" color="text.secondary" display="block">
              低波动时段
            </Typography>
            <Typography variant="body1" fontWeight="bold" color="info.main">
              {extraStats.lowVolRatio.toFixed(1)}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={extraStats.lowVolRatio} 
              color="info"
              sx={{ mt: 0.5, height: 4, borderRadius: 1 }}
            />
          </Grid>
        </Grid>
      </Box>

      {/* 风险管理快速参考 */}
      <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            🛡️ 风险管理参考
          </Typography>
          <FieldTooltip
            title={
              <Box sx={{ p: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  风险管理参考
                </Typography>
                <Typography variant="body2" paragraph>
                  基于当前波动率水平，自动计算的风险控制建议，包括止损、杠杆、仓位和持仓时长四个核心维度。
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>💡 重要提示：</strong><br/>
                  • 这些建议基于统计分析，适用于大多数情况<br/>
                  • 实际交易需结合市场环境、个人风险承受能力<br/>
                  • 建议作为参考起点，可根据经验调整<br/>
                  • 风险管理是交易成功的关键，切勿忽视
                </Typography>
                <Typography variant="body2">
                  <strong>📖 使用原则：</strong>宁可错过机会，也不承担过大风险。小仓位试错，大仓位确认。
                </Typography>
              </Box>
            }
            placement="left"
          />
        </Box>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  建议止损
                </Typography>
                <FieldTooltip
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        建议止损幅度
                      </Typography>
                      <Typography variant="body2" paragraph>
                        止损幅度应略大于平均波动率，避免被正常波动触发，同时控制最大亏损。
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>设置原则：</strong><br/>
                        • 最小值：约0.8倍平均波动率<br/>
                        • 最大值：约1.2-1.5倍平均波动率<br/>
                        • 不应小于最小波动率<br/>
                        • 不应超过最大波动率的一半
                      </Typography>
                      <Typography variant="body2">
                        <strong>💡 技巧：</strong>可根据支撑阻力位、ATR指标等技术分析工具微调止损位置。
                      </Typography>
                    </Box>
                  }
                  placement="top"
                />
              </Box>
              <Typography variant="body2" fontWeight="bold">
                {getStopLossAdvice()}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  建议杠杆
                </Typography>
                <FieldTooltip
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        建议杠杆倍数
                      </Typography>
                      <Typography variant="body2" paragraph>
                        杠杆倍数与波动率成反比：波动越大，杠杆应越低，避免被强制平仓。
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>杠杆选择：</strong><br/>
                        • 极低波动（&lt;0.5%）：5-10倍安全<br/>
                        • 低波动（0.5-1%）：3-5倍较稳健<br/>
                        • 中等波动（1-2%）：2-3倍控制风险<br/>
                        • 高波动（2-3%）：1-2倍或无杠杆<br/>
                        • 极高波动（&gt;3%）：仅现货交易
                      </Typography>
                      <Typography variant="body2">
                        <strong>⚠️ 警告：</strong>高杠杆虽能放大收益，但更容易爆仓，新手建议从低杠杆开始。
                      </Typography>
                    </Box>
                  }
                  placement="top"
                />
              </Box>
              <Typography variant="body2" fontWeight="bold">
                {volatility.average < 0.5 ? '5-10倍' :
                 volatility.average < 1 ? '3-5倍' :
                 volatility.average < 2 ? '2-3倍' :
                 volatility.average < 3 ? '1-2倍' :
                 '1倍或现货'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  单次仓位
                </Typography>
                <FieldTooltip
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        单次仓位占比
                      </Typography>
                      <Typography variant="body2" paragraph>
                        单次交易使用的资金占总资金的比例。仓位过大容易暴露于巨大风险，过小则难以获得有意义的收益。
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>仓位管理：</strong><br/>
                        • 极低波动：可用30-50%仓位<br/>
                        • 低波动：建议20-30%<br/>
                        • 中等波动：控制在10-20%<br/>
                        • 高波动：仅5-10%小仓位试探<br/>
                        • 极高波动：≤5%或观望
                      </Typography>
                      <Typography variant="body2">
                        <strong>💡 分批建仓：</strong>可将仓位分2-3次建立，降低单点入场风险，提高成本价优势。
                      </Typography>
                    </Box>
                  }
                  placement="top"
                />
              </Box>
              <Typography variant="body2" fontWeight="bold">
                {volatility.average < 0.5 ? '30-50%' :
                 volatility.average < 1 ? '20-30%' :
                 volatility.average < 2 ? '10-20%' :
                 volatility.average < 3 ? '5-10%' :
                 '≤5%'}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 0.5 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  持仓时长
                </Typography>
                <FieldTooltip
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        建议持仓时长
                      </Typography>
                      <Typography variant="body2" paragraph>
                        根据波动率水平，建议的持仓周期。波动越大，应越快进快出，避免风险累积。
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>时长策略：</strong><br/>
                        • 低波动：数天至数周的中长期持仓<br/>
                        • 中等波动：数小时至1天的短线交易<br/>
                        • 高波动：分钟至小时级别的超短线<br/>
                        • 极高波动：快进快出，见好就收
                      </Typography>
                      <Typography variant="body2">
                        <strong>💡 灵活调整：</strong>如果持仓后波动率显著上升，应考虑提前离场或收紧止损。
                      </Typography>
                    </Box>
                  }
                  placement="top"
                />
              </Box>
              <Typography variant="body2" fontWeight="bold">
                {volatility.average < 1 ? '数天-数周' :
                 volatility.average < 2 ? '数小时-1天' :
                 volatility.average < 3 ? '分钟-小时' :
                 '快进快出'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* 补充说明 */}
      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          💡 <strong>说明:</strong> 波动率 = (最高价 - 最低价) / 开盘价 × 100%，反映单个周期内的价格波动幅度。
          以上建议仅供参考，实际交易请结合自身风险承受能力和市场环境综合判断。
        </Typography>
      </Box>
    </Paper>
  );
}

export default VolatilityStatsCard;


