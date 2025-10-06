import React, { useState, useEffect, useCallback } from 'react';
import { Grid } from '@mui/material';
import {
  PositionSide,
  MarginMode,
  PositionMode,
  LiquidationPriceCalculatorParams,
  LiquidationPriceCalculatorResult,
  calculateLiquidationPrice,
} from '../../../utils/contractCalculations';
import { FormSection } from './FormSection';
import { ResultSection } from './ResultSection';

export default function LiquidationPriceCalculator() {
  const [params, setParams] = useState<LiquidationPriceCalculatorParams>({
    side: PositionSide.LONG,
    marginMode: MarginMode.CROSS,
    positionMode: PositionMode.ONE_WAY,
    leverage: 20,
    entryPrice: 0,
    quantity: 0,
    walletBalance: 0,
    maintenanceMarginRate: 0.004, // 0.4%
  });

  const [result, setResult] = useState<LiquidationPriceCalculatorResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 验证输入参数
  const validateParams = useCallback((): string[] => {
    const errors: string[] = [];

    if (params.entryPrice <= 0) {
      errors.push('开仓价格必须大于0');
    }

    if (params.quantity <= 0) {
      errors.push('成交数量必须大于0');
    }

    if (params.leverage <= 0 || params.leverage > 125) {
      errors.push('杠杆倍数必须在1-125之间');
    }

    if (params.walletBalance < 0) {
      errors.push('钱包余额不能为负数');
    }

    return errors;
  }, [params]);

  // 计算强平价格
  const handleCalculate = () => {
    const validationErrors = validateParams();
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      const calculationResult = calculateLiquidationPrice(params);
      setResult(calculationResult);
    } else {
      setResult(null);
    }
  };

  // 重置表单
  const handleReset = () => {
    setParams({
      side: PositionSide.LONG,
      marginMode: MarginMode.CROSS,
      positionMode: PositionMode.ONE_WAY,
      leverage: 20,
      entryPrice: 0,
      quantity: 0,
      walletBalance: 0,
      maintenanceMarginRate: 0.004,
    });
    setResult(null);
    setErrors([]);
  };

  // 自动计算（当所有必要参数都有值时）
  useEffect(() => {
    if (params.entryPrice > 0 && params.quantity > 0 && params.leverage > 0 && params.walletBalance >= 0) {
      const validationErrors = validateParams();
      if (validationErrors.length === 0) {
        const calculationResult = calculateLiquidationPrice(params);
        setResult(calculationResult);
        setErrors([]);
      }
    }
  }, [params, validateParams]);

  return (
    <Grid container spacing={3}>
      {/* 左侧：参数输入 */}
      <Grid item xs={12} md={6}>
        <FormSection
          params={params}
          onParamsChange={setParams}
          onCalculate={handleCalculate}
          onReset={handleReset}
          errors={errors}
        />
      </Grid>

      {/* 右侧：计算结果 */}
      <Grid item xs={12} md={6}>
        <ResultSection result={result} params={params} />
      </Grid>
    </Grid>
  );
}
