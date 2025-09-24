/**
 * 数据迁移工具 - 从localStorage迁移到IndexedDB
 */

import { IndexedDBUtil } from './indexedDBUtil';
import { IndexedDBPositionStorage } from './positionStorage';
import { IndexedDBThemeStorage } from './themeStorage';
import { IndexedDBSettingsStorage } from './settingsStorage';

export class DataMigration {
  private static readonly MIGRATION_KEY = 'data-migration-completed';

  /**
   * 检查是否需要数据迁移
   */
  static async needsMigration(): Promise<boolean> {
    try {
      const migrationCompleted = await IndexedDBUtil.load<boolean>('settings', this.MIGRATION_KEY);
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

  /**
   * 执行完整的迁移流程
   */
  static async performMigration(): Promise<void> {
    try {
      const needsMigration = await this.needsMigration();
      if (needsMigration) {
        await this.migrateFromLocalStorage();
        // 可选：清理旧数据（谨慎操作）
        // this.cleanupLocalStorage();
      } else {
        console.log('数据迁移已完成，无需重复迁移');
      }
    } catch (error) {
      console.error('执行数据迁移失败:', error);
      throw error;
    }
  }
}
