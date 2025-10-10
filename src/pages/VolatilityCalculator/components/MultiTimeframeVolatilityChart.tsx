/**
 * 多时间周期波动率对比图
 * 对比不同时间尺度（日线、4小时、1小时）的波动率
 */

import React, { useMemo, useState } from 'react';
import { Box, Typography, Paper, ToggleButtonGroup, ToggleButton, CircularProgress, Alert } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import { binanceDataService, KlineInterval } from '../../../services/binance';

export interface MultiTimeframeVolatilityChartProps {
  symbol: string;
  periods: number;
  height?: number;
}

interface TimeframeData {
  name: string;
  interval: KlineInterval;
  data: number[];
  average: number;
  color: string;
}

/**
 * 多时间周期波动率对比图组件
 */
export function MultiTimeframeVolatilityChart({ 
  symbol, 
  periods,
  height = 500,
}: MultiTimeframeVolatilityChartProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [timeframesData, setTimeframesData] = React.useState<TimeframeData[]>([]);
  const [chartType, setChartType] = useState<'line' | 'area'>('area');

  // 定义要对比的时间周期
  const timeframes = useMemo(() => [
    { name: '1小时', interval: KlineInterval['1h'], color: '#666666' },
    { name: '4小时', interval: KlineInterval['4h'], color: '#777777' },
    { name: '1天', interval: KlineInterval['1d'], color: '#888888' },
  ], []);

  // 加载多个时间周期的数据
  React.useEffect(() => {
    const loadData = async () => {
      if (!symbol) return;

      try {
        setLoading(true);
        setError(null);

        const results = await Promise.all(
          timeframes.map(async (tf) => {
            const stats = await binanceDataService.getVolatilityStats(
              symbol,
              tf.interval,
              periods
            );
            
            return {
              name: tf.name,
              interval: tf.interval,
              data: stats.volatility.values,
              average: stats.volatility.average,
              color: tf.color,
            };
          })
        );

        setTimeframesData(results);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '加载数据失败';
        setError(errorMessage);
        console.error('加载多时间周期数据失败:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [symbol, periods, timeframes]);

  // 生成时间标签（使用最长的数据序列）
  const timeLabels = useMemo(() => {
    if (timeframesData.length === 0) return [];
    
    const maxLength = Math.max(...timeframesData.map(tf => tf.data.length));
    return Array.from({ length: maxLength }, (_, i) => `T-${maxLength - 1 - i}`);
  }, [timeframesData]);

  const chartOption = useMemo(() => {
    if (timeframesData.length === 0) return {};

    return {
      title: {
        text: '多时间周期波动率对比',
        subtext: '对比不同时间尺度下的波动特征',
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
            content += `${param.marker} ${param.seriesName}: <strong>${param.value.toFixed(4)}%</strong><br/>`;
          });
          return content;
        },
      },
      legend: {
        data: timeframesData.map(tf => tf.name),
        top: 40,
        selected: timeframesData.reduce((acc, tf) => {
          acc[tf.name] = true;
          return acc;
        }, {} as Record<string, boolean>),
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
        data: timeLabels,
        boundaryGap: chartType === 'area' ? false : true,
        axisLabel: {
          interval: Math.max(0, Math.floor(timeLabels.length / 12)),
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
      series: timeframesData.map(tf => ({
        name: tf.name,
        type: 'line',
        data: tf.data,
        smooth: true,
        symbol: chartType === 'line' ? 'circle' : 'none',
        symbolSize: 4,
        lineStyle: {
          width: 2.5,
          color: tf.color,
        },
        itemStyle: {
          color: tf.color,
        },
        areaStyle: chartType === 'area' ? {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: tf.color.replace(')', ', 0.3)').replace('rgb', 'rgba') },
              { offset: 1, color: tf.color.replace(')', ', 0.05)').replace('rgb', 'rgba') },
            ],
          },
        } : undefined,
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: {
            type: 'dashed',
            width: 1,
            color: tf.color,
          },
          data: [
            {
              yAxis: tf.average,
              label: {
                formatter: `${tf.name}均值`,
                position: 'end',
                fontSize: 10,
              },
            },
          ],
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
    };
  }, [timeframesData, timeLabels, chartType]);

  // 计算周期间的相关性
  const correlations = useMemo(() => {
    if (timeframesData.length < 2) return [];

    const results: Array<{ pair: string; correlation: number }> = [];

    for (let i = 0; i < timeframesData.length; i++) {
      for (let j = i + 1; j < timeframesData.length; j++) {
        const data1 = timeframesData[i].data;
        const data2 = timeframesData[j].data;
        
        // 使用较短序列的长度
        const len = Math.min(data1.length, data2.length);
        const mean1 = data1.slice(0, len).reduce((s, v) => s + v, 0) / len;
        const mean2 = data2.slice(0, len).reduce((s, v) => s + v, 0) / len;

        let numerator = 0;
        let denom1 = 0;
        let denom2 = 0;

        for (let k = 0; k < len; k++) {
          const dev1 = data1[k] - mean1;
          const dev2 = data2[k] - mean2;
          numerator += dev1 * dev2;
          denom1 += dev1 * dev1;
          denom2 += dev2 * dev2;
        }

        const correlation = denom1 && denom2 
          ? numerator / Math.sqrt(denom1 * denom2)
          : 0;

        results.push({
          pair: `${timeframesData[i].name} vs ${timeframesData[j].name}`,
          correlation,
        });
      }
    }

    return results;
  }, [timeframesData]);

  if (loading) {
    return (
      <Paper elevation={2} sx={{ p: 2.5, mb: 3, textAlign: 'center' }}>
        <CircularProgress sx={{ my: 4 }} />
        <Typography variant="body2" color="text.secondary">
          正在加载多时间周期数据...
        </Typography>
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (timeframesData.length === 0) {
    return null;
  }

  return (
    <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          📊 多时间周期波动率对比
        </Typography>
        <ToggleButtonGroup
          value={chartType}
          exclusive
          onChange={(_, newType) => newType && setChartType(newType)}
          size="small"
        >
          <ToggleButton value="line">折线图</ToggleButton>
          <ToggleButton value="area">区域图</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Typography variant="body2" color="text.secondary" paragraph>
        对比不同时间尺度的波动率，揭示短期噪声与长期趋势的差异
      </Typography>
      
      <Box sx={{ width: '100%', minHeight: `${height}px` }}>
        <ReactECharts
          option={chartOption}
          style={{ height: `${height}px`, width: '100%' }}
          opts={{ renderer: 'canvas' }}
          notMerge={true}
        />
      </Box>

      {/* 统计对比 */}
      <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          📈 周期对比统计
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          {timeframesData.map(tf => (
            <Box 
              key={tf.name}
              sx={{ 
                flex: 1,
                minWidth: 120,
                p: 1.5, 
                bgcolor: 'background.paper', 
                borderRadius: 1,
                borderLeft: `4px solid ${tf.color}`,
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                {tf.name}平均波动率
              </Typography>
              <Typography variant="h6" fontWeight="bold" sx={{ color: tf.color }}>
                {tf.average.toFixed(4)}%
              </Typography>
            </Box>
          ))}
        </Box>

        {/* 相关性分析 */}
        {correlations.length > 0 && (
          <Box sx={{ mt: 2, p: 1.5, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="caption" fontWeight="bold" display="block" gutterBottom>
              周期间相关性:
            </Typography>
            {correlations.map(({ pair, correlation }) => (
              <Typography key={pair} variant="caption" display="block">
                {pair}: <strong>{correlation.toFixed(3)}</strong>
                {Math.abs(correlation) > 0.7 ? ' (强相关)' : Math.abs(correlation) > 0.4 ? ' (中等相关)' : ' (弱相关)'}
              </Typography>
            ))}
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            💡 <strong>分析要点:</strong><br/>
            • 短周期（1小时）波动更剧烈，捕捉短期市场噪声<br/>
            • 长周期（1天）波动更平滑，反映主要趋势<br/>
            • 多周期共振上升可能预示风险升级<br/>
            • 长短周期背离可能存在套利或反转机会
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default MultiTimeframeVolatilityChart;

