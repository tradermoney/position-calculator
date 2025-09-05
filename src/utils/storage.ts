import { Position } from '../types';

const STORAGE_KEYS = {
  POSITIONS: 'position-calculator-positions',
  THEME: 'position-calculator-theme',
  SETTINGS: 'position-calculator-settings'
} as const;

/**
 * 本地存储工具类
 */
export class StorageUtil {
  /**
   * 保存数据到本地存储
   * @param key 存储键
   * @param data 要保存的数据
   */
  static save<T>(key: string, data: T): void {
    try {
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
    } catch (error) {
      console.error('保存数据到本地存储失败:', error);
    }
  }

  /**
   * 从本地存储读取数据
   * @param key 存储键
   * @param defaultValue 默认值
   * @returns 读取的数据或默认值
   */
  static load<T>(key: string, defaultValue: T): T {
    try {
      const serializedData = localStorage.getItem(key);
      if (serializedData === null) {
        return defaultValue;
      }
      return JSON.parse(serializedData) as T;
    } catch (error) {
      console.error('从本地存储读取数据失败:', error);
      return defaultValue;
    }
  }

  /**
   * 删除本地存储中的数据
   * @param key 存储键
   */
  static remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('删除本地存储数据失败:', error);
    }
  }

  /**
   * 清空所有本地存储数据
   */
  static clear(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('清空本地存储失败:', error);
    }
  }
}

/**
 * 仓位数据存储管理
 */
export class PositionStorage {
  /**
   * 保存仓位列表
   * @param positions 仓位列表
   */
  static savePositions(positions: Position[]): void {
    StorageUtil.save(STORAGE_KEYS.POSITIONS, positions);
  }

  /**
   * 加载仓位列表
   * @returns 仓位列表
   */
  static loadPositions(): Position[] {
    const positions = StorageUtil.load<Position[]>(STORAGE_KEYS.POSITIONS, []);
    // 转换日期字符串为Date对象
    return positions.map(position => ({
      ...position,
      createdAt: new Date(position.createdAt),
      updatedAt: new Date(position.updatedAt)
    }));
  }

  /**
   * 添加新仓位
   * @param position 新仓位
   */
  static addPosition(position: Position): void {
    const positions = this.loadPositions();
    positions.push(position);
    this.savePositions(positions);
  }

  /**
   * 更新仓位
   * @param updatedPosition 更新后的仓位
   */
  static updatePosition(updatedPosition: Position): void {
    const positions = this.loadPositions();
    const index = positions.findIndex(p => p.id === updatedPosition.id);
    if (index !== -1) {
      positions[index] = { ...updatedPosition, updatedAt: new Date() };
      this.savePositions(positions);
    }
  }

  /**
   * 删除仓位
   * @param positionId 仓位ID
   */
  static deletePosition(positionId: string): void {
    const positions = this.loadPositions();
    const filteredPositions = positions.filter(p => p.id !== positionId);
    this.savePositions(filteredPositions);
  }

  /**
   * 根据ID获取仓位
   * @param positionId 仓位ID
   * @returns 仓位或null
   */
  static getPositionById(positionId: string): Position | null {
    const positions = this.loadPositions();
    return positions.find(p => p.id === positionId) || null;
  }

  /**
   * 清空所有仓位
   */
  static clearPositions(): void {
    StorageUtil.remove(STORAGE_KEYS.POSITIONS);
  }
}

/**
 * 主题设置存储
 */
export class ThemeStorage {
  /**
   * 保存主题设置
   * @param theme 主题类型
   */
  static saveTheme(theme: 'light' | 'dark'): void {
    StorageUtil.save(STORAGE_KEYS.THEME, theme);
  }

  /**
   * 加载主题设置
   * @returns 主题类型
   */
  static loadTheme(): 'light' | 'dark' {
    return StorageUtil.load(STORAGE_KEYS.THEME, 'light');
  }
}

/**
 * 应用设置存储
 */
export interface AppSettings {
  defaultLeverage: number;
  defaultPriceStep: number;
  decimalPlaces: number;
  autoSave: boolean;
}

export class SettingsStorage {
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
  static saveSettings(settings: AppSettings): void {
    StorageUtil.save(STORAGE_KEYS.SETTINGS, settings);
  }

  /**
   * 加载应用设置
   * @returns 应用设置
   */
  static loadSettings(): AppSettings {
    return StorageUtil.load(STORAGE_KEYS.SETTINGS, this.defaultSettings);
  }

  /**
   * 重置为默认设置
   */
  static resetSettings(): void {
    this.saveSettings(this.defaultSettings);
  }
}

/**
 * 数据导出工具
 */
export class DataExporter {
  /**
   * 导出仓位数据为JSON
   * @param positions 仓位列表
   * @returns JSON字符串
   */
  static exportPositionsToJSON(positions: Position[]): string {
    return JSON.stringify(positions, null, 2);
  }

  /**
   * 从JSON导入仓位数据
   * @param jsonString JSON字符串
   * @returns 仓位列表
   */
  static importPositionsFromJSON(jsonString: string): Position[] {
    try {
      const positions = JSON.parse(jsonString) as Position[];
      // 验证数据格式并转换日期
      return positions.map(position => ({
        ...position,
        createdAt: new Date(position.createdAt),
        updatedAt: new Date(position.updatedAt)
      }));
    } catch (error) {
      console.error('导入仓位数据失败:', error);
      throw new Error('无效的JSON格式');
    }
  }

  /**
   * 导出仓位数据为CSV
   * @param positions 仓位列表
   * @returns CSV字符串
   */
  static exportPositionsToCSV(positions: Position[]): string {
    if (positions.length === 0) return '';

    const headers = [
      'ID', '币种', '方向', '杠杆', '开仓价格', '数量', '保证金', '创建时间', '更新时间'
    ];

    const rows = positions.map(position => [
      position.id,
      position.symbol,
      position.side === 'long' ? '多头' : '空头',
      position.leverage.toString(),
      position.entryPrice.toString(),
      position.quantity.toString(),
      position.margin.toString(),
      position.createdAt.toISOString(),
      position.updatedAt.toISOString()
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }

  /**
   * 下载数据文件
   * @param content 文件内容
   * @param filename 文件名
   * @param contentType 内容类型
   */
  static downloadFile(content: string, filename: string, contentType: string = 'text/plain'): void {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }
}
