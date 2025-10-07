/**
 * 存储相关的Hooks
 */

import { useContext } from 'react';
import { StorageContext } from '../contexts/StorageContextInstance';

export function useStorage() {
  const context = useContext(StorageContext);
  if (context === undefined) {
    throw new Error('useStorage must be used within a StorageProvider');
  }
  return context;
}

/**
 * 等待存储就绪的Hook
 * 在存储未就绪时返回loading状态
 */
export function useStorageReady() {
  const { isStorageReady, error } = useStorage();
  return { isStorageReady, error };
}
