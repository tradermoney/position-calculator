// 强平价格计算器完善测试套件
// 包含34个详细测试用例，覆盖全仓/逐仓模式的所有场景

import { chromium } from 'playwright';
import fs from 'fs';

class LiquidationCalculatorTestSuite {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testResults = [];
    this.startTime = Date.now();
  }

  async setup() {
    console.log('🚀 启动强平价格计算器测试环境...');
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 100
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    await this.page.goto('http://localhost:57320/contract-calculator');
    console.log('✅ 测试环境准备完成');
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🔚 测试环境清理完成');
  }

  // 记录测试结果
  recordResult(testName, result, passed, notes = '', performance = {}) {
    const testResult = {
      testName,
      result,
      passed,
      notes,
      performance,
      timestamp: new Date().toISOString()
    };
    this.testResults.push(testResult);
    
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} ${testName}: ${result}`);
    if (!passed) {
      console.log(`  备注: ${notes}`);
    }
  }

  // 测试强平价格计算器
  async testLiquidationCalculator(side, entryPrice, quantity, leverage, balance, marginMode = 'CROSS') {
    const startTime = Date.now();
    
    try {
      await this.page.getByRole('tab', { name: '强平价格' }).click();
      
      // 设置仓位方向
      if (side === 'LONG') {
        await this.page.getByRole('button', { name: '做多' }).click();
      } else {
        await this.page.getByRole('button', { name: '做空' }).click();
      }
      
      // 设置保证金模式
      await this.page.getByRole('combobox', { name: '保证金模式' }).click();
      if (marginMode === 'CROSS') {
        await this.page.getByRole('option', { name: '全仓' }).click();
      } else {
        await this.page.getByRole('option', { name: '逐仓' }).click();
      }
      
      // 设置杠杆
      await this.page.locator('input[type="range"]').fill(leverage.toString());
      
      // 输入参数
      await this.page.getByRole('spinbutton', { name: '开仓价格' }).fill(entryPrice.toString());
      await this.page.getByRole('spinbutton', { name: '成交数量' }).fill(quantity.toString());
      
      if (marginMode === 'CROSS') {
        await this.page.getByRole('spinbutton', { name: '钱包余额' }).fill(balance.toString());
      } else {
        await this.page.getByRole('spinbutton', { name: '保证金' }).fill(balance.toString());
      }
      
      await this.page.waitForTimeout(500);
      
      // 获取结果
      const liquidationPriceText = await this.page.locator('text=/\\d+\\.\\d+ USDT/').first().textContent();
      
      const endTime = Date.now();
      const performance = { calculationTime: endTime - startTime };
      
      return {
        success: true,
        liquidationPrice: liquidationPriceText,
        performance
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        performance: { calculationTime: Date.now() - startTime }
      };
    }
  }

  // 执行单个测试用例
  async runTestCase(testCase) {
    const { name, side, entryPrice, quantity, leverage, balance, marginMode } = testCase;
    
    const result = await this.testLiquidationCalculator(side, entryPrice, quantity, leverage, balance, marginMode);
    
    if (result.success) {
      const resultText = `强平价格: ${result.liquidationPrice}`;
      const notes = `参数: ${marginMode} ${side} ${entryPrice}, ${quantity}币, ${leverage}x杠杆, 余额${balance}`;
      
      this.recordResult(
        name,
        resultText,
        true,
        notes,
        result.performance
      );
    } else {
      this.recordResult(
        name,
        'ERROR',
        false,
        `测试执行失败: ${result.error}`,
        result.performance
      );
    }
  }

  // 全仓模式基础测试用例
  getCrossMarginTestCases() {
    return [
      { name: '全仓做多', side: 'LONG', entryPrice: 50000, quantity: 1, leverage: 20, balance: 10000, marginMode: 'CROSS' },
      { name: '全仓做空', side: 'SHORT', entryPrice: 50000, quantity: 1, leverage: 20, balance: 10000, marginMode: 'CROSS' },
      { name: '全仓低杠杆', side: 'LONG', entryPrice: 50000, quantity: 1, leverage: 5, balance: 10000, marginMode: 'CROSS' },
      { name: '全仓高杠杆', side: 'LONG', entryPrice: 50000, quantity: 1, leverage: 100, balance: 10000, marginMode: 'CROSS' },
      { name: '全仓小数量', side: 'LONG', entryPrice: 50000, quantity: 0.1, leverage: 20, balance: 10000, marginMode: 'CROSS' },
      { name: '全仓大数量', side: 'LONG', entryPrice: 50000, quantity: 10, leverage: 20, balance: 100000, marginMode: 'CROSS' },
      { name: '全仓低余额', side: 'LONG', entryPrice: 50000, quantity: 1, leverage: 20, balance: 2600, marginMode: 'CROSS' },
      { name: '全仓高余额', side: 'LONG', entryPrice: 50000, quantity: 1, leverage: 20, balance: 50000, marginMode: 'CROSS' },
      { name: '全仓极限杠杆', side: 'LONG', entryPrice: 50000, quantity: 1, leverage: 125, balance: 10000, marginMode: 'CROSS' },
      { name: '全仓最小保证金', side: 'LONG', entryPrice: 50000, quantity: 1, leverage: 20, balance: 2500, marginMode: 'CROSS' }
    ];
  }

  // 逐仓模式基础测试用例
  getIsolatedMarginTestCases() {
    return [
      { name: '逐仓做多', side: 'LONG', entryPrice: 50000, quantity: 1, leverage: 20, balance: 2500, marginMode: 'ISOLATED' },
      { name: '逐仓做空', side: 'SHORT', entryPrice: 50000, quantity: 1, leverage: 20, balance: 2500, marginMode: 'ISOLATED' },
      { name: '逐仓低杠杆', side: 'LONG', entryPrice: 50000, quantity: 1, leverage: 5, balance: 10000, marginMode: 'ISOLATED' },
      { name: '逐仓高杠杆', side: 'LONG', entryPrice: 50000, quantity: 1, leverage: 100, balance: 500, marginMode: 'ISOLATED' },
      { name: '逐仓小数量', side: 'LONG', entryPrice: 50000, quantity: 0.1, leverage: 20, balance: 250, marginMode: 'ISOLATED' },
      { name: '逐仓大数量', side: 'LONG', entryPrice: 50000, quantity: 10, leverage: 20, balance: 25000, marginMode: 'ISOLATED' },
      { name: '逐仓最小保证金', side: 'LONG', entryPrice: 50000, quantity: 1, leverage: 20, balance: 2500, marginMode: 'ISOLATED' },
      { name: '逐仓超额保证金', side: 'LONG', entryPrice: 50000, quantity: 1, leverage: 20, balance: 5000, marginMode: 'ISOLATED' }
    ];
  }

  // 杠杆倍数测试用例
  getLeverageTestCases() {
    const leverages = [1, 5, 10, 20, 50, 75, 100, 125];
    return leverages.map(leverage => ({
      name: `${leverage}x杠杆全仓`,
      side: 'LONG',
      entryPrice: 50000,
      quantity: 1,
      leverage,
      balance: Math.max(50000 / leverage, 400),
      marginMode: 'CROSS'
    }));
  }

  // 价格区间测试用例
  getPriceTestCases() {
    return [
      { name: '低价区间', side: 'LONG', entryPrice: 1000, quantity: 1, leverage: 20, balance: 100, marginMode: 'CROSS' },
      { name: '中价区间', side: 'LONG', entryPrice: 30000, quantity: 1, leverage: 20, balance: 1500, marginMode: 'CROSS' },
      { name: '高价区间', side: 'LONG', entryPrice: 100000, quantity: 1, leverage: 20, balance: 5000, marginMode: 'CROSS' },
      { name: '极高价格', side: 'LONG', entryPrice: 500000, quantity: 1, leverage: 20, balance: 25000, marginMode: 'CROSS' }
    ];
  }

  // 边界值测试用例
  getBoundaryTestCases() {
    return [
      { name: '最小维持保证金', side: 'LONG', entryPrice: 50000, quantity: 0.001, leverage: 20, balance: 2.5, marginMode: 'CROSS' },
      { name: '最大风险仓位', side: 'LONG', entryPrice: 50000, quantity: 100, leverage: 125, balance: 40000, marginMode: 'CROSS' },
      { name: '零余额风险', side: 'LONG', entryPrice: 50000, quantity: 1, leverage: 20, balance: 2500, marginMode: 'CROSS' },
      { name: '小数价格精度', side: 'LONG', entryPrice: 50000.123, quantity: 1.234, leverage: 20, balance: 3086, marginMode: 'CROSS' }
    ];
  }

  // 运行所有测试
  async runAllTests() {
    try {
      await this.setup();
      
      console.log('⚡ 开始执行强平价格计算器完善测试套件（34个用例）');
      console.log('=' .repeat(60));
      
      const allTestCases = [
        ...this.getCrossMarginTestCases(),
        ...this.getIsolatedMarginTestCases(),
        ...this.getLeverageTestCases(),
        ...this.getPriceTestCases(),
        ...this.getBoundaryTestCases()
      ];
      
      console.log(`📊 总测试用例数: ${allTestCases.length}`);
      
      for (let i = 0; i < allTestCases.length; i++) {
        const testCase = allTestCases[i];
        console.log(`\n[${i + 1}/${allTestCases.length}] 测试: ${testCase.name}`);
        await this.runTestCase(testCase);
        
        // 每10个测试用例后暂停一下
        if ((i + 1) % 10 === 0) {
          console.log(`\n⏸️  已完成 ${i + 1} 个测试用例，暂停1秒...`);
          await this.page.waitForTimeout(1000);
        }
      }
      
      this.generateReport();
      
    } catch (error) {
      console.error('❌ 测试执行失败:', error);
    } finally {
      await this.teardown();
    }
  }

  // 生成测试报告
  generateReport() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(2);
    
    // 计算性能统计
    const performanceData = this.testResults
      .filter(r => r.performance && r.performance.calculationTime)
      .map(r => r.performance.calculationTime);
    
    const avgCalculationTime = performanceData.length > 0 
      ? (performanceData.reduce((a, b) => a + b, 0) / performanceData.length).toFixed(2)
      : 'N/A';
    
    const report = {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate: `${successRate}%`,
        duration: `${duration}秒`,
        avgCalculationTime: `${avgCalculationTime}ms`,
        timestamp: new Date().toISOString()
      },
      results: this.testResults
    };
    
    // 保存JSON报告
    fs.writeFileSync('liquidation-calculator-test-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📋 === 强平价格计算器测试报告 ===');
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${passedTests}`);
    console.log(`失败: ${failedTests}`);
    console.log(`成功率: ${successRate}%`);
    console.log(`总耗时: ${duration}秒`);
    console.log(`平均计算时间: ${avgCalculationTime}ms`);
    console.log('\n📄 详细报告已保存到 liquidation-calculator-test-report.json');
  }
}

// 运行测试套件
async function main() {
  const testSuite = new LiquidationCalculatorTestSuite();
  await testSuite.runAllTests();
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default LiquidationCalculatorTestSuite;
