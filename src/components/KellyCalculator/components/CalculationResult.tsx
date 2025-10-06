import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
} from '@mui/material';
import { KellyResult, formatPercentage, formatNumber } from '../../../utils/kellyCalculations';

interface CalculationResultProps {
  result: KellyResult | null;
}

export function CalculationResult({ result }: CalculationResultProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          计算结果
        </Typography>

        {result ? (
          <Box>
            {/* 主要结果 */}
            <Box mb={3} textAlign="center">
              <Typography variant="h4" color="primary" gutterBottom>
                {formatPercentage(result.fractionalKelly)}
              </Typography>
              <Typography variant="subtitle2" color="text.secondary">
                建议仓位比例
              </Typography>
            </Box>

            {/* 详细指标 */}
            <Box mb={2}>
              <Grid container spacing={{ xs: 1, sm: 1.5, md: 2 }}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    原始凯里比例:
                  </Typography>
                  <Typography variant="body1">
                    {formatPercentage(result.kellyPercentage)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    胜率:
                  </Typography>
                  <Typography variant="body1">
                    {formatPercentage(result.winRate)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    平均盈利:
                  </Typography>
                  <Typography variant="body1">
                    {formatNumber(result.avgWin)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    平均亏损:
                  </Typography>
                  <Typography variant="body1">
                    {formatNumber(result.avgLoss)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    盈利因子:
                  </Typography>
                  <Typography variant="body1">
                    {formatNumber(result.profitFactor)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    预期收益率:
                  </Typography>
                  <Typography
                    variant="body1"
                    color={result.expectedReturn > 0 ? 'success.main' : 'error.main'}
                  >
                    {formatPercentage(result.expectedReturn)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* 建议 */}
            {result.recommendation && (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">{result.recommendation}</Typography>
              </Alert>
            )}

            {/* 警告 */}
            {result.warnings.map((warning, index) => (
              <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                <Typography variant="body2">{warning}</Typography>
              </Alert>
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">请输入参数并点击计算</Typography>
        )}
      </CardContent>
    </Card>
  );
}
