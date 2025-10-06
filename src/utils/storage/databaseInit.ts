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
  // 如果已经初始化过，直接返回
  if (isInitialized) {
    return;
  }

  // 如果正在初始化，等待完成
  if (initPromise) {
    return initPromise;
  }

  // 检查IndexedDB是否可用
  if (!isIndexedDBAvailable()) {
    console.warn('IndexedDB不可用，应用将使用localStorage作为存储方案');
    isInitialized = true;
    return;
  }

  // 创建初始化Promise
  initPromise = (async () => {
    try {
      await initDB();
      console.log('数据库初始化完成');
      isInitialized = true;
    } catch (error) {
      console.error('数据库初始化失败:', error);
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
