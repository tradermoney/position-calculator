import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:5173/position-calculator/break-even-calculator';

// 用于截图的计数器
let screenshotCounter = 1;

// 辅助函数：等待并截图
async function takeScreenshot(page: Page, name: string) {
  await page.waitForTimeout(500); // 等待动画完成
  await page.screenshot({
    path: `test-results/break-even-calculator-${screenshotCounter.toString().padStart(2, '0')}-${name}.png`,
    fullPage: true
  });
  screenshotCounter++;
}

// 辅助函数：获取输入元素
async function getInput(page: Page, label: string) {
  return page.locator(`input[type="number"]`).filter({ hasText: label }).or(
    page.locator(`input[type="number"]`).nth(
      label === '杠杆倍数' ? 0 :
      label === '开仓手续费率' ? 1 :
      label === '平仓手续费率' ? 2 :
      label === '资金费率' ? 3 :
      label === '持仓时间' ? 4 : 0
    )
  );
}

// 辅助函数：设置输入值
async function setInputValue(page: Page, inputSelector: string, value: string) {
  const input = page.locator(inputSelector);
  await input.click();
  await input.fill('');
  await input.type(value);
  await input.blur();
  await page.waitForTimeout(300); // 等待计算完成
}

test.describe('保本回报率计算器测试', () => {
  test.beforeEach(async ({ page }) => {
    // 创建测试结果目录
    await page.goto(BASE_URL);
    await page.waitForTimeout(2000); // 等待页面完全加载
  });

  test('1. 页面加载和基本显示测试', async ({ page }) => {
    // 验证页面标题
    await expect(page.locator('h1')).toContainText('保本回报率计算器');

    // 验证页面描述
    await expect(page.locator('text=计算合约交易的保本回报率')).toBeVisible();

    // 验证主要组件存在
    await expect(page.locator('text=计算参数设置')).toBeVisible();
    await expect(page.locator('text=杠杆倍数')).toBeVisible();
    await expect(page.locator('text=开仓手续费率')).toBeVisible();
    await expect(page.locator('text=平仓手续费率')).toBeVisible();
    await expect(page.locator('text=资金费率')).toBeVisible();
    await expect(page.locator('text=资金费率结算周期')).toBeVisible();
    await expect(page.locator('text=预期持仓时间')).toBeVisible();

    // 验证重置按钮存在
    await expect(page.locator('[aria-label="重置为默认值"], [title="重置为默认值"]')).toBeVisible();

    // 验证结果面板显示
    await expect(page.locator('text=保本回报率')).toBeVisible();

    await takeScreenshot(page, 'page-loaded');
  });

  test('2. 杠杆倍数输入测试', async ({ page }) => {
    // 获取杠杆倍数输入框
    const leverageInput = page.locator('input[type="number"]').first();

    // 测试输入50
    await setInputValue(page, 'input[type="number"]', '50');
    await expect(leverageInput).toHaveValue('50');

    // 验证滑块同步 (通过检查滑块的aria-valuenow属性)
    const leverageSlider = page.locator('[role="slider"]').first();
    await expect(leverageSlider).toHaveAttribute('aria-valuenow', '50');

    // 测试边界值
    await setInputValue(page, 'input[type="number"]', '1');
    await expect(leverageInput).toHaveValue('1');

    await setInputValue(page, 'input[type="number"]', '200');
    await expect(leverageInput).toHaveValue('200');

    await takeScreenshot(page, 'leverage-input-test');
  });

  test('3. 开仓手续费率输入测试', async ({ page }) => {
    // 获取开仓手续费率输入框 (第二个数字输入框)
    const openFeeInput = page.locator('input[type="number"]').nth(1);

    // 测试输入0.03
    await setInputValue(page, 'input[type="number"]:nth-of-type(2)', '0.03');
    await expect(openFeeInput).toHaveValue('0.03');

    // 测试边界值
    await setInputValue(page, 'input[type="number"]:nth-of-type(2)', '0');
    await expect(openFeeInput).toHaveValue('0');

    await setInputValue(page, 'input[type="number"]:nth-of-type(2)', '1');
    await expect(openFeeInput).toHaveValue('1');

    await takeScreenshot(page, 'open-fee-input-test');
  });

  test('4. 平仓手续费率输入测试', async ({ page }) => {
    // 获取平仓手续费率输入框 (第三个数字输入框)
    const closeFeeInput = page.locator('input[type="number"]').nth(2);

    // 测试输入0.08
    await setInputValue(page, 'input[type="number"]:nth-of-type(3)', '0.08');
    await expect(closeFeeInput).toHaveValue('0.08');

    // 验证计算结果更新
    const resultElement = page.locator('text=保本回报率').locator('..').locator('text=%');
    await expect(resultElement).toBeVisible();

    await takeScreenshot(page, 'close-fee-input-test');
  });

  test('5. 资金费率输入测试', async ({ page }) => {
    // 获取资金费率输入框 (第四个数字输入框)
    const fundingRateInput = page.locator('input[type="number"]').nth(3);

    // 测试正值
    await setInputValue(page, 'input[type="number"]:nth-of-type(4)', '0.01');
    await expect(fundingRateInput).toHaveValue('0.01');

    // 测试负值
    await setInputValue(page, 'input[type="number"]:nth-of-type(4)', '-0.02');
    await expect(fundingRateInput).toHaveValue('-0.02');

    // 验证负资金费率的影响
    const fundingCostElement = page.locator('text=资金费率成本');
    await expect(fundingCostElement).toBeVisible();

    await takeScreenshot(page, 'funding-rate-input-test');
  });

  test('6. 资金费率结算周期测试', async ({ page }) => {
    // 获取结算周期选择框
    const periodSelect = page.locator('select');

    // 测试选择1小时
    await periodSelect.selectOption('1');
    await expect(periodSelect).toHaveValue('1');

    // 测试选择4小时
    await periodSelect.selectOption('4');
    await expect(periodSelect).toHaveValue('4');

    // 测试选择8小时（默认）
    await periodSelect.selectOption('8');
    await expect(periodSelect).toHaveValue('8');

    // 测试选择24小时
    await periodSelect.selectOption('24');
    await expect(periodSelect).toHaveValue('24');

    await takeScreenshot(page, 'funding-period-test');
  });

  test('7. 持仓时间输入测试', async ({ page }) => {
    // 获取持仓时间输入框 (最后一个数字输入框)
    const holdingTimeInput = page.locator('input[type="number"]').last();

    // 测试输入12小时
    await setInputValue(page, 'input[type="number"]:last-of-type', '12');
    await expect(holdingTimeInput).toHaveValue('12');

    // 测试边界值
    await setInputValue(page, 'input[type="number"]:last-of-type', '0');
    await expect(holdingTimeInput).toHaveValue('0');

    await setInputValue(page, 'input[type="number"]:last-of-type', '168');
    await expect(holdingTimeInput).toHaveValue('168');

    await takeScreenshot(page, 'holding-time-test');
  });

  test('8. 计算结果验证测试', async ({ page }) => {
    // 设置已知参数进行计算验证
    // 杠杆倍数: 100x
    await setInputValue(page, 'input[type="number"]:nth-of-type(1)', '100');

    // 开仓手续费率: 0.05%
    await setInputValue(page, 'input[type="number"]:nth-of-type(2)', '0.05');

    // 平仓手续费率: 0.05%
    await setInputValue(page, 'input[type="number"]:nth-of-type(3)', '0.05');

    // 资金费率: 0.01%
    await setInputValue(page, 'input[type="number"]:nth-of-type(4)', '0.01');

    // 资金费率结算周期: 8小时
    await page.locator('select').selectOption('8');

    // 持仓时间: 24小时
    await setInputValue(page, 'input[type="number"]:last-of-type', '24');

    // 等待计算完成
    await page.waitForTimeout(1000);

    // 验证计算结果
    // 预期保本回报率 = 5% + 5% + 0.3% = 10.3%
    const totalBreakEvenRate = page.locator('text=保本回报率').locator('..').locator('text=10.3000%');
    await expect(totalBreakEvenRate).toBeVisible();

    // 验证成本明细
    await expect(page.locator('text=5.0000%')).toBeVisible(); // 开仓成本
    await expect(page.locator('text=0.3000%')).toBeVisible(); // 资金费率成本

    await takeScreenshot(page, 'calculation-verification');
  });

  test('9. 重置功能测试', async ({ page }) => {
    // 修改所有参数
    await setInputValue(page, 'input[type="number"]:nth-of-type(1)', '50');
    await setInputValue(page, 'input[type="number"]:nth-of-type(2)', '0.1');
    await setInputValue(page, 'input[type="number"]:nth-of-type(3)', '0.1');
    await setInputValue(page, 'input[type="number"]:nth-of-type(4)', '0.05');
    await page.locator('select').selectOption('4');
    await setInputValue(page, 'input[type="number"]:last-of-type', '48');

    await takeScreenshot(page, 'before-reset');

    // 点击重置按钮
    const resetButton = page.locator('[aria-label="重置为默认值"], [title="重置为默认值"]');
    await resetButton.click();

    // 等待重置完成
    await page.waitForTimeout(1000);

    // 验证默认值
    await expect(page.locator('input[type="number"]:nth-of-type(1)')).toHaveValue('100'); // 杠杆倍数
    await expect(page.locator('input[type="number"]:nth-of-type(2)')).toHaveValue('0.05'); // 开仓手续费率
    await expect(page.locator('input[type="number"]:nth-of-type(3)')).toHaveValue('0.05'); // 平仓手续费率
    await expect(page.locator('input[type="number"]:nth-of-type(4)')).toHaveValue('0.01'); // 资金费率
    await expect(page.locator('select')).toHaveValue('8'); // 结算周期
    await expect(page.locator('input[type="number"]:last-of-type')).toHaveValue('24'); // 持仓时间

    await takeScreenshot(page, 'after-reset');
  });

  test('10. 错误处理测试', async ({ page }) => {
    // 测试无效杠杆倍数
    await setInputValue(page, 'input[type="number"]:nth-of-type(1)', '0');

    // 检查是否有错误提示或自动修正
    const leverageInput = page.locator('input[type="number"]:nth-of-type(1)');
    const leverageValue = await leverageInput.inputValue();

    // 杠杆倍数应该被修正为有效值或显示错误
    if (leverageValue === '0') {
      // 如果允许0，检查是否有错误提示
      const errorMessage = page.locator('text=杠杆倍数必须大于0');
      await expect(errorMessage).toBeVisible();
    } else {
      // 如果自动修正，验证修正值
      expect(parseInt(leverageValue)).toBeGreaterThan(0);
    }

    // 测试超出范围的费率
    await setInputValue(page, 'input[type="number"]:nth-of-type(2)', '15');

    // 检查是否被限制或显示错误
    const openFeeInput = page.locator('input[type="number"]:nth-of-type(2)');
    const feeValue = await openFeeInput.inputValue();
    expect(parseFloat(feeValue)).toBeLessThanOrEqual(10);

    await takeScreenshot(page, 'error-handling-test');
  });

  test('11. 响应式设计测试', async ({ page }) => {
    // 桌面视图
    await page.setViewportSize({ width: 1920, height: 1080 });
    await takeScreenshot(page, 'desktop-view');

    // 平板视图
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await takeScreenshot(page, 'tablet-view');

    // 手机视图
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    await takeScreenshot(page, 'mobile-view');

    // 验证移动端功能是否正常
    await setInputValue(page, 'input[type="number"]:nth-of-type(1)', '50');
    await expect(page.locator('input[type="number"]:nth-of-type(1)')).toHaveValue('50');

    await takeScreenshot(page, 'mobile-functionality-test');
  });

  test('12. 性能和交互测试', async ({ page }) => {
    const startTime = Date.now();

    // 快速连续调整多个参数
    for (let i = 0; i < 5; i++) {
      await setInputValue(page, 'input[type="number"]:nth-of-type(1)', String(50 + i * 10));
      await setInputValue(page, 'input[type="number"]:nth-of-type(2)', String(0.05 + i * 0.01));
      await setInputValue(page, 'input[type="number"]:nth-of-type(4)', String(0.01 + i * 0.005));

      // 短暂等待
      await page.waitForTimeout(100);
    }

    const endTime = Date.now();
    const executionTime = endTime - startTime;

    console.log(`性能测试执行时间: ${executionTime}ms`);

    // 验证最终结果显示正常
    await expect(page.locator('text=保本回报率')).toBeVisible();
    const resultText = await page.locator('text=保本回报率').locator('..').locator('text=%').textContent();
    expect(resultText).toMatch(/\\d+\\.\\d+%/);

    await takeScreenshot(page, 'performance-test-final');
  });

  test('13. 完整场景测试', async ({ page }) => {
    // 模拟真实用户使用场景

    // 场景1：高杠杆短期交易
    await setInputValue(page, 'input[type="number"]:nth-of-type(1)', '200'); // 200x杠杆
    await setInputValue(page, 'input[type="number"]:nth-of-type(2)', '0.03'); // 低手续费
    await setInputValue(page, 'input[type="number"]:nth-of-type(3)', '0.03');
    await setInputValue(page, 'input[type="number"]:nth-of-type(4)', '0.01');
    await setInputValue(page, 'input[type="number"]:last-of-type', '4'); // 短期持仓

    await takeScreenshot(page, 'scenario-high-leverage-short-term');

    // 场景2：低杠杆长期持仓
    await setInputValue(page, 'input[type="number"]:nth-of-type(1)', '10'); // 10x杠杆
    await setInputValue(page, 'input[type="number"]:nth-of-type(2)', '0.1'); // 高手续费
    await setInputValue(page, 'input[type="number"]:nth-of-type(3)', '0.1');
    await setInputValue(page, 'input[type="number"]:nth-of-type(4)', '0.05');
    await setInputValue(page, 'input[type="number"]:last-of-type', '168'); // 长期持仓

    await takeScreenshot(page, 'scenario-low-leverage-long-term');

    // 场景3：负资金费率
    await setInputValue(page, 'input[type="number"]:nth-of-type(1)', '100');
    await setInputValue(page, 'input[type="number"]:nth-of-type(4)', '-0.01'); // 负资金费率
    await setInputValue(page, 'input[type="number"]:last-of-type', '72');

    await takeScreenshot(page, 'scenario-negative-funding-rate');

    // 验证负资金费率降低了保本要求
    const negativeResult = await page.locator('text=保本回报率').locator('..').locator('text=%').textContent();

    // 重置为正资金费率对比
    await setInputValue(page, 'input[type="number"]:nth-of-type(4)', '0.01');
    const positiveResult = await page.locator('text=保本回报率').locator('..').locator('text=%').textContent();

    // 负资金费率的保本要求应该更低
    const negativeRate = parseFloat(negativeResult?.replace('%', '') || '0');
    const positiveRate = parseFloat(positiveResult?.replace('%', '') || '0');
    expect(negativeRate).toBeLessThan(positiveRate);

    await takeScreenshot(page, 'scenario-comparison-complete');
  });
});

// 测试后清理
test.afterAll(async () => {
  console.log('所有测试完成，请查看test-results目录下的截图文件');
});