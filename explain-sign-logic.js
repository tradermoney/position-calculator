/**
 * 解释资金费率的正负号逻辑
 */

console.log('='.repeat(80));
console.log('资金费率的正负号逻辑说明');
console.log('='.repeat(80));
console.log('');

console.log('📚 基础概念：');
console.log('');
console.log('1. 资金费率的正负号 → 表示支付方向');
console.log('   • 正费率（+）：做多方支付给做空方');
console.log('   • 负费率（-）：做空方支付给做多方');
console.log('');
console.log('2. 成本数值的正负号 → 表示收支性质');
console.log('   • 正值（+）：支出（你要付钱）');
console.log('   • 负值（-）：收入（你能收钱）');
console.log('');

console.log('='.repeat(80));
console.log('情景演示：仓位10000 USDT，持有1个周期');
console.log('='.repeat(80));
console.log('');

const positionSize = 10000;
const periods = 1;

// 情景1：正费率
console.log('【情景1】费率 = +0.01%（正费率）');
console.log('-'.repeat(80));
const rate1 = 0.0001; // 0.01%
const longCost1 = positionSize * rate1 * periods;
const shortCost1 = positionSize * (-rate1) * periods;

console.log('  资金费率：+0.01%（正数）');
console.log('  ├─ 含义：做多方支付给做空方');
console.log('  └─ 标签：做多付费（红色）');
console.log('');
console.log('  做多仓位成本：');
console.log(`  ├─ 计算：10000 × 0.0001 × 1 = ${longCost1.toFixed(2)} USDT`);
console.log(`  ├─ 显示：+${longCost1.toFixed(2)} USDT（正数）`);
console.log('  ├─ 含义：支出（你需要付出1 USDT）');
console.log('  └─ ✅ 逻辑：费率为正→做多付费→成本为正（支出）');
console.log('');
console.log('  做空仓位成本：');
console.log(`  ├─ 计算：10000 × (-0.0001) × 1 = ${shortCost1.toFixed(2)} USDT`);
console.log(`  ├─ 显示：${shortCost1.toFixed(2)} USDT（负数）`);
console.log('  ├─ 含义：收入（你能收到1 USDT）');
console.log('  └─ ✅ 逻辑：费率为正→做空收费→成本为负（收入）');
console.log('');

// 情景2：负费率
console.log('【情景2】费率 = -0.01%（负费率）');
console.log('-'.repeat(80));
const rate2 = -0.0001; // -0.01%
const longCost2 = positionSize * rate2 * periods;
const shortCost2 = positionSize * (-rate2) * periods;

console.log('  资金费率：-0.01%（负数）');
console.log('  ├─ 含义：做空方支付给做多方');
console.log('  └─ 标签：做空付费（绿色）');
console.log('');
console.log('  做多仓位成本：');
console.log(`  ├─ 计算：10000 × (-0.0001) × 1 = ${longCost2.toFixed(2)} USDT`);
console.log(`  ├─ 显示：${longCost2.toFixed(2)} USDT（负数）`);
console.log('  ├─ 含义：收入（你能收到1 USDT）');
console.log('  └─ ✅ 逻辑：费率为负→做多收费→成本为负（收入）');
console.log('');
console.log('  做空仓位成本：');
console.log(`  ├─ 计算：10000 × (0.0001) × 1 = ${shortCost2.toFixed(2)} USDT`);
console.log(`  ├─ 显示：+${shortCost2.toFixed(2)} USDT（正数）`);
console.log('  ├─ 含义：支出（你需要付出1 USDT）');
console.log('  └─ ✅ 逻辑：费率为负→做空付费→成本为正（支出）');
console.log('');

// 您的实际例子
console.log('【您的实际例子】ASTERUSDT');
console.log('-'.repeat(80));
const actualRate = 0.000072; // 0.0072%
const actualPosition = 10000;
const actualPeriods = 1;
const actualCost = actualPosition * actualRate * actualPeriods;

console.log('  资金费率：+0.0072%（正数）← 费率符号');
console.log('  ├─ 含义：做多方支付给做空方');
console.log('  └─ 页面标签：「做多付费」');
console.log('');
console.log('  您的做多仓位：10000 USDT');
console.log('  持有1个周期（约4小时）');
console.log('');
console.log('  计算过程：');
console.log(`  成本 = 10000 × 0.000072 × 1 = ${actualCost.toFixed(4)} USDT`);
console.log('');
console.log('  页面显示：');
console.log(`  ├─ 做多仓位资金费用：+${actualCost.toFixed(2)} USDT ← 成本符号`);
console.log('  └─ 含义：正数 = 支出（你要付出约0.72 USDT）');
console.log('');
console.log('  ✅ 结论：');
console.log('     • 费率是正的（+0.0072%）→ 表示做多方支付');
console.log('     • 成本是正的（+0.72 USDT）→ 表示这是支出');
console.log('     • 两个正号含义不同，但逻辑完全正确！');
console.log('');

console.log('='.repeat(80));
console.log('📖 总结：为什么都是正数？');
console.log('='.repeat(80));
console.log('');
console.log('这是两个不同维度的"正负号"：');
console.log('');
console.log('1️⃣  费率的正负（+0.0072%）');
console.log('   ↓');
console.log('   告诉你：谁支付给谁');
console.log('   • 正 → 多方付给空方');
console.log('   • 负 → 空方付给多方');
console.log('');
console.log('2️⃣  成本的正负（+0.72 USDT）');
console.log('   ↓');
console.log('   告诉你：是支出还是收入');
console.log('   • 正 → 支出（钱出去）');
console.log('   • 负 → 收入（钱进来）');
console.log('');
console.log('完整链条：');
console.log('  费率 +0.0072% → 做多方支付 → 对你来说是支出 → 成本 +0.72 USDT');
console.log('  ~~~~~~~~~~~~~~~~   ~~~~~~~~~~   ~~~~~~~~~~~~   ~~~~~~~~~~~~~~~');
console.log('  ↑方向符号          ↑含义        ↑收支性质       ↑金额符号');
console.log('');
console.log('如果费率变成负数：');
console.log('  费率 -0.0072% → 做空方支付 → 对你来说是收入 → 成本 -0.72 USDT');
console.log('  ~~~~~~~~~~~~~~~~   ~~~~~~~~~~   ~~~~~~~~~~~~   ~~~~~~~~~~~~~~~');
console.log('  ↑方向符号          ↑含义        ↑收支性质       ↑金额符号');
console.log('');
console.log('='.repeat(80));
console.log('✅ 计算完全正确！');
console.log('='.repeat(80));


