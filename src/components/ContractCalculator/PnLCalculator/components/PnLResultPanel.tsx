import React from 'react';
import { Alert, Box, Card, CardContent, Divider, Typography } from '@mui/material';
import { formatNumber, formatPercentage } from '../../../../utils/contractCalculations';
import { PnLResult } from '../types';

interface PnLResultPanelProps {
  result: PnLResult | null;
}

export default function PnLResultPanel({ result }: PnLResultPanelProps) {
  return (
      <Card>
        <CardContent sx={{ p: { xs: 1, sm: 2 }, '&:last-child': { pb: { xs: 1, sm: 2 } } }}>
          <Typography variant="h6" gutterBottom>
            计算结果
          </Typography>

          {!result ? (
            <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
              <Typography variant="body1" color="textSecondary">
                请输入仓位信息，系统将自动计算结果
              </Typography>
            </Box>
          ) : (
            <Box>
              <Box mb={3} p={3} bgcolor="primary.50" borderRadius={1} textAlign="center">
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  总盈亏
                </Typography>
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
                  <Typography variant="body2" color="textSecondary">
                    总投入:
                  </Typography>
                  <Typography variant="body2">{formatNumber(result.totalInvestment, 2)} USDT</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    总回报:
                  </Typography>
                  <Typography variant="body2">{formatNumber(result.totalReturn, 2)} USDT</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" color="textSecondary">
                    回报率:
                  </Typography>
                  <Typography variant="body2" color={result.roe >= 0 ? 'success.main' : 'error.main'}>
                    {result.roe >= 0 ? '+' : ''}{formatPercentage(result.roe, 2)}%
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />
              <Typography variant="h6" gutterBottom>
                仓位统计
              </Typography>

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
