import { PositionSide } from '../utils/contractCalculations';
import { Position } from '../components/ContractCalculator/PnLCalculator/types';

/**
 * 保存的仓位数据
 */
export interface SavedPosition {
  id: string;
  name: string;
  side: PositionSide;
  capital: number;
  leverage: number;
  positions: Position[];
  inputValues: { [key: string]: string };
  createdAt: Date;
  updatedAt: Date;
  sortOrder?: number; // 排序顺序，数字越小越靠前
}

/**
 * 仓位列表项（用于显示）
 */
export interface PositionListItem {
  id: string;
  name: string;
  side: PositionSide;
  capital: number;
  leverage: number;
  positionCount: number;
  createdAt: Date;
  updatedAt: Date;
  sortOrder?: number; // 排序顺序，数字越小越靠前
}

/**
 * 仓位保存参数
 */
export interface SavePositionParams {
  name: string;
  side: PositionSide;
  capital: number;
  leverage: number;
  positions: Position[];
  inputValues: { [key: string]: string };
}

/**
 * 仓位恢复参数
 */
export interface RestorePositionParams {
  id: string;
  name: string;
  side: PositionSide;
  capital: number;
  leverage: number;
  positions: Position[];
  inputValues: { [key: string]: string };
}
