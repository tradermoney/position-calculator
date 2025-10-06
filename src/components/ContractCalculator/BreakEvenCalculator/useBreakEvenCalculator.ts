import { useState, useCallback, useMemo } from 'react';
import {
  BreakEvenInputs,
  BreakEvenResult,
  calculateBreakEvenRate,
  getDefaultBreakEvenInputs,
  validateBreakEvenInputs,
} from '../../../utils/breakEvenCalculations';

export function useBreakEvenCalculator() {
  const [inputs, setInputs] = useState<BreakEvenInputs>(getDefaultBreakEvenInputs());
  const [errors, setErrors] = useState<string[]>([]);

  // 更新输入值
  const updateInput = useCallback((field: keyof BreakEvenInputs, value: number) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    // 清除之前的错误
    setErrors([]);
  }, []);

  // 更新杠杆倍数
  const updateLeverage = useCallback((value: number) => {
    updateInput('leverage', value);
  }, [updateInput]);

  // 更新开仓手续费率
  const updateOpenFeeRate = useCallback((value: number) => {
    updateInput('openFeeRate', value);
  }, [updateInput]);

  // 更新平仓手续费率
  const updateCloseFeeRate = useCallback((value: number) => {
    updateInput('closeFeeRate', value);
  }, [updateInput]);

  // 更新资金费率
  const updateFundingRate = useCallback((value: number) => {
    updateInput('fundingRate', value);
  }, [updateInput]);

  // 更新资金费率结算周期
  const updateFundingPeriod = useCallback((value: number) => {
    updateInput('fundingPeriod', value);
  }, [updateInput]);

  // 更新持仓时间
  const updateHoldingTime = useCallback((value: number) => {
    updateInput('holdingTime', value);
  }, [updateInput]);

  // 验证输入并计算结果
  const result = useMemo<BreakEvenResult | null>(() => {
    try {
      // 验证输入
      const validationErrors = validateBreakEvenInputs(inputs);
      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        return null;
      }

      // 清除错误
      setErrors([]);

      // 计算结果
      return calculateBreakEvenRate(inputs);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '计算出错';
      setErrors([errorMessage]);
      return null;
    }
  }, [inputs]);

  // 重置到默认值
  const reset = useCallback(() => {
    setInputs(getDefaultBreakEvenInputs());
    setErrors([]);
  }, []);

  return {
    inputs,
    errors,
    result,
    updateLeverage,
    updateOpenFeeRate,
    updateCloseFeeRate,
    updateFundingRate,
    updateFundingPeriod,
    updateHoldingTime,
    reset,
  };
}