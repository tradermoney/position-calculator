import { PositionSide } from '../../../utils/contractCalculations';
import { InputValueMap, Position } from './types';

const DB_NAME = 'PnLCalculatorDB';
const DB_VERSION = 1;
const STORE_NAME = 'formState';
const STATE_KEY = 'pnlCalculatorState';

export interface StoredState {
  side: PositionSide;
  capital: number;
  leverage: number;
  positions: Position[];
  inputValues: InputValueMap;
}

/**
 * 打开 IndexedDB 数据库
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

/**
 * 保存状态到 IndexedDB
 */
export async function saveState(state: StoredState): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    store.put(state, STATE_KEY);

    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } catch (error) {
    console.error('Failed to save state to IndexedDB:', error);
  }
}

/**
 * 从 IndexedDB 加载状态
 */
export async function loadState(): Promise<StoredState | null> {
  try {
    const db = await openDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(STATE_KEY);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('Failed to load state from IndexedDB:', error);
    return null;
  }
}
