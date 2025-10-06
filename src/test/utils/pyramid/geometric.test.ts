import { describe, it, expect } from 'vitest';
import { calculatePyramidPlan } from './calculator';

describe('等比加仓策略', () => {
  it('应该正确计算等比加仓计划', () => {
    const result = calculatePyramidPlan({
      symbol: 'BTC/USDT',
      side: 'long',
      leverage: 10,
      initialPrice: 50000,
      initialQuantity: 1,
      initialMargin: 5000,
      layers: 3,
      strategy: 'geometric',
      priceChangePercent: 5,
      geometricMultiplier: 1.5
    });

    expect(result.layers).toHaveLength(3);

    // 第一层
    expect(result.layers[0].price).toBe(50000);
    expect(result.layers[0].quantity).toBe(1);
    expect(result.layers[0].margin).toBe(5000);

    // 第二层
    expect(result.layers[1].price).toBe(47500); // 50000 * 0.95
    expect(result.layers[1].quantity).toBe(1.5); // 1 * 1.5
    expect(result.layers[1].margin).toBe(7125); // 47500 * 1.5 / 10

    // 第三层
    expect(result.layers[2].price).toBe(45125); // 50000 * 0.95^2
    expect(result.layers[2].quantity).toBe(2.25); // 1 * 1.5^2

    expect(result.totalQuantity).toBe(4.75); // 1 + 1.5 + 2.25
  });

  it('应该正确计算累计数据', () => {
    const result = calculatePyramidPlan({
      symbol: 'BTC/USDT',
      side: 'long',
      leverage: 10,
      initialPrice: 50000,
      initialQuantity: 1,
      initialMargin: 5000,
      layers: 2,
      strategy: 'geometric',
      priceChangePercent: 5,
      geometricMultiplier: 1.5
    });

    // 第二层累计数据
    const secondLayer = result.layers[1];
    expect(secondLayer.cumulativeQuantity).toBe(2.5); // 1 + 1.5
    expect(secondLayer.cumulativeMargin).toBe(12125); // 5000 + 7125

    // 平均价格 = (50000 * 1 + 47500 * 1.5) / 2.5 = 121250 / 2.5 = 48500
    expect(secondLayer.averagePrice).toBe(48500);
  });
});
