/**
 * 币安市场数据API封装类
 * 提供合约市场数据的获取功能
 * 
 * 基于币安官方文档：https://developers.binance.com/docs/zh-CN/derivatives/usds-margined-futures/market-data
 */

import { BinanceClient } from './BinanceClient';
import type {
  BinanceClientConfig,
  ExchangeInfo,
  ServerTime,
  OrderBook,
  OrderBookParams,
  Trade,
  TradesParams,
  HistoricalTradesParams,
  AggTrade,
  AggTradesParams,
  Kline,
  KlinesParams,
  ContinuousKline,
  ContinuousKlinesParams,
  MarkPrice,
  MarkPriceParams,
  FundingRate,
  FundingRateParams,
  Ticker24hr,
  Ticker24hrParams,
  TickerPrice,
  BookTicker,
  OpenInterest,
  OpenInterestHist,
  OpenInterestHistParams,
  TopLongShortAccountRatio,
  TopLongShortPositionRatio,
  TopLongShortRatioParams,
  GlobalLongShortAccountRatio,
  GlobalLongShortRatioParams,
  TakerBuySellVol,
  TakerBuySellVolParams,
} from '../../types/binance';

/**
 * 币安市场数据API类
 * 继承自BinanceClient，提供市场数据相关的API调用
 */
export class BinanceMarketDataAPI extends BinanceClient {
  constructor(config: BinanceClientConfig = {}) {
    super(config);
  }

  // ==================== 基础信息 ====================

  /**
   * 测试服务器连通性
   * @returns 空对象表示成功
   */
  async ping(): Promise<Record<string, never>> {
    return this.get('/fapi/v1/ping');
  }

  /**
   * 获取服务器时间
   * @returns 服务器时间
   */
  async getServerTime(): Promise<ServerTime> {
    return this.get('/fapi/v1/time');
  }

  /**
   * 获取交易规则和交易对信息
   * @returns 交易所信息
   */
  async getExchangeInfo(): Promise<ExchangeInfo> {
    return this.get('/fapi/v1/exchangeInfo');
  }

  // ==================== 市场数据 ====================

  /**
   * 获取深度信息
   * @param params 深度信息请求参数
   * @returns 深度信息
   */
  async getOrderBook(params: OrderBookParams): Promise<OrderBook> {
    return this.get('/fapi/v1/depth', params);
  }

  /**
   * 获取近期成交
   * @param params 近期成交请求参数
   * @returns 近期成交列表
   */
  async getTrades(params: TradesParams): Promise<Trade[]> {
    return this.get('/fapi/v1/trades', params);
  }

  /**
   * 获取历史成交（需要API-KEY）
   * @param params 历史成交请求参数
   * @returns 历史成交列表
   */
  async getHistoricalTrades(params: HistoricalTradesParams): Promise<Trade[]> {
    return this.get('/fapi/v1/historicalTrades', params);
  }

  /**
   * 获取压缩/归集交易
   * @param params 压缩交易请求参数
   * @returns 压缩交易列表
   */
  async getAggTrades(params: AggTradesParams): Promise<AggTrade[]> {
    return this.get('/fapi/v1/aggTrades', params);
  }

  /**
   * 获取K线数据
   * @param params K线数据请求参数
   * @returns K线数据列表
   */
  async getKlines(params: KlinesParams): Promise<Kline[]> {
    return this.get('/fapi/v1/klines', params);
  }

  /**
   * 获取连续合约K线数据
   * @param params 连续合约K线数据请求参数
   * @returns 连续合约K线数据列表
   */
  async getContinuousKlines(params: ContinuousKlinesParams): Promise<ContinuousKline[]> {
    return this.get('/fapi/v1/continuousKlines', params);
  }

  /**
   * 获取标记价格
   * @param params 标记价格请求参数
   * @returns 标记价格信息（单个或数组）
   */
  async getMarkPrice(params: MarkPriceParams = {}): Promise<MarkPrice | MarkPrice[]> {
    return this.get('/fapi/v1/premiumIndex', params);
  }

  /**
   * 获取资金费率历史
   * @param params 资金费率历史请求参数
   * @returns 资金费率历史列表
   */
  async getFundingRate(params: FundingRateParams = {}): Promise<FundingRate[]> {
    return this.get('/fapi/v1/fundingRate', params);
  }

  /**
   * 获取24小时价格变动情况
   * @param params 24小时价格变动请求参数
   * @returns 24小时价格变动情况（单个或数组）
   */
  async getTicker24hr(params: Ticker24hrParams = {}): Promise<Ticker24hr | Ticker24hr[]> {
    return this.get('/fapi/v1/ticker/24hr', params);
  }

