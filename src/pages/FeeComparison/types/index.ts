// 交易所费率配置
export interface ExchangeFeeConfig {
  id: string;
  name: string;
  makerFee: number;  // Maker费率 (%)
  takerFee: number;  // Taker费率 (%)
}

// 费率对比计算输入
export interface FeeComparisonInput {
  tradeAmount: number;      // 交易金额
  leverage: number;         // 杠杆倍数
  makerRatio: number;       // Maker订单比例 (%)
  takerRatio: number;       // Taker订单比例 (%)
}

// 费率对比结果
export interface FeeComparisonResult {
  exchange: ExchangeFeeConfig;
  makerFee: number;          // Maker费用
  takerFee: number;          // Taker费用
  totalFee: number;          // 总费用
  actualTradeAmount: number; // 实际交易金额（含杠杆）
  feeRate: number;           // 综合费率 (%)
}

// 自定义交易所配置
export interface CustomExchangeConfig {
  name: string;
  makerFee: string;
  takerFee: string;
}


