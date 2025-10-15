/**
 * 订单薄数据格式化模块
 * 专门处理订单薄数据的获取和格式化逻辑
 */

import { BinanceMarketDataAPI } from './binance';
import { aggregateOrderBook, type AggregationConfig } from '../utils/orderBookAggregator';
import { PromptDataConfig } from '../utils/storage/types';

/**
 * 订单薄格式化配置（简化版）
 */
export interface OrderBookFormatConfig {
  priceRangePercent: number;  // 废弃参数（保留兼容性）- 由于交易所API限制，实际获取的数据范围通常在±0.5%以内
  aggregationLevels: number;  // 聚合到多少档
}

/**
 * 订单薄数据
 */
export interface OrderBookData {
  bids: [string, string][];
  asks: [string, string][];
}

/**
 * 从配置中提取订单薄格式化参数
 */
export function extractOrderBookConfig(config: PromptDataConfig): OrderBookFormatConfig {
  console.log('[OrderBook] 提取订单薄配置:', config);
  
  const formatConfig: OrderBookFormatConfig = {
    priceRangePercent: config.priceRangePercent ?? 10,  // 默认±10%
    aggregationLevels: config.aggregationLevels ?? 20,  // 默认20档
  };
  
  console.log('[OrderBook] 提取结果:', formatConfig);
  return formatConfig;
}

/**
 * 获取订单薄数据
 */
export async function fetchOrderBookData(
  api: BinanceMarketDataAPI,
  symbol: string
): Promise<OrderBookData> {
  console.log('[OrderBook] 开始获取订单薄数据:', { symbol });
  
  try {
    // 使用1000档（Binance 期货API最大支持1000档）
    const limit = 1000;
    
    console.log('[OrderBook] 请求参数:', { symbol, limit });
    const orderBook = await api.getOrderBook({ symbol, limit });
    
    console.log('[OrderBook] API返回数据:', {
      bidsCount: orderBook?.bids?.length || 0,
      asksCount: orderBook?.asks?.length || 0,
      firstBid: orderBook?.bids?.[0],
      firstAsk: orderBook?.asks?.[0],
    });
    
    if (!orderBook || !orderBook.bids || !orderBook.asks) {
      console.error('[OrderBook] 订单薄数据无效');
      throw new Error('订单薄数据无效');
    }
    
    if (orderBook.bids.length === 0 || orderBook.asks.length === 0) {
      console.error('[OrderBook] 订单薄数据为空');
      throw new Error('订单薄数据为空');
    }
    
    return orderBook;
  } catch (error) {
    console.error('[OrderBook] 获取订单薄数据失败:', error);
    throw error;
  }
}

/**
 * 过滤和聚合订单薄数据（简化版：只支持价格区间+等价格间隔聚合）
 */
export function filterAndAggregateOrderBook(
  orderBook: OrderBookData,
  config: OrderBookFormatConfig
): {
  bids: [string, string][];
  asks: [string, string][];
  displayInfo: string;
} {
  console.log('[OrderBook] 开始过滤和聚合订单薄数据:', config);
  
  // 计算中间价和价格区间
  const bestBid = parseFloat(orderBook.bids[0][0]);
  const bestAsk = parseFloat(orderBook.asks[0][0]);
  const midPrice = (bestBid + bestAsk) / 2;
  
  // 注意：由于交易所API限制（通常最多返回1000档数据），
  // 实际获取的订单薄数据价格范围通常只有±0.5%左右
  // 因此priceRangePercent参数实际上不起过滤作用，我们直接使用所有获取到的数据
  
  console.log('[OrderBook] 订单薄数据统计:', {
    bestBid,
    bestAsk,
    midPrice,
    bidsCount: orderBook.bids.length,
    asksCount: orderBook.asks.length,
  });
  
  // 直接使用所有数据（不进行价格区间过滤）
  const rawFilteredBids = orderBook.bids;
  const rawFilteredAsks = orderBook.asks;
  
  // 计算实际价格范围供日志参考
  if (orderBook.bids.length > 0 && orderBook.asks.length > 0) {
    const lowestBid = parseFloat(orderBook.bids[orderBook.bids.length - 1][0]);
    const highestAsk = parseFloat(orderBook.asks[orderBook.asks.length - 1][0]);
    const actualRange = Math.abs(highestAsk - lowestBid) / midPrice * 100;
    
    console.log('[OrderBook] 实际价格范围:', {
      lowestBid: lowestBid.toFixed(2),
      highestBid: bestBid.toFixed(2),
      lowestAsk: bestAsk.toFixed(2),
      highestAsk: highestAsk.toFixed(2),
      actualRangePercent: actualRange.toFixed(2) + '%',
      note: '交易所API限制，通常只能获取±0.5%范围内的数据'
    });
  }
  
  // 聚合配置：固定使用等价格间隔模式
  const aggConfig: AggregationConfig = {
    targetLevels: config.aggregationLevels,
    mode: 'equal-price',
  };
  
  console.log('[OrderBook] 聚合配置:', aggConfig);
  
  try {
    const aggregated = aggregateOrderBook(rawFilteredBids, rawFilteredAsks, aggConfig);
    
    const filteredBids: [string, string][] = aggregated.bids.map((b) => [
      b.price.toString(),
      b.quantity.toString(),
    ]);
    const filteredAsks: [string, string][] = aggregated.asks.map((a) => [
      a.price.toString(),
      a.quantity.toString(),
    ]);
    
    console.log('[OrderBook] 聚合后数据量:', {
      bidsCount: filteredBids.length,
      asksCount: filteredAsks.length,
    });
    
    // 计算实际价格范围
    const actualLower = filteredBids.length > 0 ? parseFloat(filteredBids[filteredBids.length - 1][0]) : 0;
    const actualUpper = filteredAsks.length > 0 ? parseFloat(filteredAsks[filteredAsks.length - 1][0]) : 0;
    const displayInfo = `${config.aggregationLevels}档 (实际价格范围: ${actualLower.toFixed(2)} - ${actualUpper.toFixed(2)})`;
    
    return {
      bids: filteredBids,
      asks: filteredAsks,
      displayInfo,
    };
  } catch (aggError) {
    console.error('[OrderBook] 聚合失败:', aggError);
    // 聚合失败时使用未聚合的过滤数据，但限制数量
    const maxDisplay = config.aggregationLevels;
    
    return {
      bids: rawFilteredBids.slice(0, maxDisplay),
      asks: rawFilteredAsks.slice(0, maxDisplay),
      displayInfo: `±${config.priceRangePercent}%区间（聚合失败，显示前${maxDisplay}档）`,
    };
  }
}

