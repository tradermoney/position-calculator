/**
 * 波动率预测图
 * 基于EWMA和简单移动平均的波动率预测
 */

import React, { useMemo } from 'react';
import { Box, Typography, Paper, Grid, Chip } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { VolatilityStats } from '../../../services/binance';

export interface VolatilityForecastChartProps {
  data: VolatilityStats;
  height?: number;
  forecastPeriods?: number;
}

/**
 * 计算EWMA（指数加权移动平均）
 * 注意：这里简化了，直接对波动率值做EWMA
 * 更准确的做法应该是对平方波动率（方差）做EWMA，然后开方
 */
function calculateEWMA(values: number[], lambda: number = 0.94): number[] {
  const ewma: number[] = [];
  // 初始值设为第一个值
  ewma[0] = values[0];
  
  for (let i = 1; i < values.length; i++) {
    // EWMA递归公式：新值 = λ × 旧值 + (1-λ) × 当前观测值
    ewma[i] = lambda * ewma[i - 1] + (1 - lambda) * values[i];
  }
  
  return ewma;
}

/**
 * 简单预测：延续最后的EWMA值
 */
function simpleForecast(ewma: number[], periods: number): number[] {
  const lastValue = ewma[ewma.length - 1];
  return new Array(periods).fill(lastValue);
}

/**
 * 波动率预测图组件
 */
