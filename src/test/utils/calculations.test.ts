import { describe, it, expect } from 'vitest';
import { 
  calculateLiquidationPrice, 
  calculatePnL, 
  calculateMarginRatio,
  calculateRequiredMargin 
} from '../../utils/calculations';

describe('核心计算逻辑测试', () => {
  describe('爆仓价格计算', () => {
    it('应该正确计算多头仓位的爆仓价格', () => {
      const result = calculateLiquidationPrice({
        entryPrice: 50000,
        quantity: 1,
        leverage: 10,
        side: 'long',
        margin: 5000,
        maintenanceMarginRate: 0.005
      });

      // 多头爆仓价格 = 开仓价格 * (1 - 1/杠杆 + 维持保证金率)
      // = 50000 * (1 - 1/10 + 0.005) = 50000 * 0.905 = 45250
      expect(result).toBeCloseTo(45250, 2);
    });

    it('应该正确计算空头仓位的爆仓价格', () => {
      const result = calculateLiquidationPrice({
        entryPrice: 50000,
        quantity: 1,
        leverage: 10,
        side: 'short',
        margin: 5000,
        maintenanceMarginRate: 0.005
      });

      // 空头爆仓价格 = 开仓价格 * (1 + 1/杠杆 - 维持保证金率)
      // = 50000 * (1 + 1/10 - 0.005) = 50000 * 1.095 = 54750
      expect(result).toBeCloseTo(54750, 2);
    });

    it('应该处理高杠杆情况', () => {
      const result = calculateLiquidationPrice({
        entryPrice: 50000,
        quantity: 1,
        leverage: 100,
        side: 'long',
        margin: 500,
        maintenanceMarginRate: 0.005
      });

      // 高杠杆下爆仓价格更接近开仓价格
      expect(result).toBeCloseTo(49750, 2);
    });

    it('应该处理边界情况 - 零杠杆', () => {
      expect(() => {
        calculateLiquidationPrice({
          entryPrice: 50000,
          quantity: 1,
          leverage: 0,
          side: 'long',
          margin: 5000,
          maintenanceMarginRate: 0.005
        });
      }).toThrow('杠杆倍数必须大于0');
    });

    it('应该处理边界情况 - 负价格', () => {
      expect(() => {
        calculateLiquidationPrice({
          entryPrice: -50000,
          quantity: 1,
          leverage: 10,
          side: 'long',
          margin: 5000,
          maintenanceMarginRate: 0.005
        });
      }).toThrow('开仓价格必须大于0');
    });
  });

  describe('盈亏计算', () => {
    it('应该正确计算多头仓位盈利', () => {
      const result = calculatePnL({
        entryPrice: 50000,
        currentPrice: 55000,
        quantity: 1,
        side: 'long'
      });

      expect(result).toBe(5000); // (55000 - 50000) * 1
    });

    it('应该正确计算多头仓位亏损', () => {
      const result = calculatePnL({
        entryPrice: 50000,
        currentPrice: 45000,
        quantity: 1,
        side: 'long'
      });

      expect(result).toBe(-5000); // (45000 - 50000) * 1
    });

    it('应该正确计算空头仓位盈利', () => {
      const result = calculatePnL({
        entryPrice: 50000,
        currentPrice: 45000,
        quantity: 1,
        side: 'short'
      });

      expect(result).toBe(5000); // (50000 - 45000) * 1
    });

    it('应该正确计算空头仓位亏损', () => {
      const result = calculatePnL({
        entryPrice: 50000,
        currentPrice: 55000,
        quantity: 1,
        side: 'short'
      });

      expect(result).toBe(-5000); // (50000 - 55000) * 1
    });
  });

  describe('保证金比率计算', () => {
    it('应该正确计算保证金比率', () => {
      const result = calculateMarginRatio({
        margin: 5000,
        unrealizedPnL: 1000,
        positionValue: 50000
      });

      // 保证金比率 = (保证金 + 未实现盈亏) / 仓位价值
      // = (5000 + 1000) / 50000 = 0.12 = 12%
      expect(result).toBeCloseTo(0.12, 4);
    });

    it('应该处理负盈亏情况', () => {
      const result = calculateMarginRatio({
        margin: 5000,
        unrealizedPnL: -2000,
        positionValue: 50000
      });

      // = (5000 - 2000) / 50000 = 0.06 = 6%
      expect(result).toBeCloseTo(0.06, 4);
    });
  });

  describe('所需保证金计算', () => {
    it('应该正确计算所需保证金', () => {
      const result = calculateRequiredMargin({
        price: 50000,
        quantity: 1,
        leverage: 10
      });

      // 所需保证金 = 价格 * 数量 / 杠杆
      // = 50000 * 1 / 10 = 5000
      expect(result).toBe(5000);
    });

    it('应该处理小数数量', () => {
      const result = calculateRequiredMargin({
        price: 50000,
        quantity: 0.5,
        leverage: 20
      });

      // = 50000 * 0.5 / 20 = 1250
      expect(result).toBe(1250);
    });
  });
});
