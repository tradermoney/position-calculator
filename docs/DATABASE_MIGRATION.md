# 数据库迁移和故障排除指南

## 概述

本应用使用 IndexedDB 作为本地存储方案。当数据库结构升级时，通常会自动迁移。但在某些情况下，您可能需要手动清空数据库。

## 数据库版本历史

- **版本 9**（当前）：添加 `defaultTemplateSettings` 表
- **版本 8**：添加 `promptTemplates` 表和资金费率计算器
- **版本 7 及更早**：基础功能

## 如何检查数据库健康状态

1. 打开浏览器开发者工具（F12 或 Cmd+Option+I）
2. 切换到 Console（控制台）标签
3. 输入以下命令：

```javascript
await window.__checkDatabaseHealth()
```

您将看到类似这样的输出：

```javascript
{
  isHealthy: true,
  missingStores: [],
  currentVersion: 9
}
```

### 健康状态说明

- `isHealthy: true` - 数据库健康，所有表都存在
- `isHealthy: false` - 数据库不健康，缺少某些表
- `missingStores` - 列出缺失的表名
- `currentVersion` - 当前数据库版本号

## 如何清空数据库

⚠️ **警告：此操作会删除所有本地数据，包括：**
- 所有保存的仓位
- 所有计算历史记录
- 所有自定义设置
- 所有提示词模板

### 步骤

1. 打开浏览器开发者工具（F12 或 Cmd+Option+I）
2. 切换到 Console（控制台）标签
3. 输入以下命令并回车：

```javascript
await window.__clearDatabase()
```

4. 等待确认消息
5. 页面将自动刷新

## 常见问题

### Q: 为什么需要清空数据库？

A: 当发生以下情况时：
- 数据库健康检查失败（`isHealthy: false`）
- 页面一直卡在"正在初始化数据库..."
- 控制台显示数据库相关错误
- 应用功能异常，怀疑是数据库问题

### Q: 清空数据库后能恢复数据吗？

A: 不能。IndexedDB 是本地存储，删除后无法恢复。建议在清空前：
1. 导出重要的数据（如有导出功能）
2. 截图保存重要的计算结果

### Q: 如何避免数据丢失？

A: 
1. 定期导出重要数据
2. 不要在多个标签页同时使用应用
3. 不要在浏览器隐私模式下使用（数据不会持久化）

### Q: 数据库升级会自动迁移数据吗？

A: 
- **正常情况**：会自动迁移，保留所有数据
- **异常情况**：如果升级过程中出错，可能需要手动清空数据库

## 开发者信息

### 数据库结构

当前数据库包含以下表（Object Stores）：

1. `positions` - 仓位数据
2. `settings` - 应用设置
3. `theme` - 主题设置
4. `volatilityRecords` - 波动率记录
5. `volatilityInputs` - 波动率输入状态
6. `binanceDataInputs` - 币安数据输入状态
7. `pnlCalculator` - 盈亏计算器状态
8. `savedPositions` - 保存的仓位
9. `calculatorRecords` - 计算器历史记录
10. `breakEvenCalculator` - 保本计算器状态
11. `fundingRateCalculator` - 资金费率计算器状态
12. `promptTemplates` - 提示词模板
13. `defaultTemplateSettings` - 默认模板设置

### 手动查看数据库

1. 打开开发者工具
2. 切换到 Application（应用）或 Storage（存储）标签
3. 展开 IndexedDB
4. 找到 `PositionCalculatorDB`
5. 可以查看各个表的数据

### 调试日志

应用会输出详细的初始化日志，格式如下：

```
[StorageProvider] 开始存储系统初始化...
[DBInit] 开始数据库初始化流程...
[DB] 开始初始化数据库...
[DB] ✓ IndexedDB数据库初始化成功，耗时: 2ms
[DBInit] ✓ 数据库健康检查通过
```

如果看到 `⚠️` 或 `✗` 标记，说明有问题需要关注。

## 技术支持

如果遇到无法解决的问题，请：

1. 查看控制台完整的错误日志
2. 运行健康检查命令获取诊断信息
3. 在 GitHub Issues 提交问题，附带：
   - 浏览器版本
   - 操作系统
   - 完整的控制台日志
   - 健康检查结果

