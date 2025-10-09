# 币安API客户端SDK

这是一个完整的币安API客户端SDK，支持现货和合约市场数据接口。

## 特性

- ✅ 完整的TypeScript类型支持
- ✅ 支持现货和合约市场
- ✅ 自动错误重试机制
- ✅ 请求速率限制保护
- ✅ 详细的错误处理
- ✅ 完善的文档和示例
- ✅ 零依赖（仅使用原生fetch）

## 安装

SDK已集成在项目中，无需额外安装。

## 快速开始

### 基础使用

```typescript
import { BinanceMarketDataAPI } from '@/services/binance';

// 创建客户端实例
const client = new BinanceMarketDataAPI();

// 获取当前价格
const price = await client.getCurrentPrice('BTCUSDT');
console.log('BTC价格:', price);

// 获取24小时行情
const ticker = await client.get24hrTicker('BTCUSDT');
console.log('24小时涨跌幅:', ticker.priceChangePercent + '%');
```

### 配置选项

```typescript
import { BinanceMarketDataAPI } from '@/services/binance';

const client = new BinanceMarketDataAPI({
  // 请求超时时间（毫秒）
  timeout: 10000,
  
  // 是否使用测试网
  testnet: false,
  
  // 自定义API端点（可选）
  baseURL: 'https://api.binance.com',
  
  // API密钥（仅私有接口需要）
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
});
```

## API文档

### 市场数据接口

#### 获取服务器时间

```typescript
const serverTime = await client.getServerTime();
console.log('服务器时间:', new Date(serverTime.serverTime));
```

#### 获取交易规则和交易对信息

```typescript
// 现货交易规则
const spotInfo = await client.getExchangeInfo();

// 合约交易规则
const futuresInfo = await client.getExchangeInfo('perpetual');

// 查找特定交易对信息
const btcInfo = spotInfo.symbols.find(s => s.symbol === 'BTCUSDT');
console.log('BTC交易规则:', btcInfo);
```

#### 获取当前价格

```typescript
// 现货价格
const spotPrice = await client.getCurrentPrice('BTCUSDT');

// 永续合约价格
const futuresPrice = await client.getCurrentPrice('BTCUSDT', 'perpetual');

// 交割合约价格
const deliveryPrice = await client.getCurrentPrice('BTCUSD_PERP', 'delivery');
```

#### 获取订单簿深度

```typescript
const orderBook = await client.getOrderBook({
  symbol: 'BTCUSDT',
  limit: 20, // 可选: 5, 10, 20, 50, 100, 500, 1000
});

console.log('最优买价:', orderBook.bids[0][0]);
console.log('最优卖价:', orderBook.asks[0][0]);
```

#### 获取最近成交

```typescript
const trades = await client.getTrades({
  symbol: 'BTCUSDT',
  limit: 100,
});

trades.forEach(trade => {
  console.log(`价格: ${trade.price}, 数量: ${trade.qty}, 时间: ${new Date(trade.time)}`);
});
```

#### 获取K线数据

```typescript
const klines = await client.getKlines({
  symbol: 'BTCUSDT',
  interval: '1h', // 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
  limit: 100,
  startTime: Date.now() - 24 * 60 * 60 * 1000, // 可选
  endTime: Date.now(), // 可选
});

klines.forEach(kline => {
  console.log(`时间: ${new Date(kline.openTime)}, 开: ${kline.open}, 高: ${kline.high}, 低: ${kline.low}, 收: ${kline.close}`);
});
```

#### 获取24小时价格变动

```typescript
const ticker = await client.get24hrTicker('BTCUSDT');

console.log('开盘价:', ticker.openPrice);
console.log('最高价:', ticker.highPrice);
console.log('最低价:', ticker.lowPrice);
console.log('最新价:', ticker.lastPrice);
console.log('涨跌额:', ticker.priceChange);
console.log('涨跌幅:', ticker.priceChangePercent + '%');
console.log('成交量:', ticker.volume);
console.log('成交额:', ticker.quoteVolume);
```

### 合约专用接口

#### 获取标记价格

```typescript
const markPrice = await client.getMarkPrice('BTCUSDT');

console.log('标记价格:', markPrice.markPrice);
console.log('指数价格:', markPrice.indexPrice);
console.log('下次资金费率:', markPrice.lastFundingRate);
console.log('下次资金时间:', new Date(markPrice.nextFundingTime));
```

#### 获取资金费率历史

