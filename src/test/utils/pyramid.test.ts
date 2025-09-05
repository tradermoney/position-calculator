import { describe, it, expect } from 'vitest';

// 金字塔加仓计算逻辑
interface PyramidLayer {
  level: number;
  price: number;
  quantity: number;
  margin: number;
  cumulativeQuantity: number;
  cumulativeMargin: number;
  averagePrice: number;
  liquidationPrice: number;
  priceChange: number;
}

interface PyramidParams {
  symbol: string;
  side: 'long' | 'short';
  leverage: number;
  initialPrice: number;
  initialQuantity: number;
  initialMargin: number;
  layers: number;
  strategy: 'geometric' | 'double_down';
  priceChangePercent: number;
  geometricMultiplier?: number;
}

interface PyramidResult {
  layers: PyramidLayer[];
  totalQuantity: number;
  totalMargin: number;
  finalAveragePrice: number;
  finalLiquidationPrice: number;
  maxDrawdown: number;
}

function calculatePyramidPlan(params: PyramidParams): PyramidResult {
  const {
    side,
    leverage,
    initialPrice,
    initialQuantity,
    initialMargin,
    layers,
    strategy,
    priceChangePercent,
    geometricMultiplier = 1.5
  } = params;

  if (layers < 2 || layers > 10) {
    throw new Error('加仓层数必须在2-10之间');
  }

  if (priceChangePercent <= 0 || priceChangePercent > 50) {
    throw new Error('价格变化幅度必须在0.1%-50%之间');
  }

  const pyramidLayers: PyramidLayer[] = [];
  let cumulativeQuantity = 0;
  let cumulativeMargin = 0;

  for (let i = 0; i < layers; i++) {
    const level = i + 1;
    
    // 计算价格
    let price: number;
    if (i === 0) {
      price = initialPrice;
    } else {
      const priceMultiplier = side === 'long' 
        ? 1 - (priceChangePercent / 100) 
        : 1 + (priceChangePercent / 100);
      price = initialPrice * Math.pow(priceMultiplier, i);
    }

    // 计算数量
    let quantity: number;
    if (i === 0) {
      quantity = initialQuantity;
    } else {
      if (strategy === 'geometric') {
        quantity = initialQuantity * Math.pow(geometricMultiplier, i);
      } else { // double_down
        quantity = initialQuantity * Math.pow(2, i);
      }
    }

    // 计算保证金
    const margin = (price * quantity) / leverage;

    // 累计数据
    cumulativeQuantity += quantity;
    cumulativeMargin += margin;

    // 计算平均价格
    const averagePrice = pyramidLayers.reduce((sum, layer) => sum + layer.price * layer.quantity, 0) + price * quantity;
    const avgPrice = averagePrice / cumulativeQuantity;

    // 计算爆仓价格
    const maintenanceMarginRate = 0.005;
    let liquidationPrice: number;
    if (side === 'long') {
      liquidationPrice = avgPrice * (1 - 1/leverage + maintenanceMarginRate);
    } else {
      liquidationPrice = avgPrice * (1 + 1/leverage - maintenanceMarginRate);
    }

    // 计算价格变化
    const priceChange = i === 0 ? 0 : ((price - initialPrice) / initialPrice) * 100;

    pyramidLayers.push({
      level,
      price,
      quantity,
      margin,
      cumulativeQuantity,
      cumulativeMargin,
      averagePrice: avgPrice,
      liquidationPrice,
      priceChange
    });
  }

  const finalLayer = pyramidLayers[pyramidLayers.length - 1];
  const maxDrawdown = Math.abs(finalLayer.priceChange);

  return {
    layers: pyramidLayers,
    totalQuantity: finalLayer.cumulativeQuantity,
    totalMargin: finalLayer.cumulativeMargin,
    finalAveragePrice: finalLayer.averagePrice,
    finalLiquidationPrice: finalLayer.liquidationPrice,
    maxDrawdown
  };
}

describe('金字塔加仓计算逻辑测试', () => {
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
});
