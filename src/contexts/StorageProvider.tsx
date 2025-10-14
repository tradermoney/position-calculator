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
      try {
        // 检查IndexedDB是否可用
        const indexedDBAvailable = 'indexedDB' in window && 'IDBTransaction' in window;
        setIsIndexedDBAvailable(indexedDBAvailable);

        if (!indexedDBAvailable) {
          console.warn('IndexedDB不可用，将使用localStorage作为存储方案');
          setIsStorageReady(true);
          return;
        }

        // 如果数据库已经初始化，直接标记为就绪
        if (isDatabaseInitialized()) {
          setIsStorageReady(true);
          return;
        }

        // 使用超时机制初始化数据库（最多等待10秒）
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('数据库初始化超时（10秒），将跳过初始化'));
          }, 10000);
        });

        await Promise.race([
          initializeDatabase(),
          timeoutPromise
        ]);
        
        setIsStorageReady(true);
        console.log('存储系统初始化完成');
      } catch (err) {
        console.error('存储系统初始化失败:', err);
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

