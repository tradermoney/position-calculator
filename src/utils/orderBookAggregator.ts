/**
 * 订单薄价格分组聚合工具
 * 用于将原始订单薄数据按指定档位数量进行聚合
 */

export interface OrderBookEntry {
  price: number;
  quantity: number;
}

export interface AggregatedOrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  totalBids: number;
  totalAsks: number;
  priceRange: {
    min: number;
    max: number;
    spread: number;
  };
}

export interface AggregationConfig {
  /** 目标聚合档位数量 */
  targetLevels: number;
  /** 聚合模式 */
  mode: 'equal-price' | 'equal-quantity';
  /** 最小价格间隔（可选，用于避免过度聚合） */
  minPriceGap?: number;
}

/**
 * 聚合订单薄数据
 * @param rawBids 原始买单数据 [price, quantity][]
 * @param rawAsks 原始卖单数据 [price, quantity][]
 * @param config 聚合配置
 * @returns 聚合后的订单薄数据
 */
export function aggregateOrderBook(
  rawBids: [string, string][],
  rawAsks: [string, string][],
  config: AggregationConfig
): AggregatedOrderBook {
  // 转换为数字格式并排序
  const bids = rawBids
    .map(([price, quantity]) => ({
      price: parseFloat(price),
      quantity: parseFloat(quantity)
    }))
    .sort((a, b) => b.price - a.price); // 买单按价格降序

  const asks = rawAsks
    .map(([price, quantity]) => ({
      price: parseFloat(price),
      quantity: parseFloat(quantity)
    }))
    .sort((a, b) => a.price - b.price); // 卖单按价格升序

  if (bids.length === 0 || asks.length === 0) {
    return {
      bids: [],
      asks: [],
      totalBids: 0,
      totalAsks: 0,
      priceRange: { min: 0, max: 0, spread: 0 }
    };
  }

  // 计算价格范围
  const minPrice = Math.min(bids[bids.length - 1].price, asks[0].price);
  const maxPrice = Math.max(bids[0].price, asks[asks.length - 1].price);
  const spread = asks[0].price - bids[0].price;

  // 如果原始数据量小于等于目标档位，直接返回
  if (bids.length <= config.targetLevels && asks.length <= config.targetLevels) {
    return {
      bids,
      asks,
      totalBids: bids.reduce((sum, bid) => sum + bid.quantity, 0),
      totalAsks: asks.reduce((sum, ask) => sum + ask.quantity, 0),
      priceRange: { min: minPrice, max: maxPrice, spread }
    };
  }

  // 根据模式进行聚合
  let aggregatedBids: OrderBookEntry[];
  let aggregatedAsks: OrderBookEntry[];

  switch (config.mode) {
    case 'equal-price':
      aggregatedBids = aggregateByEqualPrice(bids, config.targetLevels, 'bid');
      aggregatedAsks = aggregateByEqualPrice(asks, config.targetLevels, 'ask');
      break;
    case 'equal-quantity':
      aggregatedBids = aggregateByEqualQuantity(bids, config.targetLevels);
      aggregatedAsks = aggregateByEqualQuantity(asks, config.targetLevels);
      break;
    default:
      aggregatedBids = aggregateByEqualPrice(bids, config.targetLevels, 'bid');
      aggregatedAsks = aggregateByEqualPrice(asks, config.targetLevels, 'ask');
      break;
  }

  return {
    bids: aggregatedBids,
    asks: aggregatedAsks,
    totalBids: aggregatedBids.reduce((sum, bid) => sum + bid.quantity, 0),
    totalAsks: aggregatedAsks.reduce((sum, ask) => sum + ask.quantity, 0),
    priceRange: { min: minPrice, max: maxPrice, spread }
  };
}

/**
 * 按等价格间隔聚合
 */
