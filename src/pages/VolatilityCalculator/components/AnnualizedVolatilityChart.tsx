/**
 * 年化波动率趋势图
 * 展示年化波动率的变化趋势，便于跨市场和跨时段比较
 */

import React, { useMemo } from 'react';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { VolatilityStats } from '../../../services/binance';

export interface AnnualizedVolatilityChartProps {
  data: VolatilityStats;
  height?: number;
}

/**
 * 计算年化因子
 */
function getAnnualizationFactor(interval: string): number {
  // 根据K线周期计算年化因子
  if (interval.includes('m')) {
    const minutes = parseInt(interval.replace('m', ''));
    return Math.sqrt((365 * 24 * 60) / minutes); // 一年的分钟数 / 周期分钟数
  } else if (interval.includes('h')) {
    const hours = parseInt(interval.replace('h', ''));
    return Math.sqrt((365 * 24) / hours); // 一年的小时数 / 周期小时数
  } else if (interval.includes('d')) {
    const days = parseInt(interval.replace('d', ''));
    return Math.sqrt(365 / days); // 一年的天数 / 周期天数
  } else if (interval.includes('w')) {
    const weeks = parseInt(interval.replace('w', ''));
    return Math.sqrt(52 / weeks); // 一年的周数 / 周期周数
  }
  
  // 默认按小时计算
  return Math.sqrt(365 * 24);
}

/**
 * 年化波动率趋势图组件
 */
