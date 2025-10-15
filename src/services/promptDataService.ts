/**
 * 提示词数据服务
 * 用于获取和格式化币安数据
 */

import { BinanceMarketDataAPI } from './binance';
import { PromptDataConfig } from '../utils/storage/types';
import { getFormattedOrderBook } from './orderBookFormatter';

/**
 * 格式化K线数据为markdown表格
 */
function formatKlineData(klines: any[]): string {
  if (!klines || klines.length === 0) {
    return '暂无K线数据';
  }

  let markdown = '| 时间 | 开盘价 | 最高价 | 最低价 | 收盘价 | 成交量 |\n';
  markdown += '|------|--------|--------|--------|--------|--------|\n';

  klines.forEach(kline => {
    const time = new Date(kline[0]).toLocaleString('zh-CN');
    const open = parseFloat(kline[1]);
    const high = parseFloat(kline[2]);
    const low = parseFloat(kline[3]);
    const close = parseFloat(kline[4]);
    const volume = parseFloat(kline[5]);

    markdown += `| ${time} | ${open} | ${high} | ${low} | ${close} | ${volume.toFixed(2)} |\n`;
  });

  return markdown.trim();
}

/**
 * 格式化资金费率数据为markdown表格
 */
function formatFundingRateData(fundingRates: any[]): string {
  if (!fundingRates || fundingRates.length === 0) {
    return '暂无资金费率数据';
  }

  let markdown = '| 时间 | 资金费率 | 标记价格 |\n';
  markdown += '|------|----------|----------|\n';

  fundingRates.forEach(rate => {
    const time = new Date(rate.fundingTime).toLocaleString('zh-CN');
    const fundingRate = (parseFloat(rate.fundingRate) * 100).toFixed(4);
    const markPrice = rate.markPrice ? parseFloat(rate.markPrice).toFixed(2) : 'N/A';

    markdown += `| ${time} | ${fundingRate}% | ${markPrice} |\n`;
  });

  return markdown.trim();
}

// 订单薄格式化已移至 orderBookFormatter.ts 模块

/**
 * 获取单个数据配置的数据
 */
async function fetchDataForConfig(config: PromptDataConfig, api: BinanceMarketDataAPI): Promise<string> {
  try {
    switch (config.type) {
      case 'symbol': {
        if (!config.symbol) {
          return '交易对未配置';
        }
        const price = await api.getCurrentPrice(config.symbol);
        return `**交易对**: ${config.symbol}\n\n**当前价格**: ${price}`;
      }

      case 'kline': {
        if (!config.symbol) {
          return 'K线数据: 交易对未配置';
        }
        const interval = config.interval || '1m';
        const limit = config.limit || 1000;
        const klines = await api.getKlines({
          symbol: config.symbol,
          interval: interval as any,
          limit,
        });
        return `### K线数据 (${config.symbol}, ${interval}, 最近${limit}条)\n\n${formatKlineData(klines)}`;
      }

      case 'fundingRate': {
        if (!config.symbol) {
          return '资金费率数据: 交易对未配置';
        }
        const days = config.days || 3;
        const endTime = Date.now();
        const startTime = endTime - days * 24 * 60 * 60 * 1000;
        const fundingRates = await api.getFundingRate({
          symbol: config.symbol,
          startTime,
          endTime,
          limit: 1000,
        });
        return `### 资金费率数据 (${config.symbol}, 最近${days}天)\n\n${formatFundingRateData(fundingRates)}`;
      }

      case 'orderBook': {
        // 使用独立的订单薄格式化模块
        return await getFormattedOrderBook(api, config);
      }

      default:
        return `未知数据类型: ${config.type}`;
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    return `获取${config.type}数据失败: ${error instanceof Error ? error.message : '未知错误'}`;
  }
}

/**
 * 获取所有数据配置的数据并拼接
 */
export async function fetchPromptData(dataConfigs: PromptDataConfig[]): Promise<string> {
  console.log('[PromptData] ========== 开始获取提示词数据 ==========');
  console.log('[PromptData] 数据配置数量:', dataConfigs.length);
  console.log('[PromptData] 数据配置详情:', JSON.stringify(dataConfigs, null, 2));
  
  if (!dataConfigs || dataConfigs.length === 0) {
    console.log('[PromptData] 没有数据配置，返回空字符串');
    return '';
  }
  
  const api = new BinanceMarketDataAPI();
  const dataPromises = dataConfigs.map((config, index) => {
    console.log(`[PromptData] 准备获取配置 ${index + 1}/${dataConfigs.length}:`, config.type);
    return fetchDataForConfig(config, api);
  });
  
  console.log('[PromptData] 等待所有数据获取完成...');
  const dataResults = await Promise.all(dataPromises);
  
  console.log('[PromptData] 数据获取完成，结果数量:', dataResults.length);
  dataResults.forEach((result, index) => {
    console.log(`[PromptData] 结果 ${index + 1} 长度:`, result.length, '字符');
    console.log(`[PromptData] 结果 ${index + 1} 前100字符:`, result.substring(0, 100));
  });
  
  const finalResult = dataResults.join('\n\n---\n\n');
  console.log('[PromptData] ========== 提示词数据获取完成 ==========');
  console.log('[PromptData] 最终结果长度:', finalResult.length, '字符');
  
  return finalResult;
}