/**
 * 格式化订单薄数据为markdown表格
 */
export function formatOrderBookToMarkdown(
  bids: [string, string][],
  asks: [string, string][],
  displayInfo: string
): string {
  console.log('[OrderBook] 开始格式化为markdown:', {
    bidsCount: bids.length,
    asksCount: asks.length,
    displayInfo,
  });
  
  if (bids.length === 0 || asks.length === 0) {
    console.error('[OrderBook] 格式化时发现数据为空');
    return '暂无订单薄数据';
  }
  
  let markdown = `### 买单 (Bids) - ${displayInfo}\n\n`;
  markdown += '| 价格 | 数量 |\n';
  markdown += '|------|------|\n';
  
  bids.forEach((bid) => {
    const price = parseFloat(bid[0]);
    const quantity = parseFloat(bid[1]);
    markdown += `| ${price} | ${quantity.toFixed(2)} |\n`;
  });
  
  markdown += `\n### 卖单 (Asks) - ${displayInfo}\n\n`;
  markdown += '| 价格 | 数量 |\n';
  markdown += '|------|------|\n';
  
  asks.forEach((ask) => {
    const price = parseFloat(ask[0]);
    const quantity = parseFloat(ask[1]);
    markdown += `| ${price} | ${quantity.toFixed(2)} |\n`;
  });
  
  console.log('[OrderBook] 格式化完成，markdown长度:', markdown.length);
  
  return markdown.trim();
}

/**
 * 获取并格式化订单薄数据（完整流程）
 */
export async function getFormattedOrderBook(
  api: BinanceMarketDataAPI,
  config: PromptDataConfig
): Promise<string> {
  console.log('[OrderBook] ========== 开始获取并格式化订单薄数据 ==========');
  console.log('[OrderBook] 原始配置:', JSON.stringify(config, null, 2));
  
  try {
    if (!config.symbol) {
      console.error('[OrderBook] 交易对未配置');
      return '订单薄数据: 交易对未配置';
    }
    
    // 提取订单薄配置
    const formatConfig = extractOrderBookConfig(config);
    
    // 获取订单薄数据
    const orderBook = await fetchOrderBookData(api, config.symbol);
    
    // 过滤和聚合
    const { bids, asks, displayInfo } = filterAndAggregateOrderBook(
      orderBook,
      formatConfig
    );
    
    // 格式化为markdown
    const markdown = `### 订单薄数据 (${config.symbol}, ±${formatConfig.priceRangePercent}%区间)\n\n${formatOrderBookToMarkdown(
      bids,
      asks,
      displayInfo
    )}`;
    
    console.log('[OrderBook] ========== 订单薄数据获取完成 ==========');
    return markdown;
  } catch (error) {
    console.error('[OrderBook] ========== 订单薄数据获取失败 ==========');
    console.error('[OrderBook] 错误详情:', error);
    return `获取订单薄数据失败: ${error instanceof Error ? error.message : '未知错误'}`;
  }
}

