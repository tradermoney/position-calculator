import { useState, useEffect, useCallback } from 'react';
import { CalculatorStorage, CalculatorRecord } from '../../../utils/calculatorStorage';

export function useCalculatorHistory() {
  const [history, setHistory] = useState<CalculatorRecord[]>([]);

  // 加载历史记录
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const records = await CalculatorStorage.getRecords(20);
        setHistory(records);
      } catch (error) {
        console.error('加载历史记录失败:', error);
      }
    };
    loadHistory();
  }, []);

  // 添加历史记录
  const addHistoryRecord = useCallback(async (record: CalculatorRecord) => {
    try {
      await CalculatorStorage.saveRecord(record);
      const updatedHistory = await CalculatorStorage.getRecords(20);
      setHistory(updatedHistory);
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }, []);

  // 清空历史记录
  const handleClearHistory = useCallback(async () => {
    try {
      await CalculatorStorage.clearAllRecords();
      setHistory([]);
    } catch (error) {
      console.error('清空历史记录失败:', error);
    }
  }, []);

  return {
    history,
    addHistoryRecord,
    handleClearHistory,
  };
}
