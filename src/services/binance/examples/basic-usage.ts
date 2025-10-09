/**
 * 币安API基础使用示例
 */

import { BinanceMarketDataAPI, BinanceError } from '../index';

/**
 * 示例1: 获取当前价格
 */
export async function example1_getCurrentPrice() {
  const client = new BinanceMarketDataAPI();
  
  try {
    // 获取BTC现货价格
    const btcPrice = await client.getCurrentPrice('BTCUSDT');
    console.log('BTC现货价格:', btcPrice);
    
    // 获取ETH合约价格
    const ethPrice = await client.getCurrentPrice('ETHUSDT', 'perpetual');
    console.log('ETH永续合约价格:', ethPrice);
  } catch (error) {
    if (error instanceof BinanceError) {
      console.error('币安API错误:', error.getFriendlyMessage());
    } else {
      console.error('未知错误:', error);
    }
  }
}

/**
 * 示例2: 获取24小时行情数据
 */
export async function example2_get24hrTicker() {
  const client = new BinanceMarketDataAPI();
  
  try {
    const ticker = await client.get24hrTicker('BTCUSDT');
    
    console.log('24小时行情数据:');
    console.log('- 开盘价:', ticker.openPrice);
    console.log('- 最高价:', ticker.highPrice);
    console.log('- 最低价:', ticker.lowPrice);
    console.log('- 最新价:', ticker.lastPrice);
    console.log('- 涨跌幅:', ticker.priceChangePercent + '%');
    console.log('- 成交量:', ticker.volume);
    console.log('- 成交额:', ticker.quoteVolume);
  } catch (error) {
    console.error('获取行情失败:', error);
  }
}

/**
 * 示例3: 获取K线数据
 */
export async function example3_getKlines() {
  const client = new BinanceMarketDataAPI();
  
  try {
    // 获取最近100根1小时K线
    const klines = await client.getKlines({
      symbol: 'BTCUSDT',
      interval: '1h',
      limit: 100,
    });
    
    console.log(`获取到 ${klines.length} 根K线数据`);
    
    // 打印最后一根K线
    const lastKline = klines[klines.length - 1];
    console.log('最新K线:');
    console.log('- 时间:', new Date(lastKline.openTime));
    console.log('- 开盘价:', lastKline.open);
    console.log('- 最高价:', lastKline.high);
    console.log('- 最低价:', lastKline.low);
    console.log('- 收盘价:', lastKline.close);
    console.log('- 成交量:', lastKline.volume);
  } catch (error) {
    console.error('获取K线失败:', error);
  }
}

/**
 * 示例4: 获取深度数据
 */
export async function example4_getOrderBook() {
  const client = new BinanceMarketDataAPI();
  
  try {
    const orderBook = await client.getOrderBook({
      symbol: 'BTCUSDT',
      limit: 10,
    });
    
    console.log('订单簿数据:');
    console.log('\n买盘 (Bids):');
    orderBook.bids.slice(0, 5).forEach(([price, quantity]) => {
      console.log(`  价格: ${price}, 数量: ${quantity}`);
    });
    
    console.log('\n卖盘 (Asks):');
    orderBook.asks.slice(0, 5).forEach(([price, quantity]) => {
      console.log(`  价格: ${price}, 数量: ${quantity}`);
    });
  } catch (error) {
    console.error('获取订单簿失败:', error);
  }
}

/**
 * 示例5: 获取合约资金费率
 */
export async function example5_getFundingRate() {
  const client = new BinanceMarketDataAPI();
  
  try {
    const fundingRates = await client.getFundingRate({
      symbol: 'BTCUSDT',
      limit: 10,
    });
    
    console.log('资金费率历史:');
    fundingRates.forEach(rate => {
      console.log(`时间: ${new Date(rate.fundingTime)}, 费率: ${(parseFloat(rate.fundingRate) * 100).toFixed(4)}%`);
    });
  } catch (error) {
    console.error('获取资金费率失败:', error);
  }
}

/**
 * 示例6: 获取标记价格
 */
