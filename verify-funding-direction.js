/**
 * 验证资金费率计算方向
 * 使用真实的BTCUSDT数据
 */

async function verifyFundingDirection() {
  const BINANCE_API_BASE = 'https://fapi.binance.com';
  
  console.log('=' .repeat(70));
  console.log('资金费率方向验证 - 使用真实 BTCUSDT 数据');
  console.log('='.repeat(70));
  console.log('');

  // 1. 获取当前资金费率
  console.log('📊 第1步：获取BTCUSDT当前资金费率...');
  const premiumResponse = await fetch(`${BINANCE_API_BASE}/fapi/v1/premiumIndex?symbol=BTCUSDT`);
  const premiumData = await premiumResponse.json();
  
  const currentRate = parseFloat(premiumData.lastFundingRate);
  const nextFundingTime = new Date(premiumData.nextFundingTime);
  
  console.log(`  当前资金费率: ${(currentRate * 100).toFixed(4)}%`);
  console.log(`  原始数值: ${currentRate}`);
  console.log(`  下次结算时间: ${nextFundingTime.toLocaleString('zh-CN')}`);
  
  if (currentRate > 0) {
    console.log(`  ✅ 正费率 → 做多方支付给做空方`);
  } else {
    console.log(`  ✅ 负费率 → 做空方支付给做多方`);
  }
  console.log('');

  // 2. 获取最近7天的历史数据
  console.log('📊 第2步：获取最近7天历史数据...');
  const endTime = Date.now();
  const startTime = endTime - 7 * 24 * 60 * 60 * 1000;
  
  const historyResponse = await fetch(
    `${BINANCE_API_BASE}/fapi/v1/fundingRate?symbol=BTCUSDT&startTime=${startTime}&endTime=${endTime}&limit=100`
  );
  const historyData = await historyResponse.json();
  
  console.log(`  获取到 ${historyData.length} 条历史记录`);
  
  // 计算平均费率
  const rates = historyData.map(d => parseFloat(d.fundingRate));
  const avgRate = rates.reduce((sum, r) => sum + r, 0) / rates.length;
  
  console.log(`  最近7天平均费率: ${(avgRate * 100).toFixed(4)}%`);
  console.log(`  原始数值: ${avgRate}`);
  
  // 统计正负费率
  const positiveCount = rates.filter(r => r > 0).length;
  const negativeCount = rates.filter(r => r < 0).length;
  console.log(`  正费率次数: ${positiveCount} 次（做多付费）`);
  console.log(`  负费率次数: ${negativeCount} 次（做空付费）`);
  console.log('');

  // 3. 模拟计算
  console.log('💰 第3步：模拟计算资金费用...');
  console.log('');
  
  // 假设参数
  const longPositionSize = 10000; // 做多10000 USDT
  const shortPositionSize = 0;    // 不做空
  const holdingHours = 168;       // 持有7天（168小时）
  const periods = Math.ceil(holdingHours / 8); // 21个周期（每8小时一次）
  
  console.log('  假设条件：');
  console.log(`    做多仓位: ${longPositionSize} USDT`);
  console.log(`    做空仓位: ${shortPositionSize} USDT`);
  console.log(`    持有时间: ${holdingHours} 小时（${holdingHours/24}天）`);
  console.log(`    资金费率周期: ${periods} 个`);
  console.log(`    使用费率: ${(avgRate * 100).toFixed(4)}% (7天平均)`);
  console.log('');

  // 计算做多成本
  const longCost = longPositionSize * avgRate * periods;
  
  console.log('  计算过程：');
  console.log(`    做多成本 = 仓位 × 费率 × 周期数`);
  console.log(`    做多成本 = ${longPositionSize} × ${avgRate} × ${periods}`);
  console.log(`    做多成本 = ${longCost.toFixed(2)} USDT`);
  console.log('');

  // 解释
  console.log('  📖 结果解读：');
  if (avgRate > 0) {
    console.log(`    ✅ 平均费率为正（${(avgRate * 100).toFixed(4)}%）`);
    console.log(`    ✅ 做多方需要支付资金费`);
    if (longCost > 0) {
      console.log(`    ✅ 成本为正值（+${longCost.toFixed(2)} USDT）表示支出 ← 正确`);
      console.log(`    ✅ 这意味着持有7天需要支付约 ${longCost.toFixed(2)} USDT 的资金费`);
    } else {
      console.log(`    ❌ 成本应该是正值，但计算出负值 ← 错误！`);
    }
  } else {
    console.log(`    ✅ 平均费率为负（${(avgRate * 100).toFixed(4)}%）`);
    console.log(`    ✅ 做多方可以获得资金费`);
    if (longCost < 0) {
      console.log(`    ✅ 成本为负值（${longCost.toFixed(2)} USDT）表示收入 ← 正确`);
      console.log(`    ✅ 这意味着持有7天可以获得约 ${Math.abs(longCost).toFixed(2)} USDT 的资金费`);
    } else {
      console.log(`    ❌ 成本应该是负值，但计算出正值 ← 错误！`);
    }
  }
  console.log('');

  // 4. 验证单次费率
  console.log('🔍 第4步：验证单次结算的费用...');
  const singlePeriodCost = longPositionSize * avgRate;
  console.log(`  单次结算费用 = ${longPositionSize} × ${avgRate} = ${singlePeriodCost.toFixed(4)} USDT`);
  console.log(`  21次累计 = ${singlePeriodCost.toFixed(4)} × 21 = ${(singlePeriodCost * 21).toFixed(2)} USDT`);
  console.log('');

  // 5. 显示最近几次的实际费率
  console.log('📋 第5步：最近5次实际费率...');
  const recentRates = historyData.slice(-5);
  recentRates.forEach((r, i) => {
    const rate = parseFloat(r.fundingRate);
    const time = new Date(r.fundingTime).toLocaleString('zh-CN');
    const cost = longPositionSize * rate;
    console.log(`  ${i+1}. ${time}`);
    console.log(`     费率: ${(rate * 100).toFixed(4)}% | 单次成本: ${cost > 0 ? '+' : ''}${cost.toFixed(4)} USDT`);
  });
  console.log('');

  console.log('='.repeat(70));
  console.log('结论：');
  console.log('='.repeat(70));
  console.log('');
  console.log('当前计算逻辑：');
  console.log('  做多成本 = 仓位大小 × 资金费率 × 周期数');
  console.log('  做空成本 = 仓位大小 × (-资金费率) × 周期数');
  console.log('');
  console.log('这个逻辑：');
  if (avgRate > 0 && longCost > 0) {
    console.log('  ✅ 正费率时，做多成本为正（支出） - 符合规则');
  } else if (avgRate < 0 && longCost < 0) {
    console.log('  ✅ 负费率时，做多成本为负（收入） - 符合规则');
  } else {
    console.log('  ❌ 计算结果与费率方向不符 - 存在问题');
  }
  console.log('');
}

verifyFundingDirection().catch(console.error);


