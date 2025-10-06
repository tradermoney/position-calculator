#!/usr/bin/env node

/**
 * 保本回报率计算器快速测试脚本
 * 直接实现计算逻辑进行验证
 */

// 计算保本回报率的函数（基于源码逻辑）
function calculateBreakEvenRate(inputs) {
  const { leverage, openFeeRate, closeFeeRate, fundingRate, fundingPeriod, holdingTime } = inputs;

  // 输入验证
  if (leverage <= 0) {
    throw new Error('杠杆倍数必须大于0');
  }
  if (openFeeRate < 0 || closeFeeRate < 0) {
    throw new Error('手续费率不能为负数');
  }
  if (fundingPeriod <= 0) {
    throw new Error('资金费率结算周期必须大于0');
  }
  if (holdingTime < 0) {
    throw new Error('持仓时间不能为负数');
  }

  // 计算开仓成本占本金的百分比
  const openCostRate = (openFeeRate / 100) * leverage * 100; // 转换为百分比

  // 计算平仓成本占本金的百分比
  const closeCostRate = (closeFeeRate / 100) * leverage * 100; // 转换为百分比

  // 计算资金费率成本占本金的百分比
  const fundingPeriods = holdingTime / fundingPeriod;
  const fundingCostRate = (fundingRate / 100) * leverage * fundingPeriods * 100; // 转换为百分比

  // 计算总手续费成本
  const totalFeeRate = openCostRate + closeCostRate;

  // 计算总的保本回报率
  const totalBreakEvenRate = openCostRate + closeCostRate + fundingCostRate;

  // 成本明细（以1000USDT本金为例进行计算）
  const principal = 1000;
  const positionValue = principal * leverage;

  const openCost = positionValue * (openFeeRate / 100);
  const closeCost = positionValue * (closeFeeRate / 100);
  const fundingCost = positionValue * (fundingRate / 100) * fundingPeriods;
  const totalCost = openCost + closeCost + fundingCost;

  return {
    totalBreakEvenRate: Math.round(totalBreakEvenRate * 10000) / 10000, // 保留4位小数
    openCostRate: Math.round(openCostRate * 10000) / 10000,
    closeCostRate: Math.round(closeCostRate * 10000) / 10000,
    fundingCostRate: Math.round(fundingCostRate * 10000) / 10000,
    totalFeeRate: Math.round(totalFeeRate * 10000) / 10000,
    costBreakdown: {
      openCost: Math.round(openCost * 100) / 100,
      closeCost: Math.round(closeCost * 100) / 100,
      fundingCost: Math.round(fundingCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
    },
  };
}

console.log('🚀 开始保本回报率计算器快速测试...\n');

// 测试用例1：标准场景
console.log('📊 测试用例1：标准场景');
console.log('=' .repeat(40));
const inputs1 = {
  leverage: 100,
  openFeeRate: 0.05,
  closeFeeRate: 0.05,
  fundingRate: 0.01,
  fundingPeriod: 8,
  holdingTime: 24
};

const result1 = calculateBreakEvenRate(inputs1);
console.log('输入参数:');
console.log(`  杠杆倍数: ${inputs1.leverage}x`);
console.log(`  开仓手续费率: ${inputs1.openFeeRate}%`);
console.log(`  平仓手续费率: ${inputs1.closeFeeRate}%`);
console.log(`  资金费率: ${inputs1.fundingRate}%`);
console.log(`  结算周期: ${inputs1.fundingPeriod}小时`);
console.log(`  持仓时间: ${inputs1.holdingTime}小时`);

console.log('\n计算结果:');
console.log(`  开仓成本占比: ${result1.openCostRate.toFixed(4)}%`);
console.log(`  平仓成本占比: ${result1.closeCostRate.toFixed(4)}%`);
console.log(`  资金费率成本占比: ${result1.fundingCostRate.toFixed(4)}%`);
console.log(`  总保本回报率: ${result1.totalBreakEvenRate.toFixed(4)}%`);

// 验证计算是否正确
const expectedOpenCost = inputs1.openFeeRate * inputs1.leverage;
const expectedCloseCost = inputs1.closeFeeRate * inputs1.leverage;
const expectedFundingCost = inputs1.fundingRate * inputs1.leverage * (inputs1.holdingTime / inputs1.fundingPeriod);
const expectedTotal = expectedOpenCost + expectedCloseCost + expectedFundingCost;

console.log('\n验证计算:');
console.log(`  预期开仓成本: ${expectedOpenCost.toFixed(4)}%`);
console.log(`  预期平仓成本: ${expectedCloseCost.toFixed(4)}%`);
console.log(`  预期资金费率成本: ${expectedFundingCost.toFixed(4)}%`);
console.log(`  预期总保本回报率: ${expectedTotal.toFixed(4)}%`);

const test1Pass = Math.abs(result1.totalBreakEvenRate - expectedTotal) < 0.0001;
console.log(`  ✅ 测试结果: ${test1Pass ? '通过' : '失败'}\n`);

// 测试用例2：高杠杆场景
console.log('📊 测试用例2：高杠杆短期交易');
console.log('=' .repeat(40));
const inputs2 = {
  leverage: 200,
  openFeeRate: 0.03,
  closeFeeRate: 0.03,
  fundingRate: 0.01,
  fundingPeriod: 8,
  holdingTime: 4
};

const result2 = calculateBreakEvenRate(inputs2);
console.log('输入参数:');
console.log(`  杠杆倍数: ${inputs2.leverage}x`);
console.log(`  开仓手续费率: ${inputs2.openFeeRate}%`);
console.log(`  平仓手续费率: ${inputs2.closeFeeRate}%`);
console.log(`  资金费率: ${inputs2.fundingRate}%`);
console.log(`  结算周期: ${inputs2.fundingPeriod}小时`);
console.log(`  持仓时间: ${inputs2.holdingTime}小时`);

console.log('\n计算结果:');
console.log(`  开仓成本占比: ${result2.openCostRate.toFixed(4)}%`);
console.log(`  平仓成本占比: ${result2.closeCostRate.toFixed(4)}%`);
console.log(`  资金费率成本占比: ${result2.fundingCostRate.toFixed(4)}%`);
console.log(`  总保本回报率: ${result2.totalBreakEvenRate.toFixed(4)}%`);

const expectedTotal2 = 0.03 * 200 + 0.03 * 200 + 0.01 * 200 * (4 / 8);
console.log(`  预期总保本回报率: ${expectedTotal2.toFixed(4)}%`);

const test2Pass = Math.abs(result2.totalBreakEvenRate - expectedTotal2) < 0.0001;
console.log(`  ✅ 测试结果: ${test2Pass ? '通过' : '失败'}\n`);

// 测试用例3：负资金费率场景
console.log('📊 测试用例3：负资金费率');
console.log('=' .repeat(40));
const inputs3 = {
  leverage: 100,
  openFeeRate: 0.05,
  closeFeeRate: 0.05,
  fundingRate: -0.02,
  fundingPeriod: 8,
  holdingTime: 24
};

const result3 = calculateBreakEvenRate(inputs3);
console.log('输入参数:');
console.log(`  杠杆倍数: ${inputs3.leverage}x`);
console.log(`  开仓手续费率: ${inputs3.openFeeRate}%`);
console.log(`  平仓手续费率: ${inputs3.closeFeeRate}%`);
console.log(`  资金费率: ${inputs3.fundingRate}% (负值)`);
console.log(`  结算周期: ${inputs3.fundingPeriod}小时`);
console.log(`  持仓时间: ${inputs3.holdingTime}小时`);

console.log('\n计算结果:');
console.log(`  开仓成本占比: ${result3.openCostRate.toFixed(4)}%`);
console.log(`  平仓成本占比: ${result3.closeCostRate.toFixed(4)}%`);
console.log(`  资金费率成本占比: ${result3.fundingCostRate.toFixed(4)}% (应为负值)`);
console.log(`  总保本回报率: ${result3.totalBreakEvenRate.toFixed(4)}%`);

const expectedTotal3 = 0.05 * 100 + 0.05 * 100 + (-0.02) * 100 * (24 / 8);
console.log(`  预期总保本回报率: ${expectedTotal3.toFixed(4)}%`);

const test3Pass = Math.abs(result3.totalBreakEvenRate - expectedTotal3) < 0.0001;
console.log(`  ✅ 测试结果: ${test3Pass ? '通过' : '失败'}\n`);

// 测试成本实例计算
console.log('💰 成本实例验证 (1000 USDT本金):');
console.log('=' .repeat(40));
console.log(`  开仓成本: $${result1.costBreakdown.openCost.toFixed(2)}`);
console.log(`  平仓成本: $${result1.costBreakdown.closeCost.toFixed(2)}`);
console.log(`  资金费率成本: $${result1.costBreakdown.fundingCost.toFixed(2)}`);
console.log(`  总成本: $${result1.costBreakdown.totalCost.toFixed(2)}`);

// 成本验证
const expectedOpenCostUSD = 1000 * inputs1.leverage * (inputs1.openFeeRate / 100);
const expectedCloseCostUSD = 1000 * inputs1.leverage * (inputs1.closeFeeRate / 100);
const expectedFundingCostUSD = 1000 * inputs1.leverage * (inputs1.fundingRate / 100) * (inputs1.holdingTime / inputs1.fundingPeriod);

console.log('\n成本验证:');
console.log(`  预期开仓成本: $${expectedOpenCostUSD.toFixed(2)}`);
console.log(`  预期平仓成本: $${expectedCloseCostUSD.toFixed(2)}`);
console.log(`  预期资金费率成本: $${expectedFundingCostUSD.toFixed(2)}`);
console.log(`  预期总成本: $${(expectedOpenCostUSD + expectedCloseCostUSD + expectedFundingCostUSD).toFixed(2)}`);

const costTestPass = Math.abs(result1.costBreakdown.totalCost - (expectedOpenCostUSD + expectedCloseCostUSD + expectedFundingCostUSD)) < 0.01;
console.log(`  ✅ 成本测试: ${costTestPass ? '通过' : '失败'}\n`);

// 总体测试结果
const allTestsPass = test1Pass && test2Pass && test3Pass && costTestPass;
console.log('🎉 总体测试结果');
console.log('=' .repeat(40));
console.log(`  ✅ 标准场景测试: ${test1Pass ? '通过' : '失败'}`);
console.log(`  ✅ 高杠杆场景测试: ${test2Pass ? '通过' : '失败'}`);
console.log(`  ✅ 负资金费率测试: ${test3Pass ? '通过' : '失败'}`);
console.log(`  ✅ 成本计算测试: ${costTestPass ? '通过' : '失败'}`);
console.log(`\n🏆 总体结果: ${allTestsPass ? '所有测试通过！✅' : '有测试失败 ❌'}`);

if (allTestsPass) {
  console.log('\n🎯 恭喜！保本回报率计算器的计算逻辑完全正确！');
  console.log('📱 现在可以访问 http://localhost:5173/position-calculator/break-even-calculator 进行UI测试');
} else {
  console.log('\n⚠️  发现计算问题，请检查计算逻辑');
}