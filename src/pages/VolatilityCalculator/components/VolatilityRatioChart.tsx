/**
 * 波动率比率分析图
 * 短期/长期波动率比率，识别市场状态变化
 */

import React, { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { VolatilityStats } from '../../../services/binance';

export interface VolatilityRatioChartProps {
  data: VolatilityStats;
  height?: number;
}

function calculateMA(values: number[], window: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const windowValues = values.slice(start, i + 1);
    const avg = windowValues.reduce((s, v) => s + v, 0) / windowValues.length;
    result.push(avg);
  }
  return result;
}

export function VolatilityRatioChart({ data, height = 450 }: VolatilityRatioChartProps) {
  const { volatility } = data;
  const values = volatility.values;

  const ratioData = useMemo(() => {
    const shortWindow = 5;
    const longWindow = 20;
    
    const shortMA = calculateMA(values, shortWindow);
    const longMA = calculateMA(values, longWindow);
    
    const ratio = shortMA.map((s, i) => longMA[i] !== 0 ? s / longMA[i] : 1);
    
    // 识别状态
    const states = ratio.map(r => {
      if (r > 1.2) return 'high';
      if (r < 0.8) return 'low';
      return 'normal';
    });

    return { shortMA, longMA, ratio, states, shortWindow, longWindow };
  }, [values]);

  const timeLabels = values.map((_, i) => `T-${values.length - 1 - i}`);

  const chartOption = useMemo(() => ({
    title: {
      text: '波动率比率分析',
      subtext: `短期(${ratioData.shortWindow}期) / 长期(${ratioData.longWindow}期)`,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: ['短期波动率', '长期波动率', '比率', '高波动信号', '低波动信号'],
      top: 40,
    },
    grid: [
      { left: '3%', right: '4%', top: '20%', height: '30%', containLabel: true },
      { left: '3%', right: '4%', top: '58%', height: '30%', containLabel: true },
    ],
    xAxis: [
      {
        type: 'category',
        data: timeLabels,
        gridIndex: 0,
        axisLabel: { show: false },
      },
      {
        type: 'category',
        data: timeLabels,
        gridIndex: 1,
        axisLabel: {
          interval: Math.max(0, Math.floor(timeLabels.length / 12)),
          fontSize: 10,
        },
      },
    ],
    yAxis: [
      {
        type: 'value',
        name: '波动率 (%)',
        gridIndex: 0,
        nameLocation: 'middle',
        nameGap: 45,
        axisLabel: { formatter: '{value}%' },
      },
      {
        type: 'value',
        name: '比率',
        gridIndex: 1,
        nameLocation: 'middle',
        nameGap: 45,
      },
    ],
    series: [
      {
        name: '短期波动率',
        type: 'line',
        data: ratioData.shortMA,
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: true,
        lineStyle: { width: 2, color: '#f44336' },
        symbol: 'none',
      },
      {
        name: '长期波动率',
        type: 'line',
        data: ratioData.longMA,
        xAxisIndex: 0,
        yAxisIndex: 0,
        smooth: true,
        lineStyle: { width: 2, color: '#1976d2' },
        symbol: 'none',
      },
      {
        name: '比率',
        type: 'line',
        data: ratioData.ratio,
        xAxisIndex: 1,
        yAxisIndex: 1,
        smooth: true,
        lineStyle: { width: 2.5, color: '#ff9800' },
        symbol: 'none',
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { type: 'dashed', width: 1.5 },
          data: [
            { yAxis: 1, label: { formatter: '均衡' }, lineStyle: { color: '#999' } },
            { yAxis: 1.2, label: { formatter: '高波动' }, lineStyle: { color: '#f44336' } },
            { yAxis: 0.8, label: { formatter: '低波动' }, lineStyle: { color: '#4caf50' } },
          ],
        },
      },
      {
        name: '高波动信号',
        type: 'scatter',
        data: ratioData.ratio
          .map((r, i) => r > 1.2 ? [timeLabels[i], r] : null)
          .filter((item): item is [string, number] => item !== null),
        xAxisIndex: 1,
        yAxisIndex: 1,
        symbolSize: 10,
        itemStyle: { color: '#f44336' },
      },
      {
        name: '低波动信号',
        type: 'scatter',
        data: ratioData.ratio
          .map((r, i) => r < 0.8 ? [timeLabels[i], r] : null)
          .filter((item): item is [string, number] => item !== null),
        xAxisIndex: 1,
        yAxisIndex: 1,
        symbolSize: 10,
        itemStyle: { color: '#4caf50' },
      },
    ],
    dataZoom: [{ type: 'inside', start: 0, end: 100 }],
  }), [ratioData, timeLabels]);

  const currentRatio = ratioData.ratio[ratioData.ratio.length - 1];
  const highSignals = ratioData.states.filter(s => s === 'high').length;
  const lowSignals = ratioData.states.filter(s => s === 'low').length;

  return (
    <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        📊 波动率比率分析
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        短期/长期波动率比率，识别市场波动状态变化
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
          📈 比率解读
        </Typography>
        
        <Box sx={{ p: 1.5, bgcolor: currentRatio > 1.2 ? 'error.light' : currentRatio < 0.8 ? 'success.light' : 'info.light', borderRadius: 1, mb: 1 }}>
          <Typography variant="body2">
            当前比率: <strong>{currentRatio.toFixed(2)}</strong> - {
              currentRatio > 1.2 ? '⚠️ 短期波动升高，警惕风险升级' :
              currentRatio < 0.8 ? '✅ 短期波动降低，市场趋于平静' :
              '➖ 波动正常，短长期均衡'
            }
          </Typography>
        </Box>

        <Typography variant="caption" color="text.secondary">
          历史信号: 高波动{highSignals}次，低波动{lowSignals}次
        </Typography>
      </Box>
    </Paper>
  );
}

export default VolatilityRatioChart;

