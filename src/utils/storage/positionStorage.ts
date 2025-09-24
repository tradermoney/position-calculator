/**
 * 仓位数据IndexedDB存储管理
 */

import { Position } from '../../types';
import { initDB } from './database';

export class IndexedDBPositionStorage {
  /**
   * 保存仓位列表
   * @param positions 仓位列表
   */
  static async savePositions(positions: Position[]): Promise<void> {
    try {
      const db = await initDB();
      const tx = db.transaction('positions', 'readwrite');
      const store = tx.objectStore('positions');
      
      // 清空现有数据
      await store.clear();
      
      // 批量插入新数据
      for (const position of positions) {
        await store.put(position);
      }
      
      await tx.done;
    } catch (error) {
      console.error('保存仓位列表到IndexedDB失败:', error);
      throw error;
    }
  }

  /**
   * 加载仓位列表
   * @returns 仓位列表
   */
  static async loadPositions(): Promise<Position[]> {
    try {
      const db = await initDB();
      const tx = db.transaction('positions', 'readonly');
      const store = tx.objectStore('positions');
      
      const positions = await store.getAll();
      await tx.done;
      
      // 转换日期字符串为Date对象
      return positions.map(position => ({
        ...position,
        createdAt: new Date(position.createdAt),
        updatedAt: new Date(position.updatedAt)
      }));
    } catch (error) {
      console.error('从IndexedDB加载仓位列表失败:', error);
      return [];
    }
  }

  /**
   * 添加新仓位
   * @param position 新仓位
   */
  static async addPosition(position: Position): Promise<void> {
    try {
      const db = await initDB();
      const tx = db.transaction('positions', 'readwrite');
      const store = tx.objectStore('positions');
      
      await store.put(position);
      await tx.done;
    } catch (error) {
      console.error('添加仓位到IndexedDB失败:', error);
      throw error;
    }
  }

  /**
   * 更新仓位
   * @param updatedPosition 更新后的仓位
   */
  static async updatePosition(updatedPosition: Position): Promise<void> {
    try {
      const db = await initDB();
      const tx = db.transaction('positions', 'readwrite');
      const store = tx.objectStore('positions');
      
      const positionWithUpdatedTime = {
        ...updatedPosition,
        updatedAt: new Date()
      };
      
      await store.put(positionWithUpdatedTime);
      await tx.done;
    } catch (error) {
      console.error('更新IndexedDB仓位失败:', error);
      throw error;
    }
  }

  /**
   * 删除仓位
   * @param positionId 仓位ID
   */
  static async deletePosition(positionId: string): Promise<void> {
    try {
      const db = await initDB();
      const tx = db.transaction('positions', 'readwrite');
      const store = tx.objectStore('positions');
      
      await store.delete(positionId);
      await tx.done;
    } catch (error) {
      console.error('从IndexedDB删除仓位失败:', error);
      throw error;
    }
  }

  /**
   * 根据ID获取仓位
   * @param positionId 仓位ID
   * @returns 仓位或null
   */
  static async getPositionById(positionId: string): Promise<Position | null> {
    try {
      const db = await initDB();
      const tx = db.transaction('positions', 'readonly');
      const store = tx.objectStore('positions');
      
      const position = await store.get(positionId);
      await tx.done;
      
      if (!position) return null;
      
      return {
        ...position,
        createdAt: new Date(position.createdAt),
        updatedAt: new Date(position.updatedAt)
      };
    } catch (error) {
      console.error('从IndexedDB获取仓位失败:', error);
      return null;
    }
  }

  /**
   * 根据币种获取仓位
   * @param symbol 币种符号
   * @returns 仓位列表
   */
  static async getPositionsBySymbol(symbol: string): Promise<Position[]> {
    try {
      const db = await initDB();
      const tx = db.transaction('positions', 'readonly');
      const store = tx.objectStore('positions');
      const index = store.index('by-symbol');
      
      const positions = await index.getAll(symbol);
      await tx.done;
      
      return positions.map(position => ({
        ...position,
        createdAt: new Date(position.createdAt),
        updatedAt: new Date(position.updatedAt)
      }));
    } catch (error) {
      console.error('从IndexedDB根据币种获取仓位失败:', error);
      return [];
    }
  }

  /**
   * 清空所有仓位
   */
  static async clearPositions(): Promise<void> {
    try {
      const db = await initDB();
      const tx = db.transaction('positions', 'readwrite');
      const store = tx.objectStore('positions');

      await store.clear();
      await tx.done;
    } catch (error) {
      console.error('清空IndexedDB仓位失败:', error);
      throw error;
    }
  }
}
