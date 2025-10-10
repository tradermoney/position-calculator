/**
 * 资金费率计算器自定义Hook
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getFundingRateHistory,
  getCurrentFundingRate,
  getExchangeInfo,
  getSymbolInfo,
  calculateAverageFundingRate,
  calculateEstimatedFundingCost,
  calculateFundingPeriods,
  calculateFundingIntervalFromHistory,
  FundingRateData,
  SymbolInfo,
} from '../../../services/binanceApi';
import {
  saveFundingRateInputState,
  loadFundingRateInputState,
} from '../../../utils/storage/fundingRateCalculatorStorage';
import {
  DEFAULT_SYMBOL,
  DEFAULT_POSITION_SIZE,
  DEFAULT_HOLDING_HOURS,
} from '../constants';
import { CalculationResult } from '../types';

export const useFundingRateCalculator = () => {
  // 输入状态
  const [symbol, setSymbol] = useState<string>(DEFAULT_SYMBOL);
  // 做多仓位
  const [longInputMode, setLongInputMode] = useState<'direct' | 'price'>('direct');
  const [longPositionSize, setLongPositionSize] = useState<string>(DEFAULT_POSITION_SIZE);
  const [longEntryPrice, setLongEntryPrice] = useState<string>('');
  const [longQuantity, setLongQuantity] = useState<string>('');
  // 做空仓位
  const [shortInputMode, setShortInputMode] = useState<'direct' | 'price'>('direct');
  const [shortPositionSize, setShortPositionSize] = useState<string>('0');
  const [shortEntryPrice, setShortEntryPrice] = useState<string>('');
  const [shortQuantity, setShortQuantity] = useState<string>('');
  // 持有时间
  const [timeMode, setTimeMode] = useState<'historical' | 'future'>('future');
  const [holdingHours, setHoldingHours] = useState<string>(DEFAULT_HOLDING_HOURS);

  // 数据状态
  const [symbols, setSymbols] = useState<string[]>([]);
  const [symbolInfo, setSymbolInfo] = useState<SymbolInfo | null>(null);
  const [fundingHistory, setFundingHistory] = useState<FundingRateData[]>([]);
  const [currentFundingRate, setCurrentFundingRate] = useState<FundingRateData | null>(null);

  // UI状态
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [symbolsLoading, setSymbolsLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // 从存储中加载状态
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const savedState = await loadFundingRateInputState();
        if (savedState) {
          setSymbol(savedState.symbol || DEFAULT_SYMBOL);
          // 做多仓位
          setLongInputMode(savedState.longInputMode || 'direct');
          setLongPositionSize(savedState.longPositionSize || DEFAULT_POSITION_SIZE);
          setLongEntryPrice(savedState.longEntryPrice || '');
          setLongQuantity(savedState.longQuantity || '');
          // 做空仓位
          setShortInputMode(savedState.shortInputMode || 'direct');
          setShortPositionSize(savedState.shortPositionSize || '0');
          setShortEntryPrice(savedState.shortEntryPrice || '');
          setShortQuantity(savedState.shortQuantity || '');
          // 持有时间
          setTimeMode(savedState.timeMode || 'future');
          setHoldingHours(savedState.holdingHours || DEFAULT_HOLDING_HOURS);
          console.log('已加载保存的资金费率计算器状态');
        }
      } catch (error) {
        console.error('加载资金费率计算器状态失败:', error);
      } finally {
        setInitialized(true);
      }
    };

    loadSavedState();
  }, []);

  // 保存状态到存储
  useEffect(() => {
    if (!initialized) return;

    const saveState = async () => {
      try {
        await saveFundingRateInputState({
          symbol,
          longInputMode,
          longPositionSize,
          longEntryPrice,
          longQuantity,
          shortInputMode,
          shortPositionSize,
          shortEntryPrice,
          shortQuantity,
          timeMode,
          holdingHours,
        });
      } catch (error) {
        console.error('保存资金费率计算器状态失败:', error);
      }
    };

    // 防抖保存
    const timer = setTimeout(saveState, 500);
    return () => clearTimeout(timer);
  }, [
    symbol,
    longInputMode,
    longPositionSize,
    longEntryPrice,
    longQuantity,
    shortInputMode,
    shortPositionSize,
    shortEntryPrice,
    shortQuantity,
    timeMode,
    holdingHours,
    initialized
  ]);

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
    if (!symbol) return;

    try {
      setLoading(true);
      setError(null);

      // 获取最近30天的资金费率历史
      const endTime = Date.now();
      const startTime = endTime - 30 * 24 * 60 * 60 * 1000;

      const [history, current, info] = await Promise.all([
        getFundingRateHistory({
          symbol,
          startTime,
          endTime,
          limit: 1000,
        }),
        getCurrentFundingRate(symbol),
        getSymbolInfo(symbol),
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
        console.log(`${symbol} 实际结算周期: ${actualInterval} 小时（从历史数据计算）`);
      }

      setFundingHistory(history);
      setCurrentFundingRate(current);
      setSymbolInfo(updatedInfo);
    } catch (err: any) {
      setError(err.message || '加载资金费率数据失败');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  // 当交易对改变时，加载资金费率数据
  useEffect(() => {
    if (symbol && initialized) {
      loadFundingData();
    }
  }, [symbol, initialized, loadFundingData]);

  // 计算实际仓位大小
  const getActualPositionSize = useCallback((
    mode: 'direct' | 'price',
    directSize: string,
    price: string,
    quantity: string
  ): number => {
    if (mode === 'direct') {
      return parseFloat(directSize) || 0;
    } else {
      return (parseFloat(price) || 0) * (parseFloat(quantity) || 0);
    }
  }, []);

  // 计算结果
  const calculateResult = useCallback((): CalculationResult | null => {
    const longSize = getActualPositionSize(
      longInputMode,
      longPositionSize,
      longEntryPrice,
      longQuantity
    );
    const shortSize = getActualPositionSize(
      shortInputMode,
      shortPositionSize,
      shortEntryPrice,
      shortQuantity
    );
    const holdingHoursNum = parseFloat(holdingHours) || 0;

    if (longSize === 0 && shortSize === 0) {
      return null;
    }

    // 使用交易对的实际结算周期，默认8小时
    const fundingIntervalHours = symbolInfo?.fundingIntervalHours || 8;
    const periods = calculateFundingPeriods(holdingHoursNum, fundingIntervalHours);

    // 计算平均资金费率
    const avgFundingRate = calculateAverageFundingRate(fundingHistory);

    // 计算最近7天的平均费率（根据实际结算周期动态计算）
    const periodsPerDay = 24 / fundingIntervalHours; // 每天的结算次数
    const periods7Days = Math.floor(periodsPerDay * 7); // 7天的总次数
    const last7DaysData = fundingHistory.slice(-periods7Days);
    const avgFundingRate7d = calculateAverageFundingRate(last7DaysData);

    let longCost: number;
    let shortCost: number;

    // 根据时间模式选择不同的计算方式
    if (timeMode === 'historical') {
      // 已持有时间：使用实际历史资金费率逐笔计算
      // 获取最近 N 个周期的实际资金费率数据
      const recentHistory = fundingHistory.slice(-periods);
      
      if (recentHistory.length < periods) {
        console.warn(`历史数据不足: 需要 ${periods} 个周期，实际只有 ${recentHistory.length} 个`);
      }

      // 如果历史数据完全为空，回退到使用平均费率估算
      if (recentHistory.length === 0) {
        console.warn('历史数据为空，使用平均费率估算');
        const effectiveRate = avgFundingRate7d || avgFundingRate;
        longCost = calculateEstimatedFundingCost(longSize, -effectiveRate, periods);
        shortCost = calculateEstimatedFundingCost(shortSize, effectiveRate, periods);
      } else {
        // 逐笔计算做多成本
        longCost = recentHistory.reduce((sum, data) => {
          const rate = parseFloat(data.fundingRate);
          // 正费率时：做多方支付 → 负数（扣款）
          // 负费率时：做多方收取 → 正数（入账）
          return sum + (longSize * -rate);
        }, 0);

        // 逐笔计算做空成本
        shortCost = recentHistory.reduce((sum, data) => {
          const rate = parseFloat(data.fundingRate);
          // 正费率时：做空方收取 → 正数（入账）
          // 负费率时：做空方支付 → 负数（扣款）
          return sum + (shortSize * rate);
        }, 0);

        // 如果数据不足，按比例调整结果
        // 例如：需要12个周期，但只有6个，则结果应该翻倍
        if (recentHistory.length < periods && recentHistory.length > 0) {
          const scaleFactor = periods / recentHistory.length;
          longCost = longCost * scaleFactor;
          shortCost = shortCost * scaleFactor;
          console.warn(`历史数据不足，按比例调整: 缩放因子 ${scaleFactor.toFixed(2)}`);
        }
      }

    } else {
      // 预估持有时间：使用最近7天的平均费率预估
      const effectiveRate = avgFundingRate7d || avgFundingRate;

      // 计算做多成本
      // 正费率时：做多方支付 → 负数（扣款）
      // 负费率时：做多方收取 → 正数（入账）
      longCost = calculateEstimatedFundingCost(longSize, -effectiveRate, periods);

      // 计算做空成本
      // 正费率时：做空方收取 → 正数（入账）
      // 负费率时：做空方支付 → 负数（扣款）
      shortCost = calculateEstimatedFundingCost(shortSize, effectiveRate, periods);
    }

    // 总成本
    const totalCost = longCost + shortCost;

    // 净成本（对冲后）
    const netCost = totalCost;

    // 当前资金费率
    const currentRate = currentFundingRate ? parseFloat(currentFundingRate.fundingRate) : 0;

    return {
      totalCost,
      longCost,
      shortCost,
      netCost,
      periods,
      avgRate: avgFundingRate,
      avgRate7d: avgFundingRate7d,
      currentRate,
    };
  }, [
    longInputMode,
    longPositionSize,
    longEntryPrice,
    longQuantity,
    shortInputMode,
    shortPositionSize,
    shortEntryPrice,
    shortQuantity,
    holdingHours,
    fundingHistory,
    currentFundingRate,
    symbolInfo,
    timeMode,
    getActualPositionSize,
  ]);

  const result = calculateResult();

  return {
    // 输入状态
    symbol,
    longInputMode,
    longPositionSize,
    longEntryPrice,
    longQuantity,
    shortInputMode,
    shortPositionSize,
    shortEntryPrice,
    shortQuantity,
    timeMode,
    holdingHours,
    setSymbol,
    setLongInputMode,
    setLongPositionSize,
    setLongEntryPrice,
    setLongQuantity,
    setShortInputMode,
    setShortPositionSize,
    setShortEntryPrice,
    setShortQuantity,
    setTimeMode,
    setHoldingHours,

    // 数据状态
    symbols,
    symbolInfo,
    fundingHistory,
    currentFundingRate,

    // UI状态
    loading,
    error,
    symbolsLoading,

    // 计算结果
    result,

    // 方法
    loadFundingData,
  };
};

