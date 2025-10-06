import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Paper,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import { usePageTitle } from '../utils/titleManager';
import LiquidationPriceCalculator from '../components/ContractCalculator/LiquidationPriceCalculator';

export default function LiquidationCalculatorPage() {
  usePageTitle('liquidation-calculator');

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4, px: { xs: 0, sm: 3 } }}>
      {/* 页面标题 */}
      <Box mb={3} style={{ 
        paddingLeft: '16px',
        paddingRight: '16px',
      }}>
        <Box display="flex" alignItems="center" mb={2}>
          <WarningIcon sx={{ mr: 2, fontSize: 32, color: 'error.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            强平价格计算器
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          计算仓位的强制平仓价格，帮助您管理交易风险和设置止损
        </Typography>
      </Box>

      {/* 主要内容 */}
      <Paper elevation={1}>
        <Box p={3}>
          <LiquidationPriceCalculator />
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
              • <strong>杠杆倍数</strong>：选择使用的杠杆倍数（必填）
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>交易方向</strong>：选择做多或做空，影响强平价格计算
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>维持保证金率</strong>：交易所要求的最低保证金比例
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>账户余额</strong>：用于计算实际可用保证金
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
              • <strong>做多强平价格</strong>：开仓价格 × (1 - 1/杠杆倍数 + 维持保证金率)
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>做空强平价格</strong>：开仓价格 × (1 + 1/杠杆倍数 - 维持保证金率)
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>安全距离</strong>：当前价格距离强平价格的百分比
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>风险等级</strong>：根据安全距离评估仓位风险程度
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 风险提示 */}
      <Box mt={3}>
        <Card sx={{ backgroundColor: 'error.light', color: 'error.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              重要风险提示
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>强制平仓风险</strong>：当价格触及强平价格时，仓位将被强制平仓
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>高杠杆风险</strong>：杠杆倍数越高，强平价格越接近开仓价格
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>市场波动</strong>：剧烈市场波动可能导致快速触及强平价格
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>建议措施</strong>：设置合理的止损价格，避免接近强平价格
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>资金管理</strong>：保持充足的账户余额，降低强平风险
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
