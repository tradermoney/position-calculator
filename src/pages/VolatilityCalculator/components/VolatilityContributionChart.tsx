/**
 * 波动率贡献分解图
 * 显示各时段对总波动率的贡献度
 */

import React, { useMemo } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import ReactECharts from 'echarts-for-react';
import type { VolatilityStats } from '../../../services/binance';

export interface VolatilityContributionChartProps {
  data: VolatilityStats;
  height?: number;
}

export function VolatilityContributionChart({ data, height = 400 }: VolatilityContributionChartProps) {
  const { volatility } = data;
  const values = volatility.values;

  // 计算贡献度
  const contributionData = useMemo(() => {
    const totalSquared = values.reduce((sum, v) => sum + v * v, 0);
    const contributions = values.map((v, i) => ({
      index: i,
      value: v,
      contribution: (v * v / totalSquared) * 100,
      cumulative: 0,
    }));

    // 按贡献度排序
    contributions.sort((a, b) => b.contribution - a.contribution);

    // 计算累计贡献
    let cum = 0;
    contributions.forEach(c => {
      cum += c.contribution;
      c.cumulative = cum;
    });

    return contributions;
  }, [values]);

  const chartOption = useMemo(() => ({
    title: {
      text: '波动率贡献分解',
      subtext: '各时段对总波动率的贡献占比',
      left: 'center',
      textStyle: { fontSize: 16, fontWeight: 'bold' },
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' },
      formatter: (params: any) => {
        const bar = params[0];
        const line = params[1];
        return `时段 ${bar.name}<br/>` +
               `波动率: ${contributionData[bar.dataIndex].value.toFixed(4)}%<br/>` +
               `贡献度: ${bar.value.toFixed(2)}%<br/>` +
               `累计: ${line.value.toFixed(2)}%`;
      },
    },
    legend: {
      data: ['贡献度', '累计贡献'],
      top: 40,
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '10%',
      top: '18%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      name: '时段（按贡献度降序）',
      nameLocation: 'middle',
      nameGap: 30,
      data: contributionData.map((_, i) => `T${i + 1}`),
      axisLabel: {
        interval: Math.max(0, Math.floor(contributionData.length / 20)),
        fontSize: 10,
      },
    },
    yAxis: [
      {
        type: 'value',
        name: '贡献度 (%)',
        nameLocation: 'middle',
        nameGap: 45,
        position: 'left',
      },
      {
        type: 'value',
        name: '累计 (%)',
        nameLocation: 'middle',
        nameGap: 45,
        position: 'right',
        max: 100,
      },
    ],
    series: [
      {
        name: '贡献度',
        type: 'bar',
        data: contributionData.map(c => c.contribution),
        itemStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: '#f44336' },
              { offset: 1, color: '#42a5f5' },
            ],
          },
        },
      },
      {
        name: '累计贡献',
        type: 'line',
        yAxisIndex: 1,
        data: contributionData.map(c => c.cumulative),
        lineStyle: { width: 2.5, color: '#ff9800' },
        symbol: 'none',
        smooth: true,
      },
    ],
  }), [contributionData]);

  // 找出贡献最大的时段
  const topContributors = contributionData.slice(0, 5);
  const top20Percent = contributionData.findIndex(c => c.cumulative >= 20);
  const top50Percent = contributionData.findIndex(c => c.cumulative >= 50);
  const top80Percent = contributionData.findIndex(c => c.cumulative >= 80);

  return (
    <Paper elevation={2} sx={{ p: 2.5, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        📊 波动率贡献分解
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        识别对总波动率贡献最大的时段，帮助聚焦关键风险时刻
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
          📈 贡献度分析
        </Typography>
        
        <Box sx={{ p: 1.5, bgcolor: 'error.light', borderRadius: 1, mb: 1 }}>
          <Typography variant="body2">
            🔴 <strong>前5大贡献时段:</strong> 贡献了 {topContributors.reduce((s, c) => s + c.contribution, 0).toFixed(1)}% 的总波动
          </Typography>
        </Box>

        <Box sx={{ p: 1.5, bgcolor: 'info.light', borderRadius: 1 }}>
          <Typography variant="caption" display="block">
            • 20%的总波动来自前 <strong>{top20Percent + 1}</strong> 个时段
          </Typography>
          <Typography variant="caption" display="block">
            • 50%的总波动来自前 <strong>{top50Percent + 1}</strong> 个时段
          </Typography>
          <Typography variant="caption" display="block">
            • 80%的总波动来自前 <strong>{top80Percent + 1}</strong> 个时段
          </Typography>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
          💡 波动率集中在少数时段，说明市场存在明显的异常波动事件，建议重点关注高贡献时段。
        </Typography>
      </Box>
    </Paper>
  );
}

export default VolatilityContributionChart;

