/**
 * 主题设置IndexedDB存储
 */

import { IndexedDBUtil } from './indexedDBUtil';

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
      const theme = await IndexedDBUtil.load<'light' | 'dark'>('theme', this.THEME_KEY);
      return theme || 'light';
    } catch (error) {
      console.error('从IndexedDB加载主题失败:', error);
      return 'light';
    }
  }
}
