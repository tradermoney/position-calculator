import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CardActionArea,
  Stack,
  Button,
} from '@mui/material';
import {
  Add as AddIcon,
  Timeline as PyramidIcon,
  Calculate as CalculateIcon,
  TrendingUp as TargetPriceIcon,
  Warning as WarningIcon,
  AccountBalance as AccountBalanceIcon,
  PriceChange as PriceChangeIcon,
  TrendingUp as VolatilityIcon,
  ShowChart as KellyIcon,
  Functions as FunctionsIcon,
} from '@mui/icons-material';
import { usePageTitle } from '../utils/titleManager';

interface FeatureItem {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
}

const featureItems: FeatureItem[] = [
  {
    id: 'add-position',
    title: '补仓计算',
    description: '规划分批补仓所需资金与仓位变化，快速评估补仓策略。',
    path: '/add-position',
    icon: AddIcon,
  },
  {
    id: 'pyramid',
    title: '金子塔委托单',
    description: '生成金子塔加仓计划，分层委托更灵活地管理仓位。',
    path: '/pyramid',
    icon: PyramidIcon,
  },
  {
    id: 'pnl-calculator',
    title: '盈亏计算器',
    description: '计算持仓盈亏、收益率与资金使用情况，掌握交易表现。',
    path: '/pnl-calculator',
    icon: CalculateIcon,
  },
  {
    id: 'target-price-calculator',
    title: '目标价格计算器',
    description: '根据目标收益率反推理想的止盈/止损价格区间。',
    path: '/target-price-calculator',
    icon: TargetPriceIcon,
  },
  {
    id: 'liquidation-calculator',
    title: '强平价格计算器',
    description: '估算强平价格和安全边际，及时识别资金风险。',
    path: '/liquidation-calculator',
    icon: WarningIcon,
  },
  {
    id: 'max-position-calculator',
    title: '可开仓位计算',
    description: '结合杠杆与保证金限制，计算当前可开仓位规模。',
    path: '/max-position-calculator',
    icon: AccountBalanceIcon,
  },
  {
    id: 'entry-price-calculator',
    title: '平均开仓价',
    description: '合并多笔成交明细，计算加权后的平均开仓价格。',
    path: '/entry-price-calculator',
    icon: PriceChangeIcon,
  },
  {
    id: 'volatility-calculator',
    title: '波动率计算器',
    description: '衡量价格区间的波动率变化，可保存历史记录进行对比。',
    path: '/volatility-calculator',
    icon: VolatilityIcon,
  },
  {
    id: 'kelly-calculator',
    title: '凯利公式',
    description: '根据胜率与赔率推导最优仓位比例，辅助资金管理。',
    path: '/kelly-calculator',
    icon: KellyIcon,
  },
  {
    id: 'calculator',
    title: '科学计算器',
    description: '快捷完成基础运算和公式计算，保留运算历史。',
    path: '/calculator',
    icon: FunctionsIcon,
  },
];

export default function Dashboard() {
  const navigate = useNavigate();

  usePageTitle('dashboard');

  return (
    <Box>
      <Stack spacing={1} mb={{ xs: 1, sm: 2, md: 4 }}>
        <Typography variant="h4" component="h1">
          功能索引
        </Typography>
        <Typography variant="body1" color="textSecondary">
          在这里快速查看所有工具的核心功能，并前往对应页面。
        </Typography>
      </Stack>

      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
        {featureItems.map(({ id, title, description, path, icon: Icon }) => (
          <Grid item xs={12} sm={6} md={4} key={id}>
            <Card sx={{ height: '100%' }}>
              <CardActionArea
                onClick={() => navigate(path)}
                sx={{ height: '100%' }}
              >
                <CardContent>
                  <Stack spacing={2} alignItems="flex-start">
                    <Icon color="primary" fontSize="large" />
                    <Box>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {title}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {description}
                      </Typography>
                    </Box>
                    <Button size="small" color="primary" component="span">
                      查看详情
                    </Button>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
