import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Paper,
} from '@mui/material';
import { AccountBalance as AccountBalanceIcon } from '@mui/icons-material';
import { usePageTitle } from '../utils/titleManager';
import MaxPositionCalculator from '../components/ContractCalculator/MaxPositionCalculator';

export default function MaxPositionCalculatorPage() {
  usePageTitle('max-position-calculator');

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* 页面标题 */}
      <Box mb={3}>
        <Box display="flex" alignItems="center" mb={2}>
          <AccountBalanceIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            可开计算器
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          计算最大可开仓位数量，帮助您合理分配资金和控制风险
        </Typography>
      </Box>

      {/* 主要内容 */}
      <Paper elevation={1}>
        <Box p={3}>
          <MaxPositionCalculator />
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
              • <strong>账户余额</strong>：输入您的可用账户余额（必填）
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>开仓价格</strong>：输入计划的开仓价格（必填）
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>杠杆倍数</strong>：选择使用的杠杆倍数（必填）
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>风险比例</strong>：设置愿意承担的资金风险比例
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>维持保证金率</strong>：交易所要求的维持保证金比例
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
              • <strong>最大可开数量</strong>：(账户余额 × 杠杆倍数) ÷ 开仓价格
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>建议开仓数量</strong>：最大可开数量 × 风险比例
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>所需保证金</strong>：开仓价格 × 数量 ÷ 杠杆倍数
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>剩余资金</strong>：账户余额 - 所需保证金
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>资金利用率</strong>：所需保证金 ÷ 账户余额 × 100%
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 风险管理建议 */}
      <Box mt={3}>
        <Card sx={{ backgroundColor: 'info.light', color: 'info.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              风险管理建议
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>分散投资</strong>：不要将所有资金投入单一交易
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>保留资金</strong>：建议保留30-50%的资金作为风险缓冲
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>杠杆控制</strong>：新手建议使用较低杠杆，逐步提高
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>止损设置</strong>：开仓前设定明确的止损价格
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>定期评估</strong>：根据市场情况调整仓位大小
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
