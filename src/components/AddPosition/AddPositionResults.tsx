/**
 * 补仓计算结果显示组件
 */

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import { AddPositionResult } from '../../types/addPosition';

interface AddPositionResultsProps {
  result: AddPositionResult | null;
  onApply: () => void;
}

/**
 * 格式化数字
 */
const formatNumber = (value: number, decimals: number = 4): string => {
  if (isNaN(value) || !isFinite(value)) return '0';
  return value.toFixed(decimals);
};

/**
 * 格式化百分比
 */
const formatPercentage = (value: number, decimals: number = 2): string => {
  if (isNaN(value) || !isFinite(value)) return '0.00%';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

export default function AddPositionResults({
  result,
  onApply,
}: AddPositionResultsProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          补仓计算结果
        </Typography>

        {!result ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            minHeight={200}
          >
            <Typography variant="body1" color="textSecondary">
              请设置补仓参数并点击计算
            </Typography>
          </Box>
        ) : (
          <Box>
            {/* 补仓前后对比 */}
            <Typography variant="subtitle1" gutterBottom>
              补仓前后对比
            </Typography>

            <Grid container spacing={2} mb={3}>
              <Grid item xs={6}>
                <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(255,193,7,0.1)', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    补仓前成本价
                  </Typography>
                  <Typography variant="h6">
                    ${formatNumber(result.originalPosition.entryPrice)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(76,175,80,0.1)', borderRadius: 1 }}>
                  <Typography variant="body2" color="textSecondary">
                    补仓后成本价
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    ${formatNumber(result.newAveragePrice)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* 详细数据 */}
            <Typography variant="subtitle1" gutterBottom>
              详细数据
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  总持有数量
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formatNumber(result.newTotalQuantity)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  总保证金
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  ${formatNumber(result.newTotalMargin, 2)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  新爆仓价格
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  ${formatNumber(result.newLiquidationPrice)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  成本价变化
                </Typography>
                <Typography
                  variant="body1"
                  fontWeight={500}
                  color={result.priceImprovement < 0 ? 'success.main' : 'error.main'}
                >
                  {formatPercentage(result.priceImprovement)}
                </Typography>
              </Grid>
            </Grid>

            <Box mt={3}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={onApply}
                fullWidth
                color="success"
              >
                应用补仓方案
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
