import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
} from '@mui/material';
import { usePageTitle } from '../utils/titleManager';
import {
  PyramidParams,
  PyramidResult,
  PositionSide,
  PyramidStrategy
} from '../types/pyramid';
import {
  validatePyramidParams,
  convertToNumericParams,
  calculatePyramidLevels,
} from '../utils/pyramidCalculations';
import PyramidCalculatorForm from '../components/Pyramid/PyramidCalculatorForm';
import PyramidCalculatorResults from '../components/Pyramid/PyramidCalculatorResults';

export default function PyramidCalculator() {
  const [params, setParams] = useState<PyramidParams>({
    symbol: 'BTC/USDT',
    side: PositionSide.LONG,
    leverage: 10,
    initialPrice: 50000,
    initialQuantity: 1,
    initialMargin: 5000,
    pyramidLevels: 5,
    strategy: PyramidStrategy.EQUAL_RATIO,
    priceDropPercent: 5,
    ratioMultiplier: 1.5,
  });

  const [result, setResult] = useState<PyramidResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 设置页面标题
  usePageTitle('pyramid');

  // 计算金字塔加仓
  const calculatePyramid = (): void => {
    const validationErrors = validatePyramidParams(params);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResult(null);
      return;
    }

    setErrors([]);

    try {
      const numericParams = convertToNumericParams(params);
      const levels = calculatePyramidLevels(numericParams);

      const finalLevel = levels[levels.length - 1];
      const maxDrawdown = numericParams.side === PositionSide.LONG
        ? ((numericParams.initialPrice - finalLevel.price) / numericParams.initialPrice) * 100
        : ((finalLevel.price - numericParams.initialPrice) / numericParams.initialPrice) * 100;

      setResult({
        params: numericParams,
        levels,
        totalQuantity: finalLevel.cumulativeQuantity,
        totalMargin: finalLevel.cumulativeMargin,
        finalAveragePrice: finalLevel.averagePrice,
        finalLiquidationPrice: finalLevel.liquidationPrice,
        maxDrawdown,
      });
    } catch (error) {
      setErrors(['计算过程中发生错误，请检查参数设置']);
      setResult(null);
    }
  };

  // 重置表单
  const resetForm = (): void => {
    setParams({
      symbol: 'BTC/USDT',
      side: PositionSide.LONG,
      leverage: 10,
      initialPrice: 50000,
      initialQuantity: 1,
      initialMargin: 5000,
      pyramidLevels: 5,
      strategy: PyramidStrategy.EQUAL_RATIO,
      priceDropPercent: 5,
      ratioMultiplier: 1.5,
    });
    setResult(null);
    setErrors([]);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#fafafa',
        py: 4
      }}
    >
      <Box maxWidth="xl" width="100%">
        <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
          合约分批建仓计算器
        </Typography>

        <Typography variant="body1" color="textSecondary" textAlign="center" paragraph>
          制定专业的分批建仓策略，优化持仓成本和风险管理
        </Typography>

        <Grid container spacing={3}>
          {/* 参数配置 */}
          <Grid item xs={12} lg={6}>
            <PyramidCalculatorForm
              params={params}
              onParamsChange={setParams}
              onCalculate={calculatePyramid}
              onReset={resetForm}
            />
          </Grid>

          {/* 计算结果 */}
          <Grid item xs={12} lg={6}>
            <PyramidCalculatorResults
              result={result}
              errors={errors}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
