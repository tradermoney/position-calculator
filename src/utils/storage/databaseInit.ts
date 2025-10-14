/**
 * 数据库初始化服务
 * 确保在应用启动时正确初始化数据库
 */

import { initDB, isIndexedDBAvailable, checkDatabaseHealth, clearDatabase } from './database';

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
      
      // 初始化完成后进行健康检查
      console.log('[DBInit] 开始数据库健康检查...');
      const health = await checkDatabaseHealth();
      
      if (!health.isHealthy) {
        console.warn('[DBInit] ⚠️ 数据库健康检查未通过!');
        console.warn('[DBInit] 缺失的表:', health.missingStores);
        console.warn('[DBInit] 当前版本:', health.currentVersion);
        console.warn('[DBInit] 建议操作：在控制台执行以下命令清空数据库：');
        console.warn('[DBInit] window.__clearDatabase && window.__clearDatabase()');
      } else {
        console.log('[DBInit] ✓ 数据库健康检查通过');
      }
      
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

/**
 * 清空数据库并重新初始化
 * 用于修复数据库问题
 */
export async function resetDatabase(): Promise<void> {
  console.log('[DBInit] 开始重置数据库...');
  
  try {
    // 清空数据库
    await clearDatabase();
    console.log('[DBInit] ✓ 数据库已清空');
    
    // 重置初始化状态
    isInitialized = false;
    initPromise = null;
    
    // 重新初始化
    console.log('[DBInit] 开始重新初始化数据库...');
    await initializeDatabase();
    console.log('[DBInit] ✓ 数据库重置完成，请刷新页面');
    
    // 提示用户刷新页面
    alert('数据库已重置，请刷新页面以完成更新！');
    window.location.reload();
  } catch (error) {
    console.error('[DBInit] ✗ 重置数据库失败:', error);
    throw error;
  }
}

// 在开发环境或需要时，暴露清空数据库的全局函数
if (typeof window !== 'undefined') {
  (window as any).__clearDatabase = resetDatabase;
  (window as any).__checkDatabaseHealth = checkDatabaseHealth;
  console.log('[DBInit] 已注册全局函数:');
  console.log('[DBInit] - window.__clearDatabase() - 清空并重置数据库');
  console.log('[DBInit] - window.__checkDatabaseHealth() - 检查数据库健康状态');
}
