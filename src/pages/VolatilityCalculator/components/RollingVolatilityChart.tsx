/**
 * 移动窗口波动率图表
 * 显示不同窗口期（7、14、30周期）的滚动波动率对比
 */

import React, { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { VolatilityStats } from '../../../services/binance';

export interface RollingVolatilityChartProps {
  data: VolatilityStats;
  height?: number;
}

/**
 * 计算移动平均波动率
 */
function calculateRollingAverage(values: number[], window: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < values.length; i++) {
    const start = Math.max(0, i - window + 1);
    const windowValues = values.slice(start, i + 1);
    const avg = windowValues.reduce((sum, v) => sum + v, 0) / windowValues.length;
    result.push(avg);
  }
  
  return result;
}

/**
 * 移动窗口波动率图表组件
 */
export function RollingVolatilityChart({ data, height = 450 }: RollingVolatilityChartProps) {
  const { volatility } = data;
  const values = volatility.values;

  // 计算不同窗口的滚动波动率
  const rollingData = useMemo(() => {
    const windows = [7, 14, 30];
    
    return windows.map(window => ({
      name: `${window}周期滚动波动率`,
      window,
      data: calculateRollingAverage(values, window),
    }));
  }, [values]);

  // 生成时间标签
  const timeLabels = useMemo(() => {
    return values.map((_, index) => `T-${values.length - 1 - index}`);
  }, [values.length]);

  const chartOption = useMemo(() => ({
    title: {
      text: '移动窗口波动率分析',
      subtext: '对比不同窗口期的波动率变化趋势',
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
        label: {
          backgroundColor: '#888888',
        },
      },
      formatter: (params: any) => {
        let content = `<strong>${params[0].name}</strong><br/>`;
        params.forEach((param: any) => {
          content += `${param.marker} ${param.seriesName}: <strong>${param.value.toFixed(4)}%</strong><br/>`;
        });
        return content;
      },
    },
    legend: {
      data: rollingData.map(d => d.name),
      top: 40,
      textStyle: {
        fontSize: 12,
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
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
        interval: Math.max(0, Math.floor(values.length / 10)),
        rotate: 0,
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'value',
      name: '波动率 (%)',
      nameLocation: 'middle',
      nameGap: 45,
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: rollingData.map((rolling, index) => ({
      name: rolling.name,
      type: 'line',
      data: rolling.data,
      smooth: true,
      symbol: 'none',
      lineStyle: {
        width: 2.5,
      },
      emphasis: {
        focus: 'series',
      },
    })),
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
  }), [values, timeLabels, rollingData]);

  return (
    <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        📊 移动窗口波动率分析
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        通过对比不同窗口期的滚动平均波动率，观察市场波动的持续性和短期/长期波动差异
      </Typography>
      
      <Box sx={{ width: '100%', minHeight: `${height}px` }}>
        <ReactECharts
          option={chartOption}
          style={{ height: `${height}px`, width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
        />
      </Box>

      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          💡 <strong>分析要点:</strong>
          • 短窗口（7周期）对波动变化敏感，适合捕捉短期波动
          • 长窗口（30周期）平滑波动，适合观察长期趋势
          • 短窗口与长窗口交叉可能预示波动率转折
        </Typography>
      </Box>
    </Paper>
  );
}

export default RollingVolatilityChart;

