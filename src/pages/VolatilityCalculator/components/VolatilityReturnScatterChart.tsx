/**
 * 波动率vs收益率散点图
 * 分析波动率与价格收益率之间的关系
 */

import React, { useMemo } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { VolatilityStats } from '../../../services/binance';

export interface VolatilityReturnScatterChartProps {
  data: VolatilityStats;
  height?: number;
}

/**
 * 波动率vs收益率散点图组件
 */
export function VolatilityReturnScatterChart({ data, height = 450 }: VolatilityReturnScatterChartProps) {
  const { volatility, klines } = data;

  // 计算收益率和波动率的关系数据
  const scatterData = useMemo(() => {
    if (!klines || klines.length === 0) {
      return { data: [], correlation: 0, upData: [], downData: [] };
    }

    const points: [number, number][] = [];
    const upPoints: [number, number][] = [];
    const downPoints: [number, number][] = [];
    
    klines.forEach((kline, index) => {
      const returnRate = ((kline.close - kline.open) / kline.open) * 100;
      const vol = volatility.values[index];
      
      points.push([returnRate, vol]);
      
      if (returnRate >= 0) {
        upPoints.push([returnRate, vol]);
      } else {
        downPoints.push([returnRate, vol]);
      }
    });

    // 计算相关系数
    const returns = klines.map(k => ((k.close - k.open) / k.open) * 100);
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const meanVol = volatility.average;
    
    let numerator = 0;
    let denomReturn = 0;
    let denomVol = 0;
    
    returns.forEach((r, i) => {
      const devReturn = r - meanReturn;
      const devVol = volatility.values[i] - meanVol;
      numerator += devReturn * devVol;
      denomReturn += devReturn * devReturn;
      denomVol += devVol * devVol;
    });
    
    const correlation = denomReturn && denomVol 
      ? numerator / Math.sqrt(denomReturn * denomVol)
      : 0;

    return { data: points, correlation, upData: upPoints, downData: downPoints };
  }, [klines, volatility]);

  const chartOption = useMemo(() => ({
    title: {
      text: '波动率 vs 收益率散点分析',
      subtext: `相关系数: ${scatterData.correlation.toFixed(4)}`,
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const [returnRate, vol] = params.value;
        return `收益率: ${returnRate.toFixed(3)}%<br/>波动率: ${vol.toFixed(4)}%`;
      },
    },
    legend: {
      data: ['上涨周期', '下跌周期'],
      top: 40,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '8%',
      top: '18%',
      containLabel: true,
    },
    xAxis: {
      type: 'value',
      name: '收益率 (%)',
      nameLocation: 'middle',
      nameGap: 30,
      axisLabel: {
        formatter: '{value}%',
      },
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
        },
      },
      axisLine: {
        onZero: true,
        lineStyle: {
          color: '#888888',
          width: 2,
        },
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
      splitLine: {
        show: true,
        lineStyle: {
          type: 'dashed',
        },
      },
    },
    series: [
      {
        name: '上涨周期',
        type: 'scatter',
        data: scatterData.upData,
        symbolSize: 6,
        itemStyle: {
          color: '#777777',
          opacity: 0.6,
        },
        emphasis: {
          itemStyle: {
            opacity: 1,
            shadowBlur: 10,
            shadowColor: 'rgba(76, 175, 80, 0.5)',
          },
        },
      },
      {
        name: '下跌周期',
        type: 'scatter',
        data: scatterData.downData,
        symbolSize: 6,
        itemStyle: {
          color: '#666666',
          opacity: 0.6,
        },
        emphasis: {
          itemStyle: {
            opacity: 1,
            shadowBlur: 10,
            shadowColor: 'rgba(244, 67, 54, 0.5)',
          },
        },
      },
    ],
  }), [scatterData]);

  // 分析结论
  const getAnalysis = () => {
    const corr = scatterData.correlation;
    
    if (Math.abs(corr) < 0.3) {
      return {
        text: '波动率与收益率相关性较弱，二者基本独立。',
        color: 'info.main',
        icon: '📊',
      };
    } else if (corr > 0) {
      return {
        text: `波动率与收益率呈正相关（${corr.toFixed(3)}），高波动往往伴随大幅上涨或下跌。`,
        color: 'warning.main',
        icon: '⚠️',
      };
    } else {
      return {
        text: `波动率与收益率呈负相关（${corr.toFixed(3)}），这种情况较为罕见。`,
        color: 'error.main',
        icon: '❗',
      };
    }
  };

  const analysis = getAnalysis();

  // 计算极端情况统计
  const extremeStats = useMemo(() => {
    if (!klines || klines.length === 0) {
      return { highVolUpCount: 0, highVolDownCount: 0 };
    }

    const threshold = volatility.average + volatility.stdDev;
    let highVolUpCount = 0;
    let highVolDownCount = 0;

    klines.forEach((kline, index) => {
      const returnRate = ((kline.close - kline.open) / kline.open) * 100;
      const vol = volatility.values[index];

      if (vol > threshold) {
        if (returnRate > 0) {
          highVolUpCount++;
        } else {
          highVolDownCount++;
        }
      }
    });

    return { highVolUpCount, highVolDownCount };
  }, [klines, volatility]);

  return (
    <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        📈 波动率与收益率关系分析
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        通过散点图分析波动率与价格收益率的关系，识别高波动时的市场行为
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
          📊 关系分析
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
          <Chip 
            label={`相关系数: ${scatterData.correlation.toFixed(4)}`}
            color={
              Math.abs(scatterData.correlation) < 0.3 ? 'info' :
              Math.abs(scatterData.correlation) < 0.6 ? 'warning' : 'error'
            }
            sx={{ mr: 1 }}
          />
          <Chip 
            label={`高波动上涨: ${extremeStats.highVolUpCount}次`}
            color="success"
            variant="outlined"
            sx={{ mr: 1 }}
          />
          <Chip 
            label={`高波动下跌: ${extremeStats.highVolDownCount}次`}
            color="error"
            variant="outlined"
          />
        </Box>

        <Box sx={{ p: 1.5, bgcolor: analysis.color, color: 'white', borderRadius: 1 }}>
          <Typography variant="body2">
            {analysis.icon} <strong>{analysis.text}</strong>
          </Typography>
        </Box>

        <Box sx={{ mt: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            💡 <strong>应用建议:</strong>
            {Math.abs(scatterData.correlation) < 0.3 ? (
              ' 波动率与收益方向无明显关系，高波动时段涨跌概率相近，建议双向布局。'
            ) : scatterData.correlation > 0 && extremeStats.highVolDownCount > extremeStats.highVolUpCount ? (
              ' 高波动时下跌更频繁，警惕恐慌性下跌，建议在高波动时段降低多头仓位。'
            ) : scatterData.correlation > 0 && extremeStats.highVolUpCount > extremeStats.highVolDownCount ? (
              ' 高波动时上涨更频繁，可能存在FOMO情绪，建议在高波动时段谨慎追涨。'
            ) : (
              ' 需结合具体市场环境分析，建议保持灵活应对策略。'
            )}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default VolatilityReturnScatterChart;

