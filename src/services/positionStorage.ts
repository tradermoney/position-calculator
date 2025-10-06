import { SavedPosition, PositionListItem, SavePositionParams, RestorePositionParams } from '../types/position';
import { IndexedDBUtil } from '../utils/storage/indexedDBUtil';
import { waitForDatabaseInit } from '../utils/storage/databaseInit';

const STORE_NAME = 'savedPositions' as const;
const LOCALSTORAGE_KEY = 'savedPositions';

class PositionStorageService {
  /**
   * 确保数据库已初始化
   */
  private async ensureDB(): Promise<void> {
    if (!IndexedDBUtil.isAvailable()) {
      throw new Error('IndexedDB is not available');
    }
    await waitForDatabaseInit();
  }

  /**
   * 生成唯一ID
   */
  private generateId(): string {
    return `position_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 保存仓位
   */
  async savePosition(params: SavePositionParams): Promise<string> {
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

    // 检查IndexedDB是否可用
    if (!IndexedDBUtil.isAvailable()) {
      console.warn('IndexedDB不可用，使用localStorage作为降级方案');
      return this.saveToLocalStorage(savedPosition);
    }

    try {
      await IndexedDBUtil.save(STORE_NAME, id, savedPosition);
      console.log('仓位已保存到IndexedDB');
      return id;
    } catch (error) {
      console.error('保存仓位到IndexedDB失败:', error);
      return this.saveToLocalStorage(savedPosition);
    }
  }

  /**
   * 获取所有仓位列表
   */
  async getPositionList(): Promise<PositionListItem[]> {
    // 检查IndexedDB是否可用
    if (!IndexedDBUtil.isAvailable()) {
      console.warn('IndexedDB不可用，从localStorage加载数据');
      return this.getFromLocalStorage();
    }

    try {
      const positions = await IndexedDBUtil.getAll<SavedPosition>(STORE_NAME);
      
      const listItems: PositionListItem[] = positions.map(pos => ({
        id: pos.id,
        name: pos.name,
        side: pos.side,
        capital: pos.capital,
        leverage: pos.leverage,
        positionCount: pos.positions.length,
        createdAt: pos.createdAt,
        updatedAt: pos.updatedAt,
      }));

      // 按更新时间倒序排列
      listItems.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      console.log(`从IndexedDB加载了${listItems.length}个仓位`);
      return listItems;
    } catch (error) {
      console.error('从IndexedDB加载仓位列表失败:', error);
      return this.getFromLocalStorage();
    }
  }

  /**
   * 根据ID获取仓位详情
   */
  async getPositionById(id: string): Promise<SavedPosition | null> {
    // 检查IndexedDB是否可用
    if (!IndexedDBUtil.isAvailable()) {
      console.warn('IndexedDB不可用，从localStorage加载数据');
      return this.getByIdFromLocalStorage(id);
    }

    try {
      const position = await IndexedDBUtil.get<SavedPosition>(STORE_NAME, id);
      console.log('从IndexedDB加载仓位详情');
      return position || null;
    } catch (error) {
      console.error('从IndexedDB加载仓位详情失败:', error);
      return this.getByIdFromLocalStorage(id);
    }
  }

  /**
   * 更新仓位
   */
  async updatePosition(id: string, params: Partial<SavePositionParams>): Promise<void> {
    const existing = await this.getPositionById(id);
    if (!existing) {
      throw new Error('Position not found');
    }

    const updatedPosition: SavedPosition = {
      ...existing,
      ...params,
      updatedAt: new Date(),
    };

    // 检查IndexedDB是否可用
    if (!IndexedDBUtil.isAvailable()) {
      console.warn('IndexedDB不可用，使用localStorage更新');
      return this.updateInLocalStorage(updatedPosition);
    }

    try {
      await IndexedDBUtil.save(STORE_NAME, id, updatedPosition);
      console.log('仓位已更新到IndexedDB');
    } catch (error) {
      console.error('更新仓位到IndexedDB失败:', error);
      return this.updateInLocalStorage(updatedPosition);
    }
  }

  /**
   * 删除仓位
   */
  async deletePosition(id: string): Promise<void> {
    // 检查IndexedDB是否可用
    if (!IndexedDBUtil.isAvailable()) {
      console.warn('IndexedDB不可用，从localStorage删除');
      return this.deleteFromLocalStorage(id);
    }

    try {
      await IndexedDBUtil.delete(STORE_NAME, id);
      console.log('仓位已从IndexedDB删除');
    } catch (error) {
      console.error('从IndexedDB删除仓位失败:', error);
      return this.deleteFromLocalStorage(id);
    }
  }

  /**
   * 清空所有仓位
   */
  async clearAllPositions(): Promise<void> {
    // 检查IndexedDB是否可用
    if (!IndexedDBUtil.isAvailable()) {
      console.warn('IndexedDB不可用，清空localStorage');
      return this.clearLocalStorage();
    }

    try {
      await IndexedDBUtil.clear(STORE_NAME);
      console.log('所有仓位已从IndexedDB清空');
    } catch (error) {
      console.error('清空IndexedDB仓位失败:', error);
      return this.clearLocalStorage();
    }
  }

  /**
   * 获取仓位数量
   */
  async getPositionCount(): Promise<number> {
    // 检查IndexedDB是否可用
    if (!IndexedDBUtil.isAvailable()) {
      console.warn('IndexedDB不可用，从localStorage获取数量');
      return this.getCountFromLocalStorage();
    }

    try {
      const positions = await IndexedDBUtil.getAll<SavedPosition>(STORE_NAME);
      const count = positions.length;
      console.log(`IndexedDB中有${count}个仓位`);
      return count;
    } catch (error) {
      console.error('从IndexedDB获取仓位数量失败:', error);
      return this.getCountFromLocalStorage();
    }
  }

  // localStorage降级方案
  private saveToLocalStorage(position: SavedPosition): string {
    try {
      const data = localStorage.getItem(LOCALSTORAGE_KEY);
      const existing: SavedPosition[] = data ? JSON.parse(data) : [];
      existing.unshift(position);
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(existing));
      console.log('仓位已保存到localStorage');
      return position.id;
    } catch (error) {
      console.error('保存到localStorage失败:', error);
      throw error;
    }
  }

  private getFromLocalStorage(): PositionListItem[] {
    try {
      const data = localStorage.getItem(LOCALSTORAGE_KEY);
      if (!data) return [];
      
      const positions: SavedPosition[] = JSON.parse(data);
      
      // 转换日期字符串为Date对象并转换为PositionListItem
      const listItems: PositionListItem[] = positions.map(pos => ({
        id: pos.id,
        name: pos.name,
        side: pos.side,
        capital: pos.capital,
        leverage: pos.leverage,
        positionCount: pos.positions.length,
        createdAt: new Date(pos.createdAt),
        updatedAt: new Date(pos.updatedAt)
      }));
      
      // 按更新时间倒序排列
      listItems.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      return listItems;
    } catch (error) {
      console.error('从localStorage加载失败:', error);
      return [];
    }
  }

  private getByIdFromLocalStorage(id: string): SavedPosition | null {
    try {
      const data = localStorage.getItem(LOCALSTORAGE_KEY);
      if (!data) return null;
      
      const positions: SavedPosition[] = JSON.parse(data);
      
      // 转换日期字符串为Date对象
      const convertedPositions = positions.map(pos => ({
        ...pos,
        createdAt: new Date(pos.createdAt),
        updatedAt: new Date(pos.updatedAt)
      }));
      
      return convertedPositions.find(pos => pos.id === id) || null;
    } catch (error) {
      console.error('从localStorage加载失败:', error);
      return null;
    }
  }

  private updateInLocalStorage(position: SavedPosition): void {
    try {
      const data = localStorage.getItem(LOCALSTORAGE_KEY);
      if (!data) return;
      
      const positions: SavedPosition[] = JSON.parse(data);
      const index = positions.findIndex(pos => pos.id === position.id);
      if (index !== -1) {
        positions[index] = position;
        localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(positions));
        console.log('仓位已在localStorage中更新');
      }
    } catch (error) {
      console.error('在localStorage中更新失败:', error);
    }
  }

  private deleteFromLocalStorage(id: string): void {
    try {
      const data = localStorage.getItem(LOCALSTORAGE_KEY);
      if (!data) return;
      
      const positions: SavedPosition[] = JSON.parse(data);
      const filtered = positions.filter(pos => pos.id !== id);
      localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(filtered));
      console.log('仓位已从localStorage删除');
    } catch (error) {
      console.error('从localStorage删除失败:', error);
    }
  }

  private clearLocalStorage(): void {
    try {
      localStorage.removeItem(LOCALSTORAGE_KEY);
      console.log('localStorage仓位已清空');
    } catch (error) {
      console.error('清空localStorage失败:', error);
    }
  }

  private getCountFromLocalStorage(): number {
    try {
      const data = localStorage.getItem(LOCALSTORAGE_KEY);
      if (!data) return 0;
      
      const positions: SavedPosition[] = JSON.parse(data);
      return positions.length;
    } catch (error) {
      console.error('从localStorage获取数量失败:', error);
      return 0;
    }
  }
}

// 创建单例实例
export const positionStorage = new PositionStorageService();
