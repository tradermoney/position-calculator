/**
 * 仓位类型
 */
export enum PositionType {
  OPEN = 'open',
  CLOSE = 'close',
}

/**
 * 表格行数据
 */
export interface Position {
  id: number;
  type: PositionType;
  price: number;
  quantity: number;
  quantityUsdt: number;
  marginUsdt: number; // 杠杆前（U）= 保证金
  enabled: boolean;
}

/**
 * 计算结果
 */
export interface PnLResult {
  totalPnL: number;
  totalInvestment: number;
  totalReturn: number;
  roe: number;
  openPositions: Position[];
  closePositions: Position[];
}

/**
 * 每一行的汇总指标
 */
export interface PositionStat {
  holdings: number;
  averagePrice: number | null;
  cumulativePnL: number;
  isActive: boolean;
  usedCapital: number; // 当前占用本金（累计已使用的保证金）
  capitalUsageRate: number; // 本金使用率 (0-1)
  priceVolatility: number | null; // 币价波动率（相对于上一个仓位的价格波动百分比）
  liquidationPrice: number | null; // 爆仓价格（仅对开仓仓位有效）
}

export interface InputValueMap {
  [key: string]: string;
}
