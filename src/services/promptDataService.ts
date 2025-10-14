/**
 * 提示词数据服务
 * 用于获取和格式化币安数据
 */

import { BinanceMarketDataAPI } from './binance';
import { PromptDataConfig } from '../utils/storage/types';
import { aggregateOrderBook, getRecommendedLevels, type AggregationConfig } from '../utils/orderBookAggregator';

/**
 * 格式化K线数据为markdown表格
 */
function formatKlineData(klines: any[]): string {
  if (!klines || klines.length === 0) {
    return '暂无K线数据';
  }

  let markdown = '| 时间 | 开盘价 | 最高价 | 最低价 | 收盘价 | 成交量 |\n';
  markdown += '|------|--------|--------|--------|--------|--------|\n';

  klines.forEach(kline => {
    const time = new Date(kline[0]).toLocaleString('zh-CN');
    const open = parseFloat(kline[1]);
    const high = parseFloat(kline[2]);
    const low = parseFloat(kline[3]);
    const close = parseFloat(kline[4]);
    const volume = parseFloat(kline[5]);

    markdown += `| ${time} | ${open} | ${high} | ${low} | ${close} | ${volume.toFixed(2)} |\n`;
  });

  return markdown;
}

/**
 * 格式化资金费率数据为markdown表格
 */
function formatFundingRateData(fundingRates: any[]): string {
  if (!fundingRates || fundingRates.length === 0) {
    return '暂无资金费率数据';
  }

  let markdown = '| 时间 | 资金费率 | 标记价格 |\n';
  markdown += '|------|----------|----------|\n';

  fundingRates.forEach(rate => {
    const time = new Date(rate.fundingTime).toLocaleString('zh-CN');
    const fundingRate = (parseFloat(rate.fundingRate) * 100).toFixed(4);
    const markPrice = rate.markPrice ? parseFloat(rate.markPrice).toFixed(2) : 'N/A';

    markdown += `| ${time} | ${fundingRate}% | ${markPrice} |\n`;
  });

  return markdown;
}

/**
 * 格式化订单薄数据为markdown表格
 */
function formatOrderBookData(orderBook: any, config?: { 
  depth?: number; 
  mode?: string; 
  priceRangePercent?: number;
  aggregationEnabled?: boolean;
  aggregationLevels?: number;
  aggregationMode?: 'equal-price' | 'equal-quantity';
}): string {
  if (!orderBook || !orderBook.bids || !orderBook.asks) {
    return '暂无订单薄数据';
  }

  let filteredBids = orderBook.bids;
  let filteredAsks = orderBook.asks;
  let displayInfo = '';

  if (config?.mode === 'priceRange' && config.priceRangePercent) {
    // 价格区间模式
    const bestBid = parseFloat(orderBook.bids[0][0]);
    const bestAsk = parseFloat(orderBook.asks[0][0]);
    const midPrice = (bestBid + bestAsk) / 2;
    
    const rangePercent = config.priceRangePercent / 100;
    const lowerBound = midPrice * (1 - rangePercent);
    const upperBound = midPrice * (1 + rangePercent);
    
    // 过滤买单：价格在区间内的
    const rawFilteredBids = orderBook.bids.filter((bid: any[]) => {
      const price = parseFloat(bid[0]);
      return price >= lowerBound;
    });
    
    // 过滤卖单：价格在区间内的
    const rawFilteredAsks = orderBook.asks.filter((ask: any[]) => {
      const price = parseFloat(ask[0]);
      return price <= upperBound;
    });

    // 检查是否需要聚合
    if (config.aggregationEnabled && (rawFilteredBids.length > 20 || rawFilteredAsks.length > 20)) {
      const targetLevels = config.aggregationLevels || getRecommendedLevels(
        Math.max(rawFilteredBids.length, rawFilteredAsks.length), 
        config.priceRangePercent
      );
      
      const aggregationConfig: AggregationConfig = {
        targetLevels,
        mode: config.aggregationMode || 'equal-price'
      };

      const aggregated = aggregateOrderBook(rawFilteredBids, rawFilteredAsks, aggregationConfig);
      
      filteredBids = aggregated.bids.map(entry => [entry.price.toString(), entry.quantity.toString()]);
      filteredAsks = aggregated.asks.map(entry => [entry.price.toString(), entry.quantity.toString()]);
      
      displayInfo = `±${config.priceRangePercent}% 聚合为${targetLevels}档 (${lowerBound.toFixed(4)} - ${upperBound.toFixed(4)})`;
    } else {
      filteredBids = rawFilteredBids;
      filteredAsks = rawFilteredAsks;
      displayInfo = `±${config.priceRangePercent}% (${lowerBound.toFixed(4)} - ${upperBound.toFixed(4)})`;
    }
  } else {
    // 档位模式
    const actualDepth = config?.depth || Math.min(orderBook.bids.length, orderBook.asks.length);
    filteredBids = orderBook.bids.slice(0, actualDepth);
    filteredAsks = orderBook.asks.slice(0, actualDepth);
    displayInfo = `${config?.depth || actualDepth}档`;
  }

  let markdown = `### 买单 (Bids) - ${displayInfo}\n\n`;
  markdown += '| 价格 | 数量 |\n';
  markdown += '|------|------|\n';

  filteredBids.forEach((bid: any[]) => {
    const price = parseFloat(bid[0]);
    const quantity = parseFloat(bid[1]);
    markdown += `| ${price} | ${quantity.toFixed(2)} |\n`;
  });

  markdown += `\n### 卖单 (Asks) - ${displayInfo}\n\n`;
  markdown += '| 价格 | 数量 |\n';
  markdown += '|------|------|\n';

  filteredAsks.forEach((ask: any[]) => {
    const price = parseFloat(ask[0]);
    const quantity = parseFloat(ask[1]);
    markdown += `| ${price} | ${quantity.toFixed(2)} |\n`;
  });

  return markdown;
}

