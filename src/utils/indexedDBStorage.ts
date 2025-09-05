import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Position } from '../types/basic';

// 数据库配置
const DB_NAME = 'PositionCalculatorDB';
const DB_VERSION = 1;

// 定义数据库结构
interface PositionCalculatorDB extends DBSchema {
  positions: {
    key: string;
    value: Position;
    indexes: {
      'by-symbol': string;
      'by-side': string;
      'by-status': string;
      'by-created': Date;
    };
  };
  settings: {
    key: string;
    value: any;
  };
  theme: {
    key: string;
    value: 'light' | 'dark';
  };
}

// 数据库实例
let dbInstance: IDBPDatabase<PositionCalculatorDB> | null = null;

/**
 * 初始化IndexedDB数据库
 */
async function initDB(): Promise<IDBPDatabase<PositionCalculatorDB>> {
  if (dbInstance) {
    return dbInstance;
  }

  try {
    dbInstance = await openDB<PositionCalculatorDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // 创建仓位表
        if (!db.objectStoreNames.contains('positions')) {
          const positionStore = db.createObjectStore('positions', {
            keyPath: 'id'
          });
          
          // 创建索引
          positionStore.createIndex('by-symbol', 'symbol');
          positionStore.createIndex('by-side', 'side');
          positionStore.createIndex('by-status', 'status');
          positionStore.createIndex('by-created', 'createdAt');
        }

        // 创建设置表
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', {
            keyPath: 'key'
          });
        }

        // 创建主题表
        if (!db.objectStoreNames.contains('theme')) {
          db.createObjectStore('theme', {
            keyPath: 'key'
          });
        }
      },
    });

    return dbInstance;
  } catch (error) {
    console.error('初始化IndexedDB失败:', error);
    throw error;
  }
}

/**
 * IndexedDB存储工具类
 */
export class IndexedDBUtil {
  /**
   * 保存数据到IndexedDB
   * @param storeName 存储表名
   * @param data 要保存的数据
   */
  static async save<T>(storeName: 'settings' | 'theme', key: string, data: T): Promise<void> {
    try {
      const db = await initDB();
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      await store.put({ key, value: data } as any);
      await tx.done;
    } catch (error) {
      console.error(`保存数据到IndexedDB失败 (${storeName}):`, error);
      throw error;
    }
  }

  /**
   * 从IndexedDB读取数据
   * @param storeName 存储表名
   * @param key 存储键
   * @param defaultValue 默认值
   * @returns 读取的数据或默认值
   */
  static async load<T>(storeName: 'settings' | 'theme', key: string, defaultValue: T): Promise<T> {
    try {
      const db = await initDB();
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);

      const result = await store.get(key);
      await tx.done;

      return result ? result.value : defaultValue;
    } catch (error) {
      console.error(`从IndexedDB读取数据失败 (${storeName}):`, error);
      return defaultValue;
    }
  }

  /**
   * 删除IndexedDB中的数据
   * @param storeName 存储表名
   * @param key 存储键
   */
  static async remove(storeName: 'settings' | 'theme', key: string): Promise<void> {
    try {
      const db = await initDB();
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      await store.delete(key);
      await tx.done;
    } catch (error) {
      console.error(`删除IndexedDB数据失败 (${storeName}):`, error);
      throw error;
    }
  }

  /**
   * 清空指定表的所有数据
   * @param storeName 存储表名
   */
  static async clear(storeName: 'settings' | 'theme'): Promise<void> {
    try {
      const db = await initDB();
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      await store.clear();
      await tx.done;
    } catch (error) {
      console.error(`清空IndexedDB表失败 (${storeName}):`, error);
      throw error;
    }
  }

  /**
   * 获取表中所有数据
   * @param storeName 存储表名
   * @returns 所有数据
   */
  static async getAll<T>(storeName: 'settings' | 'theme'): Promise<T[]> {
    try {
      const db = await initDB();
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);

      const results = await store.getAll();
      await tx.done;

      return results.map(item => item.value);
    } catch (error) {
      console.error(`获取IndexedDB所有数据失败 (${storeName}):`, error);
      return [];
    }
  }
}

/**
 * 仓位数据IndexedDB存储管理
 */
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

/**
 * 主题设置IndexedDB存储
 */
export class IndexedDBThemeStorage {
  private static readonly THEME_KEY = 'app-theme';

  /**
   * 保存主题设置
   * @param theme 主题类型
   */
  static async saveTheme(theme: 'light' | 'dark'): Promise<void> {
    try {
      await IndexedDBUtil.save('theme', this.THEME_KEY, theme);
    } catch (error) {
      console.error('保存主题到IndexedDB失败:', error);
      throw error;
    }
  }

