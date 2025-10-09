/**
 * 波动率图表组件
 * 使用原生SVG绘制波动率折线图和柱状图
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
} from '@mui/icons-material';
import type { VolatilityStats } from '../../../services/binance';

export interface VolatilityChartProps {
  /** 波动率统计数据 */
  data: VolatilityStats;
  /** 图表高度，默认300 */
  height?: number;
}

type ChartType = 'line' | 'bar';

/**
 * 波动率图表组件
 */
export function VolatilityChart({
  data,
  height = 300,
}: VolatilityChartProps) {
  const [chartType, setChartType] = React.useState<ChartType>('line');

  const { volatility } = data;
  const values = volatility.values;

  // 计算图表尺寸
  const padding = { top: 20, right: 40, bottom: 40, left: 50 };
  const width = 800;
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // 计算数据范围
  const { minValue, maxValue, yTicks } = useMemo(() => {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    const buffer = range * 0.1; // 10% 缓冲区
    
    const minValue = Math.max(0, min - buffer);
    const maxValue = max + buffer;
    
    // 生成Y轴刻度
    const tickCount = 5;
    const tickInterval = (maxValue - minValue) / (tickCount - 1);
    const yTicks = Array.from({ length: tickCount }, (_, i) => 
      minValue + tickInterval * i
    );
    
    return { minValue, maxValue, yTicks };
  }, [values]);

  // 计算坐标点
  const points = useMemo(() => {
    return values.map((value, index) => {
      const x = padding.left + (index / (values.length - 1)) * chartWidth;
      const y = padding.top + chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
      return { x, y, value };
    });
  }, [values, chartWidth, chartHeight, minValue, maxValue, padding]);

  // 生成折线路径
  const linePath = useMemo(() => {
    if (points.length === 0) return '';
    return points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');
  }, [points]);

  // 生成面积路径（折线图下方的填充区域）
  const areaPath = useMemo(() => {
    if (points.length === 0) return '';
    const baseline = padding.top + chartHeight;
    const path = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');
    return `${path} L ${points[points.length - 1].x} ${baseline} L ${points[0].x} ${baseline} Z`;
  }, [points, padding, chartHeight]);

  // X轴标签（显示部分时间）
  const xLabels = useMemo(() => {
    const labelCount = Math.min(6, values.length);
    const step = Math.floor(values.length / (labelCount - 1));
    return Array.from({ length: labelCount }, (_, i) => {
      const index = i === labelCount - 1 ? values.length - 1 : i * step;
      return {
        index,
        x: padding.left + (index / (values.length - 1)) * chartWidth,
        label: `#${index + 1}`,
      };
    });
  }, [values.length, chartWidth, padding]);

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      {/* 图表标题和控制 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          波动率趋势图
        </Typography>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={(_, newType) => newType && setChartType(newType)}
          size="small"
        >
          <ToggleButton value="line">
            <LineChartIcon sx={{ mr: 0.5 }} fontSize="small" />
            折线图
          </ToggleButton>
          <ToggleButton value="bar">
            <BarChartIcon sx={{ mr: 0.5 }} fontSize="small" />
            柱状图
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* SVG 图表 */}
      <Box 
        sx={{ 
          width: '100%', 
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        <svg 
          width={width} 
          height={height}
          style={{ 
            minWidth: '600px',
            display: 'block',
          }}
        >
          {/* 背景网格线 */}
          <g>
            {yTicks.map((tick, i) => {
              const y = padding.top + chartHeight - ((tick - minValue) / (maxValue - minValue)) * chartHeight;
              return (
                <g key={i}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartWidth}
                    y2={y}
                    stroke="#e0e0e0"
                    strokeWidth="1"
                    strokeDasharray="4,4"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill="#666"
                  >
                    {tick.toFixed(2)}%
                  </text>
                </g>
              );
            })}
          </g>

          {/* 图表内容 */}
          {chartType === 'line' ? (
            <>
              {/* 面积填充 */}
              <path
                d={areaPath}
                fill="rgba(25, 118, 210, 0.1)"
              />
              {/* 折线 */}
              <path
                d={linePath}
                fill="none"
                stroke="#1976d2"
                strokeWidth="2"
              />
              {/* 数据点 */}
              {points.map((point, index) => (
                <g key={index}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="3"
                    fill="#1976d2"
                  />
                  {/* 悬停提示 */}
                  <title>{`周期 #${index + 1}: ${point.value.toFixed(4)}%`}</title>
                </g>
              ))}
            </>
          ) : (
            <>
              {/* 柱状图 */}
              {points.map((point, index) => {
                const barWidth = Math.max(2, chartWidth / values.length * 0.8);
                const barHeight = chartHeight - (point.y - padding.top);
                const barX = point.x - barWidth / 2;
                const barY = padding.top + chartHeight - barHeight;
                
                return (
                  <g key={index}>
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill="#1976d2"
                      opacity={0.8}
                    />
                    {/* 悬停提示 */}
                    <title>{`周期 #${index + 1}: ${point.value.toFixed(4)}%`}</title>
                  </g>
                );
              })}
            </>
          )}

          {/* X轴 */}
          <line
            x1={padding.left}
            y1={padding.top + chartHeight}
            x2={padding.left + chartWidth}
            y2={padding.top + chartHeight}
            stroke="#333"
            strokeWidth="2"
          />

          {/* Y轴 */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + chartHeight}
            stroke="#333"
            strokeWidth="2"
          />

          {/* X轴标签 */}
          {xLabels.map((label, i) => (
            <text
              key={i}
              x={label.x}
              y={padding.top + chartHeight + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#666"
            >
              {label.label}
            </text>
          ))}

          {/* Y轴标签 */}
          <text
            x={padding.left - 35}
            y={padding.top - 5}
            fontSize="12"
            fill="#666"
          >
            波动率(%)
          </text>

          {/* X轴标签 */}
          <text
            x={padding.left + chartWidth / 2}
            y={height - 5}
            textAnchor="middle"
            fontSize="12"
            fill="#666"
          >
            K线周期序号
          </text>
        </svg>
      </Box>

      {/* 图例说明 */}
      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          📊 显示最近 <strong>{values.length}</strong> 个周期的波动率变化趋势
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 提示: 鼠标悬停在数据点上可查看详细数值
        </Typography>
      </Box>
    </Paper>
  );
}

export default VolatilityChart;


