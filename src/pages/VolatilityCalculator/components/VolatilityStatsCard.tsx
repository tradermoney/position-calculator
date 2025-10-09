/**
 * 波动率统计总结组件
 * 显示波动率的统计信息和分析结论
 */

import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  ShowChart as ShowChartIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import type { VolatilityStats } from '../../../services/binance';

export interface VolatilityStatsCardProps {
  /** 波动率统计数据 */
  data: VolatilityStats;
}

/**
 * 波动率统计总结组件
 */
export function VolatilityStatsCard({ data }: VolatilityStatsCardProps) {
  const { symbol, interval, periods, volatility, timestamp } = data;

  // 判断波动率水平
  const getVolatilityLevel = (value: number): { level: string; color: string; icon: React.ReactElement } => {
    if (value < 0.5) {
      return { 
        level: '极低', 
        color: '#4caf50',
        icon: <TrendingDownIcon />
      };
    } else if (value < 1) {
      return { 
        level: '低', 
        color: '#8bc34a',
        icon: <TrendingDownIcon />
      };
    } else if (value < 2) {
      return { 
        level: '中等', 
        color: '#ff9800',
        icon: <ShowChartIcon />
      };
    } else if (value < 3) {
      return { 
        level: '高', 
        color: '#ff5722',
        icon: <TrendingUpIcon />
      };
    } else {
      return { 
        level: '极高', 
        color: '#f44336',
        icon: <TrendingUpIcon />
      };
    }
  };

  const avgLevel = getVolatilityLevel(volatility.average);
  const maxLevel = getVolatilityLevel(volatility.max);

  // 生成分析结论
  const getAnalysis = (): string => {
    const avg = volatility.average;
    
    if (avg < 0.5) {
      return '市场波动极小，价格相对稳定，适合网格交易或低风险策略。';
    } else if (avg < 1) {
      return '市场波动较小，价格变化温和，适合稳健型交易策略。';
    } else if (avg < 2) {
      return '市场波动适中，存在一定的交易机会，需要合理控制仓位。';
    } else if (avg < 3) {
      return '市场波动较大，价格变化剧烈，建议谨慎操作并设置止损。';
    } else {
      return '市场波动极大，风险很高，建议降低杠杆或观望为主。';
    }
  };

  // 标准差分析
  const getStdDevAnalysis = (): string => {
    const ratio = volatility.stdDev / volatility.average;
    if (ratio < 0.3) {
      return '波动率较为稳定，市场行为可预测性较高。';
    } else if (ratio < 0.6) {
      return '波动率有一定波动，需要关注市场变化。';
    } else {
      return '波动率起伏较大，市场不确定性高，需要密切关注。';
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
      {/* 标题 */}
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <InfoIcon sx={{ mr: 1 }} />
        统计总结
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {/* 基本信息 */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" display="block">
              交易对
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {symbol}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" display="block">
              K线周期
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {interval}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" display="block">
              数据量
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {periods} 个周期
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="caption" color="text.secondary" display="block">
              计算时间
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              {new Date(timestamp).toLocaleTimeString()}
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* 统计数据卡片 */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* 平均波动率 */}
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'action.hover', 
              borderRadius: 2,
              borderLeft: `4px solid ${avgLevel.color}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              平均波动率
            </Typography>
            <Typography variant="h5" fontWeight="bold" color={avgLevel.color}>
              {volatility.average}%
            </Typography>
            <Chip 
              label={avgLevel.level}
              size="small"
              icon={avgLevel.icon}
              sx={{ 
                mt: 1,
                bgcolor: avgLevel.color,
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          </Box>
        </Grid>

        {/* 最大波动率 */}
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'action.hover', 
              borderRadius: 2,
              borderLeft: `4px solid ${maxLevel.color}`,
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              最大波动率
            </Typography>
            <Typography variant="h5" fontWeight="bold" color={maxLevel.color}>
              {volatility.max}%
            </Typography>
            <Chip 
              label={maxLevel.level}
              size="small"
              icon={maxLevel.icon}
              sx={{ 
                mt: 1,
                bgcolor: maxLevel.color,
                color: 'white',
                fontWeight: 'bold',
              }}
            />
          </Box>
        </Grid>

        {/* 最小波动率 */}
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'action.hover', 
              borderRadius: 2,
              borderLeft: '4px solid #2196f3',
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              最小波动率
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {volatility.min}%
            </Typography>
          </Box>
        </Grid>

        {/* 标准差 */}
        <Grid item xs={12} sm={6} md={3}>
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'action.hover', 
              borderRadius: 2,
              borderLeft: '4px solid #9c27b0',
            }}
          >
            <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
              标准差
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {volatility.stdDev}%
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* 分析结论 */}
      <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2, mb: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          📈 波动率分析
        </Typography>
        <Typography variant="body2">
          {getAnalysis()}
        </Typography>
      </Box>

      <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          📊 稳定性分析
        </Typography>
        <Typography variant="body2">
          {getStdDevAnalysis()}
        </Typography>
      </Box>

      {/* 补充说明 */}
      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          💡 <strong>说明:</strong> 波动率 = (最高价 - 最低价) / 开盘价 × 100%，反映单个周期内的价格波动幅度。
        </Typography>
      </Box>
    </Paper>
  );
}

export default VolatilityStatsCard;


