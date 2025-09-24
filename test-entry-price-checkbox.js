// 测试开仓价格计算器的复选框功能
// 验证复选框可以控制仓位是否参与计算

import { chromium } from 'playwright';

class EntryPriceCheckboxTest {
  constructor() {
    this.browser = null;
    this.context = null;
    this.page = null;
    this.baseUrl = 'http://localhost:57321';
  }

  async setup() {
    console.log('🚀 启动开仓价格计算器复选框测试...');
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

  // 测试页面加载和复选框存在
  async testPageLoadAndCheckboxes() {
    console.log('\n📋 测试1: 验证页面加载和复选框存在');
    
    try {
      // 访问开仓价格计算器页面
      await this.page.goto(`${this.baseUrl}/entry-price-calculator`);
      await this.page.waitForTimeout(2000);
      
      // 检查页面标题
      const pageTitle = await this.page.title();
      if (pageTitle.includes('开仓价格计算器')) {
        console.log(`✅ 页面标题正确: ${pageTitle}`);
      } else {
        console.log(`❌ 页面标题错误: ${pageTitle}`);
        return false;
      }
      
      // 检查表格是否存在
      const table = await this.page.locator('table').first();
      const tableExists = await table.isVisible();
      
      if (!tableExists) {
        console.log('❌ 仓位表格不存在');
        return false;
      }
      
      // 检查复选框列是否存在
      const checkboxHeader = await this.page.locator('th:has-text("启用")').first();
      const headerExists = await checkboxHeader.isVisible();
      
      if (!headerExists) {
        console.log('❌ 复选框列头不存在');
        return false;
      } else {
        console.log('✅ 复选框列头存在');
      }
      
      // 检查默认的复选框数量（应该有2个默认仓位）
      const checkboxes = await this.page.locator('input[type="checkbox"]').count();
      
      if (checkboxes >= 2) {
        console.log(`✅ 找到${checkboxes}个复选框`);
      } else {
        console.log(`❌ 复选框数量不足: ${checkboxes}`);
        return false;
      }
      
      // 检查默认复选框是否都被勾选
      const checkedBoxes = await this.page.locator('input[type="checkbox"]:checked').count();
      
      if (checkedBoxes === checkboxes) {
        console.log('✅ 所有复选框默认都被勾选');
        return true;
      } else {
        console.log(`❌ 部分复选框未被勾选: ${checkedBoxes}/${checkboxes}`);
        return false;
      }
      
    } catch (error) {
      console.log('❌ 页面加载测试失败:', error.message);
      return false;
    }
  }

  // 测试复选框控制计算功能
  async testCheckboxCalculationControl() {
    console.log('\n⚙️ 测试2: 验证复选框控制计算功能');
    
    try {
      // 输入第一个仓位数据
      await this.page.locator('input[type="number"]').nth(0).fill('50000');
      await this.page.waitForTimeout(300);
      await this.page.locator('input[type="number"]').nth(1).fill('1');
      await this.page.waitForTimeout(500);
      
      // 输入第二个仓位数据
      await this.page.locator('input[type="number"]').nth(2).fill('52000');
      await this.page.waitForTimeout(300);
      await this.page.locator('input[type="number"]').nth(3).fill('1');
      await this.page.waitForTimeout(1000);
      
      // 检查是否有计算结果
      const resultCard = await this.page.locator('text=计算结果').first();
      const resultExists = await resultCard.isVisible();
      
      if (!resultExists) {
        console.log('❌ 计算结果未显示');
        return false;
      }
      
      // 获取初始的平均价格
      const initialAvgPrice = await this.page.locator('text=平均成本').locator('..').locator('div').nth(1).textContent();
      console.log(`✅ 初始平均价格: ${initialAvgPrice}`);
      
      // 取消勾选第二个仓位的复选框
      await this.page.locator('input[type="checkbox"]').nth(1).uncheck();
      await this.page.waitForTimeout(1000);
      
      // 检查平均价格是否改变
      const newAvgPrice = await this.page.locator('text=平均成本').locator('..').locator('div').nth(1).textContent();
      console.log(`✅ 取消勾选后平均价格: ${newAvgPrice}`);
      
      if (initialAvgPrice !== newAvgPrice) {
        console.log('✅ 复选框成功控制了计算结果');
        
        // 验证新的平均价格应该等于第一个仓位的价格（50000）
        if (newAvgPrice.includes('50000') || newAvgPrice.includes('50,000')) {
          console.log('✅ 计算结果正确，只计算了启用的仓位');
          return true;
        } else {
          console.log('❌ 计算结果不正确');
          return false;
        }
      } else {
        console.log('❌ 复选框未能控制计算结果');
        return false;
      }
      
    } catch (error) {
      console.log('❌ 复选框计算控制测试失败:', error.message);
      return false;
    }
  }

  // 测试禁用仓位的视觉效果
  async testDisabledPositionVisualEffect() {
    console.log('\n🎨 测试3: 验证禁用仓位的视觉效果');
    
    try {
      // 检查第二行的透明度（应该是禁用状态）
      const secondRow = await this.page.locator('tbody tr').nth(1);
      const rowStyle = await secondRow.getAttribute('style');
      
      if (rowStyle && rowStyle.includes('opacity')) {
        console.log('✅ 禁用行有透明度样式');
      } else {
        console.log('⚠️ 禁用行透明度样式可能不明显');
      }
      
      // 检查禁用行的输入框是否被禁用
      const disabledInputs = await this.page.locator('tbody tr').nth(1).locator('input[disabled]').count();
      
      if (disabledInputs >= 2) {
        console.log(`✅ 禁用行有${disabledInputs}个输入框被禁用`);
        return true;
      } else {
        console.log(`❌ 禁用行的输入框未被正确禁用: ${disabledInputs}`);
        return false;
      }
      
    } catch (error) {
      console.log('❌ 视觉效果测试失败:', error.message);
      return false;
    }
  }

  // 测试重新启用仓位
  async testReEnablePosition() {
    console.log('\n🔄 测试4: 验证重新启用仓位功能');
    
    try {
      // 重新勾选第二个仓位的复选框
      await this.page.locator('input[type="checkbox"]').nth(1).check();
      await this.page.waitForTimeout(1000);
      
      // 检查输入框是否重新启用
      const enabledInputs = await this.page.locator('tbody tr').nth(1).locator('input:not([disabled])').count();
      
      if (enabledInputs >= 2) {
        console.log(`✅ 重新启用后有${enabledInputs}个输入框可用`);
      } else {
        console.log(`❌ 重新启用后输入框状态不正确: ${enabledInputs}`);
        return false;
      }
      
      // 检查计算结果是否恢复
      const finalAvgPrice = await this.page.locator('text=平均成本').locator('..').locator('div').nth(1).textContent();
      console.log(`✅ 重新启用后平均价格: ${finalAvgPrice}`);
      
      // 应该恢复到包含两个仓位的计算结果（51000）
      if (finalAvgPrice.includes('51000') || finalAvgPrice.includes('51,000')) {
        console.log('✅ 重新启用后计算结果正确');
        return true;
      } else {
        console.log('❌ 重新启用后计算结果不正确');
        return false;
      }
      
    } catch (error) {
      console.log('❌ 重新启用测试失败:', error.message);
      return false;
    }
  }

  // 测试添加新仓位的复选框
  async testNewPositionCheckbox() {
    console.log('\n➕ 测试5: 验证新增仓位的复选框功能');
    
    try {
      // 点击添加仓位按钮
      await this.page.getByRole('button', { name: '添加交易' }).click();
      await this.page.waitForTimeout(500);
      
      // 检查是否增加了新的复选框
      const checkboxCount = await this.page.locator('input[type="checkbox"]').count();
      
      if (checkboxCount >= 3) {
        console.log(`✅ 添加仓位后复选框数量: ${checkboxCount}`);
      } else {
        console.log(`❌ 添加仓位后复选框数量不正确: ${checkboxCount}`);
        return false;
      }
      
      // 检查新增的复选框是否默认被勾选
      const newCheckbox = await this.page.locator('input[type="checkbox"]').nth(2);
      const isChecked = await newCheckbox.isChecked();
      
      if (isChecked) {
        console.log('✅ 新增仓位的复选框默认被勾选');
        return true;
      } else {
        console.log('❌ 新增仓位的复选框未被默认勾选');
        return false;
      }
      
    } catch (error) {
      console.log('❌ 新增仓位复选框测试失败:', error.message);
      return false;
    }
  }

  // 测试使用说明是否显示
  async testUsageInstructions() {
    console.log('\n📖 测试6: 验证使用说明显示');
    
    try {
      // 检查复选框使用说明是否存在
      const instructionAlert = await this.page.locator('text=使用复选框可以临时排除某些仓位的计算').first();
      const instructionExists = await instructionAlert.isVisible();
      
      if (instructionExists) {
        console.log('✅ 复选框使用说明显示正确');
        return true;
      } else {
        console.log('❌ 复选框使用说明未显示');
        return false;
      }
      
    } catch (error) {
      console.log('❌ 使用说明测试失败:', error.message);
      return false;
    }
  }

  // 运行所有测试
  async runAllTests() {
    try {
      await this.setup();
      
      console.log('🧪 开始执行开仓价格计算器复选框测试套件');
      console.log('=' .repeat(60));
      
      const tests = [
        { name: '页面加载和复选框存在', test: this.testPageLoadAndCheckboxes },
        { name: '复选框控制计算功能', test: this.testCheckboxCalculationControl },
        { name: '禁用仓位视觉效果', test: this.testDisabledPositionVisualEffect },
        { name: '重新启用仓位功能', test: this.testReEnablePosition },
        { name: '新增仓位复选框功能', test: this.testNewPositionCheckbox },
        { name: '使用说明显示', test: this.testUsageInstructions }
      ];
      
      let passedTests = 0;
      
      for (const testCase of tests) {
        const testResult = await testCase.test.call(this);
        if (testResult) {
          passedTests++;
        }
        await this.page.waitForTimeout(500);
      }
      
      console.log('\n📋 === 复选框功能测试结果汇总 ===');
      console.log(`总测试数: ${tests.length}`);
      console.log(`通过: ${passedTests}`);
      console.log(`失败: ${tests.length - passedTests}`);
      console.log(`成功率: ${((passedTests / tests.length) * 100).toFixed(2)}%`);
      
      if (passedTests === tests.length) {
        console.log('🎉 复选框功能测试全部通过！');
      } else {
        console.log('⚠️ 部分测试失败，需要检查功能实现');
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
  const testSuite = new EntryPriceCheckboxTest();
  const success = await testSuite.runAllTests();
  process.exit(success ? 0 : 1);
}

// 如果直接运行此文件
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default EntryPriceCheckboxTest;
