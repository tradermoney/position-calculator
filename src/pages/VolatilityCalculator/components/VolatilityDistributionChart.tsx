/**
 * 波动率分布直方图
 * 显示波动率的统计分布、核密度估计（KDE）和分位数信息
 */

import React, { useMemo } from 'react';
import { Box, Typography, Paper, Grid, ToggleButton, ToggleButtonGroup } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { VolatilityStats } from '../../../services/binance';

/**
 * 高斯核函数
 */
function gaussianKernel(x: number): number {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

/**
 * 计算核密度估计（KDE）
 */
function calculateKDE(data: number[], bandwidth: number, points: number = 100): { x: number[]; y: number[] } {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min;
  
  const x: number[] = [];
  const y: number[] = [];
  
  for (let i = 0; i <= points; i++) {
    const xi = min + (range * i) / points;
    x.push(xi);
    
    let density = 0;
    for (const value of data) {
      density += gaussianKernel((xi - value) / bandwidth);
    }
    density /= (data.length * bandwidth);
    y.push(density);
  }
  
  return { x, y };
}

export interface VolatilityDistributionChartProps {
  data: VolatilityStats;
  height?: number;
}

/**
 * 波动率分布直方图组件
 */
export function VolatilityDistributionChart({ data, height = 400 }: VolatilityDistributionChartProps) {
  const { volatility } = data;
  const values = volatility.values;
  const [showKDE, setShowKDE] = React.useState<boolean>(true);

  // 计算分位数
  const quantiles = useMemo(() => {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    
    return {
      p5: sorted[Math.ceil(n * 0.05) - 1],
      p10: sorted[Math.ceil(n * 0.10) - 1],
      p25: sorted[Math.ceil(n * 0.25) - 1],
      p50: sorted[Math.ceil(n * 0.50) - 1],
      p75: sorted[Math.ceil(n * 0.75) - 1],
      p90: sorted[Math.ceil(n * 0.90) - 1],
      p95: sorted[Math.ceil(n * 0.95) - 1],
    };
  }, [values]);

  // 构建直方图数据
  const histogramData = useMemo(() => {
    const binCount = 30;
    const min = volatility.min;
    const max = volatility.max;
    const binSize = (max - min) / binCount;
    
    const bins = Array(binCount).fill(0);
    const binLabels = Array(binCount).fill(0).map((_, i) => {
      const start = min + i * binSize;
      return start.toFixed(3);
    });
    
    values.forEach(value => {
      const binIndex = Math.min(
        Math.floor((value - min) / binSize),
        binCount - 1
      );
      bins[binIndex]++;
    });
    
    return { bins, binLabels };
  }, [values, volatility.min, volatility.max]);

  // 计算KDE曲线
  const kdeData = useMemo(() => {
    // 使用Silverman规则估计带宽
    const n = values.length;
    const std = volatility.stdDev;
    const bandwidth = 1.06 * std * Math.pow(n, -0.2);
    
    return calculateKDE(values, bandwidth, 100);
  }, [values, volatility.stdDev]);

  const chartOption = useMemo(() => ({
    title: {
      text: '波动率分布分析',
      subtext: showKDE ? '直方图 + 核密度估计（KDE）' : '频率分布直方图',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
      formatter: (params: any) => {
        const point = params[0];
        const percentage = ((point.value / values.length) * 100).toFixed(1);
        return `波动率区间: ${point.name}%<br/>频数: ${point.value} (${percentage}%)`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      name: '波动率 (%)',
      nameLocation: 'middle',
      nameGap: 30,
      data: histogramData.binLabels,
      axisLabel: {
        interval: Math.max(0, Math.floor(histogramData.binLabels.length / 8)),
        rotate: 45,
        fontSize: 10,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '频数',
        nameLocation: 'middle',
        nameGap: 40,
        position: 'left',
      },
      {
        type: 'value',
        name: showKDE ? '概率密度' : '',
        nameLocation: 'middle',
        nameGap: 40,
        position: 'right',
        show: showKDE,
      },
    ],
    series: [
      {
        name: '频数',
        type: 'bar',
        data: histogramData.bins,
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#666666' },
              { offset: 1, color: '#888888' },
            ],
          },
        },
        markLine: {
          silent: true,
          lineStyle: {
            type: 'dashed',
            width: 2,
          },
          data: [
            {
              name: '平均值',
              xAxis: histogramData.binLabels[
                Math.floor((volatility.average - volatility.min) / ((volatility.max - volatility.min) / 30))
              ],
              label: {
                formatter: '平均',
                position: 'end',
              },
              lineStyle: {
                color: '#888888',
              },
            },
            {
              name: '中位数',
              xAxis: histogramData.binLabels[
                Math.floor((quantiles.p50 - volatility.min) / ((volatility.max - volatility.min) / 30))
              ],
              label: {
                formatter: '中位',
                position: 'start',
              },
              lineStyle: {
                color: '#777777',
              },
            },
          ],
        },
      },
      // KDE曲线
      ...(showKDE ? [{
        name: 'KDE',
        type: 'line',
        // 使用数值索引而不是字符串，确保与binLabels对齐
        data: kdeData.x.map((x, i) => {
          // 找到对应的bin索引
          const binIndex = Math.floor((x - volatility.min) / ((volatility.max - volatility.min) / 30));
          const clampedIndex = Math.max(0, Math.min(29, binIndex));
          // 缩放KDE值到直方图的尺度
          const scaledValue = kdeData.y[i] * values.length * (volatility.max - volatility.min) / 30;
          return [histogramData.binLabels[clampedIndex], scaledValue];
        }),
        yAxisIndex: 0,
        smooth: true,
        symbol: 'none',
        lineStyle: {
          width: 3,
          color: '#666666',
        },
        itemStyle: {
          color: '#666666',
        },
        z: 10,
      }] : []),
    ],
  }), [histogramData, values.length, volatility, quantiles, showKDE, kdeData]);

  return (
    <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            📊 波动率统计分布
          </Typography>
          <Typography variant="body2" color="text.secondary">
            通过直方图和核密度估计展示波动率的分布特征
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={showKDE ? 'kde' : 'hist'}
          exclusive
          onChange={(_, val) => val && setShowKDE(val === 'kde')}
          size="small"
        >
          <ToggleButton value="hist">仅直方图</ToggleButton>
          <ToggleButton value="kde">直方图 + KDE</ToggleButton>
        </ToggleButtonGroup>
      </Box>
      
      <Box sx={{ width: '100%', minHeight: `${height}px` }}>
        <ReactECharts
          option={chartOption}
          style={{ height: `${height}px`, width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
        />
      </Box>

      {/* 分位数信息 */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          📈 分位数分析
        </Typography>
        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
          <Grid item xs={6} sm={4} md={3}>
            <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">5%分位</Typography>
              <Typography variant="body2" fontWeight="bold">{quantiles.p5.toFixed(4)}%</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">25%分位</Typography>
              <Typography variant="body2" fontWeight="bold">{quantiles.p25.toFixed(4)}%</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">50%分位(中位数)</Typography>
              <Typography variant="body2" fontWeight="bold" color="primary.main">{quantiles.p50.toFixed(4)}%</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">75%分位</Typography>
              <Typography variant="body2" fontWeight="bold">{quantiles.p75.toFixed(4)}%</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">90%分位</Typography>
              <Typography variant="body2" fontWeight="bold" color="warning.main">{quantiles.p90.toFixed(4)}%</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4} md={3}>
            <Box sx={{ p: 1, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">95%分位</Typography>
              <Typography variant="body2" fontWeight="bold" color="error.main">{quantiles.p95.toFixed(4)}%</Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'info.main', color: 'white', borderRadius: 1 }}>
          <Typography variant="body2">
            💡 <strong>当前波动处于历史{' '}
            {values[values.length - 1] <= quantiles.p25 ? '低位（≤25%分位）' :
             values[values.length - 1] <= quantiles.p50 ? '中低位（25-50%分位）' :
             values[values.length - 1] <= quantiles.p75 ? '中高位（50-75%分位）' :
             values[values.length - 1] <= quantiles.p90 ? '高位（75-90%分位）' :
             '极高位（≥90%分位）'
            }</strong>
          </Typography>
        </Box>

        {showKDE && (
          <Box sx={{ mt: 1.5, p: 1.5, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="caption" color="text.primary">
              🔬 <strong>核密度估计（KDE）说明:</strong><br/>
              红色曲线为核密度估计，是对分布的平滑拟合。相比直方图，KDE能更好地展示数据的连续性分布特征，
              帮助识别分布是否存在多个峰值（多峰分布）或长尾特征。
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
}

export default VolatilityDistributionChart;

