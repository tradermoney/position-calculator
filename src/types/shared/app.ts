import { Exchange, PositionSide, PositionStatus, RiskLevel } from './enums';
import { Position } from './positions';

/**
 * 应用层数据结构定义
 */
export interface AppSettings {
  defaultLeverage: number;
  defaultPriceStep: number;
  decimalPlaces: number;
  autoSave: boolean;
  riskWarnings: boolean;
  soundNotifications: boolean;
  defaultExchange: Exchange;
  currency: string;
  language: string;
}

export interface PositionFilters {
  side?: PositionSide;
  status?: PositionStatus;
  exchange?: Exchange;
  riskLevel?: RiskLevel;
  symbol?: string;
  tags?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SortConfig {
  field: keyof Position;
  direction: 'asc' | 'desc';
}

export interface AppState {
  positions: Position[];
  selectedPosition: Position | null;
  theme: 'light' | 'dark';
  settings: AppSettings;
  filters: PositionFilters;
  sortConfig: SortConfig;
}

export interface ValidationError {
  field: string;
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}

export interface ExportData {
  positions: Position[];
  settings: AppSettings;
  exportedAt: Date;
  version: string;
}

export interface PositionStatistics {
  totalPositions: number;
  activePositions: number;
  longPositions: number;
  shortPositions: number;
  totalMargin: number;
  totalValue: number;
  totalPnl: number;
  avgRoe: number;
  riskDistribution: Record<RiskLevel, number>;
  exchangeDistribution: Record<Exchange, number>;
}

export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  positionId?: string;
}

export interface HistoryRecord {
  id: string;
  type: 'create' | 'update' | 'close' | 'add' | 'liquidate';
  positionId: string;
  description: string;
  data: unknown;
  timestamp: Date;
}
