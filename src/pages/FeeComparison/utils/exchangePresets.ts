import { ExchangeFeeConfig } from '../types';

// 预设的主流交易所费率配置
export const EXCHANGE_PRESETS: ExchangeFeeConfig[] = [
  {
    id: 'binance-vip0',
    name: 'Binance (VIP 0)',
    makerFee: 0.02,
    takerFee: 0.04,
  },
  {
    id: 'binance-vip1',
    name: 'Binance (VIP 1)',
    makerFee: 0.016,
    takerFee: 0.04,
  },
  {
    id: 'binance-vip2',
    name: 'Binance (VIP 2)',
    makerFee: 0.014,
    takerFee: 0.035,
  },
  {
    id: 'okx-lv1',
    name: 'OKX (Lv 1)',
    makerFee: 0.02,
    takerFee: 0.05,
  },
  {
    id: 'okx-lv2',
    name: 'OKX (Lv 2)',
    makerFee: 0.015,
    takerFee: 0.04,
  },
  {
    id: 'bybit-vip0',
    name: 'Bybit (VIP 0)',
    makerFee: 0.02,
    takerFee: 0.055,
  },
  {
    id: 'bybit-vip1',
    name: 'Bybit (VIP 1)',
    makerFee: 0.02,
    takerFee: 0.05,
  },
  {
    id: 'gate-vip0',
    name: 'Gate.io (VIP 0)',
    makerFee: 0.02,
    takerFee: 0.05,
  },
  {
    id: 'huobi-vip0',
    name: 'Huobi (VIP 0)',
    makerFee: 0.02,
    takerFee: 0.04,
  },
  {
    id: 'kucoin-lv0',
    name: 'KuCoin (Lv 0)',
    makerFee: 0.02,
    takerFee: 0.06,
  },
];

// 默认选中的交易所ID
export const DEFAULT_SELECTED_EXCHANGES = [
  'binance-vip0',
  'okx-lv1',
  'bybit-vip0',
];

