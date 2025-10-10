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
import FieldTooltip from './FieldTooltip';

export interface EChartsVolatilityChartProps {
  /** 波动率统计数据 */
  data: VolatilityStats;
  /** 图表高度，默认400 */
  height?: number;
}

type ChartType = 'line' | 'bar' | 'distribution';

// 获取间隔对应的分钟数
function getIntervalMinutes(interval: string): number {
  if (interval.includes('m')) {
    return parseInt(interval.replace('m', ''));
  } else if (interval.includes('h')) {
    return parseInt(interval.replace('h', '')) * 60;
  } else if (interval.includes('d')) {
    return parseInt(interval.replace('d', '')) * 24 * 60;
  } else if (interval.includes('w')) {
    return parseInt(interval.replace('w', '')) * 7 * 24 * 60;
  } else if (interval.includes('M')) {
    return parseInt(interval.replace('M', '')) * 30 * 24 * 60;
  }
  return 60; // 默认1小时
}

/**
 * ECharts波动率图表组件
 */
export function EChartsVolatilityChart({
  data,
  height = 400,
}: EChartsVolatilityChartProps) {
  const [chartType, setChartType] = React.useState<ChartType>('line');

  const { volatility, klines } = data;
  const values = volatility.values;

  // 计算整个区间的价格统计
  const priceStats = useMemo(() => {
    if (!klines || klines.length === 0) {
      return null;
    }
    
    const highPrices = klines.map(k => k.high);
    const lowPrices = klines.map(k => k.low);
    
    return {
      highestPrice: Math.max(...highPrices),
      lowestPrice: Math.min(...lowPrices),
      openPrice: klines[0].open,
      closePrice: klines[klines.length - 1].close,
      priceChange: klines[klines.length - 1].close - klines[0].open,
      priceChangePercent: ((klines[klines.length - 1].close - klines[0].open) / klines[0].open * 100),
    };
  }, [klines]);

  // 生成时间轴标签 - 使用实际时间
  const timeLabels = useMemo(() => {
    const now = new Date();
    const interval = data.interval; // 从数据中获取间隔
    
    return values.map((_, index) => {
      // 根据间隔计算时间
      const timeOffset = (values.length - 1 - index) * getIntervalMinutes(interval);
      const time = new Date(now.getTime() - timeOffset * 60 * 1000);
      
      // 根据间隔长度选择合适的时间格式
      if (interval.includes('m')) {
        return time.toLocaleTimeString('zh-CN', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      } else if (interval.includes('h')) {
        return time.toLocaleString('zh-CN', { 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit' 
        });
      } else if (interval.includes('d')) {
        return time.toLocaleDateString('zh-CN', { 
          month: '2-digit', 
          day: '2-digit' 
        });
      } else {
        return time.toLocaleString('zh-CN', { 
          month: '2-digit', 
          day: '2-digit', 
          hour: '2-digit' 
        });
      }
    }).reverse(); // 反转以显示正确的时间顺序
  }, [values.length, data.interval]);

  // 波动率趋势图配置
  const lineChartOption = useMemo(() => ({
    title: {
      text: '波动率趋势 (横坐标: 时间, 纵坐标: 波动率)',
      left: 'center',
      textStyle: {
        fontSize: 15,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const point = params[0];
        let tooltipContent = `时间: ${point.name}<br/>波动率: ${point.value.toFixed(4)}%`;
        
        // 添加对应时间点的K线数据
        if (klines && klines.length > 0) {
          // 根据数据索引获取对应的K线数据
          const dataIndex = point.dataIndex;
          const klineIndex = values.length - 1 - dataIndex; // 反转索引，因为数据是倒序的
          
          if (klineIndex >= 0 && klineIndex < klines.length) {
            const kline = klines[klineIndex];
            const priceChange = kline.close - kline.open;
            const priceChangePercent = (priceChange / kline.open) * 100;
            
            tooltipContent += `<br/><br/><strong>━━━━━ 该周期价格数据 ━━━━━</strong>`;
            tooltipContent += `<br/>开盘价: ${kline.open.toFixed(2)}`;
            tooltipContent += `<br/>最高价: ${kline.high.toFixed(2)}`;
            tooltipContent += `<br/>最低价: ${kline.low.toFixed(2)}`;
            tooltipContent += `<br/>收盘价: ${kline.close.toFixed(2)}`;
            tooltipContent += `<br/>价格变化: ${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} (${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%)`;
            tooltipContent += `<br/>成交量: ${kline.volume.toFixed(2)}`;
          }
        }
        
        return tooltipContent;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      name: '时间',
      nameLocation: 'middle',
      nameGap: 35,
      nameTextStyle: {
        fontSize: 14,
        fontWeight: 'bold',
      },
      data: timeLabels,
      axisLabel: {
        interval: Math.max(0, Math.floor(values.length / 12)),
        rotate: 0,
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      name: '波动率 (%)',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        fontSize: 14,
        fontWeight: 'bold',
      },
      axisLabel: {
        formatter: '{value}%',
        fontSize: 11,
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
          color: '#666666',
        },
        itemStyle: {
          color: '#666666',
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
  }), [values, timeLabels, klines]);

  // 柱状图配置
  const barChartOption = useMemo(() => ({
    title: {
      text: '波动率分布 (横坐标: 时间, 纵坐标: 波动率)',
      left: 'center',
      textStyle: {
        fontSize: 15,
        fontWeight: 'bold',
      },
    },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const point = params[0];
        let tooltipContent = `时间: ${point.name}<br/>波动率: ${point.value.toFixed(4)}%`;
        
        // 添加对应时间点的K线数据
        if (klines && klines.length > 0) {
          // 根据数据索引获取对应的K线数据
          const dataIndex = point.dataIndex;
          const klineIndex = values.length - 1 - dataIndex; // 反转索引，因为数据是倒序的
          
          if (klineIndex >= 0 && klineIndex < klines.length) {
            const kline = klines[klineIndex];
            const priceChange = kline.close - kline.open;
            const priceChangePercent = (priceChange / kline.open) * 100;
            
            tooltipContent += `<br/><br/><strong>━━━━━ 该周期价格数据 ━━━━━</strong>`;
            tooltipContent += `<br/>开盘价: ${kline.open.toFixed(2)}`;
            tooltipContent += `<br/>最高价: ${kline.high.toFixed(2)}`;
            tooltipContent += `<br/>最低价: ${kline.low.toFixed(2)}`;
            tooltipContent += `<br/>收盘价: ${kline.close.toFixed(2)}`;
            tooltipContent += `<br/>价格变化: ${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)} (${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}%)`;
            tooltipContent += `<br/>成交量: ${kline.volume.toFixed(2)}`;
          }
        }
        
        return tooltipContent;
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '15%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      name: '时间',
      nameLocation: 'middle',
      nameGap: 35,
      nameTextStyle: {
        fontSize: 14,
        fontWeight: 'bold',
      },
      data: timeLabels,
      axisLabel: {
        interval: Math.max(0, Math.floor(values.length / 12)),
        rotate: 0,
        fontSize: 11,
      },
    },
    yAxis: {
      type: 'value',
      name: '波动率 (%)',
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        fontSize: 14,
        fontWeight: 'bold',
      },
      axisLabel: {
        formatter: '{value}%',
        fontSize: 11,
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
              { offset: 0, color: '#666666' },
              { offset: 1, color: '#888888' },
            ],
          },
        },
      },
    ],
  }), [values, timeLabels, klines]);

  // 波动率分布饼图配置
  const distributionChartOption = useMemo(() => {
    // 计算波动率区间分布
    const ranges = [
      { name: '极低 (0-0.5%)', min: 0, max: 0.5, count: 0, color: '#999999' },
      { name: '低 (0.5-1%)', min: 0.5, max: 1, count: 0, color: '#888888' },
      { name: '中等 (1-2%)', min: 1, max: 2, count: 0, color: '#777777' },
      { name: '高 (2-3%)', min: 2, max: 3, count: 0, color: '#666666' },
      { name: '极高 (>3%)', min: 3, max: Infinity, count: 0, color: '#555555' },
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
    <Paper elevation={2} sx={{ p: { xs: 1.5, sm: 2, md: 2.5 }, mb: 2 }}>
      {/* 图表标题和控制 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          📊 波动率可视化分析
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
          <FieldTooltip
            title={
              <Box sx={{ p: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  图表类型说明
                </Typography>
                <Typography variant="body2" paragraph>
                  波动率数据可以用不同的图表类型展示，每种类型都有其独特的分析价值：
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>📈 趋势图：</strong><br/>
                  用折线连接各时间点的波动率值，清晰展示波动率的变化趋势和周期性特征。<br/>
                  ✅ 适合：分析波动率的上升或下降趋势<br/>
                  ✅ 优点：连续性强，趋势清晰可见
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>📊 柱状图：</strong><br/>
                  用柱子表示每个时间点的波动率大小，更容易对比不同时段的波动幅度差异。<br/>
                  ✅ 适合：对比各时段波动率的绝对大小<br/>
                  ✅ 优点：直观、易于识别高低点
                </Typography>
                <Typography variant="body2">
                  <strong>🥧 分布图：</strong><br/>
                  用直方图展示波动率的分布情况，了解波动率的集中区间和离散程度。<br/>
                  ✅ 适合：分析波动率的整体分布特征<br/>
                  ✅ 优点：揭示数据的统计规律
                </Typography>
              </Box>
            }
            placement="left"
          />
        </Box>
      </Box>

      {/* ECharts 图表 - 增加高度 */}
      <Box sx={{ width: '100%', minHeight: `${height}px` }}>
        <ReactECharts
          option={chartOption}
          style={{ height: `${height}px`, width: '100%' }}
          opts={{ renderer: 'canvas', locale: 'ZH' }}
          notMerge={true}
          lazyUpdate={true}
        />
      </Box>

      {/* 图例说明 */}
      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          📊 显示最近 <strong>{values.length}</strong> 个周期的波动率数据 • 横坐标: 时间 • 纵坐标: 波动率
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 提示: 鼠标悬停可查看详细数值，支持多种图表类型切换
        </Typography>
      </Box>
    </Paper>
  );
}

export default EChartsVolatilityChart;
