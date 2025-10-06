import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Alert,
} from '@mui/material';
import {
  PositionSide,
  MaxPositionCalculatorResult,
  formatNumber,
} from '../../../utils/contractCalculations';
import { MaxPositionCalculatorParams } from './types';

interface ResultSectionProps {
  result: MaxPositionCalculatorResult | null;
  params: MaxPositionCalculatorParams;
}

export function ResultSection({ result, params }: ResultSectionProps) {
  if (!result) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            计算结果
          </Typography>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight={200}
          >
            <Typography variant="body1" color="textSecondary">
              请输入交易参数并点击计算
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          计算结果
        </Typography>

        {/* 最大可开数量 */}
        <Box mb={3} p={3} bgcolor="primary.50" borderRadius={1} textAlign="center">
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            最大可开数量
          </Typography>
          <Typography variant="h4" color="primary.main" gutterBottom>
            {formatNumber(result.maxQuantity, 6)} 币
          </Typography>
          <Typography variant="h6" color="primary.main">
            {formatNumber(result.maxPositionValue, 2)} USDT
          </Typography>
        </Box>

        {/* 详细信息 */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6}>
            <Box p={2} bgcolor="grey.50" borderRadius={1} textAlign="center">
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                可开数量
              </Typography>
              <Typography variant="h6">
                {formatNumber(result.maxQuantity, 6)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                币
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box p={2} bgcolor="grey.50" borderRadius={1} textAlign="center">
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                可开价值
              </Typography>
              <Typography variant="h6">
                {formatNumber(result.maxPositionValue, 2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                USDT
              </Typography>
            </Box>
          </Grid>
        </Grid>

        {/* 交易摘要 */}
        <Box p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            交易摘要
          </Typography>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="textSecondary">
              仓位方向:
            </Typography>
            <Typography variant="body2">
              {params.side === PositionSide.LONG ? '做多' : '做空'}
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="textSecondary">
              杠杆倍数:
            </Typography>
            <Typography variant="body2">
              {params.leverage}x
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="textSecondary">
              开仓价格:
            </Typography>
            <Typography variant="body2">
              {formatNumber(params.entryPrice, 4)} USDT
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="textSecondary">
              钱包余额:
            </Typography>
            <Typography variant="body2">
              {formatNumber(params.walletBalance, 2)} USDT
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="textSecondary">
              所需保证金:
            </Typography>
            <Typography variant="body2">
              {formatNumber(result.maxPositionValue / params.leverage, 2)} USDT
            </Typography>
          </Box>
        </Box>

        {/* 数量限制提醒 */}
        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            <strong>重要提醒：交易所数量限制</strong>
          </Typography>
          <Typography variant="body2">
            每个加密货币都有最大可开数量限制，实际可开数量可能小于计算结果
          </Typography>
          <Typography variant="body2">
            请在开仓前查看交易所的具体数量限制规则
          </Typography>
          <Typography variant="body2">
            建议参考实际能够开仓的数量限制进行交易
          </Typography>
        </Alert>

        {/* 风险提示 */}
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            在计算最大可开数量时将不考虑您的开仓损失。实际交易中请预留足够的保证金以应对市场波动。
          </Typography>
        </Alert>

        {/* 高杠杆警告 */}
        {params.leverage > 50 && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            <Typography variant="body2">
              高杠杆交易风险极大，请谨慎操作并设置好止损。
            </Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
