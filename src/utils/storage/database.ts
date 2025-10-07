/**
 * IndexedDB数据库初始化和管理
 */

import { openDB, IDBPDatabase } from 'idb';
import { PositionCalculatorDB, DB_NAME, DB_VERSION } from './types';

// 数据库实例
let dbInstance: IDBPDatabase<PositionCalculatorDB> | null = null;

/**
 * 检查IndexedDB是否可用
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  } catch {
    return false;
  }
}

/**
 * 初始化IndexedDB数据库
 */
export async function initDB(): Promise<IDBPDatabase<PositionCalculatorDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  // 检查IndexedDB是否可用
  if (!isIndexedDBAvailable()) {
    const error = new Error('IndexedDB is not available in this environment');
    console.warn('IndexedDB不可用，将使用localStorage作为降级方案:', error);
    throw error;
  }

  try {
    dbInstance = await openDB<PositionCalculatorDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        console.log('数据库升级事件触发，版本:', oldVersion, '->', DB_VERSION);
        
        // 创建仓位表
        if (!db.objectStoreNames.contains('positions')) {
          const positionStore = db.createObjectStore('positions', {
            keyPath: 'id'
          });

          // 创建索引
          positionStore.createIndex('by-symbol', 'symbol');
          positionStore.createIndex('by-side', 'side');
          positionStore.createIndex('by-status', 'status');
          positionStore.createIndex('by-created', 'createdAt');
          console.log('创建positions对象存储');
        }

        // 创建设置表
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', {
            keyPath: 'key'
          });
          console.log('创建settings对象存储');
        }

        // 创建主题表
        if (!db.objectStoreNames.contains('theme')) {
          db.createObjectStore('theme', {
            keyPath: 'key'
          });
          console.log('创建theme对象存储');
        }

        // 创建波动率记录表
        if (!db.objectStoreNames.contains('volatilityRecords')) {
          const volatilityStore = db.createObjectStore('volatilityRecords', {
            keyPath: 'id'
          });

          // 创建按计算时间的索引
          volatilityStore.createIndex('by-calculated', 'calculatedAt');
          console.log('创建volatilityRecords对象存储');
        }

        // 创建波动率输入状态表
        if (!db.objectStoreNames.contains('volatilityInputs')) {
          db.createObjectStore('volatilityInputs', {
            keyPath: 'key'
          });
          console.log('创建volatilityInputs对象存储');
        }

        // 创建PnL计算器状态表
        if (!db.objectStoreNames.contains('pnlCalculator')) {
          db.createObjectStore('pnlCalculator', {
            keyPath: 'key'
          });
          console.log('创建pnlCalculator对象存储');
        }

        // 创建保存的仓位表
        if (!db.objectStoreNames.contains('savedPositions')) {
          const savedPositionsStore = db.createObjectStore('savedPositions', {
            keyPath: 'id'
          });
          savedPositionsStore.createIndex('by-created', 'createdAt');
          savedPositionsStore.createIndex('by-updated', 'updatedAt');
          savedPositionsStore.createIndex('by-name', 'name');
          console.log('创建savedPositions对象存储');
        }

        // 创建计算器记录表
        if (!db.objectStoreNames.contains('calculatorRecords')) {
          const calculatorStore = db.createObjectStore('calculatorRecords', {
            keyPath: 'id'
          });
          calculatorStore.createIndex('by-calculated', 'calculatedAt');
          console.log('创建calculatorRecords对象存储');
        }

        // 创建保本计算器状态表
        if (!db.objectStoreNames.contains('breakEvenCalculator')) {
          db.createObjectStore('breakEvenCalculator', {
            keyPath: 'key'
          });
          console.log('创建breakEvenCalculator对象存储');
        }
      },
    });

    console.log('IndexedDB数据库初始化成功');
    return dbInstance;
  } catch (error) {
    console.error('初始化IndexedDB失败:', error);
    // 重置实例，避免缓存失败的连接
    dbInstance = null;
    throw error;
  }
}

/**
 * 获取数据库实例
 */
export async function getDB(): Promise<IDBPDatabase<PositionCalculatorDB>> {
  return await initDB();
}

/**
 * 关闭数据库连接
 */
export function closeDB(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}
