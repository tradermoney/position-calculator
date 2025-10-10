/**
 * 波动率热力图
 * 展示时间 × 波动率的二维分布，识别特定时段的高波动模式
 */

import React, { useMemo } from 'react';
import { Box, Typography, Paper, Alert } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { VolatilityStats } from '../../../services/binance';

export interface VolatilityHeatmapChartProps {
  data: VolatilityStats;
  height?: number;
}

/**
 * 波动率热力图组件
 */
export function VolatilityHeatmapChart({ data, height = 400 }: VolatilityHeatmapChartProps) {
  const { volatility, klines, interval } = data;

  if (!klines || klines.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
        <Alert severity="info">需要K线数据才能生成热力图</Alert>
      </Paper>
    );
  }

  // 根据时间周期决定分组维度
  const { groupBy, groupLabel } = useMemo(() => {
    if (interval.includes('m') || interval.includes('h')) {
      return { groupBy: 'hour', groupLabel: '小时' };
    } else if (interval.includes('d')) {
      return { groupBy: 'dayOfWeek', groupLabel: '星期' };
    } else {
      return { groupBy: 'hour', groupLabel: '小时' };
    }
  }, [interval]);

  // 构建热力图数据
  const heatmapData = useMemo(() => {
    const data: number[][] = [];
    const rows: string[] = [];
    const cols: string[] = [];

    if (groupBy === 'hour') {
      // 小时 × 波动率 - 使用数组来聚合同一时段的多个值
      const hourData: Record<string, Array<number[]>> = {};
      
      klines.forEach((k, index) => {
        const date = new Date(k.timestamp);
        const hour = date.getHours();
        const day = date.getDate();
        const key = `${day}`;
        
        if (!hourData[key]) {
          hourData[key] = Array.from({ length: 24 }, () => []);
        }
        
        hourData[key][hour].push(volatility.values[index]);
      });

      // 生成列标签（小时）
      for (let h = 0; h < 24; h++) {
        cols.push(`${h}时`);
      }

      // 生成行标签和数据 - 聚合取平均值
      Object.keys(hourData).sort((a, b) => parseInt(a) - parseInt(b)).forEach((day, dayIndex) => {
        rows.push(`${day}日`);
        hourData[day].forEach((values, hour) => {
          if (values.length > 0) {
            const avgValue = values.reduce((sum, v) => sum + v, 0) / values.length;
            data.push([hour, dayIndex, avgValue]);
          }
        });
      });
    } else {
      // 星期 × 波动率 - 使用数组来聚合
      const weekData: Record<number, Array<number[]>> = {};
      const weekNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      
      klines.forEach((k, index) => {
        const date = new Date(k.timestamp);
        const dayOfWeek = date.getDay();
        const weekNum = Math.floor(index / 7);
        
        if (!weekData[weekNum]) {
          weekData[weekNum] = Array.from({ length: 7 }, () => []);
        }
        
        weekData[weekNum][dayOfWeek].push(volatility.values[index]);
      });

      // 生成列标签（星期）
      cols.push(...weekNames);

      // 生成行标签和数据 - 聚合取平均值
      Object.keys(weekData).forEach((weekNum, weekIndex) => {
        rows.push(`第${parseInt(weekNum) + 1}周`);
        weekData[parseInt(weekNum)].forEach((values, day) => {
          if (values.length > 0) {
            const avgValue = values.reduce((sum, v) => sum + v, 0) / values.length;
            data.push([day, weekIndex, avgValue]);
          }
        });
      });
    }

    return { data, rows, cols };
  }, [klines, volatility.values, groupBy]);

  const chartOption = useMemo(() => ({
    title: {
      text: `波动率热力图 (${groupLabel}维度)`,
      subtext: '颜色深度表示波动率大小',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        const [x, y, value] = params.data;
        return `${heatmapData.rows[y]} ${heatmapData.cols[x]}<br/>波动率: <strong>${value.toFixed(4)}%</strong>`;
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: heatmapData.cols,
      splitArea: {
        show: true,
      },
      axisLabel: {
        fontSize: 10,
      },
    },
    yAxis: {
      type: 'category',
      data: heatmapData.rows,
      splitArea: {
        show: true,
      },
      axisLabel: {
        fontSize: 10,
      },
    },
    visualMap: {
      min: volatility.min,
      max: volatility.max,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '5%',
      inRange: {
        color: ['#f8f8f8', '#e8e8e8', '#d8d8d8', '#c8c8c8', '#b8b8b8', '#a8a8a8', '#989898', '#888888', '#787878', '#686868', '#585858'],
      },
      text: ['高', '低'],
      textStyle: {
        fontSize: 12,
      },
    },
    series: [
      {
        name: '波动率',
        type: 'heatmap',
        data: heatmapData.data,
        label: {
          show: false,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
      },
    ],
  }), [heatmapData, volatility.min, volatility.max, groupLabel]);

  // 分析热力图模式
  const analysis = useMemo(() => {
    if (heatmapData.data.length === 0) return null;

    // 找出最高波动的时段
    let maxValue = 0;
    let maxPos = [0, 0];
    
    heatmapData.data.forEach(([x, y, value]) => {
      if (value > maxValue) {
        maxValue = value;
        maxPos = [x, y];
      }
    });

    // 计算每个维度的平均波动率
    const colAverages = new Array(heatmapData.cols.length).fill(0);
    const colCounts = new Array(heatmapData.cols.length).fill(0);
    
    heatmapData.data.forEach(([x, _, value]) => {
      colAverages[x] += value;
      colCounts[x]++;
    });
    
    const colAvgs = colAverages.map((sum, i) => 
      colCounts[i] > 0 ? sum / colCounts[i] : 0
    );

    const maxColIndex = colAvgs.indexOf(Math.max(...colAvgs));
    const minColIndex = colAvgs.indexOf(Math.min(...colAvgs.filter(v => v > 0)));

    return {
      maxValue,
      maxTime: heatmapData.cols[maxPos[0]],
      maxDay: heatmapData.rows[maxPos[1]],
      maxCol: heatmapData.cols[maxColIndex],
      minCol: heatmapData.cols[minColIndex],
      maxColAvg: colAvgs[maxColIndex],
      minColAvg: colAvgs[minColIndex],
    };
  }, [heatmapData]);

  return (
    <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        🔥 波动率热力图
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        识别特定时段的波动模式，发现规律性的高低波动时段
      </Typography>
      
      <Box sx={{ width: '100%', minHeight: `${height}px` }}>
        <ReactECharts
          option={chartOption}
          style={{ height: `${height}px`, width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
        />
      </Box>

      {analysis && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            📊 模式分析
          </Typography>
          
          <Box sx={{ p: 1.5, bgcolor: 'error.light', borderRadius: 1, mb: 1.5 }}>
            <Typography variant="body2">
              🔴 <strong>最高波动时段:</strong> {analysis.maxDay} {analysis.maxTime}，波动率达 <strong>{analysis.maxValue.toFixed(4)}%</strong>
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: 'info.light', borderRadius: 1, mb: 1.5 }}>
            <Typography variant="body2">
              📈 <strong>平均波动最高的{groupLabel}:</strong> {analysis.maxCol}，平均波动率 <strong>{analysis.maxColAvg.toFixed(4)}%</strong>
            </Typography>
          </Box>

          <Box sx={{ p: 1.5, bgcolor: 'success.light', borderRadius: 1 }}>
            <Typography variant="body2">
              📉 <strong>平均波动最低的{groupLabel}:</strong> {analysis.minCol}，平均波动率 <strong>{analysis.minColAvg.toFixed(4)}%</strong>
            </Typography>
          </Box>

          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              💡 <strong>应用建议:</strong><br/>
              • 在{analysis.maxCol}时段交易需警惕高波动风险，可能需要更大的止损空间<br/>
              • {analysis.minCol}时段波动较小，适合建仓或调整仓位<br/>
              • 观察是否存在规律性模式，可用于择时交易策略
            </Typography>
          </Box>
        </Box>
      )}
    </Paper>
  );
}

export default VolatilityHeatmapChart;