```typescript
const fundingRates = await client.getFundingRate({
  symbol: 'BTCUSDT',
  limit: 100,
  startTime: Date.now() - 7 * 24 * 60 * 60 * 1000, // 最近7天
});

fundingRates.forEach(rate => {
  const ratePercent = (parseFloat(rate.fundingRate) * 100).toFixed(4);
  console.log(`时间: ${new Date(rate.fundingTime)}, 费率: ${ratePercent}%`);
});
```

#### 获取持仓量

```typescript
// 当前持仓量
const openInterest = await client.getOpenInterest('BTCUSDT');
console.log('持仓量:', openInterest.openInterest);

// 历史持仓量
const openInterestHist = await client.getOpenInterestHist({
  symbol: 'BTCUSDT',
  period: '5m', // 5m, 15m, 30m, 1h, 2h, 4h, 6h, 12h, 1d
  limit: 30,
});
```

#### 获取大户持仓量多空比

```typescript
// 大户账户数多空比
const accountRatio = await client.getTopLongShortAccountRatio({
  symbol: 'BTCUSDT',
  period: '5m',
  limit: 30,
});

// 大户持仓量多空比
const positionRatio = await client.getTopLongShortPositionRatio({
  symbol: 'BTCUSDT',
  period: '5m',
  limit: 30,
});

const latest = accountRatio[accountRatio.length - 1];
console.log('多头账户比例:', (parseFloat(latest.longAccount) * 100).toFixed(2) + '%');
console.log('空头账户比例:', (parseFloat(latest.shortAccount) * 100).toFixed(2) + '%');
```

#### 获取全市场多空比

```typescript
const globalRatio = await client.getGlobalLongShortAccountRatio({
  symbol: 'BTCUSDT',
  period: '5m',
  limit: 30,
});

const latest = globalRatio[globalRatio.length - 1];
console.log('全市场多空比:', latest.longShortRatio);
```

#### 获取主动买卖量

```typescript
const buySellVol = await client.getTakerBuySellVol({
  symbol: 'BTCUSDT',
  period: '5m',
  limit: 30,
});

buySellVol.forEach(vol => {
  const buyRatio = (parseFloat(vol.buySellRatio) * 100).toFixed(2);
  console.log(`时间: ${new Date(vol.timestamp)}, 买卖比: ${buyRatio}%`);
});
```

## 错误处理

SDK提供了完善的错误处理机制：

```typescript
import { BinanceError, BinanceErrorCode } from '@/services/binance';

try {
  const price = await client.getCurrentPrice('BTCUSDT');
} catch (error) {
  if (error instanceof BinanceError) {
    // 获取友好的错误消息
    console.error('错误:', error.getFriendlyMessage());
    
    // 检查错误类型
    if (error.isRateLimitError()) {
      console.log('触发了速率限制，请稍后重试');
    } else if (error.isAuthenticationError()) {
      console.log('认证失败，请检查API密钥');
    } else if (error.isParameterError()) {
      console.log('参数错误，请检查请求参数');
    }
    
    // 获取错误码
    console.log('错误码:', error.code);
    console.log('HTTP状态:', error.httpStatus);
  } else {
    console.error('未知错误:', error);
  }
}
```

### 自动重试

SDK内置了自动重试机制，会自动重试以下类型的错误：

- 速率限制错误（429）
- 服务器繁忙错误
- 网络连接错误
- 超时错误

重试策略：
- 最多重试3次
- 使用指数退避算法
- 添加随机抖动避免同时重试

```typescript
import { RetryStrategy } from '@/services/binance';

// 自定义重试策略
const retryStrategy = new RetryStrategy(
  5,      // 最大重试次数
  1000,   // 基础延迟（毫秒）
  30000   // 最大延迟（毫秒）
);

// 使用重试策略执行操作
const result = await retryStrategy.execute(
  async () => {
    return await client.getCurrentPrice('BTCUSDT');
  },
  (error, attempt, delay) => {
    console.log(`重试第${attempt}次，延迟${delay}ms，错误: ${error.message}`);
  }
);
```

## 工具函数

SDK提供了一些实用的工具函数：

```typescript
import {
  intervalToMilliseconds,
  formatPrice,
  calculatePercentChange,
  formatLargeNumber,
  parseSymbol,
  adjustPriceToTickSize,
  adjustQuantityToStepSize,
} from '@/services/binance';

// 时间间隔转毫秒
const ms = intervalToMilliseconds('1h'); // 3600000

// 格式化价格
const price = formatPrice('45123.45000000'); // "45123.45"

// 计算百分比变化
const change = calculatePercentChange(100, 110); // 10

// 格式化大数字
const formatted = formatLargeNumber(1234567); // "1.23M"

// 解析交易对
const parsed = parseSymbol('BTCUSDT'); // { base: 'BTC', quote: 'USDT' }

// 调整价格到合法步长
const adjustedPrice = adjustPriceToTickSize(45123.456, '0.01'); // 45123.46

// 调整数量到合法步长
const adjustedQty = adjustQuantityToStepSize(0.12345, '0.001'); // 0.123
```

