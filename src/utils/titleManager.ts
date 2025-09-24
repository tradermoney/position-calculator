/**
 * 页面标题管理工具
 * 用于动态设置每个页面的标题
 */

// 页面标题配置
export const PAGE_TITLES = {
  dashboard: '仪表盘 - 仓位计算器',
  positions: '仓位管理 - 仓位计算器',
  'add-position': '补仓计算 - 仓位计算器',
  pyramid: '金字塔加仓 - 仓位计算器',
  'contract-calculator': '合约计算器 - 仓位计算器',
  'volatility-calculator': '波动率计算器 - 仓位计算器',
  settings: '设置 - 仓位计算器',
} as const;

// 页面类型
export type PageKey = keyof typeof PAGE_TITLES;

// 默认标题
export const DEFAULT_TITLE = '仓位计算器 - 专业的加密货币仓位管理工具';

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
    dashboard: '查看您的仓位概览、盈亏统计和风险分析，全面掌握投资状况',
    positions: '管理您的加密货币仓位，查看详细信息、编辑参数和风险评估',
    'add-position': '智能补仓计算器，帮您制定最优的补仓策略，降低平均成本',
    pyramid: '金字塔加仓策略计算器，制定分层加仓计划，优化仓位管理',
    'contract-calculator': '专业的合约交易计算工具，包含盈亏、目标价格、强平价格等计算器',
    'volatility-calculator': '价格波动率计算器，计算两个价格之间的波动率百分比，支持历史记录',
    settings: '个性化设置您的交易参数、主题偏好和应用配置',
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
  updateMetaTag('description', '专业的加密货币仓位管理和计算工具，提供仓位分析、补仓计算、金字塔加仓等功能');
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

// 导入React用于useEffect
import React from 'react';
