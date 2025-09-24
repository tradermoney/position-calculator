/**
 * 存储模块统一导出
 */

// 类型定义
export * from './types';

// 数据库管理
export { initDB, getDB, closeDB } from './database';

// 通用工具
export { IndexedDBUtil } from './indexedDBUtil';

// 专用存储类
export { IndexedDBPositionStorage } from './positionStorage';
export { IndexedDBThemeStorage } from './themeStorage';
export { IndexedDBSettingsStorage } from './settingsStorage';
export { IndexedDBVolatilityStorage } from './volatilityStorage';

// 数据迁移
export { DataMigration } from './dataMigration';
