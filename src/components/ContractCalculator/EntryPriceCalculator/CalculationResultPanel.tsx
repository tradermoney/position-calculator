import React from 'react';
import { Box, Typography, Grid, Alert } from '@mui/material';
import {
  PositionSide,
  EntryPriceCalculatorResult,
  formatNumber,
} from '../../../utils/contractCalculations';
import { Position } from './types';

interface CalculationResultPanelProps {
  result: EntryPriceCalculatorResult | null;
  side: PositionSide;
  positions: Position[];
}

export function CalculationResultPanel({ result, side, positions }: CalculationResultPanelProps) {
  if (!result) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" minHeight={200}>
        <Typography variant="body1" color="textSecondary">
          请输入仓位信息并点击计算
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* 平均开仓价格 */}
      <Box mb={3} p={3} bgcolor="primary.50" borderRadius={1} textAlign="center">
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          平均开仓价格
        </Typography>
        <Typography variant="h4" color="primary.main" gutterBottom>
          {formatNumber(result.averageEntryPrice, 4)} USDT
        </Typography>
      </Box>

      {/* 汇总信息 */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6}>
          <Box p={2} bgcolor="grey.50" borderRadius={1} textAlign="center">
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              总数量
            </Typography>
            <Typography variant="h6">{formatNumber(result.totalQuantity, 6)}</Typography>
            <Typography variant="body2" color="textSecondary">
              币
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box p={2} bgcolor="grey.50" borderRadius={1} textAlign="center">
            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
              总价值
            </Typography>
            <Typography variant="h6">{formatNumber(result.totalValue, 2)}</Typography>
            <Typography variant="body2" color="textSecondary">
              USDT
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* 仓位详情 */}
      <Box p={2} bgcolor="grey.50" borderRadius={1}>
        <Typography variant="subtitle2" gutterBottom>
          仓位详情
        </Typography>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2" color="textSecondary">
            仓位方向:
          </Typography>
          <Typography variant="body2">
            {side === PositionSide.LONG ? '做多' : '做空'}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2" color="textSecondary">
            仓位数量:
          </Typography>
          <Typography variant="body2">
            {positions.filter((p) => p.price > 0 && p.quantity > 0).length} 笔
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography variant="body2" color="textSecondary">
            价格区间:
          </Typography>
          <Typography variant="body2">
            {(() => {
              const validPositions = positions.filter(
                (p) => p.enabled && p.price > 0 && p.quantity > 0
              );
              if (validPositions.length === 0) return '-';
              const prices = validPositions.map((p) => p.price);
              const minPrice = Math.min(...prices);
              const maxPrice = Math.max(...prices);
              return `${formatNumber(minPrice, 4)} - ${formatNumber(maxPrice, 4)} USDT`;
            })()}
          </Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="textSecondary">
            平均成本:
          </Typography>
          <Typography variant="body2">
            {formatNumber(result.averageEntryPrice, 4)} USDT
          </Typography>
        </Box>
      </Box>

      {/* 提示信息 */}
      <Alert severity="info" sx={{ mt: 2 }}>
        <Typography variant="body2">
          平均开仓价格 = 总价值 ÷ 总数量。此计算不考虑手续费和滑点。
        </Typography>
      </Alert>

      {/* 复选框使用说明 */}
      <Alert severity="success" sx={{ mt: 1 }}>
        <Typography variant="body2">
          💡 使用复选框可以临时排除某些仓位的计算，无需删除数据。取消勾选的仓位将不参与平均价格计算。
        </Typography>
      </Alert>
    </Box>
  );
}