export async function example6_getMarkPrice() {
  const client = new BinanceMarketDataAPI();
  
  try {
    const markPrice = await client.getMarkPrice('BTCUSDT');
    
    console.log('标记价格信息:');
    console.log('- 标记价格:', markPrice.markPrice);
    console.log('- 指数价格:', markPrice.indexPrice);
    console.log('- 预估结算价:', markPrice.estimatedSettlePrice);
    console.log('- 下次资金费率:', markPrice.lastFundingRate);
    console.log('- 下次资金时间:', new Date(markPrice.nextFundingTime));
  } catch (error) {
    console.error('获取标记价格失败:', error);
  }
}

/**
 * 示例7: 获取持仓量
 */
export async function example7_getOpenInterest() {
  const client = new BinanceMarketDataAPI();
  
  try {
    const openInterest = await client.getOpenInterest('BTCUSDT');
    
    console.log('持仓量信息:');
    console.log('- 持仓量:', openInterest.openInterest);
    console.log('- 时间:', new Date(openInterest.time));
  } catch (error) {
    console.error('获取持仓量失败:', error);
  }
}

/**
 * 示例8: 获取多空比
 */
export async function example8_getLongShortRatio() {
  const client = new BinanceMarketDataAPI();
  
  try {
    // 获取大户账户数多空比
    const accountRatio = await client.getTopLongShortAccountRatio({
      symbol: 'BTCUSDT',
      period: '5m',
      limit: 30,
    });
    
    console.log('大户账户数多空比:');
    const latest = accountRatio[accountRatio.length - 1];
    console.log('- 多头比例:', (parseFloat(latest.longAccount) * 100).toFixed(2) + '%');
    console.log('- 空头比例:', (parseFloat(latest.shortAccount) * 100).toFixed(2) + '%');
    console.log('- 多空比:', latest.longShortRatio);
  } catch (error) {
    console.error('获取多空比失败:', error);
  }
}

/**
 * 示例9: 批量获取多个交易对价格
 */
export async function example9_getMultiplePrices() {
  const client = new BinanceMarketDataAPI();
  
  try {
    const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];
    
    // 并发获取多个价格
    const prices = await Promise.all(
      symbols.map(symbol => client.getCurrentPrice(symbol))
    );
    
    console.log('多个交易对价格:');
    symbols.forEach((symbol, index) => {
      console.log(`${symbol}: ${prices[index]}`);
    });
  } catch (error) {
    console.error('批量获取价格失败:', error);
  }
}

/**
 * 示例10: 使用错误重试机制
 */
export async function example10_withRetry() {
  const client = new BinanceMarketDataAPI({
    timeout: 5000,
  });
  
  try {
    // API会自动重试失败的请求
    const price = await client.getCurrentPrice('BTCUSDT');
    console.log('获取价格成功:', price);
  } catch (error) {
    if (error instanceof BinanceError) {
      console.error('重试后仍然失败:', error.getFriendlyMessage());
      
      // 检查错误类型
      if (error.isRateLimitError()) {
        console.log('触发了速率限制，请稍后重试');
      } else if (error.isAuthenticationError()) {
        console.log('认证失败，请检查API密钥');
      } else if (error.isParameterError()) {
        console.log('参数错误，请检查请求参数');
      }
    }
  }
}

/**
 * 运行所有示例
 */
export async function runAllExamples() {
  console.log('=== 示例1: 获取当前价格 ===');
  await example1_getCurrentPrice();
  
  console.log('\n=== 示例2: 获取24小时行情 ===');
  await example2_get24hrTicker();
  
  console.log('\n=== 示例3: 获取K线数据 ===');
  await example3_getKlines();
  
  console.log('\n=== 示例4: 获取深度数据 ===');
  await example4_getOrderBook();
  
  console.log('\n=== 示例5: 获取资金费率 ===');
  await example5_getFundingRate();
  
  console.log('\n=== 示例6: 获取标记价格 ===');
  await example6_getMarkPrice();
  
  console.log('\n=== 示例7: 获取持仓量 ===');
  await example7_getOpenInterest();
  
  console.log('\n=== 示例8: 获取多空比 ===');
  await example8_getLongShortRatio();
  
  console.log('\n=== 示例9: 批量获取价格 ===');
  await example9_getMultiplePrices();
  
  console.log('\n=== 示例10: 错误重试机制 ===');
  await example10_withRetry();
}

// 如果直接运行此文件
if (require.main === module) {
  runAllExamples().catch(console.error);
}

