import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  BreakEvenInputs,
  BreakEvenResult,
  calculateBreakEvenRate,
  getDefaultBreakEvenInputs,
  validateBreakEvenInputs,
} from '../../../utils/breakEvenCalculations';
import { saveBreakEvenInputs, loadBreakEvenInputs } from '../../../utils/storage/breakEvenCalculatorStorage';

export function useBreakEvenCalculator() {
  const [inputs, setInputs] = useState<BreakEvenInputs>(getDefaultBreakEvenInputs());
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 加载保存的输入状态
  useEffect(() => {
    const loadSavedInputs = async () => {
      try {
        const savedInputs = await loadBreakEvenInputs();
        if (savedInputs) {
          setInputs(savedInputs);
        }
      } catch (error) {
        console.error('加载保本计算器输入状态失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedInputs();
  }, []);

  // 更新输入值
  const updateInput = useCallback((field: keyof BreakEvenInputs, value: number) => {
    setInputs(prev => {
      const newInputs = { ...prev, [field]: value };
      // 异步保存到IndexedDB
      saveBreakEvenInputs(newInputs).catch(error => {
        console.error('保存保本计算器输入状态失败:', error);
      });
      return newInputs;
    });
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
    const defaultInputs = getDefaultBreakEvenInputs();
    setInputs(defaultInputs);
    setErrors([]);
    // 保存默认值到IndexedDB
    saveBreakEvenInputs(defaultInputs).catch(error => {
      console.error('保存保本计算器默认输入状态失败:', error);
    });
  }, []);

  return {
    inputs,
    errors,
    result,
    isLoading,
    updateLeverage,
    updateOpenFeeRate,
    updateCloseFeeRate,
    updateFundingRate,
    updateFundingPeriod,
    updateHoldingTime,
    reset,
  };
}