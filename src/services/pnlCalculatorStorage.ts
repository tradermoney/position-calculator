/**
 * PnL计算器存储服务
 * 使用统一的DAO层管理数据持久化
 */

import { PositionSide } from '../utils/contractCalculations';
import { InputValueMap, Position } from '../components/ContractCalculator/PnLCalculator/types';
import { IndexedDBUtil } from '../utils/storage/indexedDBUtil';
import { waitForDatabaseInit } from '../utils/storage/databaseInit';

const STORE_NAME = 'pnlCalculator' as const;
const STATE_KEY = 'formState';

export interface StoredState {
  side: PositionSide;
  capital: number;
  leverage: number;
  positions: Position[];
  inputValues: InputValueMap;
}

/**
 * PnL计算器存储服务类
 */
export class PnLCalculatorStorageService {
  /**
   * 保存状态到IndexedDB
   */
  static async saveState(state: StoredState): Promise<void> {
    // 检查IndexedDB是否可用
    if (!IndexedDBUtil.isAvailable()) {
      console.warn('IndexedDB不可用，直接使用localStorage保存');
      try {
        localStorage.setItem('pnlCalculatorState', JSON.stringify(state));
        console.log('PnL calculator state saved to localStorage');
        return;
      } catch (localError) {
        console.error('Failed to save to localStorage:', localError);
        throw localError;
      }
    }

    try {
      // 确保数据库已初始化
      await waitForDatabaseInit();
      await IndexedDBUtil.save(STORE_NAME, STATE_KEY, state);
      console.log('PnL calculator state saved successfully to IndexedDB');
    } catch (error) {
      console.error('Failed to save PnL calculator state to IndexedDB:', error);
      
      // 降级方案：保存到localStorage
      try {
        localStorage.setItem('pnlCalculatorState', JSON.stringify(state));
        console.log('PnL calculator state saved to localStorage as fallback');
      } catch (localError) {
        console.error('Failed to save to localStorage:', localError);
        throw localError;
      }
    }
  }

  /**
   * 从IndexedDB加载状态
   */
  static async loadState(): Promise<StoredState | null> {
    // 检查IndexedDB是否可用
    if (!IndexedDBUtil.isAvailable()) {
      console.warn('IndexedDB不可用，直接从localStorage加载');
      try {
        const fallbackState = localStorage.getItem('pnlCalculatorState');
        if (fallbackState) {
          const parsed = JSON.parse(fallbackState);
          console.log('PnL calculator state loaded from localStorage');
          return parsed;
        }
      } catch (localError) {
        console.error('Failed to load from localStorage:', localError);
      }
      return null;
    }

    try {
      // 确保数据库已初始化
      await waitForDatabaseInit();
      const state = await IndexedDBUtil.get<StoredState>(STORE_NAME, STATE_KEY);
      if (state) {
        console.log('PnL calculator state loaded from IndexedDB');
        return state;
      }
    } catch (error) {
      console.error('Failed to load PnL calculator state from IndexedDB:', error);
    }
    
    // 降级方案：从localStorage加载（无论IndexedDB是否失败都尝试）
    try {
      const fallbackState = localStorage.getItem('pnlCalculatorState');
      if (fallbackState) {
        const parsed = JSON.parse(fallbackState);
        console.log('PnL calculator state loaded from localStorage as fallback');
        return parsed;
      }
    } catch (localError) {
      console.error('Failed to load from localStorage:', localError);
    }
    
    return null;
  }

  /**
   * 清除保存的状态
   */
  static async clearState(): Promise<void> {
    // 检查IndexedDB是否可用
    if (IndexedDBUtil.isAvailable()) {
      try {
        // 确保数据库已初始化
        await waitForDatabaseInit();
        await IndexedDBUtil.delete(STORE_NAME, STATE_KEY);
        console.log('PnL calculator state cleared from IndexedDB');
      } catch (error) {
        console.error('Failed to clear PnL calculator state from IndexedDB:', error);
      }
    } else {
      console.warn('IndexedDB不可用，跳过IndexedDB清除操作');
    }
    
    // 同时清除localStorage中的备份
    try {
      localStorage.removeItem('pnlCalculatorState');
      console.log('PnL calculator state cleared from localStorage');
    } catch (error) {
      console.error('Failed to clear from localStorage:', error);
    }
  }
}
