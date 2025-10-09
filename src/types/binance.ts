/**
 * 币安API类型定义
 * 基于币安官方文档：https://developers.binance.com/docs/zh-CN/derivatives
 */

// ==================== 基础类型 ====================

/**
 * 交易对类型
 */
export enum ContractType {
  /** 永续合约 */
  PERPETUAL = 'PERPETUAL',
  /** 当季合约 */
  CURRENT_QUARTER = 'CURRENT_QUARTER',
  /** 次季合约 */
  NEXT_QUARTER = 'NEXT_QUARTER',
}

/**
 * 订单方向
 */
export enum OrderSide {
  BUY = 'BUY',
  SELL = 'SELL',
}

/**
 * 持仓方向
 */
export enum PositionSide {
  /** 多头 */
  LONG = 'LONG',
  /** 空头 */
  SHORT = 'SHORT',
  /** 双向持仓 */
  BOTH = 'BOTH',
}

/**
 * K线间隔
 */
export enum KlineInterval {
  /** 1分钟 */
  '1m' = '1m',
  /** 3分钟 */
  '3m' = '3m',
  /** 5分钟 */
  '5m' = '5m',
  /** 15分钟 */
  '15m' = '15m',
  /** 30分钟 */
  '30m' = '30m',
  /** 1小时 */
  '1h' = '1h',
  /** 2小时 */
  '2h' = '2h',
  /** 4小时 */
  '4h' = '4h',
  /** 6小时 */
  '6h' = '6h',
  /** 8小时 */
  '8h' = '8h',
  /** 12小时 */
  '12h' = '12h',
  /** 1天 */
  '1d' = '1d',
  /** 3天 */
  '3d' = '3d',
  /** 1周 */
  '1w' = '1w',
  /** 1月 */
  '1M' = '1M',
}

// ==================== API响应类型 ====================

/**
 * 服务器时间响应
 */
export interface ServerTime {
  serverTime: number;
}

/**
 * 交易规则与交易对信息
 */
export interface ExchangeInfo {
  timezone: string;
  serverTime: number;
  rateLimits: RateLimit[];
  exchangeFilters: unknown[];
  symbols: SymbolInfo[];
}

/**
 * 限速规则
 */
export interface RateLimit {
  rateLimitType: string;
  interval: string;
  intervalNum: number;
  limit: number;
}

/**
 * 交易对信息
 */
export interface SymbolInfo {
  symbol: string;
  pair: string;
  contractType: ContractType;
  deliveryDate: number;
  onboardDate: number;
  status: string;
  maintMarginPercent: string;
  requiredMarginPercent: string;
  baseAsset: string;
  quoteAsset: string;
  marginAsset: string;
  pricePrecision: number;
  quantityPrecision: number;
  baseAssetPrecision: number;
  quotePrecision: number;
  underlyingType: string;
  underlyingSubType: string[];
  settlePlan: number;
  triggerProtect: string;
  filters: SymbolFilter[];
  orderTypes: string[];
  timeInForce: string[];
  liquidationFee: string;
  marketTakeBound: string;
}

/**
 * 交易对过滤器
 */
export type SymbolFilter = 
  | PriceFilter
  | LotSizeFilter
  | MarketLotSizeFilter
  | MaxNumOrdersFilter
  | MaxNumAlgoOrdersFilter
  | PercentPriceFilter
  | MinNotionalFilter;

export interface PriceFilter {
  filterType: 'PRICE_FILTER';
  minPrice: string;
  maxPrice: string;
  tickSize: string;
}

export interface LotSizeFilter {
  filterType: 'LOT_SIZE';
  minQty: string;
  maxQty: string;
  stepSize: string;
}

export interface MarketLotSizeFilter {
  filterType: 'MARKET_LOT_SIZE';
  minQty: string;
  maxQty: string;
  stepSize: string;
}

export interface MaxNumOrdersFilter {
  filterType: 'MAX_NUM_ORDERS';
  limit: number;
}

export interface MaxNumAlgoOrdersFilter {
  filterType: 'MAX_NUM_ALGO_ORDERS';
  limit: number;
}

export interface PercentPriceFilter {
  filterType: 'PERCENT_PRICE';
  multiplierUp: string;
  multiplierDown: string;
  multiplierDecimal: string;
}

export interface MinNotionalFilter {
  filterType: 'MIN_NOTIONAL';
  notional: string;
}

/**
 * 深度信息
 */
export interface OrderBook {
  lastUpdateId: number;
  /** 消息时间 */
  E: number;
  /** 交易时间 */
  T: number;
  /** 买单 [价格, 数量] */
  bids: [string, string][];
  /** 卖单 [价格, 数量] */
  asks: [string, string][];
}

/**
 * 近期成交
 */
