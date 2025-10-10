/**
 * 币安数据服务层
 * 封装币安API调用，提供高级数据获取方法
 */

import { BinanceMarketDataAPI } from './BinanceMarketDataAPI';
import { 
  ContractType, 
  KlineInterval, 
} from '../../types/binance';

/**
 * 交易对信息（简化版）
 */
export interface SymbolListItem {
  /** 交易对符号，如 BTCUSDT */
  symbol: string;
  /** 基础货币，如 BTC */
  baseAsset: string;
  /** 报价货币，如 USDT */
  quoteAsset: string;
  /** 交易对状态 */
  status: string;
  /** 是否支持合约 */
  contractType?: ContractType;
}

/**
 * K线数据（简化版）
 */
export interface KlineData {
  /** 时间戳 */
  timestamp: number;
  /** 时间字符串 */
  time: string;
  /** 开盘价 */
  open: number;
  /** 最高价 */
  high: number;
  /** 最低价 */
  low: number;
  /** 收盘价 */
  close: number;
  /** 成交量 */
  volume: number;
  /** 成交额 */
  quoteVolume: number;
}

/**
 * 波动率计算结果
 */
export interface VolatilityResult {
  /** 平均波动率（百分比） */
  average: number;
  /** 最大波动率 */
  max: number;
  /** 最小波动率 */
  min: number;
  /** 标准差 */
  stdDev: number;
  /** 各周期波动率 */
  values: number[];
}

/**
 * 波动率统计信息
 */
export interface VolatilityStats {
  /** 交易对 */
  symbol: string;
  /** K线周期 */
  interval: KlineInterval;
  /** 数据周期数 */
  periods: number;
  /** 波动率结果 */
  volatility: VolatilityResult;
  /** K线数据 */
  klines: KlineData[];
  /** 计算时间 */
  timestamp: number;
}

/**
 * 币安数据服务类
 */
export class BinanceDataService {
  private client: BinanceMarketDataAPI;

  constructor(testnet: boolean = false) {
    this.client = new BinanceMarketDataAPI({
      useTestnet: testnet,
      timeout: 10000,
    });
  }

