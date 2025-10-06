/**
 * 公用枚举类型定义
 */
export enum PositionSide {
  LONG = 'long',
  SHORT = 'short',
}

export enum PyramidStrategy {
  EQUAL_RATIO = 'equal_ratio',
  DOUBLE = 'double',
  FIBONACCI = 'fibonacci',
  CUSTOM = 'custom',
}

export enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  STOP = 'stop',
  STOP_LIMIT = 'stop_limit',
}

export enum PositionStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  LIQUIDATED = 'liquidated',
  PARTIAL = 'partial',
}

export enum Exchange {
  BINANCE = 'binance',
  OKEX = 'okex',
  HUOBI = 'huobi',
  BYBIT = 'bybit',
  BITGET = 'bitget',
  OTHER = 'other',
}

export enum RiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  EXTREME = 'extreme',
}
