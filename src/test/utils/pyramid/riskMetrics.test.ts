import { describe, it, expect } from 'vitest';
import { calculatePyramidPlan } from './calculator';

describe('风险指标计算', () => {
  it('应该正确计算最大回撤', () => {
    const result = calculatePyramidPlan({
      symbol: 'BTC/USDT',
      side: 'long',
      leverage: 10,
      initialPrice: 50000,
      initialQuantity: 1,
      initialMargin: 5000,
      layers: 5,
      strategy: 'geometric',
      priceChangePercent: 5
    });

    // 5层，每层下跌5%，最大回撤应该是最后一层的价格变化
    // 实际计算：50000 * (0.95^4) = 50000 * 0.81450625 = 40725.3125
    // 价格变化：(40725.3125 - 50000) / 50000 * 100 = -18.549375%
    const expectedMaxDrawdown = 18.55; // 约18.55%的最大回撤
    expect(result.maxDrawdown).toBeCloseTo(expectedMaxDrawdown, 1);
  });

  it('应该正确计算爆仓价格', () => {
    const result = calculatePyramidPlan({
      symbol: 'BTC/USDT',
      side: 'long',
      leverage: 10,
      initialPrice: 50000,
      initialQuantity: 1,
      initialMargin: 5000,
      layers: 2,
      strategy: 'geometric',
      priceChangePercent: 5
    });

    const finalLayer = result.layers[1];
    const expectedLiquidationPrice = finalLayer.averagePrice * (1 - 1/10 + 0.005);
    expect(finalLayer.liquidationPrice).toBeCloseTo(expectedLiquidationPrice, 2);
  });
});
