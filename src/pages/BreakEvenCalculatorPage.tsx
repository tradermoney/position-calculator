import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
} from '@mui/material';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { usePageTitle } from '../utils/titleManager';
import BreakEvenCalculator from '../components/ContractCalculator/BreakEvenCalculator';

export default function BreakEvenCalculatorPage() {
  usePageTitle('break-even-calculator');

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', px: { xs: 0, sm: 3 } }}>
      {/* 页面标题 */}
      <Box mb={3} sx={{ px: { xs: 1, sm: 0 } }}>
        <Box display="flex" alignItems="center" mb={2}>
          <TrendingUpIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            保本回报率计算器
          </Typography>
        </Box>
        <Typography variant="body1" color="textSecondary">
          计算合约交易的保本回报率，帮助您了解需要多少浮盈才能覆盖交易成本
        </Typography>
      </Box>

      {/* 主要内容 */}
      <Box sx={{ px: { xs: 0, sm: 0 } }}>
        <BreakEvenCalculator />
      </Box>

      {/* 使用说明 */}
      <Box mt={3} sx={{ px: { xs: 1, sm: 0 } }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              使用说明
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>杠杆倍数</strong>：选择您使用的杠杆倍数，杠杆越高，相同手续费率下的成本占比越大
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>开仓手续费率</strong>：输入开仓时的手续费率，通常为万分之几
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>平仓手续费率</strong>：输入平仓时的手续费率，通常与开仓手续费率相同
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>资金费率</strong>：永续合约的资金费率，可参考交易所实时费率
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>资金费率结算周期</strong>：资金费率的结算间隔，大多数交易所为8小时
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>预期持仓时间</strong>：计划持有仓位的时间，影响资金费率的总成本
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 计算公式说明 */}
      <Box mt={3} sx={{ px: { xs: 1, sm: 0 } }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              计算公式
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>开仓成本占比</strong>：开仓手续费率 × 杠杆倍数
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>平仓成本占比</strong>：平仓手续费率 × 杠杆倍数
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>资金费率成本占比</strong>：资金费率 × 杠杆倍数 × (持仓时间 ÷ 结算周期)
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>保本回报率</strong>：开仓成本占比 + 平仓成本占比 + 资金费率成本占比
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* 实例说明 */}
      <Box mt={3} sx={{ px: { xs: 1, sm: 0 } }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              计算实例
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              假设您有100 USDT本金，使用100倍杠杆开仓，开仓和平仓手续费率均为0.05%，
              资金费率为0.01%，8小时结算一次，预计持仓24小时。
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • 开仓成本：0.05% × 100 = 5%
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • 平仓成本：0.05% × 100 = 5%
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • 资金费率成本：0.01% × 100 × (24÷8) = 3%
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              • <strong>保本回报率：5% + 5% + 3% = 13%</strong>
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              这意味着您的仓位至少需要浮盈13%才能保本。
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}