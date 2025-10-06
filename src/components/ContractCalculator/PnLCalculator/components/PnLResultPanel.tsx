import React from 'react';
import { Alert, Box, Card, CardContent, Divider, Typography } from '@mui/material';
import { formatNumber, formatPercentage } from '../../../../utils/contractCalculations';
import TooltipIcon from '../../../common/TooltipIcon';
import { PnLResult } from '../types';

interface PnLResultPanelProps {
  result: PnLResult | null;
}

export default function PnLResultPanel({ result }: PnLResultPanelProps) {
  return (
      <Card>
        <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
          <Box display="flex" alignItems="center" gap={1} mb={2}>
            <Typography variant="h6">
              计算结果
            </Typography>
            <TooltipIcon title="基于您输入的委托单信息计算出的盈亏结果和统计信息" />
          </Box>

          {!result ? (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
              <Typography variant="body1" color="textSecondary">
                请输入仓位信息，系统将自动计算结果
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box mb={3} p={3} bgcolor="primary.50" borderRadius={1} textAlign="center">
                <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={1}>
                  <Typography variant="subtitle2" color="textSecondary">
                    总盈亏
                  </Typography>
                  <TooltipIcon title="所有委托单的累计盈亏金额，正值表示盈利，负值表示亏损" />
                </Box>
                <Typography
                  variant="h4"
                  color={result.totalPnL >= 0 ? 'success.main' : 'error.main'}
                  gutterBottom
                >
                  {result.totalPnL >= 0 ? '+' : ''}{formatNumber(result.totalPnL, 2)} USDT
                </Typography>
              </Box>

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="textSecondary">
                      总投入:
                    </Typography>
                    <TooltipIcon title="所有开仓委托单的总投入资金" size="small" />
                  </Box>
                  <Typography variant="body2">{formatNumber(result.totalInvestment, 2)} USDT</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="textSecondary">
                      总回报:
                    </Typography>
                    <TooltipIcon title="所有平仓委托单的总回报资金" size="small" />
                  </Box>
                  <Typography variant="body2">{formatNumber(result.totalReturn, 2)} USDT</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color="textSecondary">
                      回报率:
                    </Typography>
                    <TooltipIcon title="总盈亏除以总投入的百分比，表示投资收益率" size="small" />
                  </Box>
                  <Typography variant="body2" color={result.roe >= 0 ? 'success.main' : 'error.main'}>
                    {result.roe >= 0 ? '+' : ''}{formatPercentage(result.roe, 2)}%
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Typography variant="h6">
                  仓位统计
                </Typography>
                <TooltipIcon title="统计开仓和平仓委托单的数量和总量信息" />
              </Box>

              <Box mb={2}>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    开仓仓位:
                  </Typography>
                  <Typography variant="body2">{result.openPositions.length} 个</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    平仓仓位:
                  </Typography>
                  <Typography variant="body2">{result.closePositions.length} 个</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    开仓总量:
                  </Typography>
                  <Typography variant="body2">
                    {formatNumber(result.openPositions.reduce((sum, p) => sum + p.quantity, 0), 4)} 币
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    平仓总量:
                  </Typography>
                  <Typography variant="body2">
                    {formatNumber(result.closePositions.reduce((sum, p) => sum + p.quantity, 0), 4)} 币
                  </Typography>
                </Box>
              </Box>

              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  盈亏计算基于开仓和平仓仓位的价格差异。此计算不考虑手续费和滑点。
                </Typography>
              </Alert>

              {Math.abs(result.roe) > 100 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  高回报率意味着高风险，请谨慎交易
                </Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
  );
}
