/**
 * 资金费率计算器状态存储服务
 */

import { IndexedDBUtil } from './indexedDBUtil';
import { waitForDatabaseInit } from './databaseInit';
import { FundingRateInputState } from './types';

const STORE_NAME = 'fundingRateCalculator' as const;
const STATE_KEY = 'inputState';
const LOCALSTORAGE_KEY = 'fundingRateCalculator_inputState';

/**
 * 保存资金费率计算器输入状态
 */
export async function saveFundingRateInputState(state: Omit<FundingRateInputState, 'lastUpdated'>): Promise<void> {
  const fullState: FundingRateInputState & { key: string } = {
    ...state,
    key: STATE_KEY,
    lastUpdated: new Date(),
  };

  // 检查IndexedDB是否可用
  if (!IndexedDBUtil.isAvailable()) {
    console.warn('IndexedDB不可用，使用localStorage作为降级方案');
    saveToLocalStorage(fullState);
    return;
  }

  try {
    await waitForDatabaseInit();
    await IndexedDBUtil.save(STORE_NAME, STATE_KEY, fullState);
    console.log('资金费率计算器状态已保存到IndexedDB');
  } catch (error) {
    console.error('保存资金费率计算器状态到IndexedDB失败:', error);
    saveToLocalStorage(fullState);
  }
}

/**
 * 加载资金费率计算器输入状态
 */
export async function loadFundingRateInputState(): Promise<FundingRateInputState | null> {
  // 检查IndexedDB是否可用
  if (!IndexedDBUtil.isAvailable()) {
    console.warn('IndexedDB不可用，从localStorage加载数据');
    return loadFromLocalStorage();
  }

  try {
    await waitForDatabaseInit();
    const state = await IndexedDBUtil.load<FundingRateInputState & { key: string }>(STORE_NAME, STATE_KEY);
    
    if (state) {
      console.log('从IndexedDB加载资金费率计算器状态');
      // 转换日期字符串为Date对象
      return {
        ...state,
        lastUpdated: new Date(state.lastUpdated),
      };
    }
    
    // 如果IndexedDB中没有数据，尝试从localStorage加载
    console.log('IndexedDB中没有数据，尝试从localStorage加载');
    return loadFromLocalStorage();
  } catch (error) {
    console.error('从IndexedDB加载资金费率计算器状态失败:', error);
    return loadFromLocalStorage();
  }
}

/**
 * 清除资金费率计算器输入状态
 */
export async function clearFundingRateInputState(): Promise<void> {
  // 检查IndexedDB是否可用
  if (!IndexedDBUtil.isAvailable()) {
    console.warn('IndexedDB不可用，清除localStorage数据');
    clearLocalStorage();
    return;
  }

  try {
    await waitForDatabaseInit();
    await IndexedDBUtil.delete(STORE_NAME, STATE_KEY);
    console.log('资金费率计算器状态已从IndexedDB清除');
  } catch (error) {
    console.error('清除IndexedDB资金费率计算器状态失败:', error);
    clearLocalStorage();
  }
}

// localStorage降级方案
function saveToLocalStorage(state: FundingRateInputState & { key: string }): void {
  try {
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(state));
    console.log('资金费率计算器状态已保存到localStorage');
  } catch (error) {
    console.error('保存到localStorage失败:', error);
  }
}

function loadFromLocalStorage(): FundingRateInputState | null {
  try {
    const data = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!data) return null;
    
    const state = JSON.parse(data);
    // 转换日期字符串为Date对象
    return {
      ...state,
      lastUpdated: new Date(state.lastUpdated),
    };
  } catch (error) {
    console.error('从localStorage加载失败:', error);
    return null;
  }
}

function clearLocalStorage(): void {
  try {
    localStorage.removeItem(LOCALSTORAGE_KEY);
    console.log('localStorage资金费率计算器状态已清除');
  } catch (error) {
    console.error('清除localStorage失败:', error);
  }
}

