// 合约计算器测试脚本
// 用于验证我们的计算器功能是否与币安一致

const { chromium } = require('playwright');

async function testContractCalculator() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  
  // 打开我们的页面
  const ourPage = await context.newPage();
  await ourPage.goto('http://localhost:57320/contract-calculator');
  
  // 打开币安页面
  const binancePage = await context.newPage();
  await binancePage.goto('https://www.binance.com/zh-CN/futures/BTCUSDT/calculator');
  
  console.log('开始测试合约计算器...');
  
  // 测试盈亏计算器
  console.log('\n=== 测试盈亏计算器 ===');
  
  // 在我们的页面测试
  await ourPage.getByRole('tab', { name: '盈亏计算器' }).click();
  await ourPage.getByRole('spinbutton', { name: '开仓价格' }).fill('50000');
  await ourPage.getByRole('spinbutton', { name: '平仓价格' }).fill('55000');
  await ourPage.getByRole('spinbutton', { name: '成交数量' }).fill('1');
  
  await ourPage.waitForTimeout(1000);
  
  const ourPnLResult = await ourPage.locator('[data-testid="pnl-result"]').textContent();
  console.log('我们的盈亏结果:', ourPnLResult);
  
  // 在币安页面测试
  await binancePage.getByRole('textbox', { name: 'input field' }).first().fill('50000');
  await binancePage.getByRole('textbox', { name: 'input field' }).nth(1).fill('55000');
  await binancePage.getByRole('textbox', { name: 'input field' }).nth(2).fill('1');
  await binancePage.getByRole('button', { name: '计算' }).click();
  
  await binancePage.waitForTimeout(1000);
  
  // 获取币安的结果
  const binancePnL = await binancePage.locator('text=5,000.00USDT').textContent();
  console.log('币安的盈亏结果:', binancePnL);
  
  // 测试目标价格计算器
  console.log('\n=== 测试目标价格计算器 ===');
  
  // 在我们的页面测试
  await ourPage.getByRole('tab', { name: '目标价格' }).click();
  await ourPage.getByRole('spinbutton', { name: '开仓价格' }).fill('50000');
  await ourPage.getByRole('button', { name: '+50%' }).click();
  
  await ourPage.waitForTimeout(1000);
  
  const ourTargetPrice = await ourPage.locator('[data-testid="target-price-result"]').textContent();
  console.log('我们的目标价格结果:', ourTargetPrice);
  
  // 在币安页面测试
  await binancePage.getByRole('tab', { name: '目标价格' }).click();
  await binancePage.getByRole('textbox', { name: 'input field' }).first().fill('50000');
  await binancePage.getByRole('textbox', { name: 'input field' }).nth(1).fill('50');
  await binancePage.getByRole('button', { name: '计算' }).click();
  
  await binancePage.waitForTimeout(1000);
  
  const binanceTargetPrice = await binancePage.locator('text=51,249.99USDT').textContent();
  console.log('币安的目标价格结果:', binanceTargetPrice);
  
  console.log('\n测试完成！');
  
  await browser.close();
}

// 运行测试
testContractCalculator().catch(console.error);
