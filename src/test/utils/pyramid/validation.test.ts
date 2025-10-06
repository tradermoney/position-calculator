import { describe, it, expect } from 'vitest';
import { calculatePyramidPlan } from './calculator';

describe('边界情况测试', () => {
  it('应该拒绝无效的层数', () => {
    expect(() => {
      calculatePyramidPlan({
        symbol: 'BTC/USDT',
        side: 'long',
        leverage: 10,
        initialPrice: 50000,
        initialQuantity: 1,
        initialMargin: 5000,
        layers: 1, // 无效
        strategy: 'geometric',
        priceChangePercent: 5
      });
    }).toThrow('加仓层数必须在2-10之间');
  });

  it('应该拒绝无效的价格变化幅度', () => {
    expect(() => {
      calculatePyramidPlan({
        symbol: 'BTC/USDT',
        side: 'long',
        leverage: 10,
        initialPrice: 50000,
        initialQuantity: 1,
        initialMargin: 5000,
        layers: 3,
        strategy: 'geometric',
        priceChangePercent: 60 // 无效
      });
    }).toThrow('价格变化幅度必须在0.1%-50%之间');
  });
});
