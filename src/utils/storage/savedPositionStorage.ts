/**
 * 保存的仓位数据IndexedDB存储管理
 */

import { SavedPosition, PositionListItem, SavePositionParams, RestorePositionParams } from '../../types/position';
import { IndexedDBUtil } from './indexedDBUtil';
import { waitForDatabaseInit } from './databaseInit';

const STORE_NAME = 'savedPositions' as const;

export class SavedPositionStorage {
  /**
   * 生成唯一ID
   */
  private static generateId(): string {
    return `position_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 保存仓位
   */
  static async savePosition(params: SavePositionParams): Promise<string> {
    const id = this.generateId();
    const now = new Date();
    
    const savedPosition: SavedPosition = {
      id,
      name: params.name,
      side: params.side,
      capital: params.capital,
      leverage: params.leverage,
      positions: params.positions,
      inputValues: params.inputValues,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await waitForDatabaseInit();
      await IndexedDBUtil.save(STORE_NAME, id, savedPosition);
      return id;
    } catch (error) {
      console.error('保存仓位失败:', error);
      throw new Error('保存仓位失败');
    }
  }

  /**
   * 获取所有仓位列表
   */
  static async getPositionList(): Promise<PositionListItem[]> {
    try {
      await waitForDatabaseInit();
      const positions = await IndexedDBUtil.getAll<SavedPosition>(STORE_NAME);
      
      return positions.map(position => ({
        id: position.id,
        name: position.name,
        side: position.side,
        capital: position.capital,
        leverage: position.leverage,
        positionCount: position.positions.length,
        createdAt: position.createdAt,
        updatedAt: position.updatedAt,
      }));
    } catch (error) {
      console.error('获取仓位列表失败:', error);
      return [];
    }
  }

  /**
   * 根据ID获取仓位
   */
  static async getPositionById(positionId: string): Promise<SavedPosition | null> {
    try {
      await waitForDatabaseInit();
      return await IndexedDBUtil.get<SavedPosition>(STORE_NAME, positionId);
    } catch (error) {
      console.error('获取仓位失败:', error);
      return null;
    }
  }

  /**
   * 删除仓位
   */
  static async deletePosition(positionId: string): Promise<void> {
    try {
      await waitForDatabaseInit();
      await IndexedDBUtil.delete(STORE_NAME, positionId);
    } catch (error) {
      console.error('删除仓位失败:', error);
      throw new Error('删除仓位失败');
    }
  }

  /**
   * 更新仓位
   */
  static async updatePosition(positionId: string, params: SavePositionParams): Promise<void> {
    try {
      const existingPosition = await this.getPositionById(positionId);
      if (!existingPosition) {
        throw new Error('仓位不存在');
      }

      const updatedPosition: SavedPosition = {
        ...existingPosition,
        name: params.name,
        side: params.side,
        capital: params.capital,
        leverage: params.leverage,
        positions: params.positions,
        inputValues: params.inputValues,
        updatedAt: new Date(),
      };

      await waitForDatabaseInit();
      await IndexedDBUtil.save(STORE_NAME, positionId, updatedPosition);
    } catch (error) {
      console.error('更新仓位失败:', error);
      throw new Error('更新仓位失败');
    }
  }

  /**
   * 清空所有仓位
   */
  static async clearAllPositions(): Promise<void> {
    try {
      await waitForDatabaseInit();
      await IndexedDBUtil.clear(STORE_NAME);
    } catch (error) {
      console.error('清空仓位失败:', error);
      throw new Error('清空仓位失败');
    }
  }
}