export interface Trade {
  id: number;
  price: string;
  qty: string;
  quoteQty: string;
  time: number;
  isBuyerMaker: boolean;
}

/**
 * 压缩/归集交易
 */
export interface AggTrade {
  /** 归集交易ID */
  a: number;
  /** 价格 */
  p: string;
  /** 数量 */
  q: string;
  /** 被归集的首个交易ID */
  f: number;
  /** 被归集的末个交易ID */
  l: number;
  /** 时间戳 */
  T: number;
  /** 是否为主动卖出 */
  m: boolean;
}

/**
 * K线数据
 */
export type Kline = [
  number,  // 开盘时间
  string,  // 开盘价
  string,  // 最高价
  string,  // 最低价
  string,  // 收盘价
  string,  // 成交量
  number,  // 收盘时间
  string,  // 成交额
  number,  // 成交笔数
  string,  // 主动买入成交量
  string,  // 主动买入成交额
  string   // 请忽略该参数
];

/**
 * 连续合约K线数据
 */
export interface ContinuousKline {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteVolume: string;
  count: number;
  takerBuyVolume: string;
  takerBuyQuoteVolume: string;
}

/**
 * 标记价格
 */
export interface MarkPrice {
  symbol: string;
  /** 标记价格 */
  markPrice: string;
  /** 指数价格 */
  indexPrice: string;
  /** 预估结算价 */
  estimatedSettlePrice: string;
  /** 最近资金费率 */
  lastFundingRate: string;
  /** 下次资金时间 */
  nextFundingTime: number;
  /** 基础资产利率 */
  interestRate: string;
  time: number;
}

/**
 * 资金费率历史
 */
export interface FundingRate {
  symbol: string;
  /** 资金费率 */
  fundingRate: string;
  /** 资金费时间 */
  fundingTime: number;
  /** 资金结算时间 */
  time?: number;
}

/**
 * 24hr价格变动情况
 */
export interface Ticker24hr {
  symbol: string;
  /** 价格变动 */
  priceChange: string;
  /** 价格变动百分比 */
  priceChangePercent: string;
  /** 加权平均价 */
  weightedAvgPrice: string;
  /** 最新价格 */
  lastPrice: string;
  /** 最新成交额 */
  lastQty: string;
  /** 开盘价 */
  openPrice: string;
  /** 最高价 */
  highPrice: string;
  /** 最低价 */
  lowPrice: string;
  /** 成交量 */
  volume: string;
  /** 成交额 */
  quoteVolume: string;
  /** 开盘时间 */
  openTime: number;
  /** 收盘时间 */
  closeTime: number;
  /** 首笔交易ID */
  firstId: number;
  /** 末笔交易ID */
  lastId: number;
  /** 成交笔数 */
  count: number;
}

/**
 * 最新价格
 */
export interface TickerPrice {
  symbol: string;
  price: string;
  time: number;
}

/**
 * 最优挂单
 */
export interface BookTicker {
  symbol: string;
  /** 买一价 */
  bidPrice: string;
  /** 买一量 */
  bidQty: string;
  /** 卖一价 */
  askPrice: string;
  /** 卖一量 */
  askQty: string;
  /** 时间戳 */
  time: number;
}

/**
 * 持仓量
 */
export interface OpenInterest {
  symbol: string;
  /** 持仓量 */
  openInterest: string;
  time: number;
}

/**
 * 持仓量统计
 */
export interface OpenInterestHist {
  symbol: string;
  /** 总持仓量 */
  sumOpenInterest: string;
  /** 总持仓价值 */
  sumOpenInterestValue: string;
  timestamp: number;
}

/**
 * 大户持仓量多空比
 */
export interface TopLongShortAccountRatio {
  symbol: string;
  /** 多空账户数比 */
  longShortRatio: string;
  /** 多账户数 */
  longAccount: string;
  /** 空账户数 */
  shortAccount: string;
  timestamp: number;
}

/**
 * 大户持仓量多空比（持仓）
 */
export interface TopLongShortPositionRatio {
  symbol: string;
  /** 多空持仓量比 */
  longShortRatio: string;
  /** 多持仓量 */
  longPosition: string;
  /** 空持仓量 */
  shortPosition: string;
  timestamp: number;
}

/**
 * 多空持仓人数比
 */
export interface GlobalLongShortAccountRatio {
  symbol: string;
  /** 多空持仓人数比 */
  longShortRatio: string;
  /** 多持仓人数 */
  longAccount: string;
  /** 空持仓人数 */
  shortAccount: string;
  timestamp: number;
}

/**
 * 合约主动买卖量
 */
export interface TakerBuySellVol {
  buySellRatio: string;
  buyVol: string;
  sellVol: string;
  timestamp: number;
}

// ==================== API请求参数类型 ====================

/**
 * 深度信息请求参数
 */
