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

// 币安数据输入状态接口
export interface BinanceDataInputState {
  selectedSymbol: string | null;
  selectedInterval: string;
  selectedPeriods: number;
  lastUpdated: Date;
}

// 计算器记录接口
export interface CalculatorRecord {
  id: string;
  expression: string;
  result: string;
  calculatedAt: Date;
}

// 保本计算器输入状态接口
export interface BreakEvenInputState {
  leverage: number;
  openFeeRate: number;
  closeFeeRate: number;
  fundingRate: number;
  fundingPeriod: number;
  holdingTime: number;
  symbol: string;
  positionDirection: 'long' | 'short';
  lastUpdated: Date;
}

// 资金费率计算器输入状态接口
export interface FundingRateInputState {
  symbol: string;
  // 做多仓位
  longInputMode: 'direct' | 'price'; // direct: 直接输入仓位大小, price: 价格×数量
  longPositionSize: string; // 直接输入模式
  longEntryPrice: string; // 价格模式 - 开仓价格
  longQuantity: string; // 价格模式 - 数量
  // 做空仓位
  shortInputMode: 'direct' | 'price';
  shortPositionSize: string;
  shortEntryPrice: string;
  shortQuantity: string;
  // 持有时间
  timeMode: 'historical' | 'future'; // historical: 已持有时间, future: 预估持有时间
  holdingHours: string;
  lastUpdated: Date;
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

// 默认模板设置接口
export interface DefaultTemplateSettings {
  content: string; // 默认的 Markdown 内容
  updatedAt: Date;
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
  binanceDataInputs: {
    key: string;
    value: BinanceDataInputState;
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
  breakEvenCalculator: {
    key: string;
    value: BreakEvenInputState & { key: string };
  };
  fundingRateCalculator: {
    key: string;
    value: FundingRateInputState & { key: string };
  };
  promptTemplates: {
    key: string;
    value: PromptTemplate;
    indexes: {
      'by-created': Date;
      'by-updated': Date;
      'by-name': string;
    };
  };
  defaultTemplateSettings: {
    key: string;
    value: DefaultTemplateSettings;
  };
}

// 提示词模板数据类型
export type PromptDataType = 'symbol' | 'kline' | 'fundingRate' | 'orderBook';

// 订单薄模式
export type OrderBookMode = 'depth' | 'priceRange';

// 订单薄聚合模式
export type OrderBookAggregationMode = 'equal-price' | 'equal-quantity';

// 提示词模板数据配置
export interface PromptDataConfig {
  id: string;
  type: PromptDataType;
  // 交易对配置
  symbol?: string;
  // K线配置
  interval?: string; // 时间粒度，如 '1m', '5m', '1h' 等
  limit?: number; // 获取多少个点，默认1000
  // 资金费率配置
  days?: number; // 获取最近多少天，默认3天
  // 订单薄配置
  depth?: number; // 档位，默认20
  orderBookMode?: OrderBookMode; // 订单薄模式：depth(档位) 或 priceRange(价格区间)
  priceRangePercent?: number; // 价格区间百分比，如1表示±1%，默认1
  // 价格区间模式的聚合配置
  aggregationEnabled?: boolean; // 是否启用聚合，默认false
  aggregationLevels?: number; // 聚合后的档位数量，默认20
  aggregationMode?: OrderBookAggregationMode; // 聚合模式，默认'equal-price'
}

// 提示词模板
export interface PromptTemplate {
  id: string;
  name: string;
  content: string; // markdown 内容
  dataConfigs: PromptDataConfig[]; // 数据配置列表
  createdAt: Date;
  updatedAt: Date;
}

// 数据库配置常量
export const DB_NAME = 'PositionCalculatorDB';
export const DB_VERSION = 8; // 升级版本
