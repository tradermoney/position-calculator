import { test, expect } from '@playwright/test';

test.describe('PNL计算器百分比平仓功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:57319/position-calculator/');
  });

  test('委托单方向下拉列表应包含平仓百分比选项', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForSelector('[data-testid="pnl-calculator"]');

    // 查找委托单方向下拉列表
    const directionSelects = await page.locator('select').all();
    expect(directionSelects.length).toBeGreaterThan(0);

    // 检查第一个委托单的方向选项
    const firstSelect = directionSelects[0];
    await firstSelect.click();

    // 验证所有选项都存在
    const options = await firstSelect.locator('option').allTextContents();
    expect(options).toContain('开仓');
    expect(options).toContain('平仓');
    expect(options).toContain('平仓25%');
    expect(options).toContain('平仓50%');
    expect(options).toContain('平仓75%');
    expect(options).toContain('平仓100%');
  });

  test('选择平仓百分比时数量输入框应为只读状态', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForSelector('[data-testid="pnl-calculator"]');

    // 查找第二个委托单（默认是平仓）
    const directionSelects = await page.locator('select').all();
    if (directionSelects.length >= 2) {
      const secondSelect = directionSelects[1];
      await secondSelect.click();

      // 选择平仓50%
      await page.locator('option[value="close_50"]').click();

      // 查找数量输入框（应该是第4个输入框：价格、数量、杠杆前、杠杆后）
      const quantityInputs = await page.locator('input[type="text"]').all();
      expect(quantityInputs.length).toBeGreaterThan(3);

      // 验证数量、杠杆前、杠杆后输入框为只读状态
      const quantityInput = quantityInputs[1]; // 数量输入框
      const marginInput = quantityInputs[2];   // 杠杆前输入框
      const quantityUsdtInput = quantityInputs[3]; // 杠杆后输入框

      await expect(quantityInput).toBeDisabled();
      await expect(marginInput).toBeDisabled();
      await expect(quantityUsdtInput).toBeDisabled();
    }
  });

  test('选择开仓时数量输入框应恢复可编辑状态', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForSelector('[data-testid="pnl-calculator"]');

    // 查找第一个委托单（默认是开仓）
    const directionSelects = await page.locator('select').all();
    if (directionSelects.length >= 1) {
      const firstSelect = directionSelects[0];

      // 确保选择的是开仓
      await firstSelect.selectOption({ value: 'open' });

      // 查找数量输入框
      const quantityInputs = await page.locator('input[type="text"]').all();
      expect(quantityInputs.length).toBeGreaterThan(3);

      // 验证数量、杠杆前、杠杆后输入框可编辑
      const quantityInput = quantityInputs[1]; // 数量输入框
      const marginInput = quantityInputs[2];   // 杠杆前输入框
      const quantityUsdtInput = quantityInputs[3]; // 杠杆后输入框

      await expect(quantityInput).not.toBeDisabled();
      await expect(marginInput).not.toBeDisabled();
      await expect(quantityUsdtInput).not.toBeDisabled();
    }
  });

  test('百分比平仓应自动计算数量', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForSelector('[data-testid="pnl-calculator"]');

    // 设置第一个委托单为开仓
    const directionSelects = await page.locator('select').all();
    if (directionSelects.length >= 2) {
      // 设置第一个委托单
      const firstSelect = directionSelects[0];
      await firstSelect.selectOption({ value: 'open' });

      // 填写开仓数据
      const inputs = await page.locator('input[type="text"]').all();
      await inputs[0].fill('100'); // 价格
      await inputs[1].fill('10');  // 数量

      // 等待自动计算完成
      await page.waitForTimeout(500);

      // 设置第二个委托单为平仓50%
      const secondSelect = directionSelects[1];
      await secondSelect.selectOption({ value: 'close_50' });

      // 等待自动计算完成
      await page.waitForTimeout(1000);

      // 验证第二个委托单的数量字段自动填充为5（50% of 10）
      const secondRowInputs = await page.locator('tbody tr:nth-child(2) input[type="text"]').all();
      if (secondRowInputs.length >= 2) {
        const quantityValue = await secondRowInputs[1].inputValue();
        expect(quantityValue).toBe('5'); // 应该是10的50%
      }
    }
  });

  test('不同百分比应正确计算数量', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForSelector('[data-testid="pnl-calculator"]');

    // 添加多个委托单来测试不同百分比
    await page.locator('button:has-text("增加仓位")').click();
    await page.waitForTimeout(500);

    const directionSelects = await page.locator('select').all();
    if (directionSelects.length >= 3) {
      // 设置第一个委托单为开仓
      await directionSelects[0].selectOption({ value: 'open' });

      // 填写开仓数据
      const firstRowInputs = await page.locator('tbody tr:nth-child(1) input[type="text"]').all();
      await firstRowInputs[0].fill('100'); // 价格
      await firstRowInputs[1].fill('100'); // 数量

      await page.waitForTimeout(500);

      // 设置第二个委托单为平仓25%
      await directionSelects[1].selectOption({ value: 'close_25' });
      await page.waitForTimeout(1000);

      // 验证平仓25%计算正确
      const secondRowInputs = await page.locator('tbody tr:nth-child(2) input[type="text"]').all();
      if (secondRowInputs.length >= 2) {
        const quantityValue = await secondRowInputs[1].inputValue();
        expect(quantityValue).toBe('25'); // 应该是100的25%
      }

      // 设置第三个委托单为平仓75%
      await directionSelects[2].selectOption({ value: 'close_75' });
      await page.waitForTimeout(1000);

      // 验证平仓75%计算正确（基于剩余75个币）
      const thirdRowInputs = await page.locator('tbody tr:nth-child(3) input[type="text"]').all();
      if (thirdRowInputs.length >= 2) {
        const quantityValue = await thirdRowInputs[1].inputValue();
        expect(quantityValue).toBe('56.25'); // 应该是75的75%
      }
    }
  });

  test('计算按钮应正确处理百分比平仓', async ({ page }) => {
    // 等待页面加载完成
    await page.waitForSelector('[data-testid="pnl-calculator"]');

    // 设置测试数据
    const directionSelects = await page.locator('select').all();
    if (directionSelects.length >= 2) {
      // 第一个委托单：开仓
      await directionSelects[0].selectOption({ value: 'open' });
      const firstRowInputs = await page.locator('tbody tr:nth-child(1) input[type="text"]').all();
      await firstRowInputs[0].fill('100'); // 价格
      await firstRowInputs[1].fill('10');  // 数量

      await page.waitForTimeout(500);

      // 第二个委托单：平仓100%
      await directionSelects[1].selectOption({ value: 'close_100' });
      await page.waitForTimeout(1000);

      // 点击计算按钮
      await page.locator('button:has-text("计算")').click();
      await page.waitForTimeout(1000);

      // 验证计算结果存在
      const resultElement = await page.locator('text=/盈亏|回报率|总盈亏/').first();
      await expect(resultElement).toBeVisible();
    }
  });
});