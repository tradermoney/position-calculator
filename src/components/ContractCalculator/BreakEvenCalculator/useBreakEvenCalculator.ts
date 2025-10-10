import { useState, useCallback, useMemo, useEffect } from 'react';
import {
  BreakEvenInputs,
  BreakEvenResult,
  calculateBreakEvenRate,
  getDefaultBreakEvenInputs,
  validateBreakEvenInputs,
} from '../../../utils/breakEvenCalculations';
import { saveBreakEvenInputs, loadBreakEvenInputs } from '../../../utils/storage/breakEvenCalculatorStorage';
import {
  getExchangeInfo,
  getCurrentFundingRate,
  getSymbolInfo,
  calculateAverageFundingRate,
  calculateFundingIntervalFromHistory,
  getFundingRateHistory,
  SymbolInfo,
} from '../../../services/binanceApi';

export function useBreakEvenCalculator() {
  const [inputs, setInputs] = useState<BreakEvenInputs>(getDefaultBreakEvenInputs());
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 币安API相关状态
  const [symbols, setSymbols] = useState<string[]>([]);
  const [symbolInfo, setSymbolInfo] = useState<SymbolInfo | null>(null);
  const [fundingHistory, setFundingHistory] = useState<any[]>([]);
  const [currentFundingRate, setCurrentFundingRate] = useState<any>(null);
  const [symbolsLoading, setSymbolsLoading] = useState(true);
  const [fundingDataLoading, setFundingDataLoading] = useState(false);

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

  // 加载可用交易对
  useEffect(() => {
    const loadSymbols = async () => {
      try {
        setSymbolsLoading(true);
        const data = await getExchangeInfo();
        setSymbols(data);
      } catch (err) {
        console.error('加载交易对失败:', err);
        // 如果加载失败，使用常见交易对
        setSymbols([
          'BTCUSDT',
          'ETHUSDT',
          'BNBUSDT',
          'SOLUSDT',
          'XRPUSDT',
          'DOGEUSDT',
          'ADAUSDT',
          'MATICUSDT',
          'DOTUSDT',
          'LINKUSDT',
        ]);
      } finally {
        setSymbolsLoading(false);
      }
    };
    loadSymbols();
  }, []);

  // 加载资金费率数据
  const loadFundingData = useCallback(async () => {
    if (!inputs.symbol) return;

    try {
      setFundingDataLoading(true);
      setErrors([]);

      // 获取最近30天的资金费率历史
      const endTime = Date.now();
      const startTime = endTime - 30 * 24 * 60 * 60 * 1000;

      const [history, current, info] = await Promise.all([
        getFundingRateHistory({
          symbol: inputs.symbol,
          startTime,
          endTime,
          limit: 1000,
        }),
        getCurrentFundingRate(inputs.symbol),
        getSymbolInfo(inputs.symbol),
      ]);

      // 从历史数据中计算实际的结算周期
      const actualInterval = calculateFundingIntervalFromHistory(history);
      
      // 更新 symbolInfo 的实际结算周期
      let updatedInfo = info;
      if (info && actualInterval) {
        updatedInfo = {
          ...info,
          fundingIntervalHours: actualInterval,
        };
        console.log(`${inputs.symbol} 实际结算周期: ${actualInterval} 小时（从历史数据计算）`);
      }

      // 计算7天平均费率
      const periodsPerDay = 24 / (actualInterval || 8);
      const periods7Days = Math.floor(periodsPerDay * 7);
      const last7DaysData = history.slice(-periods7Days);
      const avgFundingRate7d = calculateAverageFundingRate(last7DaysData);

      setFundingHistory(history);
      setCurrentFundingRate(current);
      setSymbolInfo(updatedInfo);

      // 自动更新资金费率和结算周期
      if (avgFundingRate7d !== null) {
        setInputs(prev => ({
          ...prev,
          fundingRate: avgFundingRate7d * 100, // 转换为百分比
          fundingPeriod: actualInterval || 8,
        }));
      }
    } catch (err: any) {
      setErrors([err.message || '加载资金费率数据失败']);
      console.error('Error:', err);
    } finally {
      setFundingDataLoading(false);
    }
  }, [inputs.symbol]);

  // 当交易对改变时，加载资金费率数据
  useEffect(() => {
    if (inputs.symbol && !isLoading) {
      loadFundingData();
    }
  }, [inputs.symbol, isLoading, loadFundingData]);

  // 更新输入值
  const updateInput = useCallback((field: keyof BreakEvenInputs, value: number | string) => {
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

  // 更新交易对
  const updateSymbol = useCallback((value: string) => {
    updateInput('symbol', value);
  }, [updateInput]);

  // 更新开仓方向
  const updatePositionDirection = useCallback((value: 'long' | 'short') => {
    updateInput('positionDirection', value);
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
    symbols,
    symbolInfo,
    fundingHistory,
    currentFundingRate,
    symbolsLoading,
    fundingDataLoading,
    updateLeverage,
    updateOpenFeeRate,
    updateCloseFeeRate,
    updateFundingRate,
    updateFundingPeriod,
    updateHoldingTime,
    updateSymbol,
    updatePositionDirection,
    reset,
    loadFundingData,
  };
}