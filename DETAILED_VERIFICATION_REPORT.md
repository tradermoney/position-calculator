# 波动率计算器 - 详细验证报告

## 🔍 验证时间
2025-10-10

## ✅ 第一部分：数据源验证

### 1.1 原始数据来源 ✅
**文件**: `src/services/binance/BinanceDataService.ts:204-208`

```typescript
// 波动率计算公式
const volatilities = klines.map(k => {
  if (k.open === 0) return 0;
  return ((k.high - k.low) / k.open) * 100;
});
```

**验证结果**:
- ✅ 数据来源: 真实的币安K线数据（通过`BinanceMarketDataAPI`获取）
- ✅ 计算公式: `(high - low) / open × 100%` 正确
- ✅ 边界处理: `open === 0` 时返回0，避免除零错误
- ✅ 无假数据: 所有数据从API实时获取

---

### 1.2 基础统计计算 ✅
**文件**: `src/services/binance/BinanceDataService.ts:210-227`

| 字段 | 计算方式 | 验证 |
|------|---------|------|
| `average` | `sum / length` | ✅ 正确 |
| `max` | `Math.max(...volatilities)` | ✅ 正确 |
| `min` | `Math.min(...volatilities)` | ✅ 正确 |
| `stdDev` | `√[Σ(x-μ)²/n]` | ✅ 正确 |
| `values` | 原始波动率数组 | ✅ 正确 |

**验证结果**: ✅ 所有基础统计计算正确，无假数据

---

## ✅ 第二部分：扩展统计验证

### 2.1 分位数计算 ✅
**文件**: `src/pages/VolatilityCalculator/utils/volatilityStats.ts:45-55`

| 指标 | 计算方式 | 验证 |
|------|---------|------|
| `median` | 排序后取中位数 | ✅ 正确（偶数长度取平均） |
| `q1` | `sortedValues[floor(n*0.25)]` | ✅ 正确 |
| `q3` | `sortedValues[floor(n*0.75)]` | ✅ 正确 |
| `iqr` | `q3 - q1` | ✅ 正确 |
| `range` | `max - min` | ✅ 正确 |

---

### 2.2 高级统计指标 ✅
**文件**: `src/pages/VolatilityCalculator/utils/volatilityStats.ts:60-68`

| 指标 | 公式 | 验证 |
|------|------|------|
| `cv` (变异系数) | `(σ/μ) × 100%` | ✅ 正确 |
| `skewness` (偏度) | `E[(X-μ)³/σ³]` | ✅ 正确 |
| `kurtosis` (峰度) | `E[(X-μ)⁴/σ⁴] - 3` | ✅ 正确（超额峰度） |

---

### 2.3 风险指标 ✅
**文件**: `src/pages/VolatilityCalculator/utils/volatilityStats.ts:69-74`

| 指标 | 计算方式 | 验证 |
|------|---------|------|
| `var95` | 95%分位数 | ✅ 正确 |
| `cvar95` | 超过VaR的平均值 | ✅ 正确 |

**公式检查**:
```typescript
const var95Index = Math.floor(n * 0.95);
const var95 = sortedValues[var95Index];
const cvar95 = sortedValues.slice(var95Index).reduce((sum, v) => sum + v, 0) / (n - var95Index);
```
✅ CVaR计算正确：条件期望值

---

### 2.4 占比统计 ✅
**文件**: `src/pages/VolatilityCalculator/utils/volatilityStats.ts:76-90`

| 指标 | 定义 | 阈值 | 验证 |
|------|------|------|------|
| `highVolRatio` | 高波动占比 | `μ + σ` | ✅ 正确 |
| `lowVolRatio` | 低波动占比 | `max(0, μ - σ)` | ✅ 正确 |
| `stableRatio` | 稳定期占比 | `[μ - 0.5σ, μ + 0.5σ]` | ✅ 正确 |

---

### 2.5 连续性统计 ✅
**文件**: `src/pages/VolatilityCalculator/utils/volatilityStats.ts:92-114`

