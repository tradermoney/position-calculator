/**
 * 存储上下文
 * 管理数据库初始化状态，确保所有组件都能安全访问存储
 */

import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { initializeDatabase, isDatabaseInitialized } from '../utils/storage/databaseInit';

interface StorageContextType {
  isStorageReady: boolean;
  isIndexedDBAvailable: boolean;
  error: string | null;
}

export const StorageContext = createContext<StorageContextType | undefined>(undefined);

interface StorageProviderProps {
  children: ReactNode;
}

export function StorageProvider({ children }: StorageProviderProps) {
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [isIndexedDBAvailable, setIsIndexedDBAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

        // 初始化数据库
        await initializeDatabase();
        setIsStorageReady(true);
        console.log('存储系统初始化完成');
      } catch (err) {
        console.error('存储系统初始化失败:', err);
        setError(err instanceof Error ? err.message : '存储系统初始化失败');
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

