/**
 * 波动率跳跃检测图
 * 识别异常的波动率跳跃事件
 */

import React, { useMemo } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { VolatilityStats } from '../../../services/binance';

export interface VolatilityJumpDetectionChartProps {
  data: VolatilityStats;
  height?: number;
  threshold?: number; // 跳跃阈值（标准差倍数）
}

export function VolatilityJumpDetectionChart({ 
  data, 
  height = 450,
  threshold = 2.5, 
}: VolatilityJumpDetectionChartProps) {
  const { volatility } = data;
  const values = volatility.values;

  // 检测跳跃
  const jumpData = useMemo(() => {
    const changes: number[] = [];
    for (let i = 1; i < values.length; i++) {
      changes.push(values[i] - values[i - 1]);
    }

    const mean = changes.reduce((s, c) => s + c, 0) / changes.length;
    const variance = changes.reduce((s, c) => s + Math.pow(c - mean, 2), 0) / (changes.length - 1);
    const std = Math.sqrt(variance);

    const jumpThreshold = threshold * std;
    const jumps: Array<{
      index: number;
      value: number;
      change: number;
      type: 'up' | 'down';
      severity: 'moderate' | 'severe';
    }> = [];

    changes.forEach((change, i) => {
      if (Math.abs(change) > jumpThreshold) {
        jumps.push({
          index: i + 1,
          value: values[i + 1],
          change,
          type: change > 0 ? 'up' : 'down',
          severity: Math.abs(change) > threshold * 1.5 * std ? 'severe' : 'moderate',
        });
      }
    });

    return { jumps, mean, std, jumpThreshold };
  }, [values, threshold]);

  const timeLabels = values.map((_, i) => `T-${values.length - 1 - i}`);

  const chartOption = useMemo(() => ({
    title: {
      text: '波动率跳跃检测',
      subtext: `检测阈值: ±${threshold}σ，发现${jumpData.jumps.length}个跳跃事件`,
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
    },
    legend: {
      data: ['波动率', `上界(+${threshold}σ)`, `下界(-${threshold}σ)`, '向上跳跃', '向下跳跃'],
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
      data: timeLabels,
      boundaryGap: false,
      axisLabel: {
        interval: Math.max(0, Math.floor(timeLabels.length / 12)),
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
      name: '波动率 (%)',
      nameLocation: 'middle',
      nameGap: 50,
      axisLabel: { formatter: '{value}%' },
    },
    series: [
      {
        name: '波动率',
        type: 'line',
        data: values,
        smooth: false,
        lineStyle: { width: 2, color: '#1976d2' },
        symbol: 'none',
      },
      {
        name: `上界(+${threshold}σ)`,
        type: 'line',
        data: values.map(v => v + jumpData.jumpThreshold),
        lineStyle: { width: 1.5, type: 'dashed', color: '#ff9800' },
        symbol: 'none',
      },
      {
        name: `下界(-${threshold}σ)`,
        type: 'line',
        data: values.map(v => Math.max(0, v - jumpData.jumpThreshold)),
        lineStyle: { width: 1.5, type: 'dashed', color: '#ff9800' },
        symbol: 'none',
      },
      {
        name: '向上跳跃',
        type: 'scatter',
        data: jumpData.jumps
          .filter(j => j.type === 'up')
          .map(j => ({
            value: [j.index, j.value],
            severity: j.severity,
          })),
        symbolSize: (dataItem: any) => {
          return dataItem.severity === 'severe' ? 20 : 12;
        },
        symbol: 'arrow',
        symbolRotate: 0,
        itemStyle: { color: '#f44336' },
      },
      {
        name: '向下跳跃',
        type: 'scatter',
        data: jumpData.jumps
          .filter(j => j.type === 'down')
          .map(j => ({
            value: [j.index, j.value],
            severity: j.severity,
          })),
        symbolSize: (dataItem: any) => {
          return dataItem.severity === 'severe' ? 20 : 12;
        },
        symbol: 'arrow',
        symbolRotate: 180,
        itemStyle: { color: '#4caf50' },
      },
    ],
    dataZoom: [
      { type: 'inside', start: 0, end: 100 },
      { start: 0, end: 100, height: 20, bottom: 10 },
    ],
  }), [values, timeLabels, jumpData, threshold]);

  const upJumps = jumpData.jumps.filter(j => j.type === 'up').length;
  const downJumps = jumpData.jumps.filter(j => j.type === 'down').length;
  const severeJumps = jumpData.jumps.filter(j => j.severity === 'severe').length;

  return (
    <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        ⚡ 波动率跳跃检测
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        识别异常的波动率突变事件，警示潜在的市场风险
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
          📊 跳跃事件统计
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip label={`总跳跃: ${jumpData.jumps.length}`} color="primary" />
          <Chip label={`向上: ${upJumps}`} color="error" variant="outlined" />
          <Chip label={`向下: ${downJumps}`} color="success" variant="outlined" />
          <Chip label={`严重: ${severeJumps}`} color="warning" />
        </Box>

        <Typography variant="caption" color="text.secondary">
          💡 跳跃事件可能由重大新闻、政策变动或流动性冲击引起。建议在跳跃后调整风险敞口。
        </Typography>
      </Box>
    </Paper>
  );
}

export default VolatilityJumpDetectionChart;

