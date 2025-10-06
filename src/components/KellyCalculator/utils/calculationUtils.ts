import {
  TradeRecord,
  KellyResult,
  RiskAdjustment,
  calculateHistoricalKelly,
  calculateTradingKelly,
  applyRiskAdjustment,
  validateKellyParams,
} from '../../../utils/kellyCalculations';

export interface CalculateKellyParams {
  tabValue: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  trades: TradeRecord[];
  riskAdjustment: RiskAdjustment;
}

export interface CalculateKellyReturn {
  result: KellyResult | null;
  errors: string[];
}

// 计算凯里公式
export const calculateKelly = (params: CalculateKellyParams): CalculateKellyReturn => {
  const { tabValue, winRate, avgWin, avgLoss, trades, riskAdjustment } = params;

  if (tabValue === 0) {
    // 交易版凯里公式
    const validationErrors = validateKellyParams(winRate / 100, avgWin, avgLoss);
    if (validationErrors.length > 0) {
      return {
        result: null,
        errors: validationErrors,
      };
    }

    const kellyPercentage = calculateTradingKelly({
      winRate: winRate / 100,
      avgWin,
      avgLoss,
    });

    const adjustedKelly = applyRiskAdjustment(kellyPercentage, riskAdjustment);

    const calculationResult: KellyResult = {
      kellyPercentage,
      fractionalKelly: adjustedKelly,
      winRate: winRate / 100,
      avgWin,
      avgLoss,
      profitFactor: avgLoss > 0 ? avgWin / avgLoss : Infinity,
      expectedReturn: (winRate / 100 * avgWin - (1 - winRate / 100) * avgLoss) / 100,
      riskOfRuin: kellyPercentage > 0.25 ? 0.1 : 0.05,
      recommendation: kellyPercentage > 0.25 ? '建议使用分数凯利降低风险' : '可以使用当前比例',
      isValid: kellyPercentage > 0,
      warnings: kellyPercentage > 0.25 ? ['凯利比例较高，建议谨慎使用'] : [],
    };

    return {
      result: calculationResult,
      errors: [],
    };
  } else {
    // 历史数据分析
    const calculationResult = calculateHistoricalKelly({ trades });
    const adjustedResult = {
      ...calculationResult,
      fractionalKelly: applyRiskAdjustment(calculationResult.kellyPercentage, riskAdjustment),
    };

    return {
      result: adjustedResult,
      errors: [],
    };
  }
};
