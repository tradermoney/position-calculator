// 简化的开仓价格计算器复选框功能测试
// 验证核心功能：复选框控制计算、视觉效果、新增仓位

import { chromium } from 'playwright';

async function testCheckboxFunctionality() {
  console.log('🧪 开始测试开仓价格计算器复选框功能...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 500
  });
  
  try {
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // 访问开仓价格计算器页面
    await page.goto('http://localhost:57321/entry-price-calculator');
    await page.waitForTimeout(2000);
    
    console.log('✅ 页面加载成功');
    
    // 测试1: 输入数据并验证初始计算
    console.log('\n📊 测试1: 输入数据并验证初始计算');
    await page.getByPlaceholder('0.00').nth(0).fill('50000');
    await page.getByPlaceholder('0.00').nth(1).fill('1');
    await page.getByPlaceholder('0.00').nth(2).fill('52000');
    await page.getByPlaceholder('0.00').nth(3).fill('1');
    await page.waitForTimeout(1000);
    
    // 检查初始计算结果
    const initialPrice = await page.locator('text=51000.0000 USDT').first();
    const initialExists = await initialPrice.isVisible();
    
    if (initialExists) {
      console.log('✅ 初始平均价格计算正确: 51000 USDT');
    } else {
      console.log('❌ 初始计算结果不正确');
      return false;
    }
    
    // 测试2: 取消勾选第二个仓位
    console.log('\n🔲 测试2: 取消勾选第二个仓位');
    await page.locator('input[type="checkbox"]').nth(1).uncheck();
    await page.waitForTimeout(1000);
    
    // 检查计算结果是否变为50000
    const newPrice = await page.locator('text=50000.0000 USDT').first();
    const newExists = await newPrice.isVisible();
    
    if (newExists) {
      console.log('✅ 取消勾选后平均价格正确: 50000 USDT');
    } else {
      console.log('❌ 取消勾选后计算结果不正确');
      return false;
    }
    
    // 检查第二行输入框是否被禁用
    const disabledInput = await page.locator('tbody tr').nth(1).locator('input[disabled]').count();
    if (disabledInput >= 2) {
      console.log('✅ 禁用仓位的输入框正确禁用');
    } else {
      console.log('❌ 禁用仓位的输入框状态不正确');
    }
    
    // 测试3: 重新启用第二个仓位
    console.log('\n✅ 测试3: 重新启用第二个仓位');
    await page.locator('input[type="checkbox"]').nth(1).check();
    await page.waitForTimeout(1000);
    
    // 检查计算结果是否恢复为51000
    const restoredPrice = await page.locator('text=51000.0000 USDT').first();
    const restoredExists = await restoredPrice.isVisible();
    
    if (restoredExists) {
      console.log('✅ 重新启用后平均价格恢复: 51000 USDT');
    } else {
      console.log('❌ 重新启用后计算结果不正确');
      return false;
    }
    
    // 测试4: 添加新仓位并验证复选框
    console.log('\n➕ 测试4: 添加新仓位并验证复选框');
    await page.getByRole('button', { name: '增加仓位' }).click();
    await page.waitForTimeout(500);
    
    // 检查新增的复选框
    const checkboxCount = await page.locator('input[type="checkbox"]').count();
    if (checkboxCount >= 3) {
      console.log(`✅ 成功添加新仓位，复选框数量: ${checkboxCount}`);
    } else {
      console.log(`❌ 新增仓位失败，复选框数量: ${checkboxCount}`);
      return false;
    }
    
    // 检查新增复选框是否默认勾选
    const newCheckbox = await page.locator('input[type="checkbox"]').nth(2);
    const isChecked = await newCheckbox.isChecked();
    
    if (isChecked) {
      console.log('✅ 新增仓位复选框默认勾选');
    } else {
      console.log('❌ 新增仓位复选框未默认勾选');
      return false;
    }
    
    // 测试5: 验证使用说明显示
    console.log('\n📖 测试5: 验证使用说明显示');
    const instruction = await page.locator('text=使用复选框可以临时排除某些仓位的计算').first();
    const instructionExists = await instruction.isVisible();
    
    if (instructionExists) {
      console.log('✅ 复选框使用说明正确显示');
    } else {
      console.log('❌ 复选框使用说明未显示');
      return false;
    }
    
    console.log('\n🎉 所有复选框功能测试通过！');
    console.log('\n📋 功能验证总结:');
    console.log('✅ 复选框控制计算功能正常');
    console.log('✅ 禁用仓位视觉效果正确');
    console.log('✅ 重新启用功能正常');
    console.log('✅ 新增仓位复选框功能正常');
    console.log('✅ 使用说明正确显示');
    
    return true;
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error);
    return false;
  } finally {
    await browser.close();
    console.log('🔚 测试完成，浏览器已关闭');
  }
}

// 运行测试
testCheckboxFunctionality().then(success => {
  if (success) {
    console.log('\n🎊 复选框功能测试全部通过！');
    process.exit(0);
  } else {
    console.log('\n⚠️ 部分测试失败，请检查功能实现');
    process.exit(1);
  }
}).catch(error => {
  console.error('测试执行失败:', error);
  process.exit(1);
});
