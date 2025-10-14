/**
 * 数据库初始化服务
 * 确保在应用启动时正确初始化数据库
 */

import { initDB, isIndexedDBAvailable } from './database';

let isInitialized = false;
let initPromise: Promise<void> | null = null;

/**
 * 初始化数据库（确保只初始化一次）
 */
export async function initializeDatabase(): Promise<void> {
  console.log('[DBInit] 开始数据库初始化流程...');
  
  // 如果已经初始化过，直接返回
  if (isInitialized) {
    console.log('[DBInit] 数据库已初始化，跳过');
    return;
  }

  // 如果正在初始化，等待完成
  if (initPromise) {
    console.log('[DBInit] 数据库正在初始化中，等待完成...');
    return initPromise;
  }

  // 检查IndexedDB是否可用
  console.log('[DBInit] 检查IndexedDB可用性...');
  if (!isIndexedDBAvailable()) {
    console.warn('[DBInit] IndexedDB不可用，应用将使用localStorage作为存储方案');
    isInitialized = true;
    return;
  }
  console.log('[DBInit] IndexedDB可用');

  // 创建初始化Promise
  initPromise = (async () => {
    try {
      console.log('[DBInit] 开始调用initDB()...');
      const startTime = Date.now();
      await initDB();
      const duration = Date.now() - startTime;
      console.log(`[DBInit] ✓ 数据库初始化完成，总耗时: ${duration}ms`);
      isInitialized = true;
    } catch (error) {
      console.error('[DBInit] ✗ 数据库初始化失败:', error);
      if (error instanceof Error) {
        console.error('[DBInit] 错误详情:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
      }
      // 即使初始化失败，也标记为已初始化，避免重复尝试
      isInitialized = true;
      throw error;
    }
  })();

  return initPromise;
}

/**
 * 检查数据库是否已初始化
 */
export function isDatabaseInitialized(): boolean {
  return isInitialized;
}

/**
 * 等待数据库初始化完成
 */
export async function waitForDatabaseInit(): Promise<void> {
  if (isInitialized) {
    return;
  }

  if (initPromise) {
    await initPromise;
  } else {
    await initializeDatabase();
  }
}
