// 测试菜单重构功能
// 验证5个合约计算器标签页已提升为独立菜单项

import { chromium } from 'playwright';

class MenuRestructureTest {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.baseUrl = 'http://localhost:57319';
  }

  async setup() {
    console.log('🚀 启动菜单重构测试...');
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

  // 测试菜单项数量和内容
  async testMenuItemsCount() {
    console.log('\n📋 测试1: 验证菜单项数量和内容');
    
    try {
      await this.page.goto(this.baseUrl);
      await this.page.waitForTimeout(2000);
      
      // 期望的菜单项
      const expectedMenuItems = [
        '仪表盘',
        '仓位管理',
        '补仓计算',
        '金字塔加仓',
        '盈亏计算器',
        '目标价格计算器',
        '强平价格计算器',
        '可开计算器',
        '开仓价格计算器',
        '波动率计算器'
      ];
      
      // 检查每个菜单项是否存在
      let foundItems = 0;
      const missingItems = [];
      
      for (const item of expectedMenuItems) {
        const menuItem = await this.page.locator(`text=${item}`).first();
        const isVisible = await menuItem.isVisible();
        
        if (isVisible) {
          foundItems++;
          console.log(`✅ 找到菜单项: ${item}`);
        } else {
          missingItems.push(item);
          console.log(`❌ 缺失菜单项: ${item}`);
        }
      }
      
      // 检查是否还有旧的合约计算器菜单项
      const oldContractCalculator = await this.page.locator('text=合约计算器').first();
      const oldExists = await oldContractCalculator.isVisible();
      
      if (oldExists) {
        console.log('❌ 旧的合约计算器菜单项仍然存在');
        return false;
      } else {
        console.log('✅ 旧的合约计算器菜单项已删除');
      }
      
      if (foundItems === expectedMenuItems.length && missingItems.length === 0) {
        console.log(`✅ 菜单项验证通过: ${foundItems}/${expectedMenuItems.length}`);
        return true;
      } else {
        console.log(`❌ 菜单项验证失败: ${foundItems}/${expectedMenuItems.length}`);
        if (missingItems.length > 0) {
          console.log(`缺失的菜单项: ${missingItems.join(', ')}`);
        }
        return false;
      }
    } catch (error) {
      console.log('❌ 菜单项测试失败:', error.message);
      return false;
    }
  }

  // 测试每个计算器页面导航
  async testCalculatorNavigation() {
    console.log('\n🧭 测试2: 验证计算器页面导航');
    
    const calculators = [
      { name: '盈亏计算器', path: '/pnl-calculator', title: '盈亏计算器' },
      { name: '目标价格计算器', path: '/target-price-calculator', title: '目标价格计算器' },
      { name: '强平价格计算器', path: '/liquidation-calculator', title: '强平价格计算器' },
      { name: '可开计算器', path: '/max-position-calculator', title: '可开计算器' },
      { name: '开仓价格计算器', path: '/entry-price-calculator', title: '开仓价格计算器' }
    ];
    
    let successCount = 0;
    
    for (const calc of calculators) {
      try {
        console.log(`\n测试 ${calc.name}...`);
        
        // 点击菜单项
        await this.page.getByRole('button', { name: calc.name }).first().click();
        await this.page.waitForTimeout(1500);
        
        // 检查URL
        const currentUrl = this.page.url();
        if (currentUrl.includes(calc.path)) {
          console.log(`✅ URL正确: ${currentUrl}`);
        } else {
          console.log(`❌ URL错误: 期望包含${calc.path}, 实际${currentUrl}`);
          continue;
        }
        
        // 检查页面标题
        const pageTitle = await this.page.title();
        if (pageTitle.includes(calc.title)) {
          console.log(`✅ 页面标题正确: ${pageTitle}`);
        } else {
          console.log(`❌ 页面标题错误: 期望包含${calc.title}, 实际${pageTitle}`);
          continue;
        }
        
        // 检查页面内容是否加载
        const pageHeading = await this.page.locator('h1, h4').first().textContent();
        if (pageHeading && pageHeading.includes(calc.title)) {
          console.log(`✅ 页面内容加载正确: ${pageHeading}`);
          successCount++;
        } else {
          console.log(`❌ 页面内容加载错误: ${pageHeading}`);
        }
        
      } catch (error) {
        console.log(`❌ ${calc.name} 测试失败:`, error.message);
      }
    }
    
    const successRate = (successCount / calculators.length) * 100;
    
    if (successCount === calculators.length) {
      console.log(`\n✅ 所有计算器页面导航测试通过 (${successCount}/${calculators.length})`);
      return true;
    } else {
      console.log(`\n❌ 部分计算器页面导航测试失败 (${successCount}/${calculators.length})`);
      return false;
    }
  }

  // 测试向后兼容性重定向
  async testBackwardCompatibility() {
    console.log('\n🔄 测试3: 验证向后兼容性重定向');
    
    const redirectTests = [
      { oldPath: '/contract-calculator', expectedRedirect: '/pnl-calculator' },
      { oldPath: '/contract-calculator/pnl', expectedRedirect: '/pnl-calculator' },
      { oldPath: '/contract-calculator/target-price', expectedRedirect: '/target-price-calculator' },
      { oldPath: '/contract-calculator/liquidation', expectedRedirect: '/liquidation-calculator' },
      { oldPath: '/contract-calculator/max-position', expectedRedirect: '/max-position-calculator' },
      { oldPath: '/contract-calculator/entry-price', expectedRedirect: '/entry-price-calculator' }
    ];
    
    let successCount = 0;
    
    for (const test of redirectTests) {
      try {
        console.log(`\n测试重定向: ${test.oldPath} → ${test.expectedRedirect}`);
        
        // 访问旧路径
        await this.page.goto(`${this.baseUrl}${test.oldPath}`);
        await this.page.waitForTimeout(1000);
        
        // 检查是否重定向到新路径
        const currentUrl = this.page.url();
        
        if (currentUrl.includes(test.expectedRedirect)) {
          console.log(`✅ 重定向成功: ${currentUrl}`);
          successCount++;
        } else {
          console.log(`❌ 重定向失败: 期望${test.expectedRedirect}, 实际${currentUrl}`);
        }
        
      } catch (error) {
        console.log(`❌ 重定向测试失败 ${test.oldPath}:`, error.message);
      }
    }
    
    if (successCount === redirectTests.length) {
      console.log(`\n✅ 所有重定向测试通过 (${successCount}/${redirectTests.length})`);
      return true;
    } else {
      console.log(`\n❌ 部分重定向测试失败 (${successCount}/${redirectTests.length})`);
      return false;
    }
  }

  // 测试计算器功能完整性
  async testCalculatorFunctionality() {
    console.log('\n⚙️ 测试4: 验证计算器功能完整性');
    
    try {
      // 测试盈亏计算器功能
      await this.page.goto(`${this.baseUrl}/pnl-calculator`);
      await this.page.waitForTimeout(1500);
      
      // 检查是否有输入字段
      const inputFields = await this.page.locator('input[type="number"], input[type="text"]').count();
      
      if (inputFields > 0) {
        console.log(`✅ 盈亏计算器有${inputFields}个输入字段`);
      } else {
        console.log('❌ 盈亏计算器缺少输入字段');
        return false;
      }
      
      // 测试目标价格计算器
      await this.page.goto(`${this.baseUrl}/target-price-calculator`);
      await this.page.waitForTimeout(1500);
      
      const targetInputs = await this.page.locator('input[type="number"], input[type="text"]').count();
      
      if (targetInputs > 0) {
        console.log(`✅ 目标价格计算器有${targetInputs}个输入字段`);
      } else {
        console.log('❌ 目标价格计算器缺少输入字段');
        return false;
      }
      
      console.log('✅ 计算器功能完整性验证通过');
      return true;
      
    } catch (error) {
      console.log('❌ 计算器功能测试失败:', error.message);
      return false;
    }
  }

  // 测试页面性能
  async testPagePerformance() {
    console.log('\n⚡ 测试5: 验证页面加载性能');
    
    const pages = [
      '/pnl-calculator',
      '/target-price-calculator',
      '/liquidation-calculator',
      '/max-position-calculator',
      '/entry-price-calculator'
    ];
    
    const loadTimes = [];
    
    for (const path of pages) {
      try {
        const startTime = Date.now();
        await this.page.goto(`${this.baseUrl}${path}`);
        await this.page.waitForLoadState('networkidle');
        const endTime = Date.now();
        
        const loadTime = endTime - startTime;
        loadTimes.push(loadTime);
        
        console.log(`✅ ${path} 加载时间: ${loadTime}ms`);
        
      } catch (error) {
        console.log(`❌ ${path} 性能测试失败:`, error.message);
      }
    }
    
    if (loadTimes.length > 0) {
      const avgLoadTime = loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length;
      console.log(`\n📊 平均加载时间: ${avgLoadTime.toFixed(2)}ms`);
      
      if (avgLoadTime < 5000) {
        console.log('✅ 页面加载性能良好');
        return true;
      } else {
        console.log('⚠️ 页面加载时间较长');
        return false;
      }
    } else {
      console.log('❌ 无法获取性能数据');
      return false;
    }
  }

  // 运行所有测试
  async runAllTests() {
    try {
      await this.setup();
      
      console.log('🧪 开始执行菜单重构测试套件');
      console.log('=' .repeat(60));
      
      const tests = [
        { name: '菜单项数量和内容', test: this.testMenuItemsCount },
        { name: '计算器页面导航', test: this.testCalculatorNavigation },
        { name: '向后兼容性重定向', test: this.testBackwardCompatibility },
        { name: '计算器功能完整性', test: this.testCalculatorFunctionality },
        { name: '页面加载性能', test: this.testPagePerformance }
      ];
      
      let passedTests = 0;
      
      for (const testCase of tests) {
        const testResult = await testCase.test.call(this);
        if (testResult) {
          passedTests++;
        }
        await this.page.waitForTimeout(500);
      }
      
      console.log('\n📋 === 菜单重构测试结果汇总 ===');
      console.log(`总测试数: ${tests.length}`);
      console.log(`通过: ${passedTests}`);
      console.log(`失败: ${tests.length - passedTests}`);
      console.log(`成功率: ${((passedTests / tests.length) * 100).toFixed(2)}%`);
      
      if (passedTests === tests.length) {
        console.log('🎉 菜单重构成功！所有测试通过');
      } else {
        console.log('⚠️ 部分测试失败，需要检查重构是否完整');
      }
      
      return passedTests === tests.length;
      
    } catch (error) {
      console.error('❌ 测试执行失败:', error);
      return false;
    } finally {
      await this.teardown();
    }
  }
}

// 运行测试
async function main() {
  const testSuite = new MenuRestructureTest();
  const success = await testSuite.runAllTests();
  process.exit(success ? 0 : 1);
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default MenuRestructureTest;
