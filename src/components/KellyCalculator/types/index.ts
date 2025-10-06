export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export interface KellyFormData {
  // 交易版凯里公式参数
  winRate: number;
  avgWin: number;
  avgLoss: number;
}

export interface KellyState {
  tabValue: number;
  winRate: number;
  avgWin: number;
  avgLoss: number;
  trades: import('../../../utils/kellyCalculations').TradeRecord[];
  riskAdjustment: import('../../../utils/kellyCalculations').RiskAdjustment;
  result: import('../../../utils/kellyCalculations').KellyResult | null;
  errors: string[];
}
