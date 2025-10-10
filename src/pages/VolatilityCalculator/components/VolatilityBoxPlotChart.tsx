/**
 * 波动率箱线图
 * 直观展示波动率的分位数和离群值
 */

import React, { useMemo } from 'react';
import { Box, Typography, Paper, Grid } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { VolatilityStats } from '../../../services/binance';

export interface VolatilityBoxPlotChartProps {
  data: VolatilityStats;
  height?: number;
}

/**
 * 波动率箱线图组件
 */
export function VolatilityBoxPlotChart({ data, height = 400 }: VolatilityBoxPlotChartProps) {
  const { volatility } = data;
  const values = volatility.values;

  // 计算箱线图所需的统计数据
  const boxPlotData = useMemo(() => {
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    
    const q1 = sorted[Math.ceil(n * 0.25) - 1];
    const median = sorted[Math.ceil(n * 0.50) - 1];
    const q3 = sorted[Math.ceil(n * 0.75) - 1];
    const min = sorted[0];
    const max = sorted[n - 1];
    
    const iqr = q3 - q1;
    const lowerWhisker = Math.max(min, q1 - 1.5 * iqr);
    const upperWhisker = Math.min(max, q3 + 1.5 * iqr);
    
    // 识别离群值
    const outliers = sorted.filter(v => v < lowerWhisker || v > upperWhisker);
    
    return {
      boxData: [lowerWhisker, q1, median, q3, upperWhisker],
      outliers,
      q1,
      median,
      q3,
      iqr,
      min,
      max,
    };
  }, [values]);

  const chartOption = useMemo(() => ({
    title: {
      text: '波动率箱线图 (Box Plot)',
      subtext: '直观展示波动率的分布特征和离群值',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.componentSubType === 'boxplot') {
          const [lower, q1, median, q3, upper] = params.value;
          return `下须: ${lower.toFixed(4)}%<br/>` +
                 `Q1 (25%): ${q1.toFixed(4)}%<br/>` +
                 `中位数: ${median.toFixed(4)}%<br/>` +
                 `Q3 (75%): ${q3.toFixed(4)}%<br/>` +
                 `上须: ${upper.toFixed(4)}%`;
        } else {
          return `离群值: ${params.value[1].toFixed(4)}%`;
        }
      },
    },
    grid: {
      left: '10%',
      right: '10%',
      bottom: '15%',
      top: '18%',
    },
    xAxis: {
      type: 'category',
      data: ['波动率分布'],
      boundaryGap: true,
      nameGap: 30,
      splitArea: {
        show: false,
      },
      axisLabel: {
        fontSize: 14,
        fontWeight: 'bold',
      },
      splitLine: {
        show: false,
      },
    },
    yAxis: {
      type: 'value',
      name: '波动率 (%)',
      nameLocation: 'middle',
      nameGap: 50,
      splitArea: {
        show: true,
      },
      axisLabel: {
        formatter: '{value}%',
      },
    },
    series: [
      {
        name: 'boxplot',
        type: 'boxplot',
        data: [boxPlotData.boxData],
        itemStyle: {
          color: '#666666',
          borderColor: '#444444',
          borderWidth: 2,
        },
        boxWidth: ['40%', '80%'],
      },
      {
        name: 'outlier',
        type: 'scatter',
        data: boxPlotData.outliers.map(v => ['波动率分布', v]),
        symbolSize: 8,
        itemStyle: {
          color: '#888888',
        },
        tooltip: {
          formatter: (params: any) => {
            return `离群值: ${params.value[1].toFixed(4)}%`;
          },
        },
      },
    ],
  }), [boxPlotData]);

  return (
    <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        📊 波动率箱线图分析
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        通过箱线图直观展示波动率的五数概括和离群值分布
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
          📈 统计概括
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">最小值</Typography>
              <Typography variant="body1" fontWeight="bold">{boxPlotData.min.toFixed(4)}%</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Q1 (25%)</Typography>
              <Typography variant="body1" fontWeight="bold">{boxPlotData.q1.toFixed(4)}%</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Box sx={{ p: 1.5, bgcolor: 'primary.light', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">中位数</Typography>
              <Typography variant="body1" fontWeight="bold" color="primary.main">{boxPlotData.median.toFixed(4)}%</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Q3 (75%)</Typography>
              <Typography variant="body1" fontWeight="bold">{boxPlotData.q3.toFixed(4)}%</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">最大值</Typography>
              <Typography variant="body1" fontWeight="bold">{boxPlotData.max.toFixed(4)}%</Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={4}>
            <Box sx={{ p: 1.5, bgcolor: 'error.light', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">离群值数量</Typography>
              <Typography variant="body1" fontWeight="bold" color="error.main">{boxPlotData.outliers.length}</Typography>
            </Box>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="body2" color="text.primary">
            💡 <strong>IQR (四分位距) = {boxPlotData.iqr.toFixed(4)}%</strong><br/>
            • 箱体包含50%的数据（Q1到Q3）<br/>
            • 须线延伸至1.5倍IQR范围内的最值<br/>
            • 红点表示离群值，代表异常高或低的波动时段<br/>
            {boxPlotData.outliers.length > 0 && (
              <>• 检测到{boxPlotData.outliers.length}个离群值，占比{((boxPlotData.outliers.length / values.length) * 100).toFixed(1)}%</>
            )}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default VolatilityBoxPlotChart;

