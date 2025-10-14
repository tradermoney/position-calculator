/**
 * 订单薄聚合器测试
 */

import { aggregateOrderBook, getRecommendedLevels, getAggregationLevelOptions } from '../orderBookAggregator';

describe('OrderBook Aggregator', () => {
  // 模拟订单薄数据
  const mockBids: [string, string][] = [
    ['50000.00', '1.5'],
    ['49999.50', '2.0'],
    ['49999.00', '1.2'],
    ['49998.50', '3.0'],
    ['49998.00', '0.8'],
    ['49997.50', '2.5'],
    ['49997.00', '1.8'],
    ['49996.50', '2.2'],
    ['49996.00', '1.0'],
    ['49995.50', '3.5'],
  ];

  const mockAsks: [string, string][] = [
    ['50001.00', '1.2'],
    ['50001.50', '2.5'],
    ['50002.00', '1.8'],
    ['50002.50', '2.0'],
    ['50003.00', '1.5'],
    ['50003.50', '3.0'],
    ['50004.00', '2.2'],
    ['50004.50', '1.0'],
    ['50005.00', '2.8'],
    ['50005.50', '1.5'],
  ];

  describe('aggregateOrderBook', () => {
    it('应该正确聚合订单薄数据', () => {
      const result = aggregateOrderBook(mockBids, mockAsks, {
        targetLevels: 5,
        mode: 'equal-price'
      });

      expect(result.bids).toHaveLength(5);
      expect(result.asks).toHaveLength(5);
      expect(result.totalBids).toBeGreaterThan(0);
      expect(result.totalAsks).toBeGreaterThan(0);
    });

    it('应该保持价格排序', () => {
      const result = aggregateOrderBook(mockBids, mockAsks, {
        targetLevels: 3,
        mode: 'equal-price'
      });

      // 买单应该按价格降序
      for (let i = 0; i < result.bids.length - 1; i++) {
        expect(result.bids[i].price).toBeGreaterThan(result.bids[i + 1].price);
      }

      // 卖单应该按价格升序
      for (let i = 0; i < result.asks.length - 1; i++) {
        expect(result.asks[i].price).toBeLessThan(result.asks[i + 1].price);
      }
    });

    it('应该保持数量守恒', () => {
      const originalBidsTotal = mockBids.reduce((sum, [, qty]) => sum + parseFloat(qty), 0);
      const originalAsksTotal = mockAsks.reduce((sum, [, qty]) => sum + parseFloat(qty), 0);

      const result = aggregateOrderBook(mockBids, mockAsks, {
        targetLevels: 3,
        mode: 'equal-price'
      });

      expect(Math.abs(result.totalBids - originalBidsTotal)).toBeLessThan(0.001);
      expect(Math.abs(result.totalAsks - originalAsksTotal)).toBeLessThan(0.001);
    });

    it('当原始数据量小于目标档位时应该直接返回', () => {
      const smallBids = mockBids.slice(0, 3);
      const smallAsks = mockAsks.slice(0, 3);

      const result = aggregateOrderBook(smallBids, smallAsks, {
        targetLevels: 5,
        mode: 'equal-price'
      });

      expect(result.bids).toHaveLength(3);
      expect(result.asks).toHaveLength(3);
    });
  });

  describe('getRecommendedLevels', () => {
    it('应该为小数据量返回原始数量', () => {
      expect(getRecommendedLevels(15, 1)).toBe(15);
    });

    it('应该为大区间返回较少档位', () => {
      const smallRange = getRecommendedLevels(100, 1);
      const largeRange = getRecommendedLevels(100, 10);
      
      expect(largeRange).toBeLessThan(smallRange);
    });

    it('应该返回合理的档位数量', () => {
      const result = getRecommendedLevels(200, 5);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThanOrEqual(200);
    });
  });

  describe('getAggregationLevelOptions', () => {
    it('应该返回有效的选项数组', () => {
      const options = getAggregationLevelOptions(50);
      
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
      expect(options).toContain(50); // 应该包含原始数据量
    });

    it('应该按升序排列', () => {
      const options = getAggregationLevelOptions(100);
      
      for (let i = 0; i < options.length - 1; i++) {
        expect(options[i]).toBeLessThan(options[i + 1]);
      }
    });

    it('不应该包含大于数据量的选项', () => {
      const options = getAggregationLevelOptions(30);
      
      options.forEach(option => {
        expect(option).toBeLessThanOrEqual(30);
      });
    });
  });
});
