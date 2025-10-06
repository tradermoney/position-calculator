import { RiskLevel } from './enums';

/**
 * 与合约计算相关的常量定义
 */
export const CONSTANTS = {
  DEFAULT_LEVERAGE: 10,
  DEFAULT_PRICE_STEP: 5,
  DEFAULT_DECIMAL_PLACES: 4,
  DEFAULT_MAINTENANCE_MARGIN_RATE: 0.005,
  MIN_LEVERAGE: 1,
  MAX_LEVERAGE: 125,
  MIN_QUANTITY: 0.0001,
  MAX_QUANTITY: 1_000_000,
  MIN_PRICE: 0.0001,
  MAX_PRICE: 1_000_000,
  RISK_THRESHOLDS: {
    [RiskLevel.LOW]: 25,
    [RiskLevel.MEDIUM]: 50,
    [RiskLevel.HIGH]: 75,
    [RiskLevel.EXTREME]: 100,
  },
  COLORS: {
    PROFIT: '#00c853',
    LOSS: '#ff1744',
    NEUTRAL: '#757575',
    LONG: '#4caf50',
    SHORT: '#f44336',
    WARNING: '#ff9800',
    INFO: '#2196f3',
  },
} as const;
