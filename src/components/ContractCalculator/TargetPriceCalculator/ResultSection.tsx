import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
} from '@mui/material';
import {
  PositionSide,
  TargetPriceCalculatorResult,
  formatNumber,
} from '../../../utils/contractCalculations';
import { TargetPriceCalculatorParams } from './types';

interface ResultSectionProps {
  result: TargetPriceCalculatorResult | null;
  params: TargetPriceCalculatorParams;
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

        {/* 目标价格 */}
        <Box mb={3} p={3} bgcolor="grey.50" borderRadius={1} textAlign="center">
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            目标价格
          </Typography>
          <Typography variant="h4" color="primary.main" gutterBottom>
            {formatNumber(result.targetPrice, 4)} USDT
          </Typography>

          {/* 价格变化信息 */}
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              从 {formatNumber(params.entryPrice, 4)} USDT 到 {formatNumber(result.targetPrice, 4)} USDT
            </Typography>
            <Typography
              variant="body2"
              color={params.targetROE >= 0 ? 'success.main' : 'error.main'}
            >
              价格变化: {params.side === PositionSide.LONG
                ? (result.targetPrice > params.entryPrice ? '上涨' : '下跌')
                : (result.targetPrice < params.entryPrice ? '下跌' : '上涨')
              } {formatNumber(Math.abs(result.targetPrice - params.entryPrice), 4)} USDT
            </Typography>
            <Typography
              variant="body2"
              color={params.targetROE >= 0 ? 'success.main' : 'error.main'}
            >
              变化幅度: {formatNumber(Math.abs((result.targetPrice - params.entryPrice) / params.entryPrice * 100), 2)}%
            </Typography>
          </Box>
        </Box>

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
              开仓价格:
            </Typography>
            <Typography variant="body2">
              {formatNumber(params.entryPrice, 4)} USDT
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="textSecondary">
              目标回报率:
            </Typography>
            <Typography
              variant="body2"
              color={params.targetROE >= 0 ? 'success.main' : 'error.main'}
            >
              {params.targetROE >= 0 ? '+' : ''}{params.targetROE}%
            </Typography>
          </Box>
        </Box>

        {/* 风险提示 */}
        {Math.abs(params.targetROE) > 100 && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            高回报率目标意味着高风险，请谨慎设置止盈止损
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
