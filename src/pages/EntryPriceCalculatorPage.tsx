import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  Paper,
} from '@mui/material';
import { PriceChange as PriceChangeIcon } from '@mui/icons-material';
import { usePageTitle } from '../utils/titleManager';
import EntryPriceCalculator from '../components/ContractCalculator/EntryPriceCalculator';

export default function EntryPriceCalculatorPage() {
  usePageTitle('entry-price-calculator');

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* 页面标题 */}
      <Box mb={3}>
        <Box display="flex" alignItems="center" mb={2}>
          <PriceChangeIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            开仓价格计算器
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          计算多笔交易的平均开仓价格，帮助您了解真实的持仓成本
        </Typography>
      </Box>

      {/* 主要内容 */}
      <Paper elevation={1}>
        <Box p={3}>
          <EntryPriceCalculator />
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
              • <strong>添加交易记录</strong>：点击"添加交易"按钮添加每笔交易
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>价格</strong>：输入每笔交易的开仓价格
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>数量</strong>：输入每笔交易的合约数量
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>交易方向</strong>：选择做多或做空（影响平均价格计算）
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>删除记录</strong>：点击删除按钮移除不需要的交易记录
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
              • <strong>平均开仓价格</strong>：Σ(价格 × 数量) ÷ Σ(数量)
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>总投入资金</strong>：Σ(价格 × 数量)
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>总持仓数量</strong>：Σ(数量)
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>加权平均</strong>：根据每笔交易的数量进行加权计算
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 应用场景 */}
      <Box mt={3}>
        <Card sx={{ backgroundColor: 'success.light', color: 'success.contrastText' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              应用场景
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>分批建仓</strong>：多次小额买入时计算平均成本
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>加仓操作</strong>：在不同价位加仓后的平均持仓价格
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>DCA策略</strong>：定投策略中的平均买入价格
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>风险管理</strong>：了解真实成本，设置合理止损
            </Typography>
            <Typography variant="body2" paragraph>
              • <strong>盈亏计算</strong>：基于平均价格计算实际盈亏情况
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}