  /**
   * 获取交易对列表
   * @param contractType 合约类型，默认为永续合约
   * @param quoteAsset 报价货币过滤，如 'USDT'
   * @returns 交易对列表
   */
  async getSymbols(
    contractType: ContractType = ContractType.PERPETUAL,
    quoteAsset?: string
  ): Promise<SymbolListItem[]> {
    try {
      const info = await this.client.getExchangeInfo();
      
      let symbols = info.symbols
        .filter(s => s.status === 'TRADING')
        .map(s => ({
          symbol: s.symbol,
          baseAsset: s.baseAsset,
          quoteAsset: s.quoteAsset,
          status: s.status,
          contractType,
        }));

      // 如果指定了报价货币，进行过滤
      if (quoteAsset) {
        symbols = symbols.filter(s => s.quoteAsset === quoteAsset);
      }

      return symbols;
    } catch (error) {
      console.error('获取交易对列表失败:', error);
      throw new Error(`获取交易对列表失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 搜索交易对
   * @param keyword 搜索关键词
   * @param contractType 合约类型
   * @param quoteAsset 报价货币
   * @returns 匹配的交易对列表
   */
  async searchSymbols(
    keyword: string,
    contractType: ContractType = ContractType.PERPETUAL,
    quoteAsset?: string
  ): Promise<SymbolListItem[]> {
    const symbols = await this.getSymbols(contractType, quoteAsset);
    
    if (!keyword) {
      return symbols;
    }

    const upperKeyword = keyword.toUpperCase();
    return symbols.filter(s => 
      s.symbol.includes(upperKeyword) ||
      s.baseAsset.includes(upperKeyword) ||
      s.quoteAsset.includes(upperKeyword)
    );
  }

  /**
   * 获取K线数据
   * @param symbol 交易对符号
   * @param interval K线周期
   * @param limit 获取数量，默认100，最大1500
   * @returns K线数据列表
   */
  async getKlines(
    symbol: string,
    interval: KlineInterval,
    limit: number = 100,
  ): Promise<KlineData[]> {
    try {
      const klines = await this.client.getKlines({
        symbol,
        interval,
        limit: Math.min(limit, 1500), // 限制最大1500
      });

      // K线数据格式: [openTime, open, high, low, close, volume, closeTime, quoteVolume, ...]
      return klines.map(k => ({
        timestamp: k[0],
        time: new Date(k[0]).toLocaleString(),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5]),
        quoteVolume: parseFloat(k[7]),
      }));
    } catch (error) {
      console.error('获取K线数据失败:', error);
      throw new Error(`获取K线数据失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 计算价格波动率
   * @param klines K线数据
   * @returns 波动率结果
   */
  calculateVolatility(klines: KlineData[]): VolatilityResult {
    if (klines.length < 2) {
      throw new Error('K线数据不足，至少需要2个周期');
    }

    // 计算每个周期的波动率 = (最高价 - 最低价) / 开盘价 * 100
    const volatilities = klines.map(k => {
      if (k.open === 0) return 0;
      return ((k.high - k.low) / k.open) * 100;
    });

    // 计算统计数据
    const sum = volatilities.reduce((a, b) => a + b, 0);
    const average = sum / volatilities.length;
    const max = Math.max(...volatilities);
    const min = Math.min(...volatilities);

    // 计算标准差（使用样本标准差，除以n-1）
    const squaredDiffs = volatilities.map(v => Math.pow(v - average, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / (volatilities.length - 1);
    const stdDev = Math.sqrt(variance);

    return {
      average: parseFloat(average.toFixed(4)),
      max: parseFloat(max.toFixed(4)),
      min: parseFloat(min.toFixed(4)),
      stdDev: parseFloat(stdDev.toFixed(4)),
      values: volatilities.map(v => parseFloat(v.toFixed(4))),
    };
  }

  /**
   * 获取波动率统计信息
   * @param symbol 交易对符号
   * @param interval K线周期
   * @param limit 数据周期数
   * @param contractType 合约类型
   * @returns 波动率统计信息
   */
  async getVolatilityStats(
    symbol: string,
    interval: KlineInterval,
    limit: number = 100,
    contractType: ContractType = ContractType.PERPETUAL
  ): Promise<VolatilityStats> {
    try {
      // 获取K线数据
      const klines = await this.getKlines(symbol, interval, limit);

      // 计算波动率
      const volatility = this.calculateVolatility(klines);

      return {
        symbol,
        interval,
        periods: klines.length,
        volatility,
        klines,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('获取波动率统计失败:', error);
      throw new Error(`获取波动率统计失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取当前价格
   * @param symbol 交易对符号
   * @returns 当前价格
   */
  async getCurrentPrice(symbol: string): Promise<number> {
    try {
      return await this.client.getCurrentPrice(symbol);
    } catch (error) {
      console.error('获取当前价格失败:', error);
      throw new Error(`获取当前价格失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 获取24小时行情
   * @param symbol 交易对符号
   * @returns 24小时行情
   */
  async get24hrTicker(symbol: string) {
    try {
      const result = await this.client.getTicker24hr({ symbol });
      // getTicker24hr可能返回单个或数组，我们只需要单个
      return Array.isArray(result) ? result[0] : result;
    } catch (error) {
      console.error('获取24小时行情失败:', error);
      throw new Error(`获取24小时行情失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  }

  /**
   * 验证交易对是否存在
   * @param symbol 交易对符号
   * @returns 是否存在
   */
  async validateSymbol(
    symbol: string,
  ): Promise<boolean> {
    try {
      const info = await this.client.getExchangeInfo();
      return info.symbols.some(s => s.symbol === symbol && s.status === 'TRADING');
    } catch (error) {
      console.error('验证交易对失败:', error);
      return false;
    }
  }
}

// 创建默认实例
export const binanceDataService = new BinanceDataService();

// 导出单例实例
export default binanceDataService;

