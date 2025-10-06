import { useState, useEffect, useCallback } from 'react';
import { IndexedDBVolatilityStorage, VolatilityInputState } from '../../../utils/indexedDBStorage';
import { VolatilityRecord, CalculationMode, VolatilityResult, ReverseCalculationResult } from '../types';

interface UseHistoryProps {
  price1: string;
  price2: string;
  setPrice1: (value: string) => void;
  setPrice2: (value: string) => void;
  calculationMode: CalculationMode;
  result: VolatilityResult | null;
  reverseResult: ReverseCalculationResult | null;
  clearInputs: () => void;
}

export const useHistory = ({
  price1,
  price2,
  setPrice1,
  setPrice2,
  calculationMode,
  result,
  reverseResult,
  clearInputs,
}: UseHistoryProps) => {
  const [history, setHistory] = useState<VolatilityRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 初始化数据加载
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);

        // 加载历史记录
        const records = await IndexedDBVolatilityStorage.getRecords(10);
        setHistory(records);

        // 加载输入状态
        const inputState = await IndexedDBVolatilityStorage.loadInputState();
        if (inputState.price1 || inputState.price2) {
          setPrice1(inputState.price1);
          setPrice2(inputState.price2);
        }
      } catch (error) {
        console.error('初始化数据加载失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [setPrice1, setPrice2]);

  // 自动保存输入状态
  useEffect(() => {
    if (!isLoading) {
      const saveInputState = async () => {
        try {
          const inputState: VolatilityInputState = {
            price1,
            price2,
            lastUpdated: new Date()
          };
          await IndexedDBVolatilityStorage.saveInputState(inputState);
        } catch (error) {
          console.error('保存输入状态失败:', error);
        }
      };

      // 防抖保存
      const timeoutId = setTimeout(saveInputState, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [price1, price2, isLoading]);

  // 保存计算记录
  const saveRecord = useCallback(async () => {
    const currentResult = result || reverseResult;
    if (!currentResult) return;

    try {
      const record: VolatilityRecord = {
        id: Date.now().toString(),
        price1: parseFloat(price1),
        price2: calculationMode === CalculationMode.FORWARD
          ? parseFloat(price2)
          : reverseResult?.targetPrice || 0,
        volatility: currentResult.volatility,
        sign: currentResult.sign,
        calculatedAt: new Date(),
      };

      // 保存到IndexedDB
      await IndexedDBVolatilityStorage.saveRecord(record);

      // 重新加载历史记录
      const updatedRecords = await IndexedDBVolatilityStorage.getRecords(10);
      setHistory(updatedRecords);
    } catch (error) {
      console.error('保存计算记录失败:', error);
    }
  }, [result, reverseResult, price1, price2, calculationMode]);

  // 从历史记录恢复
  const restoreFromHistory = useCallback((record: VolatilityRecord) => {
    setPrice1(record.price1.toString());
    setPrice2(record.price2.toString());
  }, [setPrice1, setPrice2]);

  // 清空历史记录
  const clearHistory = useCallback(async () => {
    try {
      await IndexedDBVolatilityStorage.clearAllRecords();
      setHistory([]);
    } catch (error) {
      console.error('清空历史记录失败:', error);
    }
  }, []);

  // 增强的清空输入（包括 IndexedDB）
  const clearInputsWithStorage = useCallback(async () => {
    try {
      clearInputs();
      // 清空IndexedDB中的输入状态
      await IndexedDBVolatilityStorage.clearInputState();
    } catch (error) {
      console.error('清空输入状态失败:', error);
    }
  }, [clearInputs]);

  return {
    history,
    isLoading,
    saveRecord,
    restoreFromHistory,
    clearHistory,
    clearInputsWithStorage,
  };
};
