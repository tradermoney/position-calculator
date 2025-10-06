import { describe, it, expect } from 'vitest';
import { calculatePyramidPlan } from './calculator';

describe('加倍加仓策略', () => {
  it('应该正确计算加倍加仓计划', () => {
    const result = calculatePyramidPlan({
      symbol: 'BTC/USDT',
      side: 'long',
      leverage: 10,
      initialPrice: 50000,
      initialQuantity: 1,
      initialMargin: 5000,
      layers: 4,
      strategy: 'double_down',
      priceChangePercent: 5
    });

    expect(result.layers).toHaveLength(4);

    // 验证数量翻倍
    expect(result.layers[0].quantity).toBe(1);
    expect(result.layers[1].quantity).toBe(2);
    expect(result.layers[2].quantity).toBe(4);
    expect(result.layers[3].quantity).toBe(8);

    expect(result.totalQuantity).toBe(15); // 1 + 2 + 4 + 8
  });

  it('应该正确计算空头仓位', () => {
    const result = calculatePyramidPlan({
      symbol: 'BTC/USDT',
      side: 'short',
      leverage: 10,
      initialPrice: 50000,
      initialQuantity: 1,
      initialMargin: 5000,
      layers: 2,
      strategy: 'double_down',
      priceChangePercent: 5
    });

    // 空头价格应该上涨
    expect(result.layers[0].price).toBe(50000);
    expect(result.layers[1].price).toBe(52500); // 50000 * 1.05
    expect(result.layers[1].priceChange).toBe(5); // 上涨5%
  });
});
