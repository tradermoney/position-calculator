/**
 * 资金费率计算器常量定义
 */

export interface TimeShortcut {
  label: string;
  hours: number;
}

export const TIME_SHORTCUTS: TimeShortcut[] = [
  { label: '4小时', hours: 4 },
  { label: '8小时', hours: 8 },
  { label: '1天', hours: 24 },
  { label: '3天', hours: 72 },
  { label: '1周', hours: 168 },
  { label: '2周', hours: 336 },
  { label: '3周', hours: 504 },
  { label: '1个月', hours: 720 },
  { label: '2个月', hours: 1440 },
  { label: '3个月', hours: 2160 },
  { label: '4个月', hours: 2880 },
  { label: '5个月', hours: 3600 },
  { label: '半年', hours: 4380 },
  { label: '1年', hours: 8760 },
];

export const BINANCE_FUNDING_RATE_URL = 'https://www.binance.com/zh-CN/futures/funding-history/perpetual/real-time-funding-rate';

export const DEFAULT_SYMBOL = 'BTCUSDT';
export const DEFAULT_POSITION_SIZE = '10000';
export const DEFAULT_HOLDING_HOURS = '24';

