// 波动率计算器基本功能测试
// 测试导航、计算功能、输入验证等基本功能

import { chromium } from 'playwright';

class VolatilityCalculatorBasicTest {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async setup() {
    console.log('🚀 启动波动率计算器基本功能测试...');
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 200
    });
    this.context = await this.browser.newContext();
    this.page = await this.context.newPage();
    console.log('✅ 测试环境准备完成');
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
    console.log('🔚 测试环境清理完成');
  }

  // 测试导航到波动率计算器
  async testNavigation() {
    console.log('\n📍 测试1: 导航到波动率计算器');
    
    try {
      // 访问主页
      await this.page.goto('http://localhost:57320/');
      await this.page.waitForTimeout(1000);
      
      // 点击波动率计算器菜单（使用更精确的选择器）
      await this.page.getByRole('button', { name: '波动率计算器' }).first().click();
      await this.page.waitForTimeout(1000);
      
      // 验证URL
      const currentUrl = this.page.url();
      if (currentUrl.includes('/volatility-calculator')) {
        console.log('✅ 导航成功，URL正确:', currentUrl);
      } else {
        console.log('❌ 导航失败，URL错误:', currentUrl);
        return false;
      }
      
      // 验证页面标题
      const pageTitle = await this.page.title();
      if (pageTitle.includes('波动率计算器')) {
        console.log('✅ 页面标题正确:', pageTitle);
      } else {
        console.log('❌ 页面标题错误:', pageTitle);
        return false;
      }
      
      // 验证页面内容
      const heading = await this.page.locator('h1').textContent();
      if (heading && heading.includes('波动率计算器')) {
        console.log('✅ 页面内容加载正确');
        return true;
      } else {
        console.log('❌ 页面内容加载错误');
        return false;
      }
    } catch (error) {
      console.log('❌ 导航测试失败:', error.message);
      return false;
    }
  }

  // 测试基本计算功能
  async testBasicCalculation() {
    console.log('\n🧮 测试2: 基本计算功能');
    
    try {
      // 确保在波动率计算器页面
      await this.page.goto('http://localhost:57320/volatility-calculator');
      await this.page.waitForTimeout(1000);
      
      // 输入价格1
      const price1Input = this.page.getByLabel('价格 1');
      await price1Input.fill('50000');
      await this.page.waitForTimeout(500);
      
      // 输入价格2
      const price2Input = this.page.getByLabel('价格 2');
      await price2Input.fill('55000');
      await this.page.waitForTimeout(500);
      
      // 检查是否显示了计算结果
      const resultVisible = await this.page.locator('text=/[+-]\\d+\\.\\d+%/').isVisible();
      if (resultVisible) {
        const resultText = await this.page.locator('text=/[+-]\\d+\\.\\d+%/').textContent();
        console.log('✅ 计算结果显示:', resultText);
        
        // 验证计算逻辑：|50000-55000|/max(50000,55000)*100 = 5000/55000*100 ≈ 9.09%
        // 由于50000 < 55000，应该显示负号
        if (resultText.includes('-') && resultText.includes('9.09')) {
          console.log('✅ 计算结果正确');
          return true;
        } else {
          console.log('❌ 计算结果可能不正确，期望约-9.09%');
          return false;
        }
      } else {
        console.log('❌ 未显示计算结果');
        return false;
      }
    } catch (error) {
      console.log('❌ 基本计算测试失败:', error.message);
      return false;
    }
  }

  // 测试正向波动率计算
  async testPositiveVolatility() {
    console.log('\n📈 测试3: 正向波动率计算');
    
    try {
      // 清空输入
      await this.page.getByLabel('价格 1').fill('');
      await this.page.getByLabel('价格 2').fill('');
      await this.page.waitForTimeout(300);
      
      // 输入价格1 > 价格2的情况
      await this.page.getByLabel('价格 1').fill('60000');
      await this.page.getByLabel('价格 2').fill('50000');
      await this.page.waitForTimeout(500);
      
      // 检查结果
      const resultText = await this.page.locator('text=/[+-]\\d+\\.\\d+%/').textContent();
      console.log('✅ 正向波动率结果:', resultText);
      
      // 验证：|60000-50000|/max(60000,50000)*100 = 10000/60000*100 ≈ 16.67%
      // 由于60000 > 50000，应该显示正号
      if (resultText.includes('+') && resultText.includes('16.67')) {
        console.log('✅ 正向波动率计算正确');
        return true;
      } else {
        console.log('❌ 正向波动率计算可能不正确，期望约+16.67%');
        return false;
      }
    } catch (error) {
      console.log('❌ 正向波动率测试失败:', error.message);
      return false;
    }
  }

  // 测试输入验证
  async testInputValidation() {
    console.log('\n🔍 测试4: 输入验证');
    
    try {
      // 测试无效输入
      await this.page.getByLabel('价格 1').fill('');
      await this.page.getByLabel('价格 2').fill('');
      await this.page.waitForTimeout(300);
      
      // 检查是否没有显示结果
      const resultVisible = await this.page.locator('text=/[+-]\\d+\\.\\d+%/').isVisible();
      if (!resultVisible) {
        console.log('✅ 空输入时正确隐藏结果');
      } else {
        console.log('❌ 空输入时仍显示结果');
        return false;
      }
      
      // 测试相同价格
      await this.page.getByLabel('价格 1').fill('50000');
      await this.page.getByLabel('价格 2').fill('50000');
      await this.page.waitForTimeout(500);
      
      // 检查是否显示错误提示
      const errorVisible = await this.page.locator('text=/两个价格不能相同/').isVisible();
      if (errorVisible) {
        console.log('✅ 相同价格时正确显示错误提示');
        return true;
      } else {
        console.log('❌ 相同价格时未显示错误提示');
        return false;
      }
    } catch (error) {
      console.log('❌ 输入验证测试失败:', error.message);
      return false;
    }
  }

  // 测试保存记录功能
  async testSaveRecord() {
    console.log('\n💾 测试5: 保存记录功能');
    
    try {
      // 输入有效数据
      await this.page.getByLabel('价格 1').fill('45000');
      await this.page.getByLabel('价格 2').fill('50000');
      await this.page.waitForTimeout(500);
      
      // 点击保存记录按钮
      await this.page.getByRole('button', { name: '保存记录' }).click();
      await this.page.waitForTimeout(1000);
      
      // 检查历史记录区域是否有新记录
      const historyVisible = await this.page.locator('text=/45000.*→.*50000/').isVisible();
      if (historyVisible) {
        console.log('✅ 记录保存成功，历史记录显示正确');
        return true;
      } else {
        console.log('❌ 记录保存失败或历史记录未显示');
        return false;
      }
    } catch (error) {
      console.log('❌ 保存记录测试失败:', error.message);
      return false;
    }
  }

  // 测试历史记录恢复
  async testHistoryRestore() {
    console.log('\n🔄 测试6: 历史记录恢复功能');
    
    try {
      // 清空当前输入
      await this.page.getByLabel('价格 1').fill('');
      await this.page.getByLabel('价格 2').fill('');
      await this.page.waitForTimeout(300);
      
      // 点击历史记录项
      await this.page.locator('text=/45000.*→.*50000/').click();
      await this.page.waitForTimeout(500);
      
      // 检查输入框是否恢复了数据
      const price1Value = await this.page.getByLabel('价格 1').inputValue();
      const price2Value = await this.page.getByLabel('价格 2').inputValue();
      
      if (price1Value === '45000' && price2Value === '50000') {
        console.log('✅ 历史记录恢复功能正常');
        return true;
      } else {
        console.log('❌ 历史记录恢复失败，价格1:', price1Value, '价格2:', price2Value);
        return false;
      }
    } catch (error) {
      console.log('❌ 历史记录恢复测试失败:', error.message);
      return false;
    }
  }

  // 运行所有测试
  async runAllTests() {
    try {
      await this.setup();
      
      console.log('🧪 开始执行波动率计算器基本功能测试');
      console.log('=' .repeat(60));
      
      const tests = [
        this.testNavigation,
        this.testBasicCalculation,
        this.testPositiveVolatility,
        this.testInputValidation,
        this.testSaveRecord,
        this.testHistoryRestore
      ];
      
      let passedTests = 0;
      
      for (let i = 0; i < tests.length; i++) {
        const testResult = await tests[i].call(this);
        if (testResult) {
          passedTests++;
        }
        await this.page.waitForTimeout(500);
      }
      
      console.log('\n📋 === 测试结果汇总 ===');
      console.log(`总测试数: ${tests.length}`);
      console.log(`通过: ${passedTests}`);
      console.log(`失败: ${tests.length - passedTests}`);
      console.log(`成功率: ${((passedTests / tests.length) * 100).toFixed(2)}%`);
      
      if (passedTests === tests.length) {
        console.log('🎉 所有测试通过！波动率计算器基本功能正常');
      } else {
        console.log('⚠️  部分测试失败，需要检查相关功能');
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
  const testSuite = new VolatilityCalculatorBasicTest();
  await testSuite.runAllTests();
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default VolatilityCalculatorBasicTest;
