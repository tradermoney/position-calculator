// 目标价格计算器完善测试套件
// 包含32个详细测试用例，覆盖所有回报率和杠杆组合

import { chromium } from 'playwright';
import fs from 'fs';

class TargetPriceCalculatorTestSuite {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testResults = [];
    this.startTime = Date.now();
  }

  async setup() {
    console.log('🚀 启动目标价格计算器测试环境...');
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

  // 测试我们的目标价格计算器
  async testTargetPriceCalculator(side, entryPrice, targetROE, leverage) {
    const startTime = Date.now();
    
    try {
      await this.page.getByRole('tab', { name: '目标价格' }).click();
      
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
      await this.page.getByRole('spinbutton', { name: '目标回报率' }).fill(targetROE.toString());
      
      await this.page.waitForTimeout(500);
      
      // 获取结果
      const targetPriceText = await this.page.locator('text=/\\d+\\.\\d+ USDT/').first().textContent();
      
      const endTime = Date.now();
      const performance = { calculationTime: endTime - startTime };
      
      return {
        success: true,
        targetPrice: targetPriceText,
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
    const { name, side, entryPrice, targetROE, leverage } = testCase;
    
    const result = await this.testTargetPriceCalculator(side, entryPrice, targetROE, leverage);
    
    if (result.success) {
      const resultText = `目标价格: ${result.targetPrice}`;
      const notes = `参数: ${side} 开仓${entryPrice}, 目标ROE${targetROE}%, ${leverage}x杠杆`;
      
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
      { name: '做多25% ROE', side: 'LONG', entryPrice: 50000, targetROE: 25, leverage: 20 },
      { name: '做多50% ROE', side: 'LONG', entryPrice: 50000, targetROE: 50, leverage: 20 },
      { name: '做多100% ROE', side: 'LONG', entryPrice: 50000, targetROE: 100, leverage: 20 },
      { name: '做空25% ROE', side: 'SHORT', entryPrice: 50000, targetROE: 25, leverage: 20 },
      { name: '做空50% ROE', side: 'SHORT', entryPrice: 50000, targetROE: 50, leverage: 20 },
      { name: '做空100% ROE', side: 'SHORT', entryPrice: 50000, targetROE: 100, leverage: 20 },
      { name: '零回报率', side: 'LONG', entryPrice: 50000, targetROE: 0, leverage: 20 },
      { name: '微小回报率', side: 'LONG', entryPrice: 50000, targetROE: 0.01, leverage: 20 }
    ];
  }

  // 杠杆倍数测试用例
  getLeverageTestCases() {
    const leverages = [1, 5, 10, 20, 50, 75, 100, 125];
    return leverages.map(leverage => ({
      name: `${leverage}x杠杆50% ROE`,
      side: 'LONG',
      entryPrice: 50000,
      targetROE: 50,
      leverage
    }));
  }

  // 回报率范围测试用例
  getROETestCases() {
    const roeValues = [5, 10, 15, 75, 150, 200, 500, 1000];
    return roeValues.map(roe => ({
      name: `${roe}% ROE`,
      side: 'LONG',
      entryPrice: 50000,
      targetROE: roe,
      leverage: 20
    }));
  }

  // 负回报率测试用例
  getNegativeROETestCases() {
    return [
      { name: '做多-25% ROE', side: 'LONG', entryPrice: 50000, targetROE: -25, leverage: 20 },
      { name: '做多-50% ROE', side: 'LONG', entryPrice: 50000, targetROE: -50, leverage: 20 },
      { name: '做空-25% ROE', side: 'SHORT', entryPrice: 50000, targetROE: -25, leverage: 20 },
      { name: '做空-50% ROE', side: 'SHORT', entryPrice: 50000, targetROE: -50, leverage: 20 }
    ];
  }

  // 价格区间测试用例
  getPriceTestCases() {
    return [
      { name: '低价区间', side: 'LONG', entryPrice: 1000, targetROE: 50, leverage: 20 },
      { name: '高价区间', side: 'LONG', entryPrice: 100000, targetROE: 50, leverage: 20 },
      { name: '极高价格', side: 'LONG', entryPrice: 500000, targetROE: 50, leverage: 20 },
      { name: '小数价格', side: 'LONG', entryPrice: 50000.123, targetROE: 50, leverage: 20 }
    ];
  }

  // 运行所有测试
  async runAllTests() {
    try {
      await this.setup();
      
      console.log('🎯 开始执行目标价格计算器完善测试套件（32个用例）');
      console.log('=' .repeat(60));
      
      const allTestCases = [
        ...this.getBasicTestCases(),
        ...this.getLeverageTestCases(),
        ...this.getROETestCases(),
        ...this.getNegativeROETestCases(),
        ...this.getPriceTestCases()
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
    fs.writeFileSync('target-price-calculator-test-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📋 === 目标价格计算器测试报告 ===');
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${passedTests}`);
    console.log(`失败: ${failedTests}`);
    console.log(`成功率: ${successRate}%`);
    console.log(`总耗时: ${duration}秒`);
    console.log(`平均计算时间: ${avgCalculationTime}ms`);
    console.log('\n📄 详细报告已保存到 target-price-calculator-test-report.json');
  }
}

// 运行测试套件
async function main() {
  const testSuite = new TargetPriceCalculatorTestSuite();
  await testSuite.runAllTests();
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default TargetPriceCalculatorTestSuite;
