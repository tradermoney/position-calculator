// 波动率计算器完整测试套件
// 包含功能测试、数据持久化测试、边界值测试、性能测试等

import { chromium } from 'playwright';
import fs from 'fs';

class VolatilityComprehensiveTest {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testResults = [];
    this.startTime = Date.now();
  }

  async setup() {
    console.log('🚀 启动波动率计算器完整测试套件...');
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 200
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    
    // 监听控制台错误
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🔴 控制台错误:', msg.text());
      }
    });
    
    console.log('✅ 测试环境准备完成');
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🔚 测试环境清理完成');
  }

  // 记录测试结果
  recordTest(testName, passed, details = '') {
    this.testResults.push({
      name: testName,
      passed,
      details,
      timestamp: new Date().toISOString()
    });
  }

  // 测试页面加载性能
  async testPageLoadPerformance() {
    console.log('\n⚡ 测试1: 页面加载性能');
    
    try {
      const startTime = Date.now();
      await this.page.goto('http://localhost:57320/volatility-calculator');
      
      // 等待关键元素加载
      await this.page.waitForSelector('h1', { timeout: 10000 });
      await this.page.waitForSelector('input[aria-label="价格 1"]', { timeout: 5000 });
      await this.page.waitForSelector('input[aria-label="价格 2"]', { timeout: 5000 });
      
      const loadTime = Date.now() - startTime;
      
      if (loadTime < 5000) {
        console.log(`✅ 页面加载性能良好: ${loadTime}ms`);
        this.recordTest('页面加载性能', true, `加载时间: ${loadTime}ms`);
        return true;
      } else {
        console.log(`⚠️ 页面加载较慢: ${loadTime}ms`);
        this.recordTest('页面加载性能', false, `加载时间过长: ${loadTime}ms`);
        return false;
      }
    } catch (error) {
      console.log('❌ 页面加载性能测试失败:', error.message);
      this.recordTest('页面加载性能', false, error.message);
      return false;
    }
  }

  // 测试计算准确性
  async testCalculationAccuracy() {
    console.log('\n🧮 测试2: 计算准确性');
    
    const testCases = [
      { price1: '50000', price2: '55000', expected: '-9.09' },
      { price1: '60000', price2: '50000', expected: '+16.67' },
      { price1: '100', price2: '110', expected: '-9.09' },
      { price1: '1000', price2: '900', expected: '+10.00' },
      { price1: '0.1', price2: '0.11', expected: '-9.09' }
    ];
    
    let passedCases = 0;
    
    for (const testCase of testCases) {
      try {
        await this.page.getByLabel('价格 1').fill(testCase.price1);
        await this.page.getByLabel('价格 2').fill(testCase.price2);
        await this.page.waitForTimeout(500);
        
        const resultText = await this.page.locator('text=/[+-]\\d+\\.\\d+%/').textContent();
        
        if (resultText && resultText.includes(testCase.expected)) {
          console.log(`✅ 计算正确: ${testCase.price1} → ${testCase.price2} = ${resultText}`);
          passedCases++;
        } else {
          console.log(`❌ 计算错误: ${testCase.price1} → ${testCase.price2}, 期望: ${testCase.expected}%, 实际: ${resultText}`);
        }
      } catch (error) {
        console.log(`❌ 计算测试失败: ${testCase.price1} → ${testCase.price2}:`, error.message);
      }
    }
    
    const accuracy = (passedCases / testCases.length) * 100;
    const passed = accuracy >= 80;
    
    console.log(`📊 计算准确性: ${passedCases}/${testCases.length} (${accuracy.toFixed(2)}%)`);
    this.recordTest('计算准确性', passed, `准确率: ${accuracy.toFixed(2)}%`);
    
    return passed;
  }

  // 测试边界值处理
  async testBoundaryValues() {
    console.log('\n🔍 测试3: 边界值处理');
    
    const boundaryTests = [
      { price1: '0', price2: '1', shouldError: true, desc: '零值测试' },
      { price1: '1', price2: '1', shouldError: true, desc: '相同值测试' },
      { price1: '-100', price2: '100', shouldError: true, desc: '负值测试' },
      { price1: 'abc', price2: '100', shouldError: true, desc: '非数字测试' },
      { price1: '0.0001', price2: '0.0002', shouldError: false, desc: '极小值测试' },
      { price1: '999999999', price2: '1000000000', shouldError: false, desc: '极大值测试' }
    ];
    
    let passedTests = 0;
    
    for (const test of boundaryTests) {
      try {
        await this.page.getByLabel('价格 1').fill(test.price1);
        await this.page.getByLabel('价格 2').fill(test.price2);
        await this.page.waitForTimeout(500);
        
        const hasError = await this.page.locator('text=/错误|不能|无效/').isVisible();
        const hasResult = await this.page.locator('text=/[+-]\\d+\\.\\d+%/').isVisible();
        
        if (test.shouldError) {
          if (hasError || !hasResult) {
            console.log(`✅ ${test.desc}: 正确显示错误或无结果`);
            passedTests++;
          } else {
            console.log(`❌ ${test.desc}: 应该显示错误但显示了结果`);
          }
        } else {
          if (!hasError && hasResult) {
            console.log(`✅ ${test.desc}: 正确计算结果`);
            passedTests++;
          } else {
            console.log(`❌ ${test.desc}: 应该显示结果但显示了错误`);
          }
        }
      } catch (error) {
        console.log(`❌ ${test.desc} 测试失败:`, error.message);
      }
    }
    
    const accuracy = (passedTests / boundaryTests.length) * 100;
    const passed = accuracy >= 80;
    
    console.log(`📊 边界值处理: ${passedTests}/${boundaryTests.length} (${accuracy.toFixed(2)}%)`);
    this.recordTest('边界值处理', passed, `通过率: ${accuracy.toFixed(2)}%`);
    
    return passed;
  }

  // 测试用户界面响应性
  async testUIResponsiveness() {
    console.log('\n🎨 测试4: 用户界面响应性');
    
    try {
      let passedChecks = 0;
      const totalChecks = 5;
      
      // 检查输入框响应
      await this.page.getByLabel('价格 1').fill('12345');
      const inputValue = await this.page.getByLabel('价格 1').inputValue();
      if (inputValue === '12345') {
        console.log('✅ 输入框响应正常');
        passedChecks++;
      }
      
      // 检查按钮可点击性
      const saveButton = this.page.getByRole('button', { name: '保存记录' });
      if (await saveButton.isEnabled()) {
        console.log('✅ 保存按钮可点击');
        passedChecks++;
      }
      
      // 检查清空按钮
      const clearButton = this.page.getByRole('button', { name: '清空输入' });
      if (await clearButton.isVisible()) {
        console.log('✅ 清空按钮可见');
        passedChecks++;
      }
      
      // 检查结果显示
      await this.page.getByLabel('价格 2').fill('15000');
      await this.page.waitForTimeout(300);
      const resultVisible = await this.page.locator('text=/[+-]\\d+\\.\\d+%/').isVisible();
      if (resultVisible) {
        console.log('✅ 结果实时显示');
        passedChecks++;
      }
      
      // 检查历史记录区域
      const historySection = this.page.locator('text=/历史记录/');
      if (await historySection.isVisible()) {
        console.log('✅ 历史记录区域可见');
        passedChecks++;
      }
      
      const responsiveness = (passedChecks / totalChecks) * 100;
      const passed = responsiveness >= 80;
      
      console.log(`📊 界面响应性: ${passedChecks}/${totalChecks} (${responsiveness.toFixed(2)}%)`);
      this.recordTest('用户界面响应性', passed, `响应率: ${responsiveness.toFixed(2)}%`);
      
      return passed;
    } catch (error) {
      console.log('❌ 用户界面响应性测试失败:', error.message);
      this.recordTest('用户界面响应性', false, error.message);
      return false;
    }
  }

  // 测试数据持久化完整性
  async testDataPersistenceIntegrity() {
    console.log('\n💾 测试5: 数据持久化完整性');
    
    try {
      // 清空现有数据
      await this.page.goto('http://localhost:57320/volatility-calculator');
      await this.page.waitForTimeout(1000);
      
      // 创建测试数据
      const testData = [
        { price1: '25000', price2: '27000' },
        { price1: '35000', price2: '33000' },
        { price1: '45000', price2: '48000' }
      ];
      
      // 保存测试数据
      for (const data of testData) {
        await this.page.getByLabel('价格 1').fill(data.price1);
        await this.page.getByLabel('价格 2').fill(data.price2);
        await this.page.waitForTimeout(300);
        await this.page.getByRole('button', { name: '保存记录' }).click();
        await this.page.waitForTimeout(300);
      }
      
      // 刷新页面多次测试持久性
      for (let i = 0; i < 3; i++) {
        await this.page.reload();
        await this.page.waitForTimeout(2000);
        
        // 检查数据是否仍然存在
        const historyCount = await this.page.locator('text=/\\d+.*→.*\\d+/').count();
        if (historyCount < testData.length) {
          console.log(`❌ 第${i + 1}次刷新后数据丢失，期望${testData.length}条，实际${historyCount}条`);
          this.recordTest('数据持久化完整性', false, `数据丢失: 期望${testData.length}条，实际${historyCount}条`);
          return false;
        }
      }
      
      console.log('✅ 数据持久化完整性测试通过');
      this.recordTest('数据持久化完整性', true, '多次刷新后数据保持完整');
      return true;
      
    } catch (error) {
      console.log('❌ 数据持久化完整性测试失败:', error.message);
      this.recordTest('数据持久化完整性', false, error.message);
      return false;
    }
  }

  // 测试错误处理机制
  async testErrorHandling() {
    console.log('\n🚨 测试6: 错误处理机制');
    
    try {
      let errorHandlingScore = 0;
      const totalTests = 4;
      
      // 测试空输入处理
      await this.page.getByLabel('价格 1').fill('');
      await this.page.getByLabel('价格 2').fill('');
      await this.page.waitForTimeout(300);
      
      const noResultWhenEmpty = !(await this.page.locator('text=/[+-]\\d+\\.\\d+%/').isVisible());
      if (noResultWhenEmpty) {
        console.log('✅ 空输入时正确隐藏结果');
        errorHandlingScore++;
      }
      
      // 测试相同价格处理
      await this.page.getByLabel('价格 1').fill('100');
      await this.page.getByLabel('价格 2').fill('100');
      await this.page.waitForTimeout(300);
      
      const showsErrorForSamePrice = await this.page.locator('text=/两个价格不能相同/').isVisible();
      if (showsErrorForSamePrice) {
        console.log('✅ 相同价格时正确显示错误');
        errorHandlingScore++;
      }
      
      // 测试无效输入处理
      await this.page.getByLabel('价格 1').fill('abc');
      await this.page.getByLabel('价格 2').fill('123');
      await this.page.waitForTimeout(300);
      
      const handlesInvalidInput = !(await this.page.locator('text=/[+-]\\d+\\.\\d+%/').isVisible());
      if (handlesInvalidInput) {
        console.log('✅ 无效输入时正确处理');
        errorHandlingScore++;
      }
      
      // 测试负数处理
      await this.page.getByLabel('价格 1').fill('-100');
      await this.page.getByLabel('价格 2').fill('100');
      await this.page.waitForTimeout(300);
      
      const handlesNegativeInput = !(await this.page.locator('text=/[+-]\\d+\\.\\d+%/').isVisible());
      if (handlesNegativeInput) {
        console.log('✅ 负数输入时正确处理');
        errorHandlingScore++;
      }
      
      const errorHandlingRate = (errorHandlingScore / totalTests) * 100;
      const passed = errorHandlingRate >= 75;
      
      console.log(`📊 错误处理: ${errorHandlingScore}/${totalTests} (${errorHandlingRate.toFixed(2)}%)`);
      this.recordTest('错误处理机制', passed, `处理率: ${errorHandlingRate.toFixed(2)}%`);
      
      return passed;
    } catch (error) {
      console.log('❌ 错误处理机制测试失败:', error.message);
      this.recordTest('错误处理机制', false, error.message);
      return false;
    }
  }

  // 生成测试报告
  generateReport() {
    const endTime = Date.now();
    const totalTime = endTime - this.startTime;
    const passedTests = this.testResults.filter(test => test.passed).length;
    const totalTests = this.testResults.length;
    const successRate = (passedTests / totalTests) * 100;
    
    const report = {
      summary: {
        totalTests,
        passedTests,
        failedTests: totalTests - passedTests,
        successRate: successRate.toFixed(2) + '%',
        totalTime: totalTime + 'ms',
        timestamp: new Date().toISOString()
      },
      details: this.testResults,
      environment: {
        browser: 'Chromium',
        url: 'http://localhost:57320/volatility-calculator',
        testSuite: 'VolatilityComprehensiveTest'
      }
    };
    
    // 保存报告到文件
    fs.writeFileSync('volatility-test-report.json', JSON.stringify(report, null, 2));
    
    return report;
  }

  // 运行所有测试
  async runAllTests() {
    try {
      await this.setup();
      
      console.log('🧪 开始执行波动率计算器完整测试套件');
      console.log('=' .repeat(60));
      
      const tests = [
        this.testPageLoadPerformance,
        this.testCalculationAccuracy,
        this.testBoundaryValues,
        this.testUIResponsiveness,
        this.testDataPersistenceIntegrity,
        this.testErrorHandling
      ];
      
      for (const test of tests) {
        await test.call(this);
        await this.page.waitForTimeout(500);
      }
      
      const report = this.generateReport();
      
      console.log('\n📋 === 完整测试套件结果汇总 ===');
      console.log(`总测试数: ${report.summary.totalTests}`);
      console.log(`通过: ${report.summary.passedTests}`);
      console.log(`失败: ${report.summary.failedTests}`);
      console.log(`成功率: ${report.summary.successRate}`);
      console.log(`总耗时: ${report.summary.totalTime}`);
      console.log(`报告文件: volatility-test-report.json`);
      
      if (report.summary.successRate >= '80.00%') {
        console.log('🎉 波动率计算器测试通过！功能完整且稳定');
      } else {
        console.log('⚠️  部分测试失败，需要进一步优化');
      }
      
    } catch (error) {
      console.error('❌ 测试执行失败:', error);
    } finally {
      await this.teardown();
    }
  }
}

// 运行测试
async function main() {
  const testSuite = new VolatilityComprehensiveTest();
  await testSuite.runAllTests();
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default VolatilityComprehensiveTest;
