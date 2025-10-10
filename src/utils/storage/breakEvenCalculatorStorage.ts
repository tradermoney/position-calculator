/**
 * 保本计算器数据存储服务
 */

import { getDB } from './database';
import { BreakEvenInputState } from './types';
import { BreakEvenInputs } from '../breakEvenCalculations';

const STORAGE_KEY = 'breakEvenCalculatorInputs';

/**
 * 保存保本计算器输入状态
 */
export async function saveBreakEvenInputs(inputs: BreakEvenInputs): Promise<void> {
  try {
    const db = await getDB();
    const inputState: BreakEvenInputState = {
      ...inputs,
      lastUpdated: new Date(),
    };

    // 保存为符合keyPath='key'的格式
    await db.put('breakEvenCalculator', {
      key: STORAGE_KEY,
      ...inputState,
    });

    console.log('保本计算器输入状态已保存');
  } catch (error) {
    console.error('保存保本计算器输入状态失败:', error);
    throw error;
  }
}

/**
 * 加载保本计算器输入状态
 */
export async function loadBreakEvenInputs(): Promise<BreakEvenInputs | null> {
  try {
    const db = await getDB();
    const result = await db.get('breakEvenCalculator', STORAGE_KEY);

    if (result) {
      const { leverage, openFeeRate, closeFeeRate, fundingRate, fundingPeriod, holdingTime, symbol, positionDirection } = result as BreakEvenInputState;
      return {
        leverage,
        openFeeRate,
        closeFeeRate,
        fundingRate,
        fundingPeriod,
        holdingTime,
        symbol: symbol || 'BTCUSDT',
        positionDirection: positionDirection || 'long',
      };
    }

    return null;
  } catch (error) {
    console.error('加载保本计算器输入状态失败:', error);
    return null;
  }
}

/**
 * 清除保本计算器输入状态
 */
export async function clearBreakEvenInputs(): Promise<void> {
  try {
    const db = await getDB();
    await db.delete('breakEvenCalculator', STORAGE_KEY);
    console.log('保本计算器输入状态已清除');
  } catch (error) {
    console.error('清除保本计算器输入状态失败:', error);
    throw error;
  }
}

