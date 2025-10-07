/**
 * 存储上下文类型定义
 */

export interface StorageContextType {
  isStorageReady: boolean;
  isIndexedDBAvailable: boolean;
  error: string | null;
}
