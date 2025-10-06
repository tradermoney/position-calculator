import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Paper,
} from '@mui/material';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { usePageTitle } from '../utils/titleManager';
import TargetPriceCalculator from '../components/ContractCalculator/TargetPriceCalculator';

export default function TargetPriceCalculatorPage() {
  usePageTitle('target-price-calculator');

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 0, sm: 3 } }}>
      {/* 页面标题 */}
      <Box mb={3} style={{ 
        paddingLeft: '16px',
        paddingRight: '16px',
      }}>
        <Box display="flex" alignItems="center" mb={2}>
          <TrendingUpIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            目标价格计算器
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          根据期望回报率计算目标价格，帮助您设定合理的止盈目标
        </Typography>
      </Box>

      {/* 主要内容 */}
      <Paper elevation={1}>
        <Box p={3}>
          <TargetPriceCalculator />
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
              • <strong>开仓价格</strong>：输入您的开仓价格（必填）
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>期望回报率</strong>：输入您期望的回报率百分比（必填）
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>交易方向</strong>：选择做多或做空，影响目标价格计算方向
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>杠杆倍数</strong>：选择使用的杠杆倍数，影响回报率计算
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>手续费率</strong>：考虑交易成本，计算更准确的目标价格
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 计算公式说明 */}
      <Box mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              计算公式
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>做多目标价格</strong>：开仓价格 × (1 + 期望回报率 ÷ 杠杆倍数)
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>做空目标价格</strong>：开仓价格 × (1 - 期望回报率 ÷ 杠杆倍数)
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>价格变化幅度</strong>：(目标价格 - 开仓价格) ÷ 开仓价格 × 100%
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>考虑手续费</strong>：目标价格需要额外覆盖交易手续费成本
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 风险提示 */}
      <Box mt={3}>
        <Card sx={{ backgroundColor: 'warning.light', color: 'warning.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              风险提示
            </Typography>
            <Typography variant="body2" paragraph>
              • 目标价格仅供参考，实际交易中市场价格可能无法达到预期目标
            </Typography>
            <Typography variant="body2" paragraph>
              • 高杠杆交易风险较大，请合理控制仓位和风险
            </Typography>
            <Typography variant="body2" paragraph>
              • 建议结合技术分析和基本面分析制定交易策略
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
