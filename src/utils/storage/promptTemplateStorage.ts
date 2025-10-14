/**
 * 提示词模板存储服务
 */

import { getDB } from './database';
import { PromptTemplate, DefaultTemplateSettings } from './types';

/**
 * 生成唯一ID
 */
function generateId(): string {
  return `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 获取所有提示词模板
 */
export async function getAllPromptTemplates(): Promise<PromptTemplate[]> {
  try {
    const db = await getDB();
    const templates = await db.getAll('promptTemplates');
    // 按更新时间倒序排列
    return templates.sort((a, b) => {
      const timeA = a.updatedAt instanceof Date ? a.updatedAt.getTime() : new Date(a.updatedAt).getTime();
      const timeB = b.updatedAt instanceof Date ? b.updatedAt.getTime() : new Date(b.updatedAt).getTime();
      return timeB - timeA;
    });
  } catch (error) {
    console.error('获取提示词模板列表失败:', error);
    return [];
  }
}

/**
 * 根据ID获取提示词模板
 */
export async function getPromptTemplateById(id: string): Promise<PromptTemplate | undefined> {
  try {
    const db = await getDB();
    return await db.get('promptTemplates', id);
  } catch (error) {
    console.error('获取提示词模板失败:', error);
    return undefined;
  }
}

/**
 * 创建提示词模板
 */
export async function createPromptTemplate(
  template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>
): Promise<PromptTemplate> {
  console.log('createPromptTemplate 开始执行:', template);
  try {
    console.log('获取数据库连接...');
    const db = await getDB();
    console.log('数据库连接成功');
    const now = new Date();
    const newTemplate: PromptTemplate = {
      ...template,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    console.log('准备保存模板:', newTemplate);
    await db.add('promptTemplates', newTemplate);
    console.log('模板保存成功');
    return newTemplate;
  } catch (error) {
    console.error('创建提示词模板失败:', error);
    throw error;
  }
}

/**
 * 更新提示词模板
 */
export async function updatePromptTemplate(
  id: string,
  updates: Partial<Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<PromptTemplate | undefined> {
  try {
    const db = await getDB();
    const existing = await db.get('promptTemplates', id);
    if (!existing) {
      console.error('提示词模板不存在:', id);
      return undefined;
    }

    const updated: PromptTemplate = {
      ...existing,
      ...updates,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date(),
    };

    await db.put('promptTemplates', updated);
    return updated;
  } catch (error) {
    console.error('更新提示词模板失败:', error);
    throw error;
  }
}

/**
 * 删除提示词模板
 */
export async function deletePromptTemplate(id: string): Promise<boolean> {
  try {
    const db = await getDB();
    await db.delete('promptTemplates', id);
    return true;
  } catch (error) {
    console.error('删除提示词模板失败:', error);
    return false;
  }
}

/**
 * 搜索提示词模板（按名称）
 */
export async function searchPromptTemplates(keyword: string): Promise<PromptTemplate[]> {
  try {
    const allTemplates = await getAllPromptTemplates();
    const lowerKeyword = keyword.toLowerCase();
    return allTemplates.filter(template => 
      template.name.toLowerCase().includes(lowerKeyword)
    );
  } catch (error) {
    console.error('搜索提示词模板失败:', error);
    return [];
  }
}

/**
 * 默认模板内容
 */
const DEFAULT_TEMPLATE_CONTENT = `请结合下面的数据，分析这个加密货币接下来10分钟、30分钟、1个小时、12个小时、24个小时、1天、3天、5天、7天的走向；

## 分析要求

1. **技术分析**：基于K线数据、价格走势、成交量等技术指标进行分析
2. **市场情绪**：结合资金费率、订单薄深度等数据判断市场情绪
3. **风险评估**：评估各时间段的风险水平和不确定性
4. **操作建议**：给出具体的交易建议和风险控制措施

## 时间段分析

### 短期（10分钟-1小时）
- 分析短期价格波动趋势
- 关注技术指标信号
- 评估短期交易机会

### 中期（12小时-1天）
- 分析中期趋势方向
- 考虑市场结构变化
- 评估持仓策略

### 长期（3天-7天）
- 分析长期趋势格局
- 考虑基本面因素
- 制定长期投资策略

请基于提供的数据进行详细分析，并给出明确的结论和建议。`;

/**
 * 获取默认模板设置
 */
export async function getDefaultTemplateSettings(): Promise<DefaultTemplateSettings> {
  try {
    const db = await getDB();
    const settings = await db.get('defaultTemplateSettings', 'default');
    if (settings) {
      return settings;
    }
    // 如果没有设置，返回默认值
    return {
      content: DEFAULT_TEMPLATE_CONTENT,
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('获取默认模板设置失败:', error);
    return {
      content: DEFAULT_TEMPLATE_CONTENT,
      updatedAt: new Date(),
    };
  }
}

/**
 * 保存默认模板设置
 */
export async function saveDefaultTemplateSettings(content: string): Promise<boolean> {
  try {
    const db = await getDB();
    const settings: DefaultTemplateSettings = {
      content,
      updatedAt: new Date(),
    };
    await db.put('defaultTemplateSettings', settings, 'default');
    return true;
  } catch (error) {
    console.error('保存默认模板设置失败:', error);
    return false;
  }
}

/**
 * 获取默认模板内容
 */
export async function getDefaultTemplateContent(): Promise<string> {
  const settings = await getDefaultTemplateSettings();
  return settings.content;
}


