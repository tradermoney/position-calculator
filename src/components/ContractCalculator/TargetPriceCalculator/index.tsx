import React, { useState, useEffect, useCallback } from 'react';
import { Grid } from '@mui/material';
import {
  PositionSide,
  TargetPriceCalculatorParams,
  TargetPriceCalculatorResult,
  calculateTargetPrice,
} from '../../../utils/contractCalculations';
import { FormSection } from './FormSection';
import { ResultSection } from './ResultSection';

export default function TargetPriceCalculator() {
  const [params, setParams] = useState<TargetPriceCalculatorParams>({
    side: PositionSide.LONG,
    entryPrice: 0,
    targetROE: 0,
    leverage: 20,
  });

  const [result, setResult] = useState<TargetPriceCalculatorResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 验证输入参数
  const validateParams = useCallback((): string[] => {
    const errors: string[] = [];

    if (params.entryPrice <= 0) {
      errors.push('开仓价格必须大于0');
    }

    if (params.targetROE === 0) {
      errors.push('目标回报率不能为0');
    }

    if (Math.abs(params.targetROE) > 1000) {
      errors.push('目标回报率应在-1000%到1000%之间');
    }

    return errors;
  }, [params]);

  // 计算目标价格
  const handleCalculate = () => {
    const validationErrors = validateParams();
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      const calculationResult = calculateTargetPrice(params);
      setResult(calculationResult);
    } else {
      setResult(null);
    }
  };

  // 重置表单
  const handleReset = () => {
    setParams({
      side: PositionSide.LONG,
      entryPrice: 0,
      targetROE: 0,
      leverage: 20,
    });
    setResult(null);
    setErrors([]);
  };

  // 自动计算（当所有必要参数都有值时）
  useEffect(() => {
    if (params.entryPrice > 0 && params.targetROE !== 0) {
      const validationErrors = validateParams();
      if (validationErrors.length === 0) {
        const calculationResult = calculateTargetPrice(params);
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
