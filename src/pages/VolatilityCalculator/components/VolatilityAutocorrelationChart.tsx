/**
 * 波动率自相关图
 * 用于检测波动聚集性（GARCH效应）
 */

import React, { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { VolatilityStats } from '../../../services/binance';

export interface VolatilityAutocorrelationChartProps {
  data: VolatilityStats;
  height?: number;
  maxLag?: number;
}

/**
 * 计算自相关系数
 */
function calculateAutocorrelation(values: number[], lag: number): number {
  const n = values.length;
  const mean = values.reduce((sum, v) => sum + v, 0) / n;
  
  let numerator = 0;
  let denominator = 0;
  
  for (let i = 0; i < n; i++) {
    denominator += Math.pow(values[i] - mean, 2);
  }
  
  for (let i = 0; i < n - lag; i++) {
    numerator += (values[i] - mean) * (values[i + lag] - mean);
  }
  
  return denominator !== 0 ? numerator / denominator : 0;
}

/**
 * 波动率自相关图组件
 */
export function VolatilityAutocorrelationChart({ 
  data, 
  height = 400,
  maxLag = 20,
}: VolatilityAutocorrelationChartProps) {
  const { volatility } = data;
  const values = volatility.values;

  // 计算自相关系数
  const acfData = useMemo(() => {
    const acf: number[] = [];
    
    for (let lag = 1; lag <= Math.min(maxLag, values.length - 1); lag++) {
      acf.push(calculateAutocorrelation(values, lag));
    }
    
    return acf;
  }, [values, maxLag]);

  // 计算置信区间（95%）
  const confidenceInterval = useMemo(() => {
    return 1.96 / Math.sqrt(values.length);
  }, [values.length]);

  const chartOption = useMemo(() => ({
    title: {
      text: '波动率自相关函数 (ACF)',
      subtext: '检测波动聚集性 - GARCH效应',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const lag = params[0].dataIndex + 1;
        const acf = params[0].value;
        const significant = Math.abs(acf) > confidenceInterval;
        
        return `滞后期: ${lag}<br/>` +
               `自相关系数: ${acf.toFixed(4)}<br/>` +
               `<strong>${significant ? '显著相关 ✓' : '不显著 ✗'}</strong>`;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '18%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      name: '滞后期 (Lag)',
      nameLocation: 'middle',
      nameGap: 30,
      data: Array.from({ length: acfData.length }, (_, i) => i + 1),
      axisLabel: {
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      name: '自相关系数',
      nameLocation: 'middle',
      nameGap: 45,
      min: -1,
      max: 1,
      axisLabel: {
        formatter: '{value}',
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: 'ACF',
        type: 'bar',
        data: acfData,
        itemStyle: {
          color: (params: any) => {
            const value = params.value;
            if (Math.abs(value) > confidenceInterval) {
              return value > 0 ? '#f44336' : '#2196f3';
            }
            return '#bdbdbd';
          },
        },
        barWidth: '60%',
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            type: 'dashed',
            width: 2,
          },
          data: [
            {
              yAxis: confidenceInterval,
              label: {
                show: false,
              },
              lineStyle: {
                color: '#ff9800',
              },
            },
            {
              yAxis: -confidenceInterval,
              label: {
                show: false,
              },
              lineStyle: {
                color: '#ff9800',
              },
            },
            {
              yAxis: 0,
              lineStyle: {
                color: '#000',
                width: 1,
              },
            },
          ],
        },
      },
    ],
  }), [acfData, confidenceInterval]);

  // 分析波动聚集性
  const clusteringAnalysis = useMemo(() => {
    const significantLags = acfData.filter((acf, index) => 
      Math.abs(acf) > confidenceInterval && index < 10
    ).length;

    const lag1 = acfData[0] || 0;
    
    if (significantLags === 0) {
      return {
        level: '无波动聚集',
        description: '波动率变化相对独立，过去的波动对未来影响有限。',
        color: 'success.main',
        recommendation: '适合使用简单的波动率模型，可以相对独立地评估每个周期的风险。',
      };
    } else if (significantLags <= 2) {
      return {
        level: '弱波动聚集',
        description: `存在${significantLags}个显著滞后期，波动有轻微持续性。`,
        color: 'info.main',
        recommendation: '可以使用短期移动平均等简单方法预测波动，但效果可能有限。',
      };
    } else if (significantLags <= 5) {
      return {
        level: '中度波动聚集',
        description: `存在${significantLags}个显著滞后期，波动具有明显的持续性特征（ARCH效应）。`,
        color: 'warning.main',
        recommendation: '建议使用GARCH类模型预测波动率，高波动时段可能持续数个周期。',
      };
    } else {
      return {
        level: '强波动聚集',
        description: `存在${significantLags}个显著滞后期，波动高度聚集，"高波动跟随高波动"特征明显。`,
        color: 'error.main',
        recommendation: '强烈建议使用GARCH或EGARCH模型。高波动期可能延续较长时间，需要动态调整风险管理策略。',
      };
    }
  }, [acfData, confidenceInterval]);

  return (
    <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        📊 波动率聚集性分析 (GARCH效应)
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        通过自相关函数检测波动率的"记忆性"，判断高波动是否倾向于跟随高波动
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
          📈 聚集性诊断
        </Typography>
        
        <Box sx={{ p: 1.5, bgcolor: clusteringAnalysis.color, color: 'white', borderRadius: 1, mb: 1.5 }}>
          <Typography variant="body1" fontWeight="bold">
            {clusteringAnalysis.level}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {clusteringAnalysis.description}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          💡 <strong>建模建议:</strong> {clusteringAnalysis.recommendation}
        </Typography>

        <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            <strong>图表说明:</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • 橙色虚线表示95%置信区间（±{confidenceInterval.toFixed(4)}）
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • 超出置信区间的柱子表示显著自相关
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • 红色=正相关（高波动后跟随高波动）；蓝色=负相关（罕见）；灰色=不显著
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default VolatilityAutocorrelationChart;