## 类型定义

SDK提供了完整的TypeScript类型定义：

```typescript
import type {
  ContractType,
  OrderSide,
  PositionSide,
  KlineInterval,
  Ticker24hr,
  Kline,
  OrderBook,
  MarkPrice,
  FundingRate,
} from '@/services/binance';

// 合约类型
const contractType: ContractType = 'perpetual'; // 'perpetual' | 'delivery'

// 订单方向
const side: OrderSide = 'BUY'; // 'BUY' | 'SELL'

// 持仓方向
const positionSide: PositionSide = 'LONG'; // 'BOTH' | 'LONG' | 'SHORT'

// K线间隔
const interval: KlineInterval = '1h'; // '1m' | '3m' | '5m' | ...
```

## 示例代码

查看 `examples/basic-usage.ts` 文件获取更多示例。

### 实时监控价格

```typescript
async function monitorPrice(symbol: string, interval: number = 5000) {
  const client = new BinanceMarketDataAPI();
  
  setInterval(async () => {
    try {
      const price = await client.getCurrentPrice(symbol);
      const ticker = await client.get24hrTicker(symbol);
      
      console.log(`${symbol} - 价格: ${price}, 24h涨跌: ${ticker.priceChangePercent}%`);
    } catch (error) {
      console.error('获取价格失败:', error);
    }
  }, interval);
}

monitorPrice('BTCUSDT', 5000);
```

### 分析K线数据

```typescript
async function analyzeKlines(symbol: string) {
  const client = new BinanceMarketDataAPI();
  
  const klines = await client.getKlines({
    symbol,
    interval: '1h',
    limit: 100,
  });
  
  // 计算平均价格
  const avgPrice = klines.reduce((sum, k) => sum + parseFloat(k.close), 0) / klines.length;
  
  // 找出最高价和最低价
  const highestPrice = Math.max(...klines.map(k => parseFloat(k.high)));
  const lowestPrice = Math.min(...klines.map(k => parseFloat(k.low)));
  
  // 计算总成交量
  const totalVolume = klines.reduce((sum, k) => sum + parseFloat(k.volume), 0);
  
  console.log('K线分析结果:');
  console.log('- 平均价格:', avgPrice.toFixed(2));
  console.log('- 最高价:', highestPrice.toFixed(2));
  console.log('- 最低价:', lowestPrice.toFixed(2));
  console.log('- 总成交量:', totalVolume.toFixed(2));
}

analyzeKlines('BTCUSDT');
```

### 监控资金费率

```typescript
async function monitorFundingRate(symbol: string) {
  const client = new BinanceMarketDataAPI();
  
  const markPrice = await client.getMarkPrice(symbol);
  const fundingRate = parseFloat(markPrice.lastFundingRate) * 100;
  const nextFundingTime = new Date(markPrice.nextFundingTime);
  
  console.log(`${symbol} 资金费率监控:`);
  console.log('- 当前费率:', fundingRate.toFixed(4) + '%');
  console.log('- 下次结算:', nextFundingTime.toLocaleString());
  
  // 计算年化费率（假设每8小时结算一次）
  const annualizedRate = fundingRate * 3 * 365;
  console.log('- 年化费率:', annualizedRate.toFixed(2) + '%');
}

monitorFundingRate('BTCUSDT');
```

## 注意事项

1. **速率限制**：币安API有严格的速率限制，请合理控制请求频率
   - 现货API：每分钟1200次请求
   - 合约API：每分钟2400次请求

2. **时间同步**：确保系统时间准确，避免时间戳错误

3. **错误处理**：始终使用try-catch处理API调用，避免程序崩溃

4. **测试环境**：开发时建议使用测试网，避免真实资金损失

5. **API密钥安全**：
   - 不要在代码中硬编码API密钥
   - 使用环境变量存储敏感信息
   - 定期更换API密钥
   - 限制API密钥的IP白名单

## 相关链接

- [币安API文档](https://binance-docs.github.io/apidocs/)
- [币安现货API](https://binance-docs.github.io/apidocs/spot/cn/)
- [币安合约API](https://binance-docs.github.io/apidocs/futures/cn/)
- [币安错误码](https://developers.binance.com/docs/zh-CN/derivatives/error-code)

## 许可证

MIT

