import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Paper,
} from '@mui/material';
import { Calculate as CalculateIcon } from '@mui/icons-material';
import { usePageTitle } from '../utils/titleManager';
import PnLCalculator from '../components/ContractCalculator/PnLCalculator';

export default function PnLCalculatorPage() {
  usePageTitle('pnl-calculator');

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* 页面标题 */}
      <Box mb={3}>
        <Box display="flex" alignItems="center" mb={2}>
          <CalculateIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            盈亏计算器
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          计算合约交易的盈利/亏损、回报率和起始保证金，帮助您评估交易风险和收益
        </Typography>
      </Box>

      {/* 主要内容 */}
      <Paper elevation={1}>
        <Box p={3}>
          <PnLCalculator />
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
              • <strong>平仓价格</strong>：输入预期或实际的平仓价格（必填）
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>数量</strong>：输入交易的合约数量（必填）
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>杠杆倍数</strong>：选择使用的杠杆倍数，影响保证金计算
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>交易方向</strong>：选择做多或做空，影响盈亏计算方向
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>手续费率</strong>：输入交易手续费率，用于计算净盈亏
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
              • <strong>做多盈亏</strong>：(平仓价格 - 开仓价格) × 数量
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>做空盈亏</strong>：(开仓价格 - 平仓价格) × 数量
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>回报率</strong>：盈亏金额 ÷ 起始保证金 × 100%
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>起始保证金</strong>：开仓价格 × 数量 ÷ 杠杆倍数
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>手续费</strong>：(开仓价格 + 平仓价格) × 数量 × 手续费率
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>净盈亏</strong>：盈亏金额 - 手续费
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
