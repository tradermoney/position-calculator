# 币安API SDK - 快速开始

## 5分钟快速上手

### 1. 导入SDK

```typescript
import { BinanceMarketDataAPI } from '@/services/binance';
```

### 2. 创建客户端

```typescript
const client = new BinanceMarketDataAPI();
```

### 3. 调用API

```typescript
// 获取BTC价格
const price = await client.getCurrentPrice('BTCUSDT');
console.log('BTC价格:', price);
```

## 常用功能

### 获取实时价格

```typescript
// 获取永续合约价格
const btcPrice = await client.getCurrentPrice('BTCUSDT');
const ethPrice = await client.getCurrentPrice('ETHUSDT');
```

### 获取K线数据

```typescript
const klines = await client.getKlines({
  symbol: 'BTCUSDT',
  interval: '1h',    // 1m, 5m, 15m, 30m, 1h, 4h, 1d等
  limit: 100,        // 获取最近100根K线
});

// 使用K线数据
klines.forEach(kline => {
  console.log(`时间: ${new Date(kline.openTime)}`);
  console.log(`开盘: ${kline.open}, 收盘: ${kline.close}`);
});
```

### 获取24小时行情

```typescript
const ticker = await client.get24hrTicker('BTCUSDT');

console.log('开盘价:', ticker.openPrice);
console.log('最高价:', ticker.highPrice);
console.log('最低价:', ticker.lowPrice);
console.log('最新价:', ticker.lastPrice);
console.log('涨跌幅:', ticker.priceChangePercent + '%');
console.log('成交量:', ticker.volume);
```

### 获取订单簿

```typescript
const orderBook = await client.getOrderBook({
  symbol: 'BTCUSDT',
  limit: 20,  // 获取20档深度
});

// 最优买价和卖价
const [bestBidPrice, bestBidQty] = orderBook.bids[0];
const [bestAskPrice, bestAskQty] = orderBook.asks[0];

console.log(`买一: ${bestBidPrice} (${bestBidQty})`);
console.log(`卖一: ${bestAskPrice} (${bestAskQty})`);
```

### 获取资金费率（合约）

```typescript
const markPrice = await client.getMarkPrice('BTCUSDT');

const fundingRate = parseFloat(markPrice.lastFundingRate) * 100;
console.log('当前资金费率:', fundingRate.toFixed(4) + '%');
console.log('下次结算时间:', new Date(markPrice.nextFundingTime));
```

### 批量获取价格

```typescript
const symbols = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT'];

const prices = await Promise.all(
  symbols.map(symbol => client.getCurrentPrice(symbol))
);

symbols.forEach((symbol, i) => {
  console.log(`${symbol}: $${prices[i]}`);
});
```

## 错误处理

```typescript
import { BinanceError } from '@/services/binance';

try {
  const price = await client.getCurrentPrice('BTCUSDT');
} catch (error) {
  if (error instanceof BinanceError) {
    // 获取友好的错误消息
    console.error(error.getFriendlyMessage());
    
    // 检查错误类型
    if (error.isRateLimitError()) {
      console.log('请求过于频繁，请稍后重试');
    }
  }
}
```

## 配置选项

```typescript
const client = new BinanceMarketDataAPI({
  timeout: 10000,      // 请求超时（毫秒）
  testnet: false,      // 是否使用测试网
});
```

## 运行测试

```bash
# 运行快速测试
npx tsx src/services/binance/examples/quick-test.ts

# 运行所有示例
npx tsx src/services/binance/examples/basic-usage.ts
```

## 完整文档

查看 [README.md](./README.md) 获取完整的API文档和更多示例。

## 支持的市场

- ✅ 永续合约（USDT本位）
- ✅ 期货合约（币本位）
- ❌ 现货市场（本项目不支持）

## 支持的时间间隔

K线时间间隔：
- 分钟: `1m`, `3m`, `5m`, `15m`, `30m`
- 小时: `1h`, `2h`, `4h`, `6h`, `8h`, `12h`
- 天/周/月: `1d`, `3d`, `1w`, `1M`

## 常见问题

### Q: 如何获取历史K线数据？

```typescript
const klines = await client.getKlines({
  symbol: 'BTCUSDT',
  interval: '1d',
  startTime: Date.now() - 30 * 24 * 60 * 60 * 1000, // 30天前
  endTime: Date.now(),
  limit: 1000,
});
```

### Q: 如何监控实时价格？

```typescript
setInterval(async () => {
  const price = await client.getCurrentPrice('BTCUSDT');
  console.log('当前价格:', price);
}, 5000); // 每5秒更新一次
```

### Q: 如何处理速率限制？

SDK内置了自动重试机制，会自动处理速率限制错误。如果仍然遇到问题，可以增加请求间隔：

```typescript
import { sleep } from '@/services/binance';

for (const symbol of symbols) {
  const price = await client.getCurrentPrice(symbol);
  console.log(symbol, price);
  await sleep(100); // 每次请求间隔100ms
}
```

### Q: 支持哪些交易对？

支持币安所有的交易对，包括：
- USDT本位: BTCUSDT, ETHUSDT等
- BUSD本位: BTCBUSD, ETHBUSD等
- 币本位: BTCUSD_PERP等

### Q: 需要API密钥吗？

市场数据接口不需要API密钥，可以直接使用。如果需要访问账户信息或进行交易，则需要配置API密钥：

```typescript
const client = new BinanceMarketDataAPI({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
});
```

## 下一步

- 📖 阅读 [完整文档](./README.md)
- 💡 查看 [使用示例](./examples/basic-usage.ts)
- 🧪 运行 [测试脚本](./examples/quick-test.ts)
- 📝 查看 [实现总结](../../../BINANCE_API_IMPLEMENTATION.md)

## 获取帮助

如果遇到问题，请：
1. 查看 [README.md](./README.md) 中的详细文档
2. 查看 [币安API官方文档](https://binance-docs.github.io/apidocs/)
3. 检查网络连接和API配置

---

祝使用愉快！🚀

