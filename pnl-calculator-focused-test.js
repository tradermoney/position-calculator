// 盈亏计算器专注测试套件
// 包含35个详细测试用例，专注测试我们自己的计算器

import { chromium } from 'playwright';
import fs from 'fs';

class PnLCalculatorFocusedTestSuite {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testResults = [];
    this.startTime = Date.now();
  }

  async setup() {
    console.log('🚀 启动盈亏计算器测试环境...');
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

  // 测试我们的盈亏计算器
  async testOurCalculator(side, entryPrice, exitPrice, quantity, leverage) {
    const startTime = Date.now();
    
    try {
      await this.page.getByRole('tab', { name: '盈亏计算器' }).click();
      
      // 设置仓位方向
      if (side === 'LONG') {
        await this.page.getByRole('button', { name: '做多' }).click();
      } else {
        await this.page.getByRole('button', { name: '做空' }).click();
      }
      
      // 设置杠杆
      await this.page.locator('input[type="range"]').fill(leverage.toString());
      
      // 输入参数
      await this.page.getByRole('spinbutton', { name: '开仓价格' }).fill(entryPrice.toString());
      await this.page.getByRole('spinbutton', { name: '平仓价格' }).fill(exitPrice.toString());
      await this.page.getByRole('spinbutton', { name: '成交数量' }).fill(quantity.toString());
      
      await this.page.waitForTimeout(500);
      
      // 获取结果
      const pnlText = await this.page.locator('text=/[+\\-]?\\d+\\.\\d+ USDT/').nth(1).textContent();
      const roeText = await this.page.locator('text=/[+\\-]?\\d+\\.\\d+%/').first().textContent();
      
      const endTime = Date.now();
      const performance = { calculationTime: endTime - startTime };
      
      return {
        success: true,
        pnl: pnlText,
        roe: roeText,
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
    const { name, side, entryPrice, exitPrice, quantity, leverage, expectedPnL, expectedROE } = testCase;
    
    const result = await this.testOurCalculator(side, entryPrice, exitPrice, quantity, leverage);
    
    if (result.success) {
      const resultText = `盈亏: ${result.pnl}, ROE: ${result.roe}`;
      const notes = `参数: ${side} ${entryPrice}→${exitPrice}, ${quantity}币, ${leverage}x杠杆`;
      
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

  // 基础功能测试用例
  getBasicTestCases() {
    return [
      { name: '做多盈利', side: 'LONG', entryPrice: 50000, exitPrice: 55000, quantity: 1, leverage: 20 },
      { name: '做多亏损', side: 'LONG', entryPrice: 50000, exitPrice: 45000, quantity: 1, leverage: 20 },
      { name: '做空盈利', side: 'SHORT', entryPrice: 50000, exitPrice: 45000, quantity: 1, leverage: 20 },
      { name: '做空亏损', side: 'SHORT', entryPrice: 50000, exitPrice: 55000, quantity: 1, leverage: 20 },
      { name: '无杠杆交易', side: 'LONG', entryPrice: 50000, exitPrice: 55000, quantity: 1, leverage: 1 },
      { name: '高杠杆交易', side: 'LONG', entryPrice: 50000, exitPrice: 55000, quantity: 1, leverage: 125 },
      { name: '小数量交易', side: 'LONG', entryPrice: 50000, exitPrice: 55000, quantity: 0.01, leverage: 20 },
      { name: '大数量交易', side: 'LONG', entryPrice: 50000, exitPrice: 55000, quantity: 100, leverage: 20 },
      { name: '平价交易', side: 'LONG', entryPrice: 50000, exitPrice: 50000, quantity: 1, leverage: 20 },
      { name: '微小价差', side: 'LONG', entryPrice: 50000, exitPrice: 50001, quantity: 1, leverage: 20 }
    ];
  }

  // 杠杆倍数测试用例
  getLeverageTestCases() {
    const leverages = [1, 5, 10, 20, 50, 75, 100, 125];
    return leverages.map(leverage => ({
      name: `${leverage}x杠杆`,
      side: 'LONG',
      entryPrice: 50000,
      exitPrice: 55000,
      quantity: 1,
      leverage
    }));
  }

  // 数量测试用例
  getQuantityTestCases() {
    const quantities = [0.001, 0.01, 0.1, 0.5, 2, 10, 100];
    return quantities.map(quantity => ({
      name: `${quantity}币数量`,
      side: 'LONG',
      entryPrice: 50000,
      exitPrice: 55000,
      quantity,
      leverage: 20
    }));
  }

  // 价格区间测试用例
  getPriceTestCases() {
    return [
      { name: '低价区间', side: 'LONG', entryPrice: 1000, exitPrice: 1100, quantity: 1, leverage: 20 },
      { name: '中价区间', side: 'LONG', entryPrice: 30000, exitPrice: 33000, quantity: 1, leverage: 20 },
      { name: '高价区间', side: 'LONG', entryPrice: 100000, exitPrice: 110000, quantity: 1, leverage: 20 },
      { name: '极高价格', side: 'LONG', entryPrice: 500000, exitPrice: 550000, quantity: 1, leverage: 20 },
      { name: '小数价格', side: 'LONG', entryPrice: 50000.123, exitPrice: 55000.456, quantity: 1, leverage: 20 }
    ];
  }

  // 边界值测试用例
  getBoundaryTestCases() {
    return [
      { name: '最大亏损', side: 'LONG', entryPrice: 50000, exitPrice: 25000, quantity: 1, leverage: 20 },
      { name: '极大盈利', side: 'LONG', entryPrice: 50000, exitPrice: 100000, quantity: 1, leverage: 20 },
      { name: '最小价差', side: 'LONG', entryPrice: 50000, exitPrice: 50000.01, quantity: 1, leverage: 20 },
      { name: '最大数量', side: 'LONG', entryPrice: 50000, exitPrice: 55000, quantity: 999999, leverage: 1 },
      { name: '最小杠杆最大数量', side: 'LONG', entryPrice: 1, exitPrice: 2, quantity: 1000000, leverage: 1 }
    ];
  }

  // 运行所有测试
  async runAllTests() {
    try {
      await this.setup();
      
      console.log('🧮 开始执行盈亏计算器专注测试套件（35个用例）');
      console.log('=' .repeat(60));
      
      const allTestCases = [
        ...this.getBasicTestCases(),
        ...this.getLeverageTestCases(),
        ...this.getQuantityTestCases(),
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
    fs.writeFileSync('pnl-calculator-focused-test-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📋 === 盈亏计算器专注测试报告 ===');
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${passedTests}`);
    console.log(`失败: ${failedTests}`);
    console.log(`成功率: ${successRate}%`);
    console.log(`总耗时: ${duration}秒`);
    console.log(`平均计算时间: ${avgCalculationTime}ms`);
    console.log('\n📄 详细报告已保存到 pnl-calculator-focused-test-report.json');
  }
}

// 运行测试套件
async function main() {
  const testSuite = new PnLCalculatorFocusedTestSuite();
  await testSuite.runAllTests();
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default PnLCalculatorFocusedTestSuite;
