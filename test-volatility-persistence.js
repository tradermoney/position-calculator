// 波动率计算器数据持久化测试
// 测试IndexedDB数据持久化、页面刷新恢复、历史记录管理等功能

import { chromium } from 'playwright';

class VolatilityPersistenceTest {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async setup() {
    console.log('🚀 启动波动率计算器数据持久化测试...');
    this.browser = await chromium.launch({ 
      headless: false,
      slowMo: 300
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

  // 测试输入状态持久化
  async testInputPersistence() {
    console.log('\n💾 测试1: 输入状态持久化');
    
    try {
      // 访问波动率计算器
      await this.page.goto('http://localhost:57320/volatility-calculator');
      await this.page.waitForTimeout(1000);
      
      // 输入测试数据
      await this.page.getByLabel('价格 1').fill('42000');
      await this.page.getByLabel('价格 2').fill('45000');
      await this.page.waitForTimeout(1000); // 等待防抖保存
      
      console.log('✅ 输入测试数据: 42000 → 45000');
      
      // 刷新页面
      await this.page.reload();
      await this.page.waitForTimeout(2000);
      
      // 检查输入是否恢复
      const price1Value = await this.page.getByLabel('价格 1').inputValue();
      const price2Value = await this.page.getByLabel('价格 2').inputValue();
      
      if (price1Value === '42000' && price2Value === '45000') {
        console.log('✅ 页面刷新后输入状态成功恢复');
        return true;
      } else {
        console.log('❌ 输入状态恢复失败，价格1:', price1Value, '价格2:', price2Value);
        return false;
      }
    } catch (error) {
      console.log('❌ 输入状态持久化测试失败:', error.message);
      return false;
    }
  }

  // 测试历史记录持久化
  async testHistoryPersistence() {
    console.log('\n📚 测试2: 历史记录持久化');
    
    try {
      // 确保在波动率计算器页面
      await this.page.goto('http://localhost:57320/volatility-calculator');
      await this.page.waitForTimeout(1000);
      
      // 创建多个计算记录
      const testCases = [
        { price1: '30000', price2: '32000', expected: '-6.25%' },
        { price1: '48000', price2: '45000', expected: '+6.25%' },
        { price1: '60000', price2: '63000', expected: '-4.76%' }
      ];
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        
        // 输入数据
        await this.page.getByLabel('价格 1').fill(testCase.price1);
        await this.page.getByLabel('价格 2').fill(testCase.price2);
        await this.page.waitForTimeout(500);
        
        // 保存记录
        await this.page.getByRole('button', { name: '保存记录' }).click();
        await this.page.waitForTimeout(500);
        
        console.log(`✅ 保存记录 ${i + 1}: ${testCase.price1} → ${testCase.price2}`);
      }
      
      // 刷新页面
      await this.page.reload();
      await this.page.waitForTimeout(2000);
      
      // 检查历史记录是否存在
      const historyItems = await this.page.locator('text=/\\d+.*→.*\\d+/').count();
      
      if (historyItems >= 3) {
        console.log(`✅ 历史记录持久化成功，找到 ${historyItems} 条记录`);
        return true;
      } else {
        console.log(`❌ 历史记录持久化失败，只找到 ${historyItems} 条记录`);
        return false;
      }
    } catch (error) {
      console.log('❌ 历史记录持久化测试失败:', error.message);
      return false;
    }
  }

  // 测试历史记录点击恢复
  async testHistoryRestore() {
    console.log('\n🔄 测试3: 历史记录点击恢复');
    
    try {
      // 清空当前输入
      await this.page.getByLabel('价格 1').fill('');
      await this.page.getByLabel('价格 2').fill('');
      await this.page.waitForTimeout(300);
      
      // 点击第一个历史记录
      const firstHistoryItem = this.page.locator('text=/\\d+.*→.*\\d+/').first();
      await firstHistoryItem.click();
      await this.page.waitForTimeout(500);
      
      // 检查输入框是否有值
      const price1Value = await this.page.getByLabel('价格 1').inputValue();
      const price2Value = await this.page.getByLabel('价格 2').inputValue();
      
      if (price1Value && price2Value && price1Value !== '' && price2Value !== '') {
        console.log(`✅ 历史记录恢复成功: ${price1Value} → ${price2Value}`);
        return true;
      } else {
        console.log('❌ 历史记录恢复失败，输入框为空');
        return false;
      }
    } catch (error) {
      console.log('❌ 历史记录恢复测试失败:', error.message);
      return false;
    }
  }

  // 测试历史记录限制（最多10条）
  async testHistoryLimit() {
    console.log('\n📊 测试4: 历史记录数量限制');
    
    try {
      // 创建超过10条记录
      for (let i = 1; i <= 12; i++) {
        const price1 = (30000 + i * 1000).toString();
        const price2 = (32000 + i * 1000).toString();
        
        await this.page.getByLabel('价格 1').fill(price1);
        await this.page.getByLabel('价格 2').fill(price2);
        await this.page.waitForTimeout(200);
        
        await this.page.getByRole('button', { name: '保存记录' }).click();
        await this.page.waitForTimeout(200);
      }
      
      // 等待数据保存
      await this.page.waitForTimeout(1000);
      
      // 检查历史记录数量
      const historyItems = await this.page.locator('text=/\\d+.*→.*\\d+/').count();
      
      if (historyItems <= 10) {
        console.log(`✅ 历史记录数量限制正确，当前记录数: ${historyItems}`);
        return true;
      } else {
        console.log(`❌ 历史记录数量超出限制，当前记录数: ${historyItems}`);
        return false;
      }
    } catch (error) {
      console.log('❌ 历史记录限制测试失败:', error.message);
      return false;
    }
  }

  // 测试清空历史记录
  async testClearHistory() {
    console.log('\n🗑️ 测试5: 清空历史记录');
    
    try {
      // 点击清空历史记录按钮
      const clearButton = this.page.getByRole('button', { name: '清空历史记录' }).or(
        this.page.locator('[title="清空历史记录"]')
      );
      
      if (await clearButton.isVisible()) {
        await clearButton.click();
        await this.page.waitForTimeout(1000);
        
        // 检查是否显示空状态
        const emptyStateVisible = await this.page.locator('text=/暂无历史记录/').isVisible();
        
        if (emptyStateVisible) {
          console.log('✅ 历史记录清空成功');
          return true;
        } else {
          console.log('❌ 历史记录清空失败，仍有记录显示');
          return false;
        }
      } else {
        console.log('❌ 未找到清空历史记录按钮');
        return false;
      }
    } catch (error) {
      console.log('❌ 清空历史记录测试失败:', error.message);
      return false;
    }
  }

  // 测试跨页面数据持久化
  async testCrossPagePersistence() {
    console.log('\n🌐 测试6: 跨页面数据持久化');
    
    try {
      // 在波动率计算器输入数据
      await this.page.goto('http://localhost:57320/volatility-calculator');
      await this.page.waitForTimeout(1000);
      
      await this.page.getByLabel('价格 1').fill('55000');
      await this.page.getByLabel('价格 2').fill('58000');
      await this.page.waitForTimeout(1000);
      
      // 保存一条记录
      await this.page.getByRole('button', { name: '保存记录' }).click();
      await this.page.waitForTimeout(500);
      
      // 导航到其他页面
      await this.page.goto('http://localhost:57320/positions');
      await this.page.waitForTimeout(1000);
      
      // 返回波动率计算器
      await this.page.goto('http://localhost:57320/volatility-calculator');
      await this.page.waitForTimeout(2000);
      
      // 检查数据是否仍然存在
      const price1Value = await this.page.getByLabel('价格 1').inputValue();
      const price2Value = await this.page.getByLabel('价格 2').inputValue();
      const historyVisible = await this.page.locator('text=/55000.*→.*58000/').isVisible();
      
      if (price1Value === '55000' && price2Value === '58000' && historyVisible) {
        console.log('✅ 跨页面数据持久化成功');
        return true;
      } else {
        console.log('❌ 跨页面数据持久化失败');
        return false;
      }
    } catch (error) {
      console.log('❌ 跨页面数据持久化测试失败:', error.message);
      return false;
    }
  }

  // 运行所有测试
  async runAllTests() {
    try {
      await this.setup();
      
      console.log('🧪 开始执行波动率计算器数据持久化测试');
      console.log('=' .repeat(60));
      
      const tests = [
        this.testInputPersistence,
        this.testHistoryPersistence,
        this.testHistoryRestore,
        this.testHistoryLimit,
        this.testClearHistory,
        this.testCrossPagePersistence
      ];
      
      let passedTests = 0;
      
      for (let i = 0; i < tests.length; i++) {
        const testResult = await tests[i].call(this);
        if (testResult) {
          passedTests++;
        }
        await this.page.waitForTimeout(500);
      }
      
      console.log('\n📋 === 数据持久化测试结果汇总 ===');
      console.log(`总测试数: ${tests.length}`);
      console.log(`通过: ${passedTests}`);
      console.log(`失败: ${tests.length - passedTests}`);
      console.log(`成功率: ${((passedTests / tests.length) * 100).toFixed(2)}%`);
      
      if (passedTests === tests.length) {
        console.log('🎉 所有数据持久化测试通过！IndexedDB功能正常');
      } else {
        console.log('⚠️  部分测试失败，需要检查数据持久化功能');
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
  const testSuite = new VolatilityPersistenceTest();
  await testSuite.runAllTests();
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default VolatilityPersistenceTest;
