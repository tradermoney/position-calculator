import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Divider,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  MonetizationOn as MonetizationOnIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { BreakEvenResult } from '../../../../utils/breakEvenCalculations';
import { StyledCard, ResultTitle, ResultValue, CostBreakdownBox, CostItem, InfoBox } from '../styles';

interface ResultPanelProps {
  result: BreakEvenResult | null;
}

export default function ResultPanel({ result }: ResultPanelProps) {
  if (!result) {
    return (
      <StyledCard>
        <CardContent>
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              请设置参数以查看保本回报率计算结果
            </Typography>
          </Box>
        </CardContent>
      </StyledCard>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* 主要结果 */}
      <Grid item xs={12}>
        <StyledCard>
          <CardContent>
            <Box textAlign="center">
              <TrendingUpIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
              <ResultTitle>保本回报率</ResultTitle>
              <ResultValue>
                {result.totalBreakEvenRate.toFixed(4)}%
              </ResultValue>
              <Typography variant="body1" color="text.secondary">
                至少需要浮盈 <strong>{result.totalBreakEvenRate.toFixed(4)}%</strong> 才能保本
              </Typography>
            </Box>

            <CostBreakdownBox>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
                成本构成明细
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <CostItem>
                <Typography variant="body1">开仓手续费</Typography>
                <Typography variant="body1" color="error.main" fontWeight={600}>
                  {result.openCostRate.toFixed(4)}%
                </Typography>
              </CostItem>

              <CostItem>
                <Typography variant="body1">平仓手续费</Typography>
                <Typography variant="body1" color="error.main" fontWeight={600}>
                  {result.closeCostRate.toFixed(4)}%
                </Typography>
              </CostItem>

              <CostItem>
                <Typography variant="body1">资金费率成本</Typography>
                <Typography variant="body1" color="error.main" fontWeight={600}>
                  {result.fundingCostRate.toFixed(4)}%
                </Typography>
              </CostItem>

              <CostItem>
                <Typography variant="body1" fontWeight={700}>总保本回报率</Typography>
                <Typography variant="body1" color="error.main" fontWeight={700}>
                  {result.totalBreakEvenRate.toFixed(4)}%
                </Typography>
              </CostItem>
            </CostBreakdownBox>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* 详细分析 */}
      <Grid item xs={12} md={6}>
        <StyledCard>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                手续费分析
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                总手续费成本（不含资金费率）
              </Typography>
              <Typography variant="h5" color="warning.main" fontWeight="bold">
                {result.totalFeeRate.toFixed(4)}%
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary" gutterBottom>
              开仓成本：{result.openCostRate.toFixed(4)}%
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              平仓成本：{result.closeCostRate.toFixed(4)}%
            </Typography>

            <InfoBox sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                💡 手续费成本与杠杆倍数成正比，杠杆越高，相同手续费率下的成本占比越大
              </Typography>
            </InfoBox>
          </CardContent>
        </StyledCard>
      </Grid>

      <Grid item xs={12} md={6}>
        <StyledCard>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <TimelineIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                资金费率分析
              </Typography>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                资金费率总成本
              </Typography>
              <Typography variant="h5" color="info.main" fontWeight="bold">
                {result.fundingCostRate.toFixed(4)}%
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Typography variant="body2" color="text.secondary" gutterBottom>
              资金费率成本取决于：
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              • 资金费率大小
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              • 持仓时间长短
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              • 杠杆倍数高低
            </Typography>

            <InfoBox sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                💡 负资金费率时，您会获得资金费，可以降低保本回报率要求
              </Typography>
            </InfoBox>
          </CardContent>
        </StyledCard>
      </Grid>

      {/* 成本实例 */}
      <Grid item xs={12}>
        <StyledCard>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <MonetizationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6" fontWeight="bold">
                成本实例（以1000 USDT本金为例）
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={2} bgcolor="background.default" borderRadius={2}>
                  <Typography variant="body2" color="text.secondary">开仓成本</Typography>
                  <Typography variant="h6" color="error.main" fontWeight="bold">
                    ${result.costBreakdown.openCost.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={2} bgcolor="background.default" borderRadius={2}>
                  <Typography variant="body2" color="text.secondary">平仓成本</Typography>
                  <Typography variant="h6" color="error.main" fontWeight="bold">
                    ${result.costBreakdown.closeCost.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={2} bgcolor="background.default" borderRadius={2}>
                  <Typography variant="body2" color="text.secondary">资金费率</Typography>
                  <Typography variant="h6" color="info.main" fontWeight="bold">
                    ${result.costBreakdown.fundingCost.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={6} sm={3}>
                <Box textAlign="center" p={2} bgcolor="error.light" color="error.contrastText" borderRadius={2}>
                  <Typography variant="body2">总成本</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    ${result.costBreakdown.totalCost.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <InfoBox sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>计算说明：</strong>
                以1000 USDT本金为例，根据您设置的杠杆倍数和费率参数计算出的具体成本金额。
                实际成本会根据您的本金大小等比例缩放。
              </Typography>
            </InfoBox>
          </CardContent>
        </StyledCard>
      </Grid>
    </Grid>
  );
}