/**
 * 波动率计算记录IndexedDB存储管理
 */

import { VolatilityRecord, VolatilityInputState } from './types';
import { initDB } from './database';
import { IndexedDBUtil } from './indexedDBUtil';

export class IndexedDBVolatilityStorage {
  private static readonly INPUT_STATE_KEY = 'volatility-input-state';

  /**
   * 保存波动率计算记录
   * @param record 波动率计算记录
   */
  static async saveRecord(record: VolatilityRecord): Promise<void> {
    try {
      const db = await initDB();
      const tx = db.transaction('volatilityRecords', 'readwrite');
      const store = tx.objectStore('volatilityRecords');

      await store.put(record);
      await tx.done;
    } catch (error) {
      console.error('保存波动率记录到IndexedDB失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有波动率计算记录（按时间倒序）
   * @param limit 限制返回数量，默认10条
   * @returns 波动率计算记录列表
   */
  static async getRecords(limit: number = 10): Promise<VolatilityRecord[]> {
    try {
      const db = await initDB();
      const tx = db.transaction('volatilityRecords', 'readonly');
      const store = tx.objectStore('volatilityRecords');
      const index = store.index('by-calculated');

      // 获取所有记录并按时间倒序排列
      const records = await index.getAll();
      records.sort((a, b) => new Date(b.calculatedAt).getTime() - new Date(a.calculatedAt).getTime());

      return records.slice(0, limit);
    } catch (error) {
      console.error('从IndexedDB加载波动率记录失败:', error);
      return [];
    }
  }

  /**
   * 删除指定的波动率计算记录
   * @param recordId 记录ID
   */
  static async deleteRecord(recordId: string): Promise<void> {
    try {
      const db = await initDB();
      const tx = db.transaction('volatilityRecords', 'readwrite');
      const store = tx.objectStore('volatilityRecords');

      await store.delete(recordId);
      await tx.done;
    } catch (error) {
      console.error('删除波动率记录失败:', error);
      throw error;
    }
  }

  /**
   * 清空所有波动率计算记录
   */
  static async clearAllRecords(): Promise<void> {
    try {
      const db = await initDB();
      const tx = db.transaction('volatilityRecords', 'readwrite');
      const store = tx.objectStore('volatilityRecords');

      await store.clear();
      await tx.done;
    } catch (error) {
      console.error('清空波动率记录失败:', error);
      throw error;
    }
  }

  /**
   * 保存输入状态
   * @param inputState 输入状态
   */
  static async saveInputState(inputState: VolatilityInputState): Promise<void> {
    try {
      await IndexedDBUtil.save('volatilityInputs', this.INPUT_STATE_KEY, inputState);
    } catch (error) {
      console.error('保存波动率输入状态到IndexedDB失败:', error);
      throw error;
    }
  }

  /**
   * 加载输入状态
   * @returns 输入状态
   */
  static async loadInputState(): Promise<VolatilityInputState> {
    try {
      const defaultState: VolatilityInputState = {
        price1: '',
        price2: '',
        lastUpdated: new Date()
      };

      const state = await IndexedDBUtil.load<VolatilityInputState>('volatilityInputs', this.INPUT_STATE_KEY);
      return state || defaultState;
    } catch (error) {
      console.error('从IndexedDB加载波动率输入状态失败:', error);
      return {
        price1: '',
        price2: '',
        lastUpdated: new Date()
      };
    }
  }

  /**
   * 清空输入状态
   */
  static async clearInputState(): Promise<void> {
    try {
      const emptyState: VolatilityInputState = {
        price1: '',
        price2: '',
        lastUpdated: new Date()
      };

      await this.saveInputState(emptyState);
    } catch (error) {
      console.error('清空波动率输入状态失败:', error);
      throw error;
    }
  }
}
