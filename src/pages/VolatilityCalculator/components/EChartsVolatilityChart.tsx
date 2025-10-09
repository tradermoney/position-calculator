/**
 * ECharts波动率图表组件
 * 使用ECharts提供更美观的图表展示
 */

import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  ShowChart as LineChartIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
} from '@mui/icons-material';
import ReactECharts from 'echarts-for-react';
import type { VolatilityStats } from '../../../services/binance';

export interface EChartsVolatilityChartProps {
  /** 波动率统计数据 */
  data: VolatilityStats;
  /** 图表高度，默认400 */
  height?: number;
}

type ChartType = 'line' | 'bar' | 'distribution';

/**
 * ECharts波动率图表组件
 */
export function EChartsVolatilityChart({
  data,
  height = 400,
}: EChartsVolatilityChartProps) {
  const [chartType, setChartType] = React.useState<ChartType>('line');

  const { volatility } = data;
  const values = volatility.values;

  // 生成时间轴标签
  const timeLabels = useMemo(() => {
    return values.map((_, index) => `#${index + 1}`);
  }, [values.length]);

  // 波动率趋势图配置
  const lineChartOption = useMemo(() => ({
    title: {
      text: '波动率趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const point = params[0];
        return `周期: ${point.name}<br/>波动率: ${point.value.toFixed(4)}%`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: timeLabels,
      axisLabel: {
        interval: Math.max(1, Math.floor(values.length / 10)),
      },
    },
    yAxis: {
      type: 'value',
      name: '波动率(%)',
      nameLocation: 'middle',
      nameGap: 50,
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        name: '波动率',
        type: 'line',
        data: values,
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
      },
    ],
  }), [values, timeLabels]);

  // 柱状图配置
  const barChartOption = useMemo(() => ({
    title: {
      text: '波动率分布',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const point = params[0];
        return `周期: ${point.name}<br/>波动率: ${point.value.toFixed(4)}%`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: timeLabels,
      axisLabel: {
        interval: Math.max(1, Math.floor(values.length / 10)),
      },
    },
    yAxis: {
      type: 'value',
      name: '波动率(%)',
      nameLocation: 'middle',
      nameGap: 50,
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        name: '波动率',
        type: 'bar',
        data: values,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#1976d2' },
              { offset: 1, color: '#42a5f5' },
            ],
          },
        },
      },
    ],
  }), [values, timeLabels]);

  // 波动率分布饼图配置
  const distributionChartOption = useMemo(() => {
    // 计算波动率区间分布
    const ranges = [
      { name: '极低 (0-0.5%)', min: 0, max: 0.5, count: 0, color: '#4caf50' },
      { name: '低 (0.5-1%)', min: 0.5, max: 1, count: 0, color: '#8bc34a' },
      { name: '中等 (1-2%)', min: 1, max: 2, count: 0, color: '#ff9800' },
      { name: '高 (2-3%)', min: 2, max: 3, count: 0, color: '#ff5722' },
      { name: '极高 (>3%)', min: 3, max: Infinity, count: 0, color: '#f44336' },
    ];

    values.forEach(value => {
      const range = ranges.find(r => value >= r.min && value < r.max);
      if (range) {
        range.count++;
      }
    });

    const pieData = ranges
      .filter(range => range.count > 0)
      .map(range => ({
        name: range.name,
        value: range.count,
        itemStyle: { color: range.color },
      }));

    return {
      title: {
        text: '波动率分布统计',
        left: 'center',
        textStyle: {
          fontSize: 16,
          fontWeight: 'bold',
        },
      },
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        top: 'middle',
      },
      series: [
        {
          name: '波动率分布',
          type: 'pie',
          radius: ['40%', '70%'],
          center: ['60%', '50%'],
          data: pieData,
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            show: true,
            formatter: '{b}: {c}',
          },
        },
      ],
    };
  }, [values]);

  // 根据图表类型选择配置
  const chartOption = useMemo(() => {
    switch (chartType) {
      case 'line':
        return lineChartOption;
      case 'bar':
        return barChartOption;
      case 'distribution':
        return distributionChartOption;
      default:
        return lineChartOption;
    }
  }, [chartType, lineChartOption, barChartOption, distributionChartOption]);

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      {/* 图表标题和控制 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          波动率可视化分析
        </Typography>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={(_, newType) => newType && setChartType(newType)}
          size="small"
        >
          <ToggleButton value="line">
            <LineChartIcon sx={{ mr: 0.5 }} fontSize="small" />
            趋势图
          </ToggleButton>
          <ToggleButton value="bar">
            <BarChartIcon sx={{ mr: 0.5 }} fontSize="small" />
            柱状图
          </ToggleButton>
          <ToggleButton value="distribution">
            <PieChartIcon sx={{ mr: 0.5 }} fontSize="small" />
            分布图
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* ECharts 图表 */}
      <Box sx={{ width: '100%' }}>
        <ReactECharts
          option={chartOption}
          style={{ height: `${height}px`, width: '100%' }}
          opts={{ renderer: 'canvas' }}
        />
      </Box>

      {/* 图例说明 */}
      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          📊 显示最近 <strong>{values.length}</strong> 个周期的波动率数据
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 提示: 鼠标悬停可查看详细数值，支持多种图表类型切换
        </Typography>
      </Box>
    </Paper>
  );
}

export default EChartsVolatilityChart;
