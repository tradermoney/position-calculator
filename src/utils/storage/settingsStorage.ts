/**
 * 应用设置IndexedDB存储
 */

import { AppSettings } from './types';
import { IndexedDBUtil } from './indexedDBUtil';

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
      const settings = await IndexedDBUtil.load<AppSettings>('settings', this.SETTINGS_KEY);
      return settings || this.defaultSettings;
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

  /**
   * 获取默认设置
   */
  static getDefaultSettings(): AppSettings {
    return { ...this.defaultSettings };
  }
}