  /**
   * 加载主题设置
   * @returns 主题类型
   */
  static async loadTheme(): Promise<'light' | 'dark'> {
    try {
      return await IndexedDBUtil.load('theme', this.THEME_KEY, 'light');
    } catch (error) {
      console.error('从IndexedDB加载主题失败:', error);
      return 'light';
    }
  }
}

/**
 * 应用设置IndexedDB存储
 */
export interface AppSettings {
  defaultLeverage: number;
  defaultPriceStep: number;
  decimalPlaces: number;
  autoSave: boolean;
}

export class IndexedDBSettingsStorage {
  private static readonly SETTINGS_KEY = 'app-settings';

  private static defaultSettings: AppSettings = {
    defaultLeverage: 10,
    defaultPriceStep: 5,
    decimalPlaces: 4,
    autoSave: true
  };

  /**
   * 保存应用设置
   * @param settings 应用设置
   */
  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await IndexedDBUtil.save('settings', this.SETTINGS_KEY, settings);
    } catch (error) {
      console.error('保存设置到IndexedDB失败:', error);
      throw error;
    }
  }

  /**
   * 加载应用设置
   * @returns 应用设置
   */
  static async loadSettings(): Promise<AppSettings> {
    try {
      return await IndexedDBUtil.load('settings', this.SETTINGS_KEY, this.defaultSettings);
    } catch (error) {
      console.error('从IndexedDB加载设置失败:', error);
      return this.defaultSettings;
    }
  }

  /**
   * 重置为默认设置
   */
  static async resetSettings(): Promise<void> {
    try {
      await this.saveSettings(this.defaultSettings);
    } catch (error) {
      console.error('重置IndexedDB设置失败:', error);
      throw error;
    }
  }
}

/**
 * 数据迁移工具 - 从localStorage迁移到IndexedDB
 */
export class DataMigration {
  private static readonly MIGRATION_KEY = 'data-migration-completed';

  /**
   * 检查是否需要数据迁移
   */
  static async needsMigration(): Promise<boolean> {
    try {
      const migrationCompleted = await IndexedDBUtil.load('settings', this.MIGRATION_KEY, false);
      return !migrationCompleted;
    } catch (error) {
      console.error('检查迁移状态失败:', error);
      return true; // 出错时默认需要迁移
    }
  }

  /**
   * 从localStorage迁移数据到IndexedDB
   */
  static async migrateFromLocalStorage(): Promise<void> {
    try {
      console.log('开始数据迁移：从localStorage到IndexedDB...');

      // 迁移仓位数据
      const positionsData = localStorage.getItem('position-calculator-positions');
      if (positionsData) {
        try {
          const positions = JSON.parse(positionsData);
          if (Array.isArray(positions) && positions.length > 0) {
            await IndexedDBPositionStorage.savePositions(positions);
            console.log(`已迁移 ${positions.length} 个仓位`);
          }
        } catch (error) {
          console.error('迁移仓位数据失败:', error);
        }
      }

      // 迁移主题设置
      const themeData = localStorage.getItem('position-calculator-theme');
      if (themeData) {
        try {
          const theme = JSON.parse(themeData);
          if (theme === 'light' || theme === 'dark') {
            await IndexedDBThemeStorage.saveTheme(theme);
            console.log(`已迁移主题设置: ${theme}`);
          }
        } catch (error) {
          console.error('迁移主题设置失败:', error);
        }
      }

      // 迁移应用设置
      const settingsData = localStorage.getItem('position-calculator-settings');
      if (settingsData) {
        try {
          const settings = JSON.parse(settingsData);
          await IndexedDBSettingsStorage.saveSettings(settings);
          console.log('已迁移应用设置');
        } catch (error) {
          console.error('迁移应用设置失败:', error);
        }
      }

      // 标记迁移完成
      await IndexedDBUtil.save('settings', this.MIGRATION_KEY, true);

      console.log('数据迁移完成！');
    } catch (error) {
      console.error('数据迁移失败:', error);
      throw error;
    }
  }

  /**
   * 清理localStorage中的旧数据（迁移完成后调用）
   */
  static cleanupLocalStorage(): void {
    try {
      localStorage.removeItem('position-calculator-positions');
      localStorage.removeItem('position-calculator-theme');
      localStorage.removeItem('position-calculator-settings');
      console.log('已清理localStorage中的旧数据');
    } catch (error) {
      console.error('清理localStorage失败:', error);
    }
  }
}
