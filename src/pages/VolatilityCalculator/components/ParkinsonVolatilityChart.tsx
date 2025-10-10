/**
 * Parkinson波动率对比图
 * 对比传统波动率和Parkinson波动率（基于高低价的更精确估计）
 */

import React, { useMemo } from 'react';
import { Box, Typography, Paper, Grid, Chip, Alert } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { VolatilityStats } from '../../../services/binance';

export interface ParkinsonVolatilityChartProps {
  data: VolatilityStats;
  height?: number;
}

/**
 * 计算Parkinson波动率
 * σ_P = √[ln(High/Low)² / (4×ln2)]
 */
function calculateParkinsonVolatility(high: number, low: number): number {
  if (low <= 0 || high <= 0 || high < low) return 0;
  
  const ratio = high / low;
  const logRatio = Math.log(ratio);
  const parkinson = Math.sqrt(logRatio * logRatio / (4 * Math.log(2)));
  
  return parkinson * 100; // 转换为百分比
}

/**
 * Parkinson波动率对比图组件
 */
export function ParkinsonVolatilityChart({ data, height = 500 }: ParkinsonVolatilityChartProps) {
  const { volatility, klines } = data;

  if (!klines || klines.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
        <Alert severity="info">需要K线数据才能计算Parkinson波动率</Alert>
      </Paper>
    );
  }

  // 计算Parkinson波动率
  const parkinsonData = useMemo(() => {
    const parkinsonValues = klines.map(k => 
      calculateParkinsonVolatility(k.high, k.low)
    );

    const parkinsonAverage = parkinsonValues.reduce((s, v) => s + v, 0) / parkinsonValues.length;
    const parkinsonMax = Math.max(...parkinsonValues);
    const parkinsonMin = Math.min(...parkinsonValues);
    
    // 计算与传统波动率的相关性
    const n = Math.min(volatility.values.length, parkinsonValues.length);
    const mean1 = volatility.values.slice(0, n).reduce((s, v) => s + v, 0) / n;
    const mean2 = parkinsonValues.slice(0, n).reduce((s, v) => s + v, 0) / n;

    let numerator = 0;
    let denom1 = 0;
    let denom2 = 0;

    for (let i = 0; i < n; i++) {
      const dev1 = volatility.values[i] - mean1;
      const dev2 = parkinsonValues[i] - mean2;
      numerator += dev1 * dev2;
      denom1 += dev1 * dev1;
      denom2 += dev2 * dev2;
    }

    const correlation = denom1 && denom2 
      ? numerator / Math.sqrt(denom1 * denom2)
      : 0;

    // 计算效率比（Parkinson vs 传统）
    const efficiencyRatio = parkinsonAverage / volatility.average;

    return {
      values: parkinsonValues,
      average: parkinsonAverage,
      max: parkinsonMax,
      min: parkinsonMin,
      correlation,
      efficiencyRatio,
    };
  }, [klines, volatility]);

  // 生成时间标签
  const timeLabels = useMemo(() => {
    return volatility.values.map((_, index) => `T-${volatility.values.length - 1 - index}`);
  }, [volatility.values.length]);

  const chartOption = useMemo(() => ({
    title: {
      text: 'Parkinson波动率 vs 传统波动率对比',
      subtext: `相关系数: ${parkinsonData.correlation.toFixed(4)}`,
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
          content += `${param.marker} ${param.seriesName}: <strong>${param.value.toFixed(4)}%</strong><br/>`;
        });
        
        // 计算当前点的差异
        const index = params[0].dataIndex;
        const traditional = volatility.values[index];
        const parkinson = parkinsonData.values[index];
        const diff = parkinson - traditional;
        const diffPercent = (diff / traditional) * 100;
        
        content += `<br/>━━━━━━━━━<br/>`;
        content += `差异: ${diff > 0 ? '+' : ''}${diff.toFixed(4)}% (${diffPercent > 0 ? '+' : ''}${diffPercent.toFixed(2)}%)<br/>`;
        content += `Parkinson ${diff > 0 ? '更高' : '更低'}`;
        
        return content;
      },
    },
    legend: {
      data: ['传统波动率', 'Parkinson波动率', '传统平均', 'Parkinson平均'],
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
      name: '波动率 (%)',
      nameLocation: 'middle',
      nameGap: 50,
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        name: '传统波动率',
        type: 'line',
        data: volatility.values,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: {
          width: 2,
          color: '#1976d2',
        },
        itemStyle: {
          color: '#1976d2',
        },
        z: 2,
      },
      {
        name: 'Parkinson波动率',
        type: 'line',
        data: parkinsonData.values,
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: {
          width: 2.5,
          color: '#ff5722',
        },
        itemStyle: {
          color: '#ff5722',
        },
        z: 3,
      },
      {
        name: '传统平均',
        type: 'line',
        data: new Array(volatility.values.length).fill(volatility.average),
        lineStyle: {
          type: 'dashed',
          width: 1.5,
          color: '#1976d2',
        },
        symbol: 'none',
        z: 1,
      },
      {
        name: 'Parkinson平均',
        type: 'line',
        data: new Array(parkinsonData.values.length).fill(parkinsonData.average),
        lineStyle: {
          type: 'dashed',
          width: 1.5,
          color: '#ff5722',
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
  }), [volatility, parkinsonData, timeLabels]);

  return (
    <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        📊 Parkinson波动率分析
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        基于高低价的Parkinson波动率估计，相比传统方法更精确、更高效
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
          📈 对比统计
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center', borderLeft: '4px solid #1976d2' }}>
              <Typography variant="caption" color="text.secondary">传统平均</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {volatility.average.toFixed(4)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center', borderLeft: '4px solid #ff5722' }}>
              <Typography variant="caption" color="text.secondary">Parkinson平均</Typography>
              <Typography variant="h6" fontWeight="bold" color="error.main">
                {parkinsonData.average.toFixed(4)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">相关系数</Typography>
              <Typography variant="h6" fontWeight="bold">
                {parkinsonData.correlation.toFixed(4)}
              </Typography>
              <Chip 
                label={Math.abs(parkinsonData.correlation) > 0.8 ? '强相关' : '中等相关'} 
                size="small" 
                color={Math.abs(parkinsonData.correlation) > 0.8 ? 'success' : 'warning'}
                sx={{ mt: 0.5 }}
              />
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">效率比</Typography>
              <Typography variant="h6" fontWeight="bold">
                {parkinsonData.efficiencyRatio.toFixed(2)}x
              </Typography>
              <Typography variant="caption" color="text.secondary">
                P / 传统
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ p: 1.5, bgcolor: 'info.light', borderRadius: 1, mb: 2 }}>
          <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
            🔬 Parkinson波动率公式:
          </Typography>
          <Typography variant="caption" display="block" sx={{ fontFamily: 'monospace', mb: 1 }}>
            σ_P = √[ln(High/Low)² / (4×ln2)]
          </Typography>
          <Typography variant="caption" display="block">
            <strong>优势:</strong>
          </Typography>
          <Typography variant="caption" display="block">
            • 利用高低价信息，比仅使用开盘价和收盘价更精确
          </Typography>
          <Typography variant="caption" display="block">
            • 统计效率更高，相同数据下估计误差更小
          </Typography>
          <Typography variant="caption" display="block">
            • 不受开盘价跳空影响
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, bgcolor: 'warning.light', borderRadius: 1 }}>
          <Typography variant="caption" color="text.primary">
            💡 <strong>应用建议:</strong><br/>
            {parkinsonData.correlation > 0.9 ? (
              `两种波动率高度相关(${parkinsonData.correlation.toFixed(3)})，传统方法在此市场中已足够准确。`
            ) : parkinsonData.correlation > 0.7 ? (
              `两种波动率相关性较好(${parkinsonData.correlation.toFixed(3)})，Parkinson方法能提供更精确的估计，建议用于风险管理。`
            ) : (
              `两种波动率相关性中等(${parkinsonData.correlation.toFixed(3)})，说明价格内部波动（高低价差异）包含传统方法未捕捉的信息，建议结合使用。`
            )}
            <br/><br/>
            {parkinsonData.efficiencyRatio > 1.2 ? (
              `⚠️ Parkinson波动率显著高于传统方法(${parkinsonData.efficiencyRatio.toFixed(2)}x)，说明存在大量日内波动，传统方法可能低估风险。`
            ) : parkinsonData.efficiencyRatio < 0.8 ? (
              `✅ Parkinson波动率低于传统方法(${parkinsonData.efficiencyRatio.toFixed(2)}x)，可能存在价格跳空或系统性趋势。`
            ) : (
              `✅ 两种方法估计接近(${parkinsonData.efficiencyRatio.toFixed(2)}x)，市场波动模式相对均衡。`
            )}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default ParkinsonVolatilityChart;

