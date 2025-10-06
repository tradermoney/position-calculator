/**
 * 存储相关类型定义
 */

import { DBSchema } from 'idb';
import { Position } from '../../types';

// 波动率计算记录接口
export interface VolatilityRecord {
  id: string;
  price1: number;
  price2: number;
  volatility: number;
  sign: '+' | '-';
  calculatedAt: Date;
}

// 波动率输入状态接口
export interface VolatilityInputState {
  price1: string;
  price2: string;
  lastUpdated: Date;
}

// 计算器记录接口
export interface CalculatorRecord {
  id: string;
  expression: string;
  result: string;
  calculatedAt: Date;
}

// 保存的仓位接口
export interface SavedPosition {
  id: string;
  name: string;
  side: 'long' | 'short';
  capital: number;
  leverage: number;
  positions: unknown[];
  inputValues: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// 应用设置接口
export interface AppSettings {
  defaultLeverage: number;
  defaultPriceStep: number;
  decimalPlaces: number;
  autoSave: boolean;
}

// 数据库结构定义
export interface PositionCalculatorDB extends DBSchema {
  positions: {
    key: string;
    value: Position;
    indexes: {
      'by-symbol': string;
      'by-side': string;
      'by-status': string;
      'by-created': Date;
    };
  };
  settings: {
    key: string;
    value: unknown;
  };
  theme: {
    key: string;
    value: 'light' | 'dark';
  };
  volatilityRecords: {
    key: string;
    value: VolatilityRecord;
    indexes: {
      'by-calculated': Date;
    };
  };
  volatilityInputs: {
    key: string;
    value: VolatilityInputState;
  };
  pnlCalculator: {
    key: string;
    value: unknown;
  };
  savedPositions: {
    key: string;
    value: SavedPosition;
    indexes: {
      'by-created': Date;
      'by-updated': Date;
      'by-name': string;
    };
  };
  calculatorRecords: {
    key: string;
    value: CalculatorRecord;
    indexes: {
      'by-calculated': Date;
    };
  };
}

// 数据库配置常量
export const DB_NAME = 'PositionCalculatorDB';
export const DB_VERSION = 4;