export function VolatilityForecastChart({ 
  data, 
  height = 450,
  forecastPeriods = 10,
}: VolatilityForecastChartProps) {
  const { volatility } = data;
  const values = volatility.values;

  // 计算EWMA和预测
  const forecastData = useMemo(() => {
    // RiskMetrics推荐的lambda值
    const lambda = 0.94;
    
    // 计算EWMA
    const ewma = calculateEWMA(values, lambda);
    
    // 简单预测（延续最后值）
    const forecast = simpleForecast(ewma, forecastPeriods);
    
    // 计算预测置信区间（基于历史标准差）
    const recentStd = volatility.stdDev;
    const upperBand = forecast.map(v => v + 1.96 * recentStd); // 95%置信上界
    const lowerBand = forecast.map(v => Math.max(0, v - 1.96 * recentStd)); // 95%置信下界
    
    return {
      ewma,
      forecast,
      upperBand,
      lowerBand,
      lambda,
    };
  }, [values, volatility.stdDev, forecastPeriods]);

  // 生成时间标签
  const labels = useMemo(() => {
    const historical = values.map((_, i) => `T-${values.length - 1 - i}`);
    const future = Array.from({ length: forecastPeriods }, (_, i) => `T+${i + 1}`);
    return [...historical, ...future];
  }, [values.length, forecastPeriods]);

  const chartOption = useMemo(() => {
    const historicalLength = values.length;
    
    return {
      title: {
        text: '波动率预测 (EWMA方法)',
        subtext: `λ = ${forecastData.lambda}，预测${forecastPeriods}期`,
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
          let content = `<strong>${params[0].name}</strong><br/>`;
          params.forEach((param: any) => {
            if (param.value !== null && param.value !== undefined) {
              content += `${param.marker} ${param.seriesName}: <strong>${param.value.toFixed(4)}%</strong><br/>`;
            }
          });
          return content;
        },
      },
      legend: {
        data: ['实际波动率', 'EWMA', '预测值', '95%置信上界', '95%置信下界'],
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
        name: '时间',
        nameLocation: 'middle',
        nameGap: 30,
        data: labels,
        boundaryGap: false,
        axisLabel: {
          interval: Math.max(0, Math.floor(labels.length / 15)),
          rotate: 0,
          fontSize: 10,
        },
        axisLine: {
          lineStyle: {
            color: '#999',
          },
        },
        splitLine: {
          show: true,
          lineStyle: {
            type: 'dashed',
          },
        },
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
          name: '实际波动率',
          type: 'line',
          data: [...values, ...new Array(forecastPeriods).fill(null)],
          smooth: false,
          symbol: 'circle',
          symbolSize: 3,
          lineStyle: {
            width: 1.5,
            color: '#bdbdbd',
          },
          itemStyle: {
            color: '#bdbdbd',
          },
          z: 1,
        },
        {
          name: 'EWMA',
          type: 'line',
          data: [...forecastData.ewma, ...new Array(forecastPeriods).fill(null)],
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 2.5,
            color: '#1976d2',
          },
          z: 2,
        },
        {
          name: '预测值',
          type: 'line',
          data: [...new Array(historicalLength).fill(null), ...forecastData.forecast],
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: {
            width: 3,
            color: '#ff5722',
            type: 'dashed',
          },
          itemStyle: {
            color: '#ff5722',
          },
          z: 3,
        },
        {
          name: '95%置信上界',
          type: 'line',
          data: [...new Array(historicalLength).fill(null), ...forecastData.upperBand],
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 1,
            color: '#ff5722',
            type: 'dotted',
            opacity: 0.6,
          },
          z: 1,
        },
        {
          name: '95%置信下界',
          type: 'line',
          data: [...new Array(historicalLength).fill(null), ...forecastData.lowerBand],
          smooth: true,
          symbol: 'none',
          lineStyle: {
            width: 1,
            color: '#ff5722',
            type: 'dotted',
            opacity: 0.6,
          },
          areaStyle: {
            color: 'rgba(255, 87, 34, 0.1)',
          },
          z: 1,
        },
      ],
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
    };
  }, [values, forecastData, labels, forecastPeriods]);

  // 评估预测质量（如果有足够的历史数据）
  const evaluation = useMemo(() => {
    if (values.length < 20) return null;

    // 使用最后20%的数据作为测试集
    const testSize = Math.floor(values.length * 0.2);
    const trainSize = values.length - testSize;
    
    const trainValues = values.slice(0, trainSize);
    const testValues = values.slice(trainSize);
    
    // 在训练集上计算EWMA
    const trainEWMA = calculateEWMA(trainValues, forecastData.lambda);
    const lastEWMA = trainEWMA[trainEWMA.length - 1];
    
    // 计算MAE（平均绝对误差）
    const mae = testValues.reduce((sum, actual) => 
      sum + Math.abs(actual - lastEWMA), 0
    ) / testSize;
    
    // 计算RMSE（均方根误差）
    const rmse = Math.sqrt(
      testValues.reduce((sum, actual) => 
        sum + Math.pow(actual - lastEWMA, 2), 0
      ) / testSize
    );
    
    // 计算MAPE（平均绝对百分比误差）
    const mape = testValues.reduce((sum, actual) => {
      if (actual === 0) return sum;
      return sum + Math.abs((actual - lastEWMA) / actual);
    }, 0) / testSize * 100;

    return { mae, rmse, mape, testSize };
  }, [values, forecastData.lambda]);

  return (
    <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        🔮 波动率预测
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        基于指数加权移动平均（EWMA）的波动率预测，常用于风险管理
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
          📊 预测结果
        </Typography>
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">当前EWMA</Typography>
              <Typography variant="h6" fontWeight="bold" color="primary.main">
                {forecastData.ewma[forecastData.ewma.length - 1].toFixed(4)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">预测值</Typography>
              <Typography variant="h6" fontWeight="bold" color="error.main">
                {forecastData.forecast[0].toFixed(4)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">95%上界</Typography>
              <Typography variant="h6" fontWeight="bold">
                {forecastData.upperBand[0].toFixed(4)}%
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">95%下界</Typography>
              <Typography variant="h6" fontWeight="bold">
                {forecastData.lowerBand[0].toFixed(4)}%
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {evaluation && (
          <Box sx={{ p: 1.5, bgcolor: 'info.light', borderRadius: 1, mb: 2 }}>
            <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
              📈 预测性能评估 (基于最后{evaluation.testSize}期):
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={4}>
                <Chip 
                  label={`MAE: ${evaluation.mae.toFixed(4)}%`} 
                  size="small" 
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={4}>
                <Chip 
                  label={`RMSE: ${evaluation.rmse.toFixed(4)}%`} 
                  size="small" 
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={4}>
                <Chip 
                  label={`MAPE: ${evaluation.mape.toFixed(2)}%`} 
                  size="small" 
                  variant="outlined"
                  color={evaluation.mape < 20 ? 'success' : evaluation.mape < 40 ? 'warning' : 'error'}
                />
              </Grid>
            </Grid>
          </Box>
        )}

        <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            <strong>🔬 EWMA方法说明:</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
            EWMA(t) = λ × EWMA(t-1) + (1-λ) × 波动率(t)
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • λ = {forecastData.lambda} (RiskMetrics推荐值)，越大则对历史依赖越强
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • 置信区间基于历史标准差计算，95%置信度
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
            <strong>💡 应用:</strong> 用于VaR计算、风险预算、动态止损设置等
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default VolatilityForecastChart;