export interface OrderBookParams {
  symbol: string;
  /** 深度档位，默认500，可选5/10/20/50/100/500/1000 */
  limit?: number;
  [key: string]: string | number | undefined;
}

/**
 * 近期成交请求参数
 */
export interface TradesParams {
  symbol: string;
  /** 返回数量，默认500，最大1000 */
  limit?: number;
  [key: string]: string | number | undefined;
}

/**
 * 查询历史成交请求参数
 */
export interface HistoricalTradesParams {
  symbol: string;
  /** 从哪一条成交ID开始返回 */
  fromId?: number;
  /** 返回数量，默认500，最大1000 */
  limit?: number;
  [key: string]: string | number | undefined;
}

/**
 * 压缩/归集交易请求参数
 */
export interface AggTradesParams {
  symbol: string;
  /** 从哪个ID开始返回 */
  fromId?: number;
  /** 从什么时间开始返回 */
  startTime?: number;
  /** 返回到什么时间 */
  endTime?: number;
  /** 返回数量，默认500，最大1000 */
  limit?: number;
  [key: string]: string | number | undefined;
}

/**
 * K线数据请求参数
 */
export interface KlinesParams {
  symbol: string;
  interval: KlineInterval;
  /** 从什么时间开始返回 */
  startTime?: number;
  /** 返回到什么时间 */
  endTime?: number;
  /** 返回数量，默认500，最大1500 */
  limit?: number;
  [key: string]: string | number | KlineInterval | undefined;
}

/**
 * 连续合约K线数据请求参数
 */
export interface ContinuousKlinesParams {
  pair: string;
  contractType: ContractType;
  interval: KlineInterval;
  /** 从什么时间开始返回 */
  startTime?: number;
  /** 返回到什么时间 */
  endTime?: number;
  /** 返回数量，默认500，最大1500 */
  limit?: number;
  [key: string]: string | number | ContractType | KlineInterval | undefined;
}

/**
 * 标记价格请求参数
 */
export interface MarkPriceParams {
  /** 交易对，可选，不传返回所有交易对 */
  symbol?: string;
  [key: string]: string | undefined;
}

/**
 * 资金费率历史请求参数
 */
export interface FundingRateParams {
  symbol?: string;
  /** 从什么时间开始返回 */
  startTime?: number;
  /** 返回到什么时间 */
  endTime?: number;
  /** 返回数量，默认100，最大1000 */
  limit?: number;
  [key: string]: string | number | undefined;
}

/**
 * 24hr价格变动情况请求参数
 */
export interface Ticker24hrParams {
  /** 交易对，可选，不传返回所有交易对 */
  symbol?: string;
  [key: string]: string | undefined;
}

/**
 * 持仓量统计请求参数
 */
export interface OpenInterestHistParams {
  symbol: string;
  period: '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d';
  /** 从什么时间开始返回 */
  startTime?: number;
  /** 返回到什么时间 */
  endTime?: number;
  /** 返回数量，默认30，最大500 */
  limit?: number;
  [key: string]: string | number | undefined;
}

/**
 * 大户持仓量多空比请求参数
 */
export interface TopLongShortRatioParams {
  symbol: string;
  period: '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d';
  /** 从什么时间开始返回 */
  startTime?: number;
  /** 返回到什么时间 */
  endTime?: number;
  /** 返回数量，默认30，最大500 */
  limit?: number;
  [key: string]: string | number | undefined;
}

/**
 * 多空持仓人数比请求参数
 */
export interface GlobalLongShortRatioParams {
  symbol: string;
  period: '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d';
  /** 从什么时间开始返回 */
  startTime?: number;
  /** 返回到什么时间 */
  endTime?: number;
  /** 返回数量，默认30，最大500 */
  limit?: number;
  [key: string]: string | number | undefined;
}

/**
 * 合约主动买卖量请求参数
 */
export interface TakerBuySellVolParams {
  symbol: string;
  period: '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '12h' | '1d';
  /** 从什么时间开始返回 */
  startTime?: number;
  /** 返回到什么时间 */
  endTime?: number;
  /** 返回数量，默认30，最大500 */
  limit?: number;
  [key: string]: string | number | undefined;
}

// ==================== 错误响应类型 ====================

/**
 * API错误响应
 */
export interface BinanceAPIError {
  code: number;
  msg: string;
}

// ==================== 配置类型 ====================

/**
 * 币安API客户端配置
 */
export interface BinanceClientConfig {
  /** API密钥，用于私有接口 */
  apiKey?: string;
  /** API密钥，用于私有接口 */
  apiSecret?: string;
  /** API基础URL */
  baseURL?: string;
  /** 请求超时时间（毫秒），默认10000 */
  timeout?: number;
  /** 是否启用日志，默认false */
  enableLogging?: boolean;
  /** 是否使用测试网，默认false */
  useTestnet?: boolean;
}