  /**
   * 获取最新价格
   * @param symbol 交易对符号，可选，不传返回所有交易对
   * @returns 最新价格信息（单个或数组）
   */
  async getTickerPrice(symbol?: string): Promise<TickerPrice | TickerPrice[]> {
    return this.get('/fapi/v1/ticker/price', symbol ? { symbol } : {});
  }

  /**
   * 获取最优挂单
   * @param symbol 交易对符号，可选，不传返回所有交易对
   * @returns 最优挂单信息（单个或数组）
   */
  async getBookTicker(symbol?: string): Promise<BookTicker | BookTicker[]> {
    return this.get('/fapi/v1/ticker/bookTicker', symbol ? { symbol } : {});
  }

  /**
   * 获取持仓量
   * @param symbol 交易对符号
   * @returns 持仓量信息
   */
  async getOpenInterest(symbol: string): Promise<OpenInterest> {
    return this.get('/fapi/v1/openInterest', { symbol });
  }

  /**
   * 获取持仓量统计
   * @param params 持仓量统计请求参数
   * @returns 持仓量统计列表
   */
  async getOpenInterestHist(params: OpenInterestHistParams): Promise<OpenInterestHist[]> {
    return this.get('/futures/data/openInterestHist', params);
  }

  /**
   * 获取大户持仓量多空比（账户）
   * @param params 大户持仓量多空比请求参数
   * @returns 大户持仓量多空比列表
   */
  async getTopLongShortAccountRatio(params: TopLongShortRatioParams): Promise<TopLongShortAccountRatio[]> {
    return this.get('/futures/data/topLongShortAccountRatio', params);
  }

  /**
   * 获取大户持仓量多空比（持仓）
   * @param params 大户持仓量多空比请求参数
   * @returns 大户持仓量多空比列表
   */
  async getTopLongShortPositionRatio(params: TopLongShortRatioParams): Promise<TopLongShortPositionRatio[]> {
    return this.get('/futures/data/topLongShortPositionRatio', params);
  }

  /**
   * 获取多空持仓人数比
   * @param params 多空持仓人数比请求参数
   * @returns 多空持仓人数比列表
   */
  async getGlobalLongShortAccountRatio(params: GlobalLongShortRatioParams): Promise<GlobalLongShortAccountRatio[]> {
    return this.get('/futures/data/globalLongShortAccountRatio', params);
  }

  /**
   * 获取合约主动买卖量
   * @param params 合约主动买卖量请求参数
   * @returns 合约主动买卖量列表
   */
  async getTakerBuySellVol(params: TakerBuySellVolParams): Promise<TakerBuySellVol[]> {
    return this.get('/futures/data/takerlongshortRatio', params);
  }

  // ==================== 辅助方法 ====================

  /**
   * 获取当前价格（简化方法）
   * @param symbol 交易对符号
   * @returns 当前价格
   */
  async getCurrentPrice(symbol: string): Promise<number> {
    const result = await this.getTickerPrice(symbol);
    if (Array.isArray(result)) {
      throw new Error('Expected single price, got array');
    }
    return parseFloat(result.price);
  }

  /**
   * 批量获取当前价格
   * @param symbols 交易对符号数组，可选，不传返回所有交易对
   * @returns 价格映射表 { symbol: price }
   */
  async getCurrentPrices(symbols?: string[]): Promise<Record<string, number>> {
    let result = await this.getTickerPrice();
    
    if (!Array.isArray(result)) {
      result = [result];
    }
    
    const priceMap: Record<string, number> = {};
    for (const item of result) {
      if (!symbols || symbols.includes(item.symbol)) {
        priceMap[item.symbol] = parseFloat(item.price);
      }
    }
    
    return priceMap;
  }

  /**
   * 获取交易对列表（只返回正在交易的交易对）
   * @param quoteAsset 报价货币过滤，如 'USDT'
   * @returns 交易对符号列表
   */
  async getTradingSymbols(quoteAsset?: string): Promise<string[]> {
    const info = await this.getExchangeInfo();
    let symbols = info.symbols.filter(s => s.status === 'TRADING');
    
    if (quoteAsset) {
      symbols = symbols.filter(s => s.quoteAsset === quoteAsset);
    }
    
    return symbols.map(s => s.symbol);
  }

  /**
   * 获取24小时行情（单个交易对）
   * @param symbol 交易对符号
   * @returns 24小时行情
   */
  async get24hrTickerSingle(symbol: string): Promise<Ticker24hr> {
    const result = await this.getTicker24hr({ symbol });
    if (Array.isArray(result)) {
      return result[0];
    }
    return result;
  }
}

// 创建默认实例
export const binanceMarketDataAPI = new BinanceMarketDataAPI();

// 导出单例实例
export default binanceMarketDataAPI;

