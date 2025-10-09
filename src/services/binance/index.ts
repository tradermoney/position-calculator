/**
 * 币安API客户端SDK主入口
 * 
 * @example
 * ```typescript
 * import { BinanceMarketDataAPI } from '@/services/binance';
 * 
 * const client = new BinanceMarketDataAPI();
 * 
 * // 获取当前价格
 * const price = await client.getCurrentPrice('BTCUSDT');
 * console.log('BTC价格:', price);
 * ```
 */

// 导出客户端类
export { BinanceClient, BINANCE_ENDPOINTS } from './BinanceClient';
export { BinanceMarketDataAPI } from './BinanceMarketDataAPI';
export { BinanceDataService, binanceDataService } from './BinanceDataService';

// 导入用于默认导出
import { BinanceMarketDataAPI } from './BinanceMarketDataAPI';

// 导出类型（不包括枚举）
export type {
  // API响应类型
  ServerTime,
  ExchangeInfo,
  SymbolInfo,
  SymbolFilter,
  OrderBook,
  Trade,
  AggTrade,
  Kline,
  ContinuousKline,
  MarkPrice,
  FundingRate,
  Ticker24hr,
  TickerPrice,
  BookTicker,
  OpenInterest,
  OpenInterestHist,
  TopLongShortAccountRatio,
  TopLongShortPositionRatio,
  GlobalLongShortAccountRatio,
  TakerBuySellVol,
  
  // API请求参数类型
  OrderBookParams,
  TradesParams,
  HistoricalTradesParams,
  AggTradesParams,
  KlinesParams,
  ContinuousKlinesParams,
  MarkPriceParams,
  FundingRateParams,
  Ticker24hrParams,
  OpenInterestHistParams,
  TopLongShortRatioParams,
  GlobalLongShortRatioParams,
  TakerBuySellVolParams,
  
  // 错误类型
  BinanceAPIError,
  
  // 配置类型
  BinanceClientConfig,
} from '../../types/binance';

// 导出数据服务类型
export type {
  SymbolListItem,
  KlineData,
  VolatilityResult,
  VolatilityStats,
} from './BinanceDataService';

// 导出工具函数
export * from './utils/helpers';

// 导出错误处理
export {
  BinanceError,
  NetworkError,
  TimeoutError,
  BinanceErrorCode,
  parseBinanceError,
  RetryStrategy,
} from './utils/errors';

// 导出枚举
export {
  ContractType,
  OrderSide,
  PositionSide,
  KlineInterval,
} from '../../types/binance';

/**
 * 创建默认的币安市场数据API客户端实例
 */
export function createBinanceClient(config?: import('../../types/binance').BinanceClientConfig): BinanceMarketDataAPI {
  return new BinanceMarketDataAPI(config);
}

/**
 * 默认导出：市场数据API客户端类
 */
export default BinanceMarketDataAPI;
