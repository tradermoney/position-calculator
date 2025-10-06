import { useContext } from 'react';
import { AppContext } from './AppContext';
import { Position } from '../types/basic';

// Hook for using the context
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// 选择器Hook - 用于获取特定的状态片段
export function usePositions() {
  const { state } = useAppContext();
  return state.positions;
}

export function useSelectedPosition() {
  const { state } = useAppContext();
  return state.selectedPosition;
}

export function useTheme() {
  const { state } = useAppContext();
  return state.theme;
}

// 计算派生状态的Hook
export function usePositionStats() {
  const positions = usePositions();
  return {
    total: positions.length,
    open: positions.filter((p: Position) => p.status === 'active').length,
    closed: positions.filter((p: Position) => p.status === 'closed').length,
  };
}

// 重新导出AppProvider
export { default as AppProvider } from './AppContext';