/**
 * 获取单个数据配置的数据
 */
async function fetchDataForConfig(config: PromptDataConfig, api: BinanceMarketDataAPI): Promise<string> {
  try {
    switch (config.type) {
      case 'symbol': {
        if (!config.symbol) {
          return '交易对未配置';
        }
        const price = await api.getCurrentPrice(config.symbol);
        return `**交易对**: ${config.symbol}\n**当前价格**: ${price}\n`;
      }

      case 'kline': {
        if (!config.symbol) {
          return 'K线数据: 交易对未配置';
        }
        const interval = config.interval || '1m';
        const limit = config.limit || 1000;
        const klines = await api.getKlines({
          symbol: config.symbol,
          interval: interval as any,
          limit,
        });
        return `### K线数据 (${config.symbol}, ${interval}, 最近${limit}条)\n\n${formatKlineData(klines)}`;
      }

      case 'fundingRate': {
        if (!config.symbol) {
          return '资金费率数据: 交易对未配置';
        }
        const days = config.days || 3;
        const endTime = Date.now();
        const startTime = endTime - days * 24 * 60 * 60 * 1000;
        const fundingRates = await api.getFundingRate({
          symbol: config.symbol,
          startTime,
          endTime,
          limit: 1000,
        });
        return `### 资金费率数据 (${config.symbol}, 最近${days}天)\n\n${formatFundingRateData(fundingRates)}`;
      }

      case 'orderBook': {
        if (!config.symbol) {
          return '订单薄数据: 交易对未配置';
        }
        
        const mode = config.orderBookMode || 'depth';
        const depth = config.depth || 20;
        const priceRangePercent = config.priceRangePercent || 1;
        
        // 对于价格区间模式，我们需要获取更多数据以便过滤
        const limit = mode === 'priceRange' ? 1000 : depth;
        
        const orderBook = await api.getOrderBook({
          symbol: config.symbol,
          limit,
        });
        
        const modeText = mode === 'priceRange' ? `±${priceRangePercent}%区间` : `${depth}档`;
        
        return `### 订单薄数据 (${config.symbol}, ${modeText})\n\n${formatOrderBookData(orderBook, {
          depth,
          mode,
          priceRangePercent,
          aggregationEnabled: config.aggregationEnabled,
          aggregationLevels: config.aggregationLevels,
          aggregationMode: config.aggregationMode
        })}`;
      }

      default:
        return `未知数据类型: ${config.type}`;
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    return `获取${config.type}数据失败: ${error instanceof Error ? error.message : '未知错误'}`;
  }
}

/**
 * 获取所有数据配置的数据并拼接
 */
export async function fetchPromptData(dataConfigs: PromptDataConfig[]): Promise<string> {
  const api = new BinanceMarketDataAPI();
  const dataPromises = dataConfigs.map(config => fetchDataForConfig(config, api));
  const dataResults = await Promise.all(dataPromises);

  return dataResults.join('\n\n---\n\n');
}