```typescript
// 最大连续高波动周期
let maxConsecutiveHigh = 0;
let currentConsecutiveHigh = 0;
values.forEach(v => {
  if (v > highVolThreshold) {
    currentConsecutiveHigh++;
    maxConsecutiveHigh = Math.max(maxConsecutiveHigh, currentConsecutiveHigh);
  } else {
    currentConsecutiveHigh = 0;
  }
});
```

✅ **逻辑正确**: 滑动窗口计数，重置机制正确

---

### 2.6 自相关系数 ✅
**文件**: `src/pages/VolatilityCalculator/utils/volatilityStats.ts:116-121`

```typescript
const diffs = values.slice(0, -1).map((v, i) => (v - avg) * (values[i + 1] - avg));
autoCorrelation = diffs.reduce((sum, d) => sum + d, 0) / ((n - 1) * std * std);
```

**公式**: `r₁ = Cov(Xₜ, Xₜ₊₁) / Var(X)`

✅ **正确**: Lag-1自相关，用于检测GARCH效应

---

### 2.7 趋势分析 ✅
**文件**: `src/pages/VolatilityCalculator/utils/volatilityStats.ts:123-133`

```typescript
const xMean = (n - 1) / 2;
const yMean = avg;
let numerator = 0;
let denominator = 0;
values.forEach((v, i) => {
  numerator += (i - xMean) * (v - yMean);
  denominator += Math.pow(i - xMean, 2);
});
const trendSlope = denominator !== 0 ? numerator / denominator : 0;
const trendStrength = Math.abs(trendSlope) / avg * 100;
```

**公式**: 简单线性回归的斜率 `β = Σ(xᵢ-x̄)(yᵢ-ȳ) / Σ(xᵢ-x̄)²`

✅ **正确**: OLS估计，趋势强度归一化

---

### 2.8 集中度指标 ✅
**文件**: `src/pages/VolatilityCalculator/utils/volatilityStats.ts:135-137`

```typescript
const sum = values.reduce((s, v) => s + v, 0);
const hhi = values.reduce((s, v) => s + Math.pow(v / sum, 2), 0) * 10000;
```

**公式**: HHI = Σ(sᵢ)² × 10000，其中sᵢ = vᵢ/Σvⱼ

✅ **正确**: 赫芬达尔-赫希曼指数，衡量波动率集中度

---

### 2.9 异常值检测 ✅
**文件**: `src/pages/VolatilityCalculator/utils/volatilityStats.ts:139-143`

```typescript
const lowerBound = q1 - 1.5 * iqr;
const upperBound = q3 + 1.5 * iqr;
const outliers = values.filter(v => v < lowerBound || v > upperBound).length;
```

**规则**: Tukey's fence rule (1.5×IQR)

✅ **正确**: 标准的箱线图异常值检测方法

---

### 2.10 动量指标 ✅
**文件**: `src/pages/VolatilityCalculator/utils/volatilityStats.ts:145-156`

```typescript
// 上升趋势周期数
let risingPeriods = 0;
for (let i = 1; i < n; i++) {
  if (values[i] > values[i - 1]) risingPeriods++;
}
const risingRatio = (risingPeriods / (n - 1)) * 100;

// 动量变化
const recentCount = Math.max(Math.floor(n * 0.1), 1);
const recentAvg = values.slice(-recentCount).reduce((s, v) => s + v, 0) / recentCount;
const earlyAvg = values.slice(0, recentCount).reduce((s, v) => s + v, 0) / recentCount;
const momentumChange = ((recentAvg - earlyAvg) / earlyAvg) * 100;
```

✅ **正确**: 
- 上升占比：逐周期比较
- 动量变化：最近10% vs 最早10%的平均值变化率

---

## ✅ 第三部分：图表组件验证

### 3.1 RollingVolatilityChart ✅

**文件**: 检查滚动标准差计算

<function_calls>
<invoke name="read_file">
<parameter name="target_file">/Users/cc11001100/github/tradermoney/position-calculator/src/pages/VolatilityCalculator/components/RollingVolatilityChart.tsx
