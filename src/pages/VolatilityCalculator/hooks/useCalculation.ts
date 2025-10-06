import { useState, useEffect, useCallback } from 'react';
import { CalculationMode, VolatilityResult, ReverseCalculationResult } from '../types';
import { calculateVolatility, calculateTargetPrice } from '../utils/calculations';
import { validateForwardInputs, validateReverseInputs } from '../utils/validation';

export const useCalculation = () => {
  const [calculationMode, setCalculationMode] = useState<CalculationMode>(CalculationMode.FORWARD);
  const [price1, setPrice1] = useState<string>('');
  const [price2, setPrice2] = useState<string>('');
  const [volatilityInput, setVolatilityInput] = useState<string>('');
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [result, setResult] = useState<VolatilityResult | null>(null);
  const [reverseResult, setReverseResult] = useState<ReverseCalculationResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 根据计算模式验证输入
  const validateInputs = useCallback((): string[] => {
    return calculationMode === CalculationMode.FORWARD
      ? validateForwardInputs(price1, price2)
      : validateReverseInputs(price1, volatilityInput);
  }, [calculationMode, price1, price2, volatilityInput]);

  // 实时计算
  useEffect(() => {
    const validationErrors = validateInputs();
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      if (calculationMode === CalculationMode.FORWARD && price1 && price2) {
        const calculationResult = calculateVolatility(price1, price2, investmentAmount);
        setResult(calculationResult);
        setReverseResult(null);
      } else if (calculationMode === CalculationMode.REVERSE && price1 && volatilityInput) {
        const calculationResult = calculateTargetPrice(price1, volatilityInput, investmentAmount);
        setReverseResult(calculationResult);
        setResult(null);
      }
    } else {
      setResult(null);
      setReverseResult(null);
    }
  }, [calculationMode, price1, price2, volatilityInput, investmentAmount, validateInputs]);

  // 切换计算模式
  const handleModeChange = useCallback((newMode: CalculationMode) => {
    setCalculationMode(newMode);
    // 切换模式时清空相关输入
    if (newMode === CalculationMode.FORWARD) {
      setVolatilityInput('');
    } else {
      setPrice2('');
    }
    setResult(null);
    setReverseResult(null);
    setErrors([]);
  }, []);

  // 清空输入
  const clearInputs = useCallback(() => {
    setPrice1('');
    setPrice2('');
    setVolatilityInput('');
    setInvestmentAmount('');
    setResult(null);
    setReverseResult(null);
    setErrors([]);
  }, []);

  return {
    // 状态
    calculationMode,
    price1,
    price2,
    volatilityInput,
    investmentAmount,
    result,
    reverseResult,
    errors,
    // 方法
    setPrice1,
    setPrice2,
    setVolatilityInput,
    setInvestmentAmount,
    handleModeChange,
    clearInputs,
  };
};
