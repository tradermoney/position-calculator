/**
 * 波动率锥形图
 * 显示不同时间窗口的历史分位数锥形，类似期权波动率微笑
 */

import React, { useMemo } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { VolatilityStats } from '../../../services/binance';

export interface VolatilityConeChartProps {
  data: VolatilityStats;
  height?: number;
}

/**
 * 计算滚动波动率的分位数
 */
function calculateRollingVolatilityQuantiles(values: number[], windows: number[]) {
  const results: Record<number, {
    min: number[];
    p10: number[];
    p25: number[];
    p50: number[];
    p75: number[];
    p90: number[];
    max: number[];
  }> = {};

  windows.forEach(window => {
    const rollingVols: number[] = [];
    
    // 计算滚动波动率
    for (let i = window - 1; i < values.length; i++) {
      const windowValues = values.slice(i - window + 1, i + 1);
      const mean = windowValues.reduce((s, v) => s + v, 0) / window;
      const variance = windowValues.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (window - 1);
      const vol = Math.sqrt(variance);
      rollingVols.push(vol);
    }

    // 计算分位数
    const sorted = [...rollingVols].sort((a, b) => a - b);
    const n = sorted.length;
    
    results[window] = {
      min: [sorted[0]],
      p10: [sorted[Math.ceil(n * 0.10) - 1]],
      p25: [sorted[Math.ceil(n * 0.25) - 1]],
      p50: [sorted[Math.ceil(n * 0.50) - 1]],
      p75: [sorted[Math.ceil(n * 0.75) - 1]],
      p90: [sorted[Math.ceil(n * 0.90) - 1]],
      max: [sorted[n - 1]],
    };
  });

  return results;
}

/**
 * 波动率锥形图组件
 */
export function VolatilityConeChart({ data, height = 450 }: VolatilityConeChartProps) {
  const { volatility } = data;
  const values = volatility.values;

  // 定义时间窗口
  const windows = useMemo(() => {
    const maxWindow = Math.floor(values.length / 2);
    return [5, 10, 20, 30, Math.min(60, maxWindow)].filter(w => w <= maxWindow);
  }, [values.length]);

  // 计算锥形数据
  const coneData = useMemo(() => {
    return calculateRollingVolatilityQuantiles(values, windows);
  }, [values, windows]);

  // 当前波动率在锥形中的位置
  const currentPosition = useMemo(() => {
    if (windows.length === 0) return { level: '数据不足', color: 'default', rollingVol: 0 };
    
    // 计算当前时间窗口的滚动波动率（而不是原始波动率值）
    const window = windows[0];
    const recentValues = values.slice(-window);
    const mean = recentValues.reduce((s, v) => s + v, 0) / window;
    const variance = recentValues.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / window;
    const currentRollingVol = Math.sqrt(variance);
    
    const quantiles = coneData[window];
    
    if (currentRollingVol <= quantiles.p10[0]) return { level: '极低（≤10%分位）', color: 'success', rollingVol: currentRollingVol };
    if (currentRollingVol <= quantiles.p25[0]) return { level: '低（10-25%分位）', color: 'info', rollingVol: currentRollingVol };
    if (currentRollingVol <= quantiles.p75[0]) return { level: '中等（25-75%分位）', color: 'primary', rollingVol: currentRollingVol };
    if (currentRollingVol <= quantiles.p90[0]) return { level: '高（75-90%分位）', color: 'warning', rollingVol: currentRollingVol };
    return { level: '极高（≥90%分位）', color: 'error', rollingVol: currentRollingVol };
  }, [values, windows, coneData]);

  const chartOption = useMemo(() => ({
    title: {
      text: '波动率锥形图',
      subtext: '历史分位数分布（类似期权波动率微笑）',
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
        const window = params[0].name;
        let content = `<strong>${window}周期滚动波动率</strong><br/>`;
        params.forEach((param: any) => {
          content += `${param.marker} ${param.seriesName}: ${param.value[1].toFixed(4)}%<br/>`;
        });
        return content;
      },
    },
    legend: {
      data: ['最大值', '90%分位', '75%分位', '中位数', '25%分位', '10%分位', '最小值', '当前值'],
      top: 40,
      textStyle: {
        fontSize: 11,
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '22%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      name: '时间窗口（周期数）',
      nameLocation: 'middle',
      nameGap: 30,
      data: windows.map(w => `${w}期`),
      boundaryGap: true,
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
        name: '最大值',
        type: 'line',
        data: windows.map((w, i) => [i, coneData[w].max[0]]),
        lineStyle: { width: 1.5, color: '#f44336', type: 'dashed' },
        symbol: 'circle',
        symbolSize: 4,
      },
      {
        name: '90%分位',
        type: 'line',
        data: windows.map((w, i) => [i, coneData[w].p90[0]]),
        lineStyle: { width: 2, color: '#ff9800' },
        symbol: 'circle',
        symbolSize: 5,
        areaStyle: {
          color: 'rgba(255, 152, 0, 0.1)',
        },
      },
      {
        name: '75%分位',
        type: 'line',
        data: windows.map((w, i) => [i, coneData[w].p75[0]]),
        lineStyle: { width: 2, color: '#ffeb3b' },
        symbol: 'circle',
        symbolSize: 5,
      },
      {
        name: '中位数',
        type: 'line',
        data: windows.map((w, i) => [i, coneData[w].p50[0]]),
        lineStyle: { width: 3, color: '#1976d2' },
        symbol: 'circle',
        symbolSize: 6,
      },
      {
        name: '25%分位',
        type: 'line',
        data: windows.map((w, i) => [i, coneData[w].p25[0]]),
        lineStyle: { width: 2, color: '#4caf50' },
        symbol: 'circle',
        symbolSize: 5,
      },
      {
        name: '10%分位',
        type: 'line',
        data: windows.map((w, i) => [i, coneData[w].p10[0]]),
        lineStyle: { width: 2, color: '#8bc34a' },
        symbol: 'circle',
        symbolSize: 5,
        areaStyle: {
          color: 'rgba(139, 195, 74, 0.1)',
        },
      },
      {
        name: '最小值',
        type: 'line',
        data: windows.map((w, i) => [i, coneData[w].min[0]]),
        lineStyle: { width: 1.5, color: '#4caf50', type: 'dashed' },
        symbol: 'circle',
        symbolSize: 4,
      },
      {
        name: '当前值',
        type: 'scatter',
        data: windows.length > 0 ? [[0, currentPosition.rollingVol]] : [],
        symbolSize: 15,
        symbol: 'pin',
        itemStyle: {
          color: '#e91e63',
          borderColor: '#fff',
          borderWidth: 2,
        },
        z: 10,
      },
    ],
  }), [windows, coneData, currentPosition]);

  return (
    <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        📊 波动率锥形图
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        展示不同时间窗口的历史波动率分位数分布，类似期权波动率微笑
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
          📈 当前波动率位置
        </Typography>
        
        <Chip 
          label={`当前滚动波动率: ${currentPosition.rollingVol.toFixed(4)}% - ${currentPosition.level}`}
          color={currentPosition.color as any}
          sx={{ mb: 2 }}
        />

        <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            💡 <strong>图表解读:</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • 锥形图展示不同时间窗口（{windows[0]}~{windows[windows.length - 1]}期）的历史波动率分布
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • 当前值（粉色标记）显示当前波动率在历史中的位置
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • 落在10-90%分位之间为正常波动
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • 超出90%分位表示异常高波动，需警惕风险
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default VolatilityConeChart;

