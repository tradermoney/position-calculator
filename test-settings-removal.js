// 测试设置菜单删除功能
// 验证设置菜单项已被完全删除，相关路由不可访问

import { chromium } from 'playwright';

class SettingsRemovalTest {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
  }

  async setup() {
    console.log('🚀 启动设置菜单删除测试...');
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

  // 测试导航菜单中不存在设置项
  async testSettingsMenuNotExists() {
    console.log('\n📋 测试1: 导航菜单中不存在设置项');
    
    try {
      // 访问主页
      await this.page.goto('http://localhost:57321/');
      await this.page.waitForTimeout(2000);
      
      // 检查设置菜单项是否存在
      const settingsMenuExists = await this.page.locator('text=设置').isVisible();
      
      if (!settingsMenuExists) {
        console.log('✅ 设置菜单项已成功删除');
        return true;
      } else {
        console.log('❌ 设置菜单项仍然存在');
        return false;
      }
    } catch (error) {
      console.log('❌ 设置菜单检查失败:', error.message);
      return false;
    }
  }

  // 测试设置路由不可访问
  async testSettingsRouteNotAccessible() {
    console.log('\n🚫 测试2: 设置路由不可访问');
    
    try {
      // 直接访问设置路由
      await this.page.goto('http://localhost:57321/settings');
      await this.page.waitForTimeout(2000);
      
      // 检查是否被重定向到其他页面
      const currentUrl = this.page.url();
      
      if (!currentUrl.includes('/settings')) {
        console.log(`✅ 设置路由已被重定向到: ${currentUrl}`);
        return true;
      } else {
        console.log('❌ 设置路由仍然可以访问');
        return false;
      }
    } catch (error) {
      console.log('❌ 设置路由测试失败:', error.message);
      return false;
    }
  }

  // 测试当前菜单项数量
  async testMenuItemCount() {
    console.log('\n🔢 测试3: 验证菜单项数量');
    
    try {
      // 访问主页
      await this.page.goto('http://localhost:57321/');
      await this.page.waitForTimeout(2000);
      
      // 计算菜单项数量（只计算侧边栏中的菜单项）
      const menuItems = await this.page.locator('nav [role="button"]').filter({ hasText: /仪表盘|仓位管理|补仓计算|金字塔加仓|合约计算器|波动率计算器/ }).count();
      
      // 应该有6个菜单项（删除设置后）
      const expectedCount = 6;
      
      if (menuItems === expectedCount) {
        console.log(`✅ 菜单项数量正确: ${menuItems}个`);
        return true;
      } else {
        console.log(`❌ 菜单项数量不正确: 期望${expectedCount}个，实际${menuItems}个`);
        return false;
      }
    } catch (error) {
      console.log('❌ 菜单项数量测试失败:', error.message);
      return false;
    }
  }

  // 测试所有其他菜单项仍然可用
  async testOtherMenuItemsWork() {
    console.log('\n✅ 测试4: 验证其他菜单项正常工作');
    
    const menuItems = [
      { name: '仪表盘', path: '/dashboard' },
      { name: '仓位管理', path: '/positions' },
      { name: '补仓计算', path: '/add-position' },
      { name: '金字塔加仓', path: '/pyramid' },
      { name: '合约计算器', path: '/contract-calculator' },
      { name: '波动率计算器', path: '/volatility-calculator' }
    ];
    
    let workingItems = 0;
    
    for (const item of menuItems) {
      try {
        // 点击菜单项
        await this.page.getByRole('button', { name: item.name }).first().click();
        await this.page.waitForTimeout(1000);
        
        // 检查URL是否正确
        const currentUrl = this.page.url();
        if (currentUrl.includes(item.path)) {
          console.log(`✅ ${item.name} 菜单项工作正常`);
          workingItems++;
        } else {
          console.log(`❌ ${item.name} 菜单项导航失败`);
        }
      } catch (error) {
        console.log(`❌ ${item.name} 菜单项测试失败:`, error.message);
      }
    }
    
    const successRate = (workingItems / menuItems.length) * 100;
    
    if (successRate >= 100) {
      console.log(`✅ 所有其他菜单项工作正常 (${workingItems}/${menuItems.length})`);
      return true;
    } else {
      console.log(`❌ 部分菜单项有问题 (${workingItems}/${menuItems.length})`);
      return false;
    }
  }

  // 测试页面标题不包含设置
  async testPageTitlesNoSettings() {
    console.log('\n📄 测试5: 验证页面标题不包含设置');
    
    try {
      // 访问各个页面检查标题
      const pages = [
        { path: '/', expectedTitle: '仓位管理' },
        { path: '/dashboard', expectedTitle: '仪表盘' },
        { path: '/contract-calculator', expectedTitle: '合约计算器' },
        { path: '/volatility-calculator', expectedTitle: '波动率计算器' }
      ];
      
      let correctTitles = 0;
      
      for (const pageInfo of pages) {
        await this.page.goto(`http://localhost:57321${pageInfo.path}`);
        await this.page.waitForTimeout(1000);
        
        const title = await this.page.title();
        
        if (title.includes(pageInfo.expectedTitle) && !title.includes('设置')) {
          console.log(`✅ ${pageInfo.path} 页面标题正确: ${title}`);
          correctTitles++;
        } else {
          console.log(`❌ ${pageInfo.path} 页面标题有问题: ${title}`);
        }
      }
      
      if (correctTitles === pages.length) {
        console.log('✅ 所有页面标题都不包含设置相关内容');
        return true;
      } else {
        console.log('❌ 部分页面标题有问题');
        return false;
      }
    } catch (error) {
      console.log('❌ 页面标题测试失败:', error.message);
      return false;
    }
  }

  // 测试控制台无错误
  async testNoConsoleErrors() {
    console.log('\n🔍 测试6: 验证控制台无错误');
    
    try {
      const errors = [];
      
      // 监听控制台错误
      this.page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // 访问主页并等待加载
      await this.page.goto('http://localhost:57321/');
      await this.page.waitForTimeout(3000);
      
      // 导航到几个页面
      await this.page.getByRole('button', { name: '合约计算器' }).first().click();
      await this.page.waitForTimeout(1000);
      
      await this.page.getByRole('button', { name: '波动率计算器' }).first().click();
      await this.page.waitForTimeout(1000);
      
      if (errors.length === 0) {
        console.log('✅ 控制台无错误');
        return true;
      } else {
        console.log(`❌ 控制台有${errors.length}个错误:`);
        errors.forEach(error => console.log(`  - ${error}`));
        return false;
      }
    } catch (error) {
      console.log('❌ 控制台错误检查失败:', error.message);
      return false;
    }
  }

  // 运行所有测试
  async runAllTests() {
    try {
      await this.setup();
      
      console.log('🧪 开始执行设置菜单删除测试');
      console.log('=' .repeat(60));
      
      const tests = [
        this.testSettingsMenuNotExists,
        this.testSettingsRouteNotAccessible,
        this.testMenuItemCount,
        this.testOtherMenuItemsWork,
        this.testPageTitlesNoSettings,
        this.testNoConsoleErrors
      ];
      
      let passedTests = 0;
      
      for (const test of tests) {
        const testResult = await test.call(this);
        if (testResult) {
          passedTests++;
        }
        await this.page.waitForTimeout(500);
      }
      
      console.log('\n📋 === 设置菜单删除测试结果汇总 ===');
      console.log(`总测试数: ${tests.length}`);
      console.log(`通过: ${passedTests}`);
      console.log(`失败: ${tests.length - passedTests}`);
      console.log(`成功率: ${((passedTests / tests.length) * 100).toFixed(2)}%`);
      
      if (passedTests === tests.length) {
        console.log('🎉 设置菜单删除成功！所有测试通过');
      } else {
        console.log('⚠️  部分测试失败，需要检查删除是否完整');
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
  const testSuite = new SettingsRemovalTest();
  await testSuite.runAllTests();
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default SettingsRemovalTest;
