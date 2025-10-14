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
  console.log('[DB] 开始初始化数据库...');
  
  if (dbInstance) {
    console.log('[DB] 数据库实例已存在，直接返回');
    return dbInstance;
  }

  // 检查IndexedDB是否可用
  console.log('[DB] 检查IndexedDB是否可用...');
  if (!isIndexedDBAvailable()) {
    const error = new Error('IndexedDB is not available in this environment');
    console.error('[DB] IndexedDB不可用，将使用localStorage作为降级方案:', error);
    throw error;
  }
  console.log('[DB] IndexedDB可用');

  try {
    console.log(`[DB] 准备打开数据库: ${DB_NAME}, 版本: ${DB_VERSION}`);
    const startTime = Date.now();
    
    dbInstance = await openDB<PositionCalculatorDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        console.log(`[DB] 数据库升级事件触发，版本: ${oldVersion} -> ${DB_VERSION}`);
        
        // 创建仓位表
        if (!db.objectStoreNames.contains('positions')) {
          console.log('[DB] 开始创建positions对象存储...');
          const positionStore = db.createObjectStore('positions', {
            keyPath: 'id'
          });

          // 创建索引
          positionStore.createIndex('by-symbol', 'symbol');
          positionStore.createIndex('by-side', 'side');
          positionStore.createIndex('by-status', 'status');
          positionStore.createIndex('by-created', 'createdAt');
          console.log('[DB] ✓ 创建positions对象存储成功');
        } else {
          console.log('[DB] positions对象存储已存在');
        }

        // 创建设置表
        if (!db.objectStoreNames.contains('settings')) {
          console.log('[DB] 开始创建settings对象存储...');
          db.createObjectStore('settings', {
            keyPath: 'key'
          });
          console.log('[DB] ✓ 创建settings对象存储成功');
        } else {
          console.log('[DB] settings对象存储已存在');
        }

        // 创建主题表
        if (!db.objectStoreNames.contains('theme')) {
          console.log('[DB] 开始创建theme对象存储...');
          db.createObjectStore('theme', {
            keyPath: 'key'
          });
          console.log('[DB] ✓ 创建theme对象存储成功');
        } else {
          console.log('[DB] theme对象存储已存在');
        }

        // 创建波动率记录表
        if (!db.objectStoreNames.contains('volatilityRecords')) {
          console.log('[DB] 开始创建volatilityRecords对象存储...');
          const volatilityStore = db.createObjectStore('volatilityRecords', {
            keyPath: 'id'
          });

          // 创建按计算时间的索引
          volatilityStore.createIndex('by-calculated', 'calculatedAt');
          console.log('[DB] ✓ 创建volatilityRecords对象存储成功');
        } else {
          console.log('[DB] volatilityRecords对象存储已存在');
        }

        // 创建波动率输入状态表
        if (!db.objectStoreNames.contains('volatilityInputs')) {
          console.log('[DB] 开始创建volatilityInputs对象存储...');
          db.createObjectStore('volatilityInputs', {
            keyPath: 'key'
          });
          console.log('[DB] ✓ 创建volatilityInputs对象存储成功');
        } else {
          console.log('[DB] volatilityInputs对象存储已存在');
        }

        // 创建币安数据输入状态表
        if (!db.objectStoreNames.contains('binanceDataInputs')) {
          console.log('[DB] 开始创建binanceDataInputs对象存储...');
          db.createObjectStore('binanceDataInputs', {
            keyPath: 'key'
          });
          console.log('[DB] ✓ 创建binanceDataInputs对象存储成功');
        } else {
          console.log('[DB] binanceDataInputs对象存储已存在');
        }

        // 创建PnL计算器状态表
        if (!db.objectStoreNames.contains('pnlCalculator')) {
          console.log('[DB] 开始创建pnlCalculator对象存储...');
          db.createObjectStore('pnlCalculator', {
            keyPath: 'key'
          });
          console.log('[DB] ✓ 创建pnlCalculator对象存储成功');
        } else {
          console.log('[DB] pnlCalculator对象存储已存在');
        }

        // 创建保存的仓位表
        if (!db.objectStoreNames.contains('savedPositions')) {
          console.log('[DB] 开始创建savedPositions对象存储...');
          const savedPositionsStore = db.createObjectStore('savedPositions', {
            keyPath: 'id'
          });
          savedPositionsStore.createIndex('by-created', 'createdAt');
          savedPositionsStore.createIndex('by-updated', 'updatedAt');
          savedPositionsStore.createIndex('by-name', 'name');
          console.log('[DB] ✓ 创建savedPositions对象存储成功');
        } else {
          console.log('[DB] savedPositions对象存储已存在');
        }

        // 创建计算器记录表
        if (!db.objectStoreNames.contains('calculatorRecords')) {
          console.log('[DB] 开始创建calculatorRecords对象存储...');
          const calculatorStore = db.createObjectStore('calculatorRecords', {
            keyPath: 'id'
          });
          calculatorStore.createIndex('by-calculated', 'calculatedAt');
          console.log('[DB] ✓ 创建calculatorRecords对象存储成功');
        } else {
          console.log('[DB] calculatorRecords对象存储已存在');
        }

        // 创建保本计算器状态表
        if (!db.objectStoreNames.contains('breakEvenCalculator')) {
          console.log('[DB] 开始创建breakEvenCalculator对象存储...');
          db.createObjectStore('breakEvenCalculator', {
            keyPath: 'key'
          });
          console.log('[DB] ✓ 创建breakEvenCalculator对象存储成功');
        } else {
          console.log('[DB] breakEvenCalculator对象存储已存在');
        }

        // 创建资金费率计算器状态表
        if (!db.objectStoreNames.contains('fundingRateCalculator')) {
          console.log('[DB] 开始创建fundingRateCalculator对象存储...');
          db.createObjectStore('fundingRateCalculator', {
            keyPath: 'key'
          });
          console.log('[DB] ✓ 创建fundingRateCalculator对象存储成功');
        } else {
          console.log('[DB] fundingRateCalculator对象存储已存在');
        }

        // 创建提示词模板表
        if (!db.objectStoreNames.contains('promptTemplates')) {
          console.log('[DB] 开始创建promptTemplates对象存储...');
          const promptTemplatesStore = db.createObjectStore('promptTemplates', {
            keyPath: 'id'
          });
          promptTemplatesStore.createIndex('by-created', 'createdAt');
          promptTemplatesStore.createIndex('by-updated', 'updatedAt');
          promptTemplatesStore.createIndex('by-name', 'name');
          console.log('[DB] ✓ 创建promptTemplates对象存储成功');
        } else {
          console.log('[DB] promptTemplates对象存储已存在');
        }

        // 创建默认模板设置表
        if (!db.objectStoreNames.contains('defaultTemplateSettings')) {
          console.log('[DB] 开始创建defaultTemplateSettings对象存储...');
          db.createObjectStore('defaultTemplateSettings', {
            keyPath: 'key'
          });
          console.log('[DB] ✓ 创建defaultTemplateSettings对象存储成功');
        } else {
          console.log('[DB] defaultTemplateSettings对象存储已存在');
        }
        
        console.log('[DB] 数据库升级完成');
      },
      blocked() {
        console.warn('[DB] 数据库被阻塞，可能有其他标签页正在使用旧版本的数据库');
      },
      blocking() {
        console.warn('[DB] 当前数据库正在阻塞其他连接');
      },
      terminated() {
        console.error('[DB] 数据库连接异常终止');
      },
    });

    const duration = Date.now() - startTime;
    console.log(`[DB] ✓ IndexedDB数据库初始化成功，耗时: ${duration}ms`);
    return dbInstance;
  } catch (error) {
    console.error('[DB] ✗ 初始化IndexedDB失败:', error);
    if (error instanceof Error) {
      console.error('[DB] 错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
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

/**
 * 清空数据库（删除整个数据库）
 * 谨慎使用！这将删除所有用户数据
 */
export async function clearDatabase(): Promise<void> {
  console.log('[DB] 开始清空数据库...');
  
  try {
    // 关闭现有连接
    closeDB();
    
    // 删除数据库
    if (isIndexedDBAvailable()) {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase(DB_NAME);
        
        request.onsuccess = () => {
          console.log('[DB] ✓ 数据库已成功删除');
          resolve();
        };
        
        request.onerror = () => {
          console.error('[DB] ✗ 删除数据库失败:', request.error);
          reject(request.error);
        };
        
        request.onblocked = () => {
          console.warn('[DB] 删除数据库被阻塞，请关闭所有使用该数据库的标签页');
        };
      });
    }
  } catch (error) {
    console.error('[DB] 清空数据库时发生错误:', error);
    throw error;
  }
}

/**
 * 检查数据库健康状态
 * 返回缺失的表列表
 */
export async function checkDatabaseHealth(): Promise<{
  isHealthy: boolean;
  missingStores: string[];
  currentVersion: number;
}> {
  console.log('[DB] 开始检查数据库健康状态...');
  
  const requiredStores = [
    'positions',
    'settings',
    'theme',
    'volatilityRecords',
    'volatilityInputs',
    'binanceDataInputs',
    'pnlCalculator',
    'savedPositions',
    'calculatorRecords',
    'breakEvenCalculator',
    'fundingRateCalculator',
    'promptTemplates',
    'defaultTemplateSettings',
  ] as const;
  
  try {
    const db = await getDB();
    const existingStores = new Set(Array.from(db.objectStoreNames));
    const missingStores: string[] = [];
    
    for (const store of requiredStores) {
      if (!existingStores.has(store)) {
        missingStores.push(store);
      }
    }
    
    const isHealthy = missingStores.length === 0;
    
    console.log('[DB] 数据库健康检查结果:', {
      isHealthy,
      currentVersion: db.version,
      existingStores: Array.from(existingStores),
      missingStores,
    });
    
    return {
      isHealthy,
      missingStores,
      currentVersion: db.version,
    };
  } catch (error) {
    console.error('[DB] 健康检查失败:', error);
    throw error;
  }
}
