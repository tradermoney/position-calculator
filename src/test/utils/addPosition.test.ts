import { describe, it, expect } from 'vitest';

// 补仓计算逻辑
interface AddPositionParams {
  originalPrice: number;
  originalQuantity: number;
  targetPrice: number;
  addQuantity: number;
}

interface AddPositionResult {
  newAveragePrice: number;
  totalQuantity: number;
  priceReduction: number;
  priceReductionPercentage: number;
}

function calculateAddPosition(params: AddPositionParams): AddPositionResult {
  const { originalPrice, originalQuantity, targetPrice, addQuantity } = params;
  
  if (originalPrice <= 0 || targetPrice <= 0) {
    throw new Error('价格必须大于0');
  }
  
  if (originalQuantity <= 0 || addQuantity <= 0) {
    throw new Error('数量必须大于0');
  }

  const totalQuantity = originalQuantity + addQuantity;
  const newAveragePrice = (originalPrice * originalQuantity + targetPrice * addQuantity) / totalQuantity;
  const priceReduction = originalPrice - newAveragePrice;
  const priceReductionPercentage = (priceReduction / originalPrice) * 100;

  return {
    newAveragePrice,
    totalQuantity,
    priceReduction,
    priceReductionPercentage
  };
}

describe('补仓计算逻辑测试', () => {
  describe('基本补仓计算', () => {
    it('应该正确计算补仓后的平均价格', () => {
      const result = calculateAddPosition({
        originalPrice: 50000,
        originalQuantity: 1,
        targetPrice: 45000,
        addQuantity: 1
      });

      // 新平均价格 = (50000 * 1 + 45000 * 1) / (1 + 1) = 47500
      expect(result.newAveragePrice).toBe(47500);
      expect(result.totalQuantity).toBe(2);
      expect(result.priceReduction).toBe(2500);
      expect(result.priceReductionPercentage).toBeCloseTo(5, 2);
    });

    it('应该正确处理不同数量的补仓', () => {
      const result = calculateAddPosition({
        originalPrice: 50000,
        originalQuantity: 1,
        targetPrice: 40000,
        addQuantity: 2
      });

      // 新平均价格 = (50000 * 1 + 40000 * 2) / (1 + 2) = 130000 / 3 ≈ 43333.33
      expect(result.newAveragePrice).toBeCloseTo(43333.33, 2);
      expect(result.totalQuantity).toBe(3);
      expect(result.priceReduction).toBeCloseTo(6666.67, 2);
      expect(result.priceReductionPercentage).toBeCloseTo(13.33, 2);
    });

    it('应该正确处理小数数量', () => {
      const result = calculateAddPosition({
        originalPrice: 50000,
        originalQuantity: 0.5,
        targetPrice: 45000,
        addQuantity: 0.3
      });

      // 新平均价格 = (50000 * 0.5 + 45000 * 0.3) / (0.5 + 0.3) = 38500 / 0.8 = 48125
      expect(result.newAveragePrice).toBe(48125);
      expect(result.totalQuantity).toBe(0.8);
      expect(result.priceReduction).toBe(1875);
      expect(result.priceReductionPercentage).toBeCloseTo(3.75, 2);
    });
  });

  describe('边界情况测试', () => {
    it('应该处理相同价格的补仓', () => {
      const result = calculateAddPosition({
        originalPrice: 50000,
        originalQuantity: 1,
        targetPrice: 50000,
        addQuantity: 1
      });

      expect(result.newAveragePrice).toBe(50000);
      expect(result.priceReduction).toBe(0);
      expect(result.priceReductionPercentage).toBe(0);
    });

    it('应该处理更高价格的补仓', () => {
      const result = calculateAddPosition({
        originalPrice: 50000,
        originalQuantity: 1,
        targetPrice: 55000,
        addQuantity: 1
      });

      // 新平均价格 = (50000 * 1 + 55000 * 1) / 2 = 52500
      expect(result.newAveragePrice).toBe(52500);
      expect(result.priceReduction).toBe(-2500); // 负值表示平均价格上升
      expect(result.priceReductionPercentage).toBe(-5);
    });

    it('应该拒绝零或负价格', () => {
      expect(() => {
        calculateAddPosition({
          originalPrice: 0,
          originalQuantity: 1,
          targetPrice: 45000,
          addQuantity: 1
        });
      }).toThrow('价格必须大于0');

      expect(() => {
        calculateAddPosition({
          originalPrice: 50000,
          originalQuantity: 1,
          targetPrice: -45000,
          addQuantity: 1
        });
      }).toThrow('价格必须大于0');
    });

    it('应该拒绝零或负数量', () => {
      expect(() => {
        calculateAddPosition({
          originalPrice: 50000,
          originalQuantity: 0,
          targetPrice: 45000,
          addQuantity: 1
        });
      }).toThrow('数量必须大于0');

      expect(() => {
        calculateAddPosition({
          originalPrice: 50000,
          originalQuantity: 1,
          targetPrice: 45000,
          addQuantity: -1
        });
      }).toThrow('数量必须大于0');
    });
  });

  describe('实际场景测试', () => {
    it('应该正确计算多次补仓场景', () => {
      // 第一次补仓
      let result = calculateAddPosition({
        originalPrice: 50000,
        originalQuantity: 1,
        targetPrice: 45000,
        addQuantity: 1
      });

      expect(result.newAveragePrice).toBe(47500);
      expect(result.totalQuantity).toBe(2);

      // 第二次补仓（基于第一次结果）
      result = calculateAddPosition({
        originalPrice: result.newAveragePrice,
        originalQuantity: result.totalQuantity,
        targetPrice: 40000,
        addQuantity: 2
      });

      // 新平均价格 = (47500 * 2 + 40000 * 2) / 4 = 175000 / 4 = 43750
      expect(result.newAveragePrice).toBe(43750);
      expect(result.totalQuantity).toBe(4);
    });

    it('应该正确计算大幅下跌后的补仓', () => {
      const result = calculateAddPosition({
        originalPrice: 50000,
        originalQuantity: 1,
        targetPrice: 30000, // 下跌40%
        addQuantity: 1
      });

      expect(result.newAveragePrice).toBe(40000);
      expect(result.priceReductionPercentage).toBe(20); // 平均价格降低20%
    });
  });
});