function aggregateByEqualPrice(
  orders: OrderBookEntry[],
  targetLevels: number,
  side: 'bid' | 'ask'
): OrderBookEntry[] {
  if (orders.length <= targetLevels) return orders;

  const result: OrderBookEntry[] = [];
  const groupSize = Math.ceil(orders.length / targetLevels);

  for (let i = 0; i < orders.length; i += groupSize) {
    const group = orders.slice(i, i + groupSize);
    if (group.length === 0) continue;

    // 计算加权平均价格和总数量
    const totalQuantity = group.reduce((sum, order) => sum + order.quantity, 0);
    const weightedPrice = group.reduce((sum, order) => sum + order.price * order.quantity, 0) / totalQuantity;

    result.push({
      price: weightedPrice,
      quantity: totalQuantity
    });
  }

  return result.slice(0, targetLevels);
}

/**
 * 按等数量聚合
 */
function aggregateByEqualQuantity(
  orders: OrderBookEntry[],
  targetLevels: number
): OrderBookEntry[] {
  if (orders.length <= targetLevels) return orders;

  const totalQuantity = orders.reduce((sum, order) => sum + order.quantity, 0);
  const targetQuantityPerLevel = totalQuantity / targetLevels;

  const result: OrderBookEntry[] = [];
  let currentGroup: OrderBookEntry[] = [];
  let currentQuantity = 0;

  for (const order of orders) {
    currentGroup.push(order);
    currentQuantity += order.quantity;

    if (currentQuantity >= targetQuantityPerLevel || result.length === targetLevels - 1) {
      // 计算加权平均价格
      const groupTotalQuantity = currentGroup.reduce((sum, o) => sum + o.quantity, 0);
      const weightedPrice = currentGroup.reduce((sum, o) => sum + o.price * o.quantity, 0) / groupTotalQuantity;

      result.push({
        price: weightedPrice,
        quantity: groupTotalQuantity
      });

      currentGroup = [];
      currentQuantity = 0;

      if (result.length >= targetLevels) break;
    }
  }

  // 处理剩余订单
  if (currentGroup.length > 0 && result.length < targetLevels) {
    const groupTotalQuantity = currentGroup.reduce((sum, o) => sum + o.quantity, 0);
    const weightedPrice = currentGroup.reduce((sum, o) => sum + o.price * o.quantity, 0) / groupTotalQuantity;

    result.push({
      price: weightedPrice,
      quantity: groupTotalQuantity
    });
  }

  return result;
}

/**
 * 获取推荐的聚合档位数量
 * @param dataCount 原始数据数量
 * @param priceRangePercent 价格区间百分比
 * @returns 推荐的档位数量
 */
export function getRecommendedLevels(dataCount: number, priceRangePercent: number): number {
  // 基于数据量和价格区间的智能推荐
  if (dataCount <= 20) return dataCount; // 数据量小，不需要聚合
  
  if (priceRangePercent <= 1) {
    // 小区间：保持较高精度
    return Math.min(20, Math.ceil(dataCount * 0.8));
  } else if (priceRangePercent <= 5) {
    // 中等区间：适度聚合
    return Math.min(20, Math.ceil(dataCount * 0.4));
  } else {
    // 大区间：大幅聚合
    return Math.min(15, Math.ceil(dataCount * 0.2));
  }
}

/**
 * 获取可选的聚合档位选项
 * @param dataCount 原始数据数量
 * @returns 档位选项数组
 */
export function getAggregationLevelOptions(dataCount: number): number[] {
  const options = [5, 10, 15, 20, 30, 50, 100];
  
  // 过滤掉大于数据量的选项，并添加数据量本身
  const validOptions = options.filter(option => option < dataCount);
  
  if (!validOptions.includes(dataCount)) {
    validOptions.push(dataCount);
  }
  
  // 添加推荐选项
  const recommended = getRecommendedLevels(dataCount, 5); // 使用中等区间作为参考
  if (!validOptions.includes(recommended)) {
    validOptions.push(recommended);
  }
  
  return validOptions.sort((a, b) => a - b);
}
