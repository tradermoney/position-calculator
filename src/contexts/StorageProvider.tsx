/**
 * 存储提供者组件
 */

import React from 'react';
import { StorageContext } from './StorageContextInstance';
import { StorageContextType } from './StorageContext';
import { initializeDatabase, isDatabaseInitialized } from '../utils/storage/databaseInit';

interface StorageProviderProps {
  children: React.ReactNode;
}

export function StorageProvider({ children }: StorageProviderProps) {
  const [isStorageReady, setIsStorageReady] = React.useState(false);
  const [isIndexedDBAvailable, setIsIndexedDBAvailable] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const initStorage = async () => {
      console.log('[StorageProvider] 开始存储系统初始化...');
      const startTime = Date.now();
      
      try {
        // 检查IndexedDB是否可用
        console.log('[StorageProvider] 检查IndexedDB可用性...');
        const indexedDBAvailable = 'indexedDB' in window && 'IDBTransaction' in window;
        setIsIndexedDBAvailable(indexedDBAvailable);
        console.log(`[StorageProvider] IndexedDB可用性: ${indexedDBAvailable}`);

        if (!indexedDBAvailable) {
          console.warn('[StorageProvider] IndexedDB不可用，将使用localStorage作为存储方案');
          setIsStorageReady(true);
          return;
        }

        // 如果数据库已经初始化，直接标记为就绪
        if (isDatabaseInitialized()) {
          console.log('[StorageProvider] 数据库已初始化，直接标记为就绪');
          setIsStorageReady(true);
          return;
        }

        // 直接初始化数据库，不使用超时机制
        console.log('[StorageProvider] 开始初始化数据库...');
        await initializeDatabase();
        
        const duration = Date.now() - startTime;
        setIsStorageReady(true);
        console.log(`[StorageProvider] ✓ 存储系统初始化完成，总耗时: ${duration}ms`);
      } catch (err) {
        const duration = Date.now() - startTime;
        console.error(`[StorageProvider] ✗ 存储系统初始化失败 (耗时: ${duration}ms):`, err);
        
        if (err instanceof Error) {
          console.error('[StorageProvider] 错误详情:', {
            name: err.name,
            message: err.message,
            stack: err.stack
          });
        }
        
        const errorMessage = err instanceof Error ? err.message : '存储系统初始化失败';
        setError(errorMessage);
        // 即使初始化失败，也标记为就绪，让应用继续运行
        setIsStorageReady(true);
      }
    };

    initStorage();
  }, []);

  const value: StorageContextType = {
    isStorageReady,
    isIndexedDBAvailable,
    error,
  };

  return (
    <StorageContext.Provider value={value}>
      {children}
    </StorageContext.Provider>
  );
}

