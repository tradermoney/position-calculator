import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  Container,
  Paper,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  TrendingUp as TrendingUpIcon,
  Warning as WarningIcon,
  AccountBalance as AccountBalanceIcon,
  PriceChange as PriceChangeIcon,
} from '@mui/icons-material';
import { usePageTitle } from '../utils/titleManager';
import PnLCalculator from '../components/ContractCalculator/PnLCalculator';
import TargetPriceCalculator from '../components/ContractCalculator/TargetPriceCalculator';
import LiquidationPriceCalculator from '../components/ContractCalculator/LiquidationPriceCalculator';
import MaxPositionCalculator from '../components/ContractCalculator/MaxPositionCalculator';
import EntryPriceCalculator from '../components/ContractCalculator/EntryPriceCalculator';

// 标签页配置
interface TabConfig {
  label: string;
  icon: React.ReactElement;
  component: React.ReactElement;
  description: string;
}

const tabs: TabConfig[] = [
  {
    label: '盈亏计算器',
    icon: <CalculateIcon />,
    component: <PnLCalculator />,
    description: '计算合约交易的盈利/亏损、回报率和起始保证金'
  },
  {
    label: '目标价格',
    icon: <TrendingUpIcon />,
    component: <TargetPriceCalculator />,
    description: '根据期望回报率计算目标价格'
  },
  {
    label: '强平价格',
    icon: <WarningIcon />,
    component: <LiquidationPriceCalculator />,
    description: '计算仓位的强制平仓价格'
  },
  {
    label: '可开计算器',
    icon: <AccountBalanceIcon />,
    component: <MaxPositionCalculator />,
    description: '计算最大可开仓位数量'
  },
  {
    label: '开仓价格',
    icon: <PriceChangeIcon />,
    component: <EntryPriceCalculator />,
    description: '计算多笔交易的平均开仓价格'
  },
];

interface ContractCalculatorProps {
  defaultTab?: number;
}

// 标签页路径映射
const tabPaths = [
  '/contract-calculator/pnl',
  '/contract-calculator/target-price',
  '/contract-calculator/liquidation',
  '/contract-calculator/max-position',
  '/contract-calculator/entry-price'
];

export default function ContractCalculator({ defaultTab = 0 }: ContractCalculatorProps) {
  usePageTitle('合约计算器');
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(defaultTab);

  // 根据当前路径设置活动标签页
  useEffect(() => {
    const currentPath = location.pathname;
    const tabIndex = tabPaths.indexOf(currentPath);
    if (tabIndex !== -1) {
      setActiveTab(tabIndex);
    } else if (currentPath === '/contract-calculator') {
      setActiveTab(0); // 默认显示第一个标签页
    }
  }, [location.pathname]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    navigate(tabPaths[newValue]);
  };

  return (
    <Container maxWidth="xl">
      <Box py={3}>
        {/* 页面标题 */}
        <Box mb={3}>
          <Typography variant="h4" component="h1" gutterBottom>
            合约计算器
          </Typography>
          <Typography variant="body1" color="textSecondary">
            专业的合约交易计算工具，帮助您分析交易风险和收益
          </Typography>
        </Box>

        {/* 主要内容 */}
        <Paper elevation={1}>
          {/* 标签页导航 */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .MuiTab-root': {
                  minHeight: 72,
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                },
              }}
            >
              {tabs.map((tab, index) => (
                <Tab
                  key={index}
                  icon={tab.icon}
                  iconPosition="start"
                  label={tab.label}
                  sx={{
                    '& .MuiSvgIcon-root': {
                      marginRight: 1,
                      marginBottom: 0,
                    },
                  }}
                />
              ))}
            </Tabs>
          </Box>

          {/* 标签页内容 */}
          <Box p={3}>
            {/* 当前标签页描述 */}
            <Box mb={3}>
              <Typography variant="body2" color="textSecondary">
                {tabs[activeTab].description}
              </Typography>
            </Box>

            {/* 当前标签页组件 */}
            {tabs[activeTab].component}
          </Box>
        </Paper>

        {/* 使用说明 */}
        <Box mt={3}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                使用说明
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                • <strong>盈亏计算器</strong>：输入开仓价格、平仓价格、数量和杠杆，计算盈亏和回报率
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                • <strong>目标价格</strong>：输入开仓价格和期望回报率，计算达到目标收益的价格
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                • <strong>强平价格</strong>：输入仓位信息，计算强制平仓的价格点位
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                • <strong>可开计算器</strong>：输入资金和杠杆，计算最大可开仓位
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                • <strong>开仓价格</strong>：输入多笔交易记录，计算平均开仓成本
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                <strong>注意</strong>：计算结果仅供参考，实际交易中请考虑手续费、滑点等因素。
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}
