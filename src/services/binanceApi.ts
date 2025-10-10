/**
 * 币安API服务
 * 用于获取资金费率等数据
 */

const BINANCE_API_BASE = 'https://fapi.binance.com';

export interface FundingRateData {
  symbol: string;
  fundingTime: number;
  fundingRate: string;
  markPrice?: string;
}

export interface SymbolInfo {
  symbol: string;
  status: string;
  contractType: string;
  fundingIntervalHours: number; // 资金费率结算周期（小时）
}

export interface FundingRateHistoryParams {
  symbol: string;
  startTime?: number;
  endTime?: number;
  limit?: number; // 默认100，最大1000
}

/**
 * 获取资金费率历史
 */
export async function getFundingRateHistory(
  params: FundingRateHistoryParams
): Promise<FundingRateData[]> {
  try {
    const queryParams = new URLSearchParams({
      symbol: params.symbol,
      ...(params.startTime && { startTime: params.startTime.toString() }),
      ...(params.endTime && { endTime: params.endTime.toString() }),
      limit: (params.limit || 100).toString(),
    });

    const response = await fetch(
      `${BINANCE_API_BASE}/fapi/v1/fundingRate?${queryParams.toString()}`
    );

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('获取资金费率历史失败:', error);
    throw error;
  }
}

/**
 * 获取当前资金费率
 */
export async function getCurrentFundingRate(
  symbol: string
): Promise<FundingRateData> {
  try {
    const response = await fetch(
      `${BINANCE_API_BASE}/fapi/v1/premiumIndex?symbol=${symbol}`
    );

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      symbol: data.symbol,
      fundingTime: data.nextFundingTime,
      fundingRate: data.lastFundingRate,
      markPrice: data.markPrice,
    };
  } catch (error) {
    console.error('获取当前资金费率失败:', error);
    throw error;
  }
}

/**
 * 获取所有支持的交易对（仅返回交易对名称）
 */
export async function getExchangeInfo(): Promise<string[]> {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/fapi/v1/exchangeInfo`);

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.symbols
      .filter((s: any) => s.status === 'TRADING' && s.contractType === 'PERPETUAL')
      .map((s: any) => s.symbol);
  } catch (error) {
    console.error('获取交易对信息失败:', error);
    throw error;
  }
}

/**
 * 从资金费率历史数据中计算实际的结算周期
 * @param history 资金费率历史数据
 * @returns 结算周期（小时），如果无法计算则返回null
 */
export function calculateFundingIntervalFromHistory(history: FundingRateData[]): number | null {
  if (history.length < 2) {
    return null;
  }

  // 计算所有相邻两次结算的时间差
  const intervals: number[] = [];
  for (let i = 1; i < Math.min(history.length, 10); i++) {
    const timeDiff = history[i].fundingTime - history[i - 1].fundingTime;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    intervals.push(hoursDiff);
  }

  // 计算平均间隔并四舍五入到最接近的整数小时
  const avgInterval = intervals.reduce((sum, val) => sum + val, 0) / intervals.length;
  const roundedInterval = Math.round(avgInterval);

  console.log(`计算结算周期: 平均间隔 ${avgInterval.toFixed(2)} 小时，取整为 ${roundedInterval} 小时`);
  
  return roundedInterval;
}

/**
 * 获取交易对详细信息（包括资金费率结算周期）
 * 注意：fundingIntervalHours 需要从历史数据中计算得出
 */
export async function getSymbolInfo(symbol: string): Promise<SymbolInfo | null> {
  try {
    const response = await fetch(`${BINANCE_API_BASE}/fapi/v1/exchangeInfo`);

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const symbolData = data.symbols.find((s: any) => s.symbol === symbol);
    
    if (!symbolData) {
      return null;
    }

    // 注意：fundingIntervalHours 初始值为默认值，需要通过历史数据计算实际值
    return {
      symbol: symbolData.symbol,
      status: symbolData.status,
      contractType: symbolData.contractType,
      fundingIntervalHours: 8, // 默认值，实际值需要从历史数据计算
    };
  } catch (error) {
    console.error('获取交易对详细信息失败:', error);
    throw error;
  }
}

/**
 * 计算平均资金费率
 */
export function calculateAverageFundingRate(rates: FundingRateData[]): number {
  if (rates.length === 0) return 0;
  const sum = rates.reduce((acc, rate) => acc + parseFloat(rate.fundingRate), 0);
  return sum / rates.length;
}

/**
 * 计算预估资金费用
 * @param positionSize 仓位大小（USDT）
 * @param averageFundingRate 平均资金费率
 * @param periods 预计持有的资金费率周期数
 */
export function calculateEstimatedFundingCost(
  positionSize: number,
  averageFundingRate: number,
  periods: number
): number {
  return positionSize * averageFundingRate * periods;
}

/**
 * 根据持有时间（小时）和结算周期计算资金费率周期数
 * @param holdingHours 持有时间（小时）
 * @param fundingIntervalHours 资金费率结算周期（小时），不同交易对可能不同
 * @returns 资金费率周期数
 */
export function calculateFundingPeriods(holdingHours: number, fundingIntervalHours: number = 8): number {
  return Math.ceil(holdingHours / fundingIntervalHours);
}


