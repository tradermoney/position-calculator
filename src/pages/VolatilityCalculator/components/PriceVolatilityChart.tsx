/**
 * 价格与波动率联合图表
 * 在价格走势上标注极端波动事件
 */

import React, { useMemo } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { VolatilityStats } from '../../../services/binance';

export interface PriceVolatilityChartProps {
  data: VolatilityStats;
  height?: number;
}

/**
 * 价格与波动率联合图表组件
 */
export function PriceVolatilityChart({ data, height = 500 }: PriceVolatilityChartProps) {
  const { volatility, klines } = data;

  if (!klines || klines.length === 0) {
    return null;
  }

  // 识别极端波动事件
  const extremeEvents = useMemo(() => {
    const threshold = volatility.average + 1.5 * volatility.stdDev; // 使用均值+1.5倍标准差作为阈值
    const events: Array<{
      index: number;
      time: string;
      price: number;
      volatility: number;
      type: 'high' | 'extreme';
    }> = [];

    volatility.values.forEach((vol, index) => {
      if (vol > threshold && klines[index]) {
        events.push({
          index,
          time: new Date(klines[index].timestamp).toLocaleString('zh-CN'),
          price: klines[index].close,
          volatility: vol,
          type: vol > threshold * 1.3 ? 'extreme' : 'high',
        });
      }
    });

    return events;
  }, [volatility, klines]);

  // 准备K线数据
  const candlestickData = useMemo(() => {
    return klines.map(k => [k.open, k.close, k.low, k.high]);
  }, [klines]);

  // 准备时间轴
  const timeLabels = useMemo(() => {
    return klines.map(k => {
      const date = new Date(k.timestamp);
      return date.toLocaleString('zh-CN', { 
        month: '2-digit', 
        day: '2-digit', 
        hour: '2-digit',
        minute: '2-digit',
      });
    });
  }, [klines]);

  // 准备波动率数据（用于辅助Y轴）
  const volData = useMemo(() => {
    return volatility.values.map(v => v);
  }, [volatility.values]);

  const chartOption = useMemo(() => ({
    title: {
      text: '价格走势与极端波动标注',
      subtext: `标注${extremeEvents.length}个高波动事件`,
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
        const candleData = params.find((p: any) => p.seriesName === '价格');
        const volData = params.find((p: any) => p.seriesName === '波动率');
        
        if (!candleData || !volData) return '';
        
        const [open, close, low, high] = candleData.value;
        const vol = volData.value;
        const change = ((close - open) / open * 100).toFixed(2);
        
        let content = `<strong>${params[0].name}</strong><br/>`;
        content += `开盘: ${open.toFixed(2)}<br/>`;
        content += `收盘: ${close.toFixed(2)}<br/>`;
        content += `最高: ${high.toFixed(2)}<br/>`;
        content += `最低: ${low.toFixed(2)}<br/>`;
        content += `涨跌: ${change}%<br/>`;
        content += `━━━━━━━━━<br/>`;
        content += `波动率: <strong>${vol.toFixed(4)}%</strong>`;
        
        return content;
      },
    },
    legend: {
      data: ['价格', '波动率', '高波动事件', '极端波动事件'],
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
      data: timeLabels,
      scale: true,
      boundaryGap: true,
      axisLine: { onZero: false },
      splitLine: { show: false },
      axisLabel: {
        interval: Math.max(0, Math.floor(timeLabels.length / 12)),
        rotate: 45,
        fontSize: 10,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '价格',
        scale: true,
        splitArea: {
          show: true,
        },
        position: 'left',
      },
      {
        type: 'value',
        name: '波动率 (%)',
        scale: true,
        position: 'right',
        axisLabel: {
          formatter: '{value}%',
        },
      },
    ],
    dataZoom: [
      {
        type: 'inside',
        start: 0,
        end: 100,
      },
      {
        show: true,
        type: 'slider',
        top: '90%',
        start: 0,
        end: 100,
        height: 20,
      },
    ],
    series: [
      {
        name: '价格',
        type: 'candlestick',
        data: candlestickData,
        yAxisIndex: 0,
        itemStyle: {
          color: '#ef5350',
          color0: '#26a69a',
          borderColor: '#ef5350',
          borderColor0: '#26a69a',
        },
      },
      {
        name: '波动率',
        type: 'line',
        data: volData,
        yAxisIndex: 1,
        smooth: true,
        lineStyle: {
          width: 1.5,
          color: '#1976d2',
          opacity: 0.5,
        },
        itemStyle: {
          color: '#1976d2',
        },
        symbol: 'none',
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(25, 118, 210, 0.2)' },
              { offset: 1, color: 'rgba(25, 118, 210, 0.05)' },
            ],
          },
        },
      },
      {
        name: '高波动事件',
        type: 'scatter',
        data: extremeEvents
          .filter(e => e.type === 'high')
          .map(e => [e.index, e.price]),
        yAxisIndex: 0,
        symbolSize: 15,
        itemStyle: {
          color: '#ff9800',
          borderColor: '#fff',
          borderWidth: 2,
        },
        zlevel: 2,
      },
      {
        name: '极端波动事件',
        type: 'scatter',
        data: extremeEvents
          .filter(e => e.type === 'extreme')
          .map(e => [e.index, e.price]),
        yAxisIndex: 0,
        symbolSize: 20,
        symbol: 'pin',
        itemStyle: {
          color: '#f44336',
          borderColor: '#fff',
          borderWidth: 2,
        },
        zlevel: 3,
      },
    ],
  }), [candlestickData, timeLabels, volData, extremeEvents]);

  // 分析极端事件的特征
  const eventAnalysis = useMemo(() => {
    if (extremeEvents.length === 0) {
      return {
        summary: '未检测到显著的极端波动事件',
        details: '市场波动相对平稳，没有超出1.5倍标准差的异常波动。',
      };
    }

    const upEvents = extremeEvents.filter((e, index) => {
      const kline = klines[e.index];
      return kline.close > kline.open;
    });

    const downEvents = extremeEvents.filter((e, index) => {
      const kline = klines[e.index];
      return kline.close < kline.open;
    });

    const avgVol = extremeEvents.reduce((sum, e) => sum + e.volatility, 0) / extremeEvents.length;

    return {
      summary: `检测到${extremeEvents.length}个极端波动事件`,
      details: `其中上涨${upEvents.length}次，下跌${downEvents.length}次。平均波动率${avgVol.toFixed(4)}%。${
        upEvents.length > downEvents.length * 1.5 
          ? '极端波动多发生在上涨时，可能存在FOMO情绪。' 
          : downEvents.length > upEvents.length * 1.5 
          ? '极端波动多发生在下跌时，警惕恐慌性抛售。'
          : '极端波动在涨跌时分布相对均衡。'
      }`,
      upCount: upEvents.length,
      downCount: downEvents.length,
    };
  }, [extremeEvents, klines]);

  return (
    <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        📈 价格走势与极端波动事件
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        在K线图上标注高波动事件，帮助识别市场异常时刻与价格趋势的关系
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
          📊 极端事件分析
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5, flexWrap: 'wrap' }}>
          <Chip 
            label={`总事件: ${extremeEvents.length}`}
            color="primary"
          />
          <Chip 
            label={`上涨事件: ${eventAnalysis.upCount}`}
            color="success"
            variant="outlined"
          />
          <Chip 
            label={`下跌事件: ${eventAnalysis.downCount}`}
            color="error"
            variant="outlined"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          <strong>{eventAnalysis.summary}:</strong> {eventAnalysis.details}
        </Typography>

        <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary" display="block">
            💡 <strong>标注说明:</strong>
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • 🟠 橙色圆点 = 高波动事件（超过均值+1.5倍标准差）
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • 📍 红色标记 = 极端波动事件（超过高波动阈值的1.3倍）
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            • 蓝色区域曲线 = 波动率走势（右Y轴）
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}

export default PriceVolatilityChart;

