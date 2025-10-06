/**
 * IndexedDB通用工具类
 */

import { initDB, isIndexedDBAvailable } from './database';
import { waitForDatabaseInit } from './databaseInit';

/**
 * IndexedDB存储工具类
 */
export class IndexedDBUtil {
  /**
   * 检查IndexedDB是否可用
   */
  static isAvailable(): boolean {
    return isIndexedDBAvailable();
  }

  /**
   * 保存数据到IndexedDB
   * @param storeName 存储表名
   * @param key 数据键
   * @param data 要保存的数据
   */
  static async save<T>(storeName: 'settings' | 'theme' | 'volatilityInputs' | 'pnlCalculator' | 'savedPositions' | 'volatilityRecords' | 'calculatorRecords', key: string, data: T): Promise<void> {
    if (!this.isAvailable()) {
      console.warn(`IndexedDB不可用，跳过保存操作 (${storeName})`);
      return;
    }

    try {
      // 确保数据库已初始化
      await waitForDatabaseInit();
      const db = await initDB();
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      // 根据表类型决定存储方式
      // 使用keyPath的表：直接存储数据对象
      // 其他表：使用 { key, value } 格式
      const tablesWithKeyPath = ['savedPositions', 'volatilityRecords', 'calculatorRecords', 'positions'];
      
      if (tablesWithKeyPath.includes(storeName)) {
        // 对于使用keyPath的表，直接存储数据对象
        await store.put(data as unknown);
      } else {
        // 对于其他表，使用 { key, value } 格式
        await store.put({ key, value: data } as { key: string; value: unknown });
      }
      
      await tx.done;
    } catch (error) {
      console.error(`保存数据到IndexedDB失败 (${storeName}):`, error);
      throw error;
    }
  }

  /**
   * 从IndexedDB读取数据
   * @param storeName 存储表名
   * @param key 数据键
   */
  static async load<T>(storeName: 'settings' | 'theme' | 'volatilityInputs' | 'pnlCalculator' | 'savedPositions' | 'volatilityRecords' | 'calculatorRecords', key: string): Promise<T | null> {
    if (!this.isAvailable()) {
      console.warn(`IndexedDB不可用，无法读取数据 (${storeName})`);
      return null;
    }

    try {
      // 确保数据库已初始化
      await waitForDatabaseInit();
      const db = await initDB();
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);

      const result = await store.get(key);
      
      // 根据表类型决定读取方式
      const tablesWithKeyPath = ['savedPositions', 'volatilityRecords', 'calculatorRecords', 'positions'];
      
      if (tablesWithKeyPath.includes(storeName)) {
        // 对于使用keyPath的表，直接返回数据对象
        return (result as T) || null;
      } else {
        // 对于其他表，从 { key, value } 格式中提取value
        return (result as { key: string; value: T })?.value || null;
      }
    } catch (error) {
      console.error(`从IndexedDB读取数据失败 (${storeName}):`, error);
      return null;
    }
  }

  /**
   * 从IndexedDB删除数据
   * @param storeName 存储表名
   * @param key 数据键
   */
  static async remove(storeName: 'settings' | 'theme' | 'volatilityInputs' | 'pnlCalculator' | 'savedPositions' | 'volatilityRecords' | 'calculatorRecords', key: string): Promise<void> {
    if (!this.isAvailable()) {
      console.warn(`IndexedDB不可用，跳过删除操作 (${storeName})`);
      return;
    }

    try {
      // 确保数据库已初始化
      await waitForDatabaseInit();
      const db = await initDB();
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      await store.delete(key);
      await tx.done;
    } catch (error) {
      console.error(`从IndexedDB删除数据失败 (${storeName}):`, error);
      throw error;
    }
  }

  /**
   * 清空指定存储表
   * @param storeName 存储表名
   */
  static async clear(storeName: 'settings' | 'theme' | 'volatilityInputs' | 'pnlCalculator' | 'savedPositions' | 'volatilityRecords' | 'calculatorRecords'): Promise<void> {
    if (!this.isAvailable()) {
      console.warn(`IndexedDB不可用，跳过清空操作 (${storeName})`);
      return;
    }

    try {
      // 确保数据库已初始化
      await waitForDatabaseInit();
      const db = await initDB();
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      await store.clear();
      await tx.done;
    } catch (error) {
      console.error(`清空IndexedDB存储表失败 (${storeName}):`, error);
      throw error;
    }
  }

  /**
   * 获取存储表中所有数据
   * @param storeName 存储表名
   */
  static async getAll<T>(storeName: 'settings' | 'theme' | 'volatilityInputs' | 'pnlCalculator' | 'savedPositions' | 'volatilityRecords' | 'calculatorRecords'): Promise<T[]> {
    if (!this.isAvailable()) {
      console.warn(`IndexedDB不可用，无法获取数据 (${storeName})`);
      return [];
    }

    try {
      // 确保数据库已初始化
      await waitForDatabaseInit();
      const db = await initDB();
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);

      const results = await store.getAll();
      
      // 根据表类型决定读取方式
      const tablesWithKeyPath = ['savedPositions', 'volatilityRecords', 'calculatorRecords', 'positions'];
      
      if (tablesWithKeyPath.includes(storeName)) {
        // 对于使用keyPath的表，直接返回数据对象数组
        return results as T[];
      } else {
        // 对于其他表，从 { key, value } 格式中提取value数组
        return results.map(item => (item as { key: string; value: T }).value);
      }
    } catch (error) {
      console.error(`获取IndexedDB存储表所有数据失败 (${storeName}):`, error);
      return [];
    }
  }

  /**
   * 检查数据是否存在
   * @param storeName 存储表名
   * @param key 数据键
   */
  static async exists(storeName: 'settings' | 'theme' | 'volatilityInputs' | 'pnlCalculator' | 'savedPositions' | 'volatilityRecords' | 'calculatorRecords', key: string): Promise<boolean> {
    if (!this.isAvailable()) {
      console.warn(`IndexedDB不可用，无法检查数据是否存在 (${storeName})`);
      return false;
    }

    try {
      // 确保数据库已初始化
      await waitForDatabaseInit();
      const db = await initDB();
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);

      const result = await store.get(key);
      return result !== undefined;
    } catch (error) {
      console.error(`检查IndexedDB数据是否存在失败 (${storeName}):`, error);
      return false;
    }
  }

  /**
   * 通用获取数据方法（别名）
   * @param storeName 存储表名
   * @param key 数据键
   */
  static async get<T>(storeName: 'settings' | 'theme' | 'volatilityInputs' | 'pnlCalculator' | 'savedPositions' | 'volatilityRecords' | 'calculatorRecords', key: string): Promise<T | null> {
    return this.load<T>(storeName, key);
  }

  /**
   * 通用删除数据方法（别名）
   * @param storeName 存储表名
   * @param key 数据键
   */
  static async delete(storeName: 'settings' | 'theme' | 'volatilityInputs' | 'pnlCalculator' | 'savedPositions' | 'volatilityRecords' | 'calculatorRecords', key: string): Promise<void> {
    return this.remove(storeName, key);
  }
}
