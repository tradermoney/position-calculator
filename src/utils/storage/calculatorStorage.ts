/**
 * 计算器记录存储服务
 * 使用统一的DAO层进行数据操作
 */

import { IndexedDBUtil } from './indexedDBUtil';
import { waitForDatabaseInit } from './databaseInit';
import { CalculatorRecord } from './types';

const STORE_NAME = 'calculatorRecords' as const;
const LOCALSTORAGE_KEY = 'calculatorRecords';

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `calc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 保存计算记录
 */
export async function saveCalculatorRecord(record: Omit<CalculatorRecord, 'id'>): Promise<string> {
  const id = generateId();
  const fullRecord: CalculatorRecord = {
    ...record,
    id,
  };

  // 检查IndexedDB是否可用
  if (!IndexedDBUtil.isAvailable()) {
    console.warn('IndexedDB不可用，使用localStorage作为降级方案');
    return saveToLocalStorage(fullRecord);
  }

  try {
    await waitForDatabaseInit();
    await IndexedDBUtil.save(STORE_NAME, id, fullRecord);
    console.log('计算记录已保存到IndexedDB');
    return id;
  } catch (error) {
    console.error('保存计算记录到IndexedDB失败:', error);
    return saveToLocalStorage(fullRecord);
  }
}

/**
 * 获取计算记录列表
 */
export async function getCalculatorRecords(limit: number = 20): Promise<CalculatorRecord[]> {
  // 检查IndexedDB是否可用
  if (!IndexedDBUtil.isAvailable()) {
    console.warn('IndexedDB不可用，从localStorage加载数据');
    return getFromLocalStorage(limit);
  }

  try {
    await waitForDatabaseInit();
    const records = await IndexedDBUtil.getAll<CalculatorRecord>(STORE_NAME);
    
    // 按时间倒序排列并限制数量
    const sortedRecords = records
      .sort((a, b) => b.calculatedAt.getTime() - a.calculatedAt.getTime())
      .slice(0, limit);
    
    console.log(`从IndexedDB加载了${sortedRecords.length}条计算记录`);
    
    // 如果IndexedDB中没有数据，尝试从localStorage加载
    if (sortedRecords.length === 0) {
      console.log('IndexedDB中没有数据，尝试从localStorage加载');
      return getFromLocalStorage(limit);
    }
    
    return sortedRecords;
  } catch (error) {
    console.error('从IndexedDB加载计算记录失败:', error);
    return getFromLocalStorage(limit);
  }
}

/**
 * 删除计算记录
 */
export async function deleteCalculatorRecord(id: string): Promise<void> {
  // 检查IndexedDB是否可用
  if (!IndexedDBUtil.isAvailable()) {
    console.warn('IndexedDB不可用，从localStorage删除数据');
    return deleteFromLocalStorage(id);
  }

  try {
    await waitForDatabaseInit();
    await IndexedDBUtil.delete(STORE_NAME, id);
    console.log('计算记录已从IndexedDB删除');
  } catch (error) {
    console.error('从IndexedDB删除计算记录失败:', error);
    return deleteFromLocalStorage(id);
  }
}

/**
 * 清空所有计算记录
 */
export async function clearAllCalculatorRecords(): Promise<void> {
  // 检查IndexedDB是否可用
  if (!IndexedDBUtil.isAvailable()) {
    console.warn('IndexedDB不可用，清空localStorage数据');
    return clearLocalStorage();
  }

  try {
    await waitForDatabaseInit();
    await IndexedDBUtil.clear(STORE_NAME);
    console.log('所有计算记录已从IndexedDB清空');
  } catch (error) {
    console.error('清空IndexedDB计算记录失败:', error);
    return clearLocalStorage();
  }
}

// localStorage降级方案
function saveToLocalStorage(record: CalculatorRecord): string {
  try {
    const existing = getFromLocalStorage(1000); // 获取所有记录
    existing.unshift(record); // 添加到开头
    
    // 只保留最新的100条记录
    const limited = existing.slice(0, 100);
    
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(limited));
    console.log('计算记录已保存到localStorage');
    return record.id;
  } catch (error) {
    console.error('保存到localStorage失败:', error);
    throw error;
  }
}

function getFromLocalStorage(limit: number): CalculatorRecord[] {
  try {
    const data = localStorage.getItem(LOCALSTORAGE_KEY);
    if (!data) return [];
    
    const records: CalculatorRecord[] = JSON.parse(data);
    
    // 转换日期字符串为Date对象
    const convertedRecords = records.map(record => ({
      ...record,
      calculatedAt: new Date(record.calculatedAt)
    }));
    
    return convertedRecords.slice(0, limit);
  } catch (error) {
    console.error('从localStorage加载失败:', error);
    return [];
  }
}

function deleteFromLocalStorage(id: string): void {
  try {
    const records = getFromLocalStorage(1000);
    const filtered = records.filter(record => record.id !== id);
    localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(filtered));
    console.log('计算记录已从localStorage删除');
  } catch (error) {
    console.error('从localStorage删除失败:', error);
  }
}

function clearLocalStorage(): void {
  try {
    localStorage.removeItem(LOCALSTORAGE_KEY);
    console.log('localStorage计算记录已清空');
  } catch (error) {
    console.error('清空localStorage失败:', error);
  }
}
