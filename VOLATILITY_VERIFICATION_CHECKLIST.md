# 波动率计算器 - 完整验证清单

## 🎯 验证目标
逐项检查每个组件的每个字段和计算，确保：
1. ✅ 无假数据
2. ✅ 无硬编码的测试值
3. ✅ 计算公式正确
4. ✅ 数据源正确
5. ✅ 数据流转正确

---

## 📋 组件检查清单

### 1. VolatilityStatsCard - 统计卡片
**数据源**: `VolatilityStats`

#### 基础统计字段 (8个)
- [ ] `average` - 平均波动率
- [ ] `min` - 最小波动率
- [ ] `max` - 最大波动率
- [ ] `median` - 中位数
- [ ] `stdDev` - 标准差
- [ ] `q1` - 第一四分位数
- [ ] `q3` - 第三四分位数
- [ ] `iqr` - 四分位距

#### 扩展统计字段 (15个)
- [ ] `cv` - 变异系数
- [ ] `skewness` - 偏度
- [ ] `kurtosis` - 峰度
- [ ] `var95` - VaR(95%)
- [ ] `cvar95` - CVaR(95%)
- [ ] `highVolRatio` - 高波动占比
- [ ] `lowVolRatio` - 低波动占比
- [ ] `stableRatio` - 稳定期占比
- [ ] `maxConsecutiveHigh` - 最大连续高波动
- [ ] `maxConsecutiveLow` - 最大连续低波动
- [ ] `autoCorrelation` - 自相关系数
- [ ] `trendSlope` - 趋势斜率
- [ ] `trendStrength` - 趋势强度
- [ ] `hhi` - 赫芬达尔指数
- [ ] `outlierRatio` - 异常值占比

---

### 2. EChartsVolatilityChart - 基础趋势图
- [ ] 折线图数据 = `volatility.values`
- [ ] 柱状图数据 = `volatility.values`
- [ ] 饼图数据 = 分档统计（极低/低/中/高/极高）
- [ ] 时间标签生成逻辑

---

### 3. PriceVolatilityChart - 价格波动联合图
- [ ] K线数据 = `data.klines`
- [ ] 波动率数据 = `volatility.values`
- [ ] 极端事件检测（90%分位阈值）
- [ ] 事件标注位置
- [ ] 时间戳转换

---

### 4. RollingVolatilityChart - 移动窗口图
- [ ] 7日滚动标准差
- [ ] 14日滚动标准差
- [ ] 30日滚动标准差
- [ ] 滚动计算窗口对齐

---

### 5. MultiTimeframeVolatilityChart - 多周期图
- [ ] 1小时数据获取
- [ ] 4小时数据获取
- [ ] 1日数据获取
- [ ] 相关系数计算
- [ ] 数据对齐逻辑

---

### 6. AnnualizedVolatilityChart - 年化图
- [ ] 年化因子计算（根据interval）
- [ ] 年化波动率 = 日波动率 × √年化因子
- [ ] 置信带计算
- [ ] 波动率等级分类

---

### 7. VolatilityDistributionChart - 分布直方图
- [ ] 30个区间划分
- [ ] 频数统计
- [ ] KDE带宽计算（Silverman规则）
- [ ] KDE密度估计
- [ ] 分位数标线（25%/50%/75%）

---

### 8. VolatilityBoxPlotChart - 箱线图
- [ ] 最小值
- [ ] Q1 (25%分位)
- [ ] 中位数 (50%分位)
- [ ] Q3 (75%分位)
- [ ] 最大值
- [ ] 离群值检测（1.5×IQR规则）

---

### 9. VolatilityAutocorrelationChart - ACF图
- [ ] ACF计算公式
- [ ] Lag范围（1~20）
- [ ] 置信区间 = ±1.96/√n
- [ ] GARCH效应判断

---

### 10. VolatilityReturnScatterChart - 散点图
- [ ] 收益率计算 = (close - open) / open × 100%
- [ ] 波动率配对
- [ ] Pearson相关系数
- [ ] 上涨/下跌分类

---

### 11. ParkinsonVolatilityChart - Parkinson图
- [ ] Parkinson公式 = √[ln²(H/L) / (4×ln2)]
- [ ] 传统波动率对比
- [ ] 相关系数
- [ ] 效率比

---

### 12. VolatilityHeatmapChart - 热力图
- [ ] 小时维度聚合
- [ ] 星期维度聚合
- [ ] 多值聚合（取平均）
- [ ] 色阶映射

---

### 13. VolatilityForecastChart - 预测图
- [ ] EWMA计算（λ=0.94）
- [ ] 预测期数
- [ ] 95%置信区间
- [ ] MAE/RMSE/MAPE指标

---

### 14. VolatilityConeChart - 锥形图 ⚠️
- [ ] 滚动波动率计算（5/10/20/30/60期）
- [ ] 各窗口的分位数（10%/25%/50%/75%/90%）
- [ ] 当前滚动波动率计算
- [ ] 当前值在锥形中的位置

---

### 15. VolatilityContributionChart - 贡献图
- [ ] 贡献度 = v²/Σv² × 100%
- [ ] 累计贡献
- [ ] 排序逻辑
- [ ] 20%/50%/80%累计点

---

### 16. VolatilityJumpDetectionChart - 跳跃检测 ⚠️
- [ ] 波动率变化序列
- [ ] 变化的均值和标准差
- [ ] 跳跃阈值（2.5σ）
- [ ] 严重跳跃阈值（3.75σ）
- [ ] 向上/向下分类
- [ ] 散点图数据格式

---

### 17. VolatilityRatioChart - 比率图 ⚠️
- [ ] 短期MA（5期）
- [ ] 长期MA（20期）
- [ ] 比率计算
- [ ] 状态识别（>1.2 高波动，<0.8 低波动）
- [ ] 散点图坐标

---

## 🔍 重点验证项

### 数据源验证
- [ ] `volatility.values` 是否来自真实计算
- [ ] `volatility.average` 计算方式
- [ ] `volatility.stdDev` 计算方式
- [ ] `klines` 数据来源

### 计算公式验证
- [ ] 标准差公式：√[Σ(x-μ)²/n]
- [ ] 偏度公式：E[(X-μ)³]/σ³
- [ ] 峰度公式：E[(X-μ)⁴]/σ⁴ - 3
- [ ] 相关系数公式：Cov(X,Y)/(σₓ×σᵧ)

### 无假数据验证
- [ ] 没有固定的魔法数字（除了数学常数）
- [ ] 没有硬编码的测试数组
- [ ] 没有随机数生成的模拟数据
- [ ] 所有统计值都从原始数据计算

---

## ✅ 验证状态
- [ ] 第一轮检查完成
- [ ] 发现问题列表
- [ ] 修复问题
- [ ] 第二轮验证
- [ ] 最终确认

---

**检查开始时间**: 待定  
**预计完成时间**: 待定  
**检查人员**: AI Assistant

