import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';
import {
  PositionSide,
  MarginMode,
  LiquidationPriceCalculatorResult,
  formatNumber,
} from '../../../utils/contractCalculations';
import { LiquidationPriceCalculatorParams } from './types';

interface ResultSectionProps {
  result: LiquidationPriceCalculatorResult | null;
  params: LiquidationPriceCalculatorParams;
}

export function ResultSection({ result, params }: ResultSectionProps) {
  // 计算风险距离
  const getRiskDistance = (): number => {
    if (!result || params.entryPrice <= 0) return 0;
    return Math.abs((result.liquidationPrice - params.entryPrice) / params.entryPrice * 100);
  };

  const riskDistance = getRiskDistance();

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

        {/* 强平价格 */}
        <Box mb={3} p={3} bgcolor="error.50" borderRadius={1} textAlign="center">
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            强平价格
          </Typography>
          <Typography variant="h4" color="error.main" gutterBottom>
            {formatNumber(result.liquidationPrice, 4)} USDT
          </Typography>

          {/* 风险距离 */}
          <Box mt={2}>
            <Typography variant="body2" color="textSecondary">
              距离当前价格: {formatNumber(riskDistance, 2)}%
            </Typography>
            {riskDistance < 10 && (
              <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                <WarningIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                <Typography variant="body2" color="error.main">
                  高风险：距离强平价格过近
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* 交易摘要 */}
        <Box p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="subtitle2" gutterBottom>
            交易摘要
          </Typography>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="textSecondary">
              保证金模式:
            </Typography>
            <Typography variant="body2">
              {params.marginMode === MarginMode.CROSS ? '全仓' : '逐仓'}
            </Typography>
          </Box>
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
              仓位价值:
            </Typography>
            <Typography variant="body2">
              {formatNumber(params.entryPrice * params.quantity, 2)} USDT
            </Typography>
          </Box>
          <Box display="flex" justifyContent="space-between">
            <Typography variant="body2" color="textSecondary">
              起始保证金:
            </Typography>
            <Typography variant="body2">
              {formatNumber((params.entryPrice * params.quantity) / params.leverage, 2)} USDT
            </Typography>
          </Box>
        </Box>

        {/* 风险提示 */}
        <Alert severity="warning" sx={{ mt: 2 }}>
          强平价格的计算考虑了您现有的持仓，持有仓位的未实现盈亏和占用保证金将影响强平价格计算。
        </Alert>
      </CardContent>
    </Card>
  );
}