export function AnnualizedVolatilityChart({ data, height = 450 }: AnnualizedVolatilityChartProps) {
  const { volatility, interval } = data;

  // 计算年化波动率
  const annualizedData = useMemo(() => {
    const factor = getAnnualizationFactor(interval);
    
    const annualizedValues = volatility.values.map(v => v * factor);
    const annualizedAverage = volatility.average * factor;
    const annualizedStdDev = volatility.stdDev * factor;
    const annualizedMax = volatility.max * factor;
    const annualizedMin = volatility.min * factor;

    // 计算上下波动带（均值 ± 1倍标准差）
    const upperBand = annualizedValues.map((_, i) => annualizedAverage + annualizedStdDev);
    const lowerBand = annualizedValues.map((_, i) => Math.max(0, annualizedAverage - annualizedStdDev));

    return {
      values: annualizedValues,
      average: annualizedAverage,
      stdDev: annualizedStdDev,
      max: annualizedMax,
      min: annualizedMin,
      upperBand,
      lowerBand,
      factor,
    };
  }, [volatility, interval]);

  // 生成时间标签
  const timeLabels = useMemo(() => {
    return volatility.values.map((_, index) => `T-${volatility.values.length - 1 - index}`);
  }, [volatility.values.length]);

  const chartOption = useMemo(() => ({
    title: {
      text: '年化波动率趋势',
      subtext: `年化因子: ${annualizedData.factor.toFixed(2)}`,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
      },
      formatter: (params: any) => {
        let content = `<strong>${params[0].name}</strong><br/>`;
        params.forEach((param: any) => {
          if (param.seriesName === '年化波动率') {
            content += `${param.marker} ${param.seriesName}: <strong>${param.value.toFixed(2)}%</strong><br/>`;
          } else {
            content += `${param.marker} ${param.seriesName}: ${param.value.toFixed(2)}%<br/>`;
          }
        });
        return content;
      },
    },
    legend: {
      data: ['年化波动率', '平均值', '上轨 (+1σ)', '下轨 (-1σ)'],
      top: 40,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '20%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      name: '时间',
      nameLocation: 'middle',
      nameGap: 30,
      data: timeLabels,
      boundaryGap: false,
      axisLabel: {
        interval: Math.max(0, Math.floor(timeLabels.length / 12)),
        rotate: 0,
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
      name: '年化波动率 (%)',
      nameLocation: 'middle',
      nameGap: 50,
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        name: '年化波动率',
        type: 'line',
        data: annualizedData.values,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: {
          width: 2.5,
          color: '#666666',
        },
        itemStyle: {
          color: '#666666',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(25, 118, 210, 0.3)' },
              { offset: 1, color: 'rgba(25, 118, 210, 0.05)' },
            ],
          },
        },
        z: 3,
      },
      {
        name: '平均值',
        type: 'line',
        data: annualizedData.upperBand.map(() => annualizedData.average),
        lineStyle: {
          type: 'dashed',
          width: 2,
          color: '#777777',
        },
        symbol: 'none',
        z: 2,
      },
      {
        name: '上轨 (+1σ)',
        type: 'line',
        data: annualizedData.upperBand,
        lineStyle: {
          type: 'dashed',
          width: 1.5,
          color: '#888888',
        },
        symbol: 'none',
        z: 1,
      },
      {
        name: '下轨 (-1σ)',
        type: 'line',
        data: annualizedData.lowerBand,
        lineStyle: {
          type: 'dashed',
          width: 1.5,
          color: '#999999',
        },
        symbol: 'none',
        z: 1,
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
      {
        start: 0,
        end: 100,
        height: 20,
        bottom: 10,
      },
    ],
  }), [annualizedData, timeLabels]);

  // 分析年化波动率水平
  const getVolatilityLevel = (annualizedVol: number): { level: string; color: 'success' | 'info' | 'warning' | 'error'; desc: string } => {
    if (annualizedVol < 20) {
      return { level: '极低', color: 'success' as const, desc: '市场非常平静' };
    } else if (annualizedVol < 40) {
      return { level: '低', color: 'info' as const, desc: '波动较小' };
    } else if (annualizedVol < 60) {
      return { level: '中等', color: 'warning' as const, desc: '正常波动' };
    } else if (annualizedVol < 80) {
      return { level: '高', color: 'error' as const, desc: '波动较大' };
    } else {
      return { level: '极高', color: 'error' as const, desc: '剧烈波动' };
    }
  };

  const currentLevel = getVolatilityLevel(annualizedData.values[annualizedData.values.length - 1]);
  const averageLevel = getVolatilityLevel(annualizedData.average);

  // 计算突破统计
  const breakthroughStats = useMemo(() => {
    let aboveUpper = 0;
    let belowLower = 0;
    let inRange = 0;

    annualizedData.values.forEach((v, i) => {
      if (v > annualizedData.upperBand[i]) {
        aboveUpper++;
      } else if (v < annualizedData.lowerBand[i]) {
        belowLower++;
      } else {
        inRange++;
      }
    });

    return {
      aboveUpper,
      belowLower,
      inRange,
      total: annualizedData.values.length,
    };
  }, [annualizedData]);

  return (
    <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        📊 年化波动率分析
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        将波动率标准化为年化值，便于跨市场、跨时段比较和策略评估
      </Typography>
      
      <Box sx={{ width: '100%', minHeight: `${height}px` }}>
        <ReactECharts
          option={chartOption}
          style={{ height: `${height}px`, width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
        />
      </Box>

      <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          📈 年化波动率统计
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">当前年化波动率</Typography>
              <Typography variant="h6" fontWeight="bold" color={`${currentLevel.color}.main`}>
                {annualizedData.values[annualizedData.values.length - 1].toFixed(2)}%
              </Typography>
              <Chip label={currentLevel.level} color={currentLevel.color} size="small" sx={{ mt: 0.5 }} />
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">平均年化波动率</Typography>
              <Typography variant="h6" fontWeight="bold">
                {annualizedData.average.toFixed(2)}%
              </Typography>
              <Chip label={averageLevel.level} color={averageLevel.color} size="small" sx={{ mt: 0.5 }} />
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">最高年化波动率</Typography>
              <Typography variant="h6" fontWeight="bold" color="error.main">
                {annualizedData.max.toFixed(2)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">最低年化波动率</Typography>
              <Typography variant="h6" fontWeight="bold" color="success.main">
                {annualizedData.min.toFixed(2)}%
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* 突破统计 */}
        <Box sx={{ p: 1.5, bgcolor: 'info.light', borderRadius: 1, mb: 2 }}>
          <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
            波动带突破统计:
          </Typography>
          <Typography variant="caption" display="block">
            • 超出上轨: {breakthroughStats.aboveUpper} 次 ({((breakthroughStats.aboveUpper / breakthroughStats.total) * 100).toFixed(1)}%)
          </Typography>
          <Typography variant="caption" display="block">
            • 区间内: {breakthroughStats.inRange} 次 ({((breakthroughStats.inRange / breakthroughStats.total) * 100).toFixed(1)}%)
          </Typography>
          <Typography variant="caption" display="block">
            • 跌破下轨: {breakthroughStats.belowLower} 次 ({((breakthroughStats.belowLower / breakthroughStats.total) * 100).toFixed(1)}%)
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            <strong>年化波动率计算公式:</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontFamily: 'monospace' }}>
            年化波动率 = 周期波动率 × √(年化因子)
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            <strong>应用场景:</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • 跨市场比较: 统一标准，比较不同市场的风险水平
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • 策略评估: 评估策略在不同波动率环境下的表现
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • 风险预算: 基于年化波动率制定仓位和止损策略
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default AnnualizedVolatilityChart;

