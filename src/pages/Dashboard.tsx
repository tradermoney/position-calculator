import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as BalanceIcon,
  ShowChart as ChartIcon,
} from '@mui/icons-material';
import { usePositions, usePositionStats } from '../contexts/AppContext';
import { calculatePositionResult, formatNumber, formatPercentage } from '../utils/calculations';
import { customColors } from '../styles/theme';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
}

function StatCard({ title, value, subtitle, icon, color = 'primary' }: StatCardProps) {
  const theme = useTheme();
  
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" color={`${color}.main`}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              backgroundColor: theme.palette[color].main + '20',
              borderRadius: '50%',
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {React.cloneElement(icon as React.ReactElement, {
              sx: { color: theme.palette[color].main, fontSize: 32 }
            })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

interface PositionCardProps {
  position: any;
}

function PositionCard({ position }: PositionCardProps) {
  const theme = useTheme();
  const result = calculatePositionResult(position);
  
  const isProfit = result.unrealizedPnl >= 0;
  const profitColor = isProfit ? customColors.profit.main : customColors.loss.main;
  
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" component="div">
              {position.symbol}
            </Typography>
            <Chip
              label={position.side === 'long' ? '多头' : '空头'}
              color={position.side === 'long' ? 'success' : 'error'}
              size="small"
              sx={{ mt: 0.5 }}
            />
          </Box>
          <Typography variant="body2" color="textSecondary">
            {position.leverage}x 杠杆
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="textSecondary">
              开仓价格
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              ${formatNumber(position.entryPrice)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="textSecondary">
              数量
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatNumber(position.quantity)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="textSecondary">
              保证金
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              ${formatNumber(position.margin)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="textSecondary">
              爆仓价格
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              ${formatNumber(result.liquidationPrice)}
            </Typography>
          </Grid>
        </Grid>
        
        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="body2" color="textSecondary">
              未实现盈亏
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ color: profitColor, fontWeight: 600 }}
            >
              ${formatNumber(result.unrealizedPnl, 2)}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="body2" color="textSecondary">
              收益率
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ color: profitColor, fontWeight: 600 }}
            >
              {formatPercentage(result.roe)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const positions = usePositions();
  const stats = usePositionStats();
  
  // 计算总体统计
  const totalUnrealizedPnl = positions.reduce((sum, position) => {
    const result = calculatePositionResult(position);
    return sum + result.unrealizedPnl;
  }, 0);
  
  const totalROE = stats.totalMargin > 0 ? (totalUnrealizedPnl / stats.totalMargin) * 100 : 0;
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        仪表盘
      </Typography>
      
      {/* 统计卡片 */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总仓位数"
            value={stats.totalPositions}
            subtitle={`多头: ${stats.longPositions} | 空头: ${stats.shortPositions}`}
            icon={<BalanceIcon />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总保证金"
            value={`$${formatNumber(stats.totalMargin, 2)}`}
            icon={<ChartIcon />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="未实现盈亏"
            value={`$${formatNumber(totalUnrealizedPnl, 2)}`}
            icon={totalUnrealizedPnl >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            color={totalUnrealizedPnl >= 0 ? 'success' : 'error'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="总收益率"
            value={formatPercentage(totalROE)}
            icon={totalROE >= 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
            color={totalROE >= 0 ? 'success' : 'error'}
          />
        </Grid>
      </Grid>
      
      {/* 仓位列表 */}
      <Typography variant="h5" component="h2" gutterBottom>
        当前仓位
      </Typography>
      
      {positions.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
              暂无仓位数据，请先创建仓位
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Box>
          {positions.map((position) => (
            <PositionCard key={position.id} position={position} />
          ))}
        </Box>
      )}
    </Box>
  );
}
