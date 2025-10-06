/**
 * PnL计算器存储服务
 * 使用统一的DAO层进行数据操作
 */

import { PositionSide } from '../../../utils/contractCalculations';
import { InputValueMap, Position } from './types';
import { PnLCalculatorStorageService } from '../../../services/pnlCalculatorStorage';

export interface StoredState {
  side: PositionSide;
  capital: number;
  leverage: number;
  positions: Position[];
  inputValues: InputValueMap;
}

/**
 * 保存状态到存储
 */
export async function saveState(state: StoredState): Promise<void> {
  return PnLCalculatorStorageService.saveState(state);
}

/**
 * 从存储加载状态
 */
export async function loadState(): Promise<StoredState | null> {
  return PnLCalculatorStorageService.loadState();
}

/**
 * 清除保存的状态
 */
export async function clearState(): Promise<void> {
  return PnLCalculatorStorageService.clearState();
}
