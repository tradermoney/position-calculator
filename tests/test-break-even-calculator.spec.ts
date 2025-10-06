import { test, expect } from '@playwright/test';

test.describe('保本回报率计算器 - 完整功能验证测试', () => {

  test('保本回报率计算器完整测试流程', async ({ page }) => {

    // 1. 导航到保本回报率计算器页面
    await page.goto('http://localhost:5173/position-calculator/break-even-calculator');
    await page.waitForTimeout(2000); // 等待页面完全加载

    console.log('✅ 步骤1: 成功导航到保本回报率计算器页面');

    // 2. 验证页面标题和基本元素
    await expect(page.locator('h1')).toContainText('保本回报率计算器');
    await expect(page.locator('text=计算合约交易的保本回报率')).toBeVisible();
    await expect(page.locator('text=计算参数设置')).toBeVisible();
    await expect(page.locator('text=杠杆倍数')).toBeVisible();
    await expect(page.locator('text=开仓手续费率')).toBeVisible();
    await expect(page.locator('text=平仓手续费率')).toBeVisible();
    await expect(page.locator('text=资金费率')).toBeVisible();
    await expect(page.locator('text=资金费率结算周期')).toBeVisible();
    await expect(page.locator('text=预期持仓时间')).toBeVisible();
    await expect(page.locator('text=保本回报率')).toBeVisible();

    console.log('✅ 步骤2: 页面标题和基本元素验证通过');

    // 3. 测试所有输入功能

    // 杠杆倍数设置为100倍
    const leverageInput = page.locator('input[type="number"]').first();
    await leverageInput.click();
    await leverageInput.fill('');
    await leverageInput.type('100');
    await leverageInput.blur();
    await page.waitForTimeout(300);
    await expect(leverageInput).toHaveValue('100');
    console.log('✅ 步骤3.1: 杠杆倍数设置为100倍');

    // 开仓手续费率设置为0.05%
    const openFeeInput = page.locator('input[type="number"]').nth(1);
    await openFeeInput.click();
    await openFeeInput.fill('');
    await openFeeInput.type('0.05');
    await openFeeInput.blur();
    await page.waitForTimeout(300);
    await expect(openFeeInput).toHaveValue('0.05');
    console.log('✅ 步骤3.2: 开仓手续费率设置为0.05%');

    // 平仓手续费率设置为0.05%
    const closeFeeInput = page.locator('input[type="number"]').nth(2);
    await closeFeeInput.click();
    await closeFeeInput.fill('');
    await closeFeeInput.type('0.05');
    await closeFeeInput.blur();
    await page.waitForTimeout(300);
    await expect(closeFeeInput).toHaveValue('0.05');
    console.log('✅ 步骤3.3: 平仓手续费率设置为0.05%');

    // 资金费率设置为0.01%
    const fundingRateInput = page.locator('input[type="number"]').nth(3);
    await fundingRateInput.click();
    await fundingRateInput.fill('');
    await fundingRateInput.type('0.01');
    await fundingRateInput.blur();
    await page.waitForTimeout(300);
    await expect(fundingRateInput).toHaveValue('0.01');
    console.log('✅ 步骤3.4: 资金费率设置为0.01%');

    // 资金费率结算周期选择8小时
    const periodSelect = page.locator('select');
    await periodSelect.selectOption('8');
    await page.waitForTimeout(300);
    await expect(periodSelect).toHaveValue('8');
    console.log('✅ 步骤3.5: 资金费率结算周期选择8小时');

    // 持仓时间设置为24小时
    const holdingTimeInput = page.locator('input[type="number"]').last();
    await holdingTimeInput.click();
    await holdingTimeInput.fill('');
    await holdingTimeInput.type('24');
    await holdingTimeInput.blur();
    await page.waitForTimeout(300);
    await expect(holdingTimeInput).toHaveValue('24');
    console.log('✅ 步骤3.6: 持仓时间设置为24小时');

    // 4. 验证计算结果是否正确显示
    await page.waitForTimeout(1000); // 等待计算完成

    // 查找保本回报率结果
    const breakEvenResult = page.locator('text=保本回报率').locator('..').locator('text=%');
    await expect(breakEvenResult).toBeVisible();

    // 获取保本回报率的数值
    const resultText = await breakEvenResult.textContent();
    console.log(`📊 计算结果: 保本回报率 = ${resultText}`);

    // 验证成本明细显示
    await expect(page.locator('text=开仓成本')).toBeVisible();
    await expect(page.locator('text=平仓成本')).toBeVisible();
    await expect(page.locator('text=资金费率成本')).toBeVisible();

    console.log('✅ 步骤4: 计算结果正确显示');

    // 5. 截屏保存测试结果
    await page.screenshot({
      path: 'test-results/break-even-calculator-final-result.png',
      fullPage: true
    });
    console.log('📸 步骤5: 测试结果截图已保存到 test-results/break-even-calculator-final-result.png');

    // 验证计算结果是否符合预期 (10.3% ± 0.1% 的误差范围)
    const resultValue = parseFloat(resultText?.replace('%', '') || '0');
    const expectedResult = 10.3;
    const tolerance = 0.1;

    expect(resultValue).toBeGreaterThanOrEqual(expectedResult - tolerance);
    expect(resultValue).toBeLessThanOrEqual(expectedResult + tolerance);

    console.log(`🎯 验证通过: 计算结果 ${resultValue}% 在预期范围 ${expectedResult}% ± ${tolerance}% 内`);
    console.log('🎉 所有测试步骤完成！保本回报率计算器功能正常');

  });

});