import { useState, useEffect, useCallback } from 'react';
import {
  TradeRecord,
  KellyResult,
  RiskAdjustment,
} from '../../../utils/kellyCalculations';
import { calculateKelly } from '../utils';

export const useKellyCalculator = () => {
  const [tabValue, setTabValue] = useState(0);

  // 交易版凯里公式参数
  const [winRate, setWinRate] = useState<number>(60);
  const [avgWin, setAvgWin] = useState<number>(100);
  const [avgLoss, setAvgLoss] = useState<number>(50);

  // 历史数据模式
  const [trades, setTrades] = useState<TradeRecord[]>([
    { id: 1, profit: 100, enabled: true },
    { id: 2, profit: -50, enabled: true },
    { id: 3, profit: 150, enabled: true },
    { id: 4, profit: -30, enabled: true },
  ]);

  // 风险调整参数
  const [riskAdjustment, setRiskAdjustment] = useState<RiskAdjustment>({
    fractionalFactor: 0.5,
    maxPosition: 0.25,
    riskTolerance: 'moderate',
  });

  // 计算结果
  const [result, setResult] = useState<KellyResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 计算凯里公式
  const handleCalculate = useCallback(() => {
    const { result: calculationResult, errors: calculationErrors } = calculateKelly({
      tabValue,
      winRate,
      avgWin,
      avgLoss,
      trades,
      riskAdjustment,
    });

    setResult(calculationResult);
    setErrors(calculationErrors);
  }, [tabValue, winRate, avgWin, avgLoss, trades, riskAdjustment]);

  // 重置表单
  const handleReset = () => {
    setWinRate(60);
    setAvgWin(100);
    setAvgLoss(50);
    setTrades([
      { id: 1, profit: 100, enabled: true },
      { id: 2, profit: -50, enabled: true },
      { id: 3, profit: 150, enabled: true },
      { id: 4, profit: -30, enabled: true },
    ]);
    setRiskAdjustment({
      fractionalFactor: 0.5,
      maxPosition: 0.25,
      riskTolerance: 'moderate',
    });
    setResult(null);
    setErrors([]);
  };

  // 自动计算
  useEffect(() => {
    if (tabValue === 0 && winRate > 0 && avgWin > 0 && avgLoss > 0) {
      handleCalculate();
    } else if (tabValue === 1 && trades.some(trade => trade.enabled)) {
      handleCalculate();
    }
  }, [tabValue, winRate, avgWin, avgLoss, trades, riskAdjustment, handleCalculate]);

  return {
    tabValue,
    setTabValue,
    winRate,
    setWinRate,
    avgWin,
    setAvgWin,
    avgLoss,
    setAvgLoss,
    trades,
    setTrades,
    riskAdjustment,
    setRiskAdjustment,
    result,
    errors,
    handleCalculate,
    handleReset,
  };
};
