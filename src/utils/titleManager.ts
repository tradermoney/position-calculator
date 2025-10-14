/**
 * 页面标题管理工具
 * 用于动态设置每个页面的标题
 */

// 页面标题配置
export const PAGE_TITLES = {
  dashboard: '功能索引 - 合约计算器',
  pyramid: '金子塔委托单计算器 - 合约计算器',
  'pnl-calculator': '盈亏计算器 - 合约计算器',
  'target-price-calculator': '目标价格计算器 - 合约计算器',
  'liquidation-calculator': '强平价格计算器 - 合约计算器',
  'max-position-calculator': '可开计算器 - 合约计算器',
  'entry-price-calculator': '开仓价格计算器 - 合约计算器',
  'break-even-calculator': '保本回报率计算器 - 合约计算器',
  'volatility-calculator': '波动率计算器 - 合约计算器',
  'volatility-calculator-manual': '手动计算 - 波动率计算器',
  'volatility-calculator-binance': '币安数据分析 - 波动率计算器',
  'kelly-calculator': '凯利公式计算器 - 合约计算器',
  'funding-rate-calculator': '资金费率计算器 - 合约计算器',
  'fee-comparison': 'Maker/Taker费率对比 - 合约计算器',
  'calculator': '计算器 - 合约计算器',
  'prompt-template': '提示词模板 - 合约计算器',
  'prompt-template-detail': '模板详情 - 提示词模板',
  'prompt-template-edit': '编辑模板 - 提示词模板',
  'prompt-template-new': '创建模板 - 提示词模板',
} as const;

// 页面类型
export type PageKey = keyof typeof PAGE_TITLES;

// 默认标题
export const DEFAULT_TITLE = '合约计算器 - 专业的加密货币合约交易工具';

/**
 * 设置页面标题
 * @param pageKey 页面键名
 * @param customTitle 自定义标题（可选）
 */
export function setPageTitle(pageKey: PageKey, customTitle?: string): void {
  const title = customTitle || PAGE_TITLES[pageKey] || DEFAULT_TITLE;
  
  // 设置document.title
  document.title = title;
  
  // 更新meta标签
  updateMetaTags(title, pageKey);
}

/**
 * 更新相关的meta标签
 * @param title 页面标题
 * @param pageKey 页面键名
 */
function updateMetaTags(title: string, pageKey: PageKey): void {
  // 更新或创建meta description
  const descriptions = {
    dashboard: '快速了解各个工具的功能定位，便捷跳转到目标页面',
    pyramid: '金子塔委托单计算器，制定分层加仓计划，优化仓位管理',
    'pnl-calculator': '合约盈亏计算器，计算交易盈利/亏损、回报率和起始保证金',
    'target-price-calculator': '目标价格计算器，根据期望回报率计算目标价格',
    'liquidation-calculator': '强平价格计算器，计算仓位的强制平仓价格，管理交易风险',
    'max-position-calculator': '可开计算器，计算最大可开仓位数量，合理分配资金',
    'entry-price-calculator': '开仓价格计算器，计算多笔交易的平均开仓价格',
    'break-even-calculator': '保本回报率计算器，计算合约交易需要多少浮盈才能覆盖交易成本，包括手续费和资金费率',
    'volatility-calculator': '价格波动率计算器，计算两个价格之间的波动率百分比，支持历史记录',
    'volatility-calculator-manual': '手动波动率计算工具，支持正向和反向计算，自动保存历史记录',
    'volatility-calculator-binance': '基于币安K线数据的波动率分析工具，支持实时数据获取和可视化分析',
    'kelly-calculator': '凯利公式计算器，使用Kelly Criterion计算最优仓位比例，科学管理投资风险',
    'funding-rate-calculator': '资金费率计算器，基于币安API历史数据预估永续合约持仓成本，帮您合理规划持仓时间',
    'fee-comparison': 'Maker/Taker费率对比工具，对比不同交易所的手续费率，计算实际交易成本',
    'calculator': '科学计算器，支持基础运算和括号运算，自动保存计算历史记录',
    'prompt-template': '提示词模板管理，创建和管理AI提示词模板，支持数据配置和内容复制',
    'prompt-template-detail': '查看提示词模板详情，复制完整内容包含配置数据',
    'prompt-template-edit': '编辑提示词模板，修改模板内容和数据配置',
    'prompt-template-new': '创建新的提示词模板，设置模板内容和数据源配置',
  };
  
  updateMetaTag('description', descriptions[pageKey] || '专业的加密货币仓位管理和计算工具');
  
  // 更新Open Graph标签
  updateMetaTag('og:title', title, 'property');
  updateMetaTag('og:description', descriptions[pageKey] || '专业的加密货币仓位管理和计算工具', 'property');
  
  // 更新Twitter Card标签
  updateMetaTag('twitter:title', title, 'name');
  updateMetaTag('twitter:description', descriptions[pageKey] || '专业的加密货币仓位管理和计算工具', 'name');
}

/**
 * 更新或创建meta标签
 * @param name 标签名称
 * @param content 标签内容
 * @param attribute 属性名（name或property）
 */
function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name'): void {
  let metaTag = document.querySelector(`meta[${attribute}="${name}"]`);
  
  if (!metaTag) {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(attribute, name);
    document.head.appendChild(metaTag);
  }
  
  metaTag.setAttribute('content', content);
}

/**
 * 重置为默认标题
 */
export function resetTitle(): void {
  document.title = DEFAULT_TITLE;
  updateMetaTag('description', '专业的加密货币合约交易和计算工具，提供合约分析、金子塔委托单等功能');
}

/**
 * 获取当前页面标题
 * @param pageKey 页面键名
 * @returns 页面标题
 */
export function getPageTitle(pageKey: PageKey): string {
  return PAGE_TITLES[pageKey] || DEFAULT_TITLE;
}

/**
 * 页面标题Hook
 * 用于在React组件中管理页面标题
 */
export function usePageTitle(pageKey: PageKey, customTitle?: string) {
  React.useEffect(() => {
    setPageTitle(pageKey, customTitle);
    
    // 组件卸载时重置标题
    return () => {
      resetTitle();
    };
  }, [pageKey, customTitle]);
}

/**
 * 动态页面标题Hook
 * 用于根据数据动态设置页面标题（如模板名称）
 */
export function useDynamicPageTitle(pageKey: PageKey, dynamicPart?: string, suffix?: string) {
  React.useEffect(() => {
    if (dynamicPart) {
      const customTitle = suffix 
        ? `${dynamicPart} - ${suffix}` 
        : `${dynamicPart} - ${PAGE_TITLES[pageKey] || DEFAULT_TITLE}`;
      setPageTitle(pageKey, customTitle);
    } else {
      setPageTitle(pageKey);
    }
    
    // 组件卸载时重置标题
    return () => {
      resetTitle();
    };
  }, [pageKey, dynamicPart, suffix]);
}

// 导入React用于useEffect
import React from 'react';
