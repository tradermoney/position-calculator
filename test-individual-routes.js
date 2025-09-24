// 测试每个计算器的独立路由
// 验证每个路由都能正确加载对应的计算器标签页

import { chromium } from 'playwright';
import fs from 'fs';

class IndividualRoutesTestSuite {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.testResults = [];
    this.startTime = Date.now();
  }

  async setup() {
    console.log('🚀 启动独立路由测试环境...');
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

  // 测试单个路由
  async testRoute(routeInfo) {
    const { name, path, expectedTabText, tabIndex } = routeInfo;
    const startTime = Date.now();
    
    try {
      // 导航到指定路由
      await this.page.goto(`http://localhost:57319${path}`);
      await this.page.waitForTimeout(1000);
      
      // 检查页面标题
      const pageTitle = await this.page.title();
      
      // 检查是否显示了正确的标签页
      const activeTab = await this.page.locator('.MuiTab-root.Mui-selected').textContent();
      
      // 检查标签页内容是否正确加载（检查计算器组件是否存在）
      const tabContent = await this.page.locator('.MuiCard-root').first().isVisible();
      
      // 检查URL是否正确
      const currentUrl = this.page.url();
      
      const endTime = Date.now();
      const performance = { loadTime: endTime - startTime };
      
      // 验证结果
      const isCorrectTab = activeTab && activeTab.includes(expectedTabText);
      const isCorrectUrl = currentUrl.includes(path);
      const hasContent = tabContent;
      
      if (isCorrectTab && isCorrectUrl && hasContent) {
        this.recordResult(
          name,
          `路由正确，标签页: ${activeTab}`,
          true,
          `URL: ${currentUrl}`,
          performance
        );
        return true;
      } else {
        this.recordResult(
          name,
          'FAIL',
          false,
          `标签页: ${activeTab}, URL: ${currentUrl}, 内容: ${hasContent}`,
          performance
        );
        return false;
      }
    } catch (error) {
      this.recordResult(
        name,
        'ERROR',
        false,
        `测试执行失败: ${error.message}`,
        { loadTime: Date.now() - startTime }
      );
      return false;
    }
  }

  // 测试标签页切换是否更新URL
  async testTabNavigation() {
    const startTime = Date.now();
    
    try {
      // 从主路由开始
      await this.page.goto('http://localhost:57319/contract-calculator');
      await this.page.waitForTimeout(1000);
      
      const results = [];
      
      // 点击每个标签页并检查URL变化
      const tabs = await this.page.locator('.MuiTab-root').all();
      
      for (let i = 0; i < Math.min(tabs.length, 5); i++) {
        await tabs[i].click();
        await this.page.waitForTimeout(500);
        
        const currentUrl = this.page.url();
        const activeTab = await this.page.locator('.MuiTab-root.Mui-selected').textContent();
        
        results.push({
          tabIndex: i,
          tabText: activeTab,
          url: currentUrl
        });
      }
      
      const endTime = Date.now();
      const performance = { navigationTime: endTime - startTime };
      
      // 验证每次点击都更新了URL
      const urlsChanged = results.every((result, index) => {
        if (index === 0) return true;
        return result.url !== results[index - 1].url;
      });
      
      if (urlsChanged) {
        this.recordResult(
          '标签页导航',
          `成功测试${results.length}个标签页`,
          true,
          `URL变化: ${results.map(r => r.url.split('/').pop()).join(' → ')}`,
          performance
        );
        return true;
      } else {
        this.recordResult(
          '标签页导航',
          'FAIL',
          false,
          'URL未正确更新',
          performance
        );
        return false;
      }
    } catch (error) {
      this.recordResult(
        '标签页导航',
        'ERROR',
        false,
        `测试执行失败: ${error.message}`,
        { navigationTime: Date.now() - startTime }
      );
      return false;
    }
  }

  // 测试浏览器前进后退功能
  async testBrowserNavigation() {
    const startTime = Date.now();
    
    try {
      // 访问几个不同的路由
      const routes = [
        '/contract-calculator/pnl',
        '/contract-calculator/target-price',
        '/contract-calculator/liquidation'
      ];
      
      for (const route of routes) {
        await this.page.goto(`http://localhost:57319${route}`);
        await this.page.waitForTimeout(500);
      }
      
      // 测试后退
      await this.page.goBack();
      await this.page.waitForTimeout(500);
      const backUrl = this.page.url();
      
      // 测试前进
      await this.page.goForward();
      await this.page.waitForTimeout(500);
      const forwardUrl = this.page.url();
      
      const endTime = Date.now();
      const performance = { browserNavTime: endTime - startTime };
      
      const backCorrect = backUrl.includes('/target-price');
      const forwardCorrect = forwardUrl.includes('/liquidation');
      
      if (backCorrect && forwardCorrect) {
        this.recordResult(
          '浏览器导航',
          '前进后退功能正常',
          true,
          `后退: ${backUrl.split('/').pop()}, 前进: ${forwardUrl.split('/').pop()}`,
          performance
        );
        return true;
      } else {
        this.recordResult(
          '浏览器导航',
          'FAIL',
          false,
          `后退: ${backUrl}, 前进: ${forwardUrl}`,
          performance
        );
        return false;
      }
    } catch (error) {
      this.recordResult(
        '浏览器导航',
        'ERROR',
        false,
        `测试执行失败: ${error.message}`,
        { browserNavTime: Date.now() - startTime }
      );
      return false;
    }
  }

  // 运行所有测试
  async runAllTests() {
    try {
      await this.setup();
      
      console.log('🔗 开始执行独立路由测试套件');
      console.log('=' .repeat(60));
      
      // 定义所有路由测试
      const routes = [
        {
          name: '盈亏计算器路由',
          path: '/contract-calculator/pnl',
          expectedTabText: '盈亏计算器',
          tabIndex: 0
        },
        {
          name: '目标价格计算器路由',
          path: '/contract-calculator/target-price',
          expectedTabText: '目标价格',
          tabIndex: 1
        },
        {
          name: '强平价格计算器路由',
          path: '/contract-calculator/liquidation',
          expectedTabText: '强平价格',
          tabIndex: 2
        },
        {
          name: '可开计算器路由',
          path: '/contract-calculator/max-position',
          expectedTabText: '可开',
          tabIndex: 3
        },
        {
          name: '开仓价格计算器路由',
          path: '/contract-calculator/entry-price',
          expectedTabText: '开仓价格',
          tabIndex: 4
        },
        {
          name: '主路由重定向',
          path: '/contract-calculator',
          expectedTabText: '盈亏计算器',
          tabIndex: 0
        }
      ];
      
      console.log(`📊 总路由测试数: ${routes.length}`);
      
      // 测试每个独立路由
      for (let i = 0; i < routes.length; i++) {
        const route = routes[i];
        console.log(`\n[${i + 1}/${routes.length}] 测试: ${route.name}`);
        await this.testRoute(route);
        await this.page.waitForTimeout(500);
      }
      
      // 测试标签页导航
      console.log(`\n[${routes.length + 1}/${routes.length + 3}] 测试: 标签页导航`);
      await this.testTabNavigation();
      
      // 测试浏览器导航
      console.log(`\n[${routes.length + 2}/${routes.length + 3}] 测试: 浏览器导航`);
      await this.testBrowserNavigation();
      
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
      .filter(r => r.performance && Object.keys(r.performance).length > 0)
      .map(r => Object.values(r.performance)[0]);
    
    const avgLoadTime = performanceData.length > 0 
      ? (performanceData.reduce((a, b) => a + b, 0) / performanceData.length).toFixed(2)
      : 'N/A';
    
    const report = {
      summary: {
        totalTests,
        passedTests,
        failedTests,
        successRate: `${successRate}%`,
        duration: `${duration}秒`,
        avgLoadTime: `${avgLoadTime}ms`,
        timestamp: new Date().toISOString()
      },
      results: this.testResults
    };
    
    // 保存JSON报告
    fs.writeFileSync('individual-routes-test-report.json', JSON.stringify(report, null, 2));
    
    console.log('\n📋 === 独立路由测试报告 ===');
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过: ${passedTests}`);
    console.log(`失败: ${failedTests}`);
    console.log(`成功率: ${successRate}%`);
    console.log(`总耗时: ${duration}秒`);
    console.log(`平均加载时间: ${avgLoadTime}ms`);
    console.log('\n📄 详细报告已保存到 individual-routes-test-report.json');
  }
}

// 运行测试套件
async function main() {
  const testSuite = new IndividualRoutesTestSuite();
  await testSuite.runAllTests();
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default IndividualRoutesTestSuite;
