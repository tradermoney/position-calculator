import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Position, AppState } from '../types';
import { PositionStorage, ThemeStorage } from '../utils/storage';

// 定义Action类型
type AppAction =
  | { type: 'SET_POSITIONS'; payload: Position[] }
  | { type: 'ADD_POSITION'; payload: Position }
  | { type: 'UPDATE_POSITION'; payload: Position }
  | { type: 'DELETE_POSITION'; payload: string }
  | { type: 'SELECT_POSITION'; payload: Position | null }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'LOAD_DATA' };

// 初始状态
const initialState: AppState = {
  positions: [],
  selectedPosition: null,
  theme: 'light'
};

// Reducer函数
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_POSITIONS':
      return {
        ...state,
        positions: action.payload
      };

    case 'ADD_POSITION':
      const newPositions = [...state.positions, action.payload];
      PositionStorage.savePositions(newPositions);
      return {
        ...state,
        positions: newPositions
      };

    case 'UPDATE_POSITION':
      const updatedPositions = state.positions.map(position =>
        position.id === action.payload.id ? action.payload : position
      );
      PositionStorage.savePositions(updatedPositions);
      return {
        ...state,
        positions: updatedPositions,
        selectedPosition: state.selectedPosition?.id === action.payload.id 
          ? action.payload 
          : state.selectedPosition
      };

    case 'DELETE_POSITION':
      const filteredPositions = state.positions.filter(
        position => position.id !== action.payload
      );
      PositionStorage.savePositions(filteredPositions);
      return {
        ...state,
        positions: filteredPositions,
        selectedPosition: state.selectedPosition?.id === action.payload 
          ? null 
          : state.selectedPosition
      };

    case 'SELECT_POSITION':
      return {
        ...state,
        selectedPosition: action.payload
      };

    case 'SET_THEME':
      ThemeStorage.saveTheme(action.payload);
      return {
        ...state,
        theme: action.payload
      };

    case 'LOAD_DATA':
      return {
        ...state,
        positions: PositionStorage.loadPositions(),
        theme: ThemeStorage.loadTheme()
      };

    default:
      return state;
  }
}

// Context类型定义
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // 便捷方法
  addPosition: (position: Position) => void;
  updatePosition: (position: Position) => void;
  deletePosition: (positionId: string) => void;
  selectPosition: (position: Position | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  loadData: () => void;
}

// 创建Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider组件属性
interface AppProviderProps {
  children: ReactNode;
}

// Provider组件
export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 便捷方法
  const addPosition = (position: Position) => {
    dispatch({ type: 'ADD_POSITION', payload: position });
  };

  const updatePosition = (position: Position) => {
    dispatch({ type: 'UPDATE_POSITION', payload: position });
  };

  const deletePosition = (positionId: string) => {
    dispatch({ type: 'DELETE_POSITION', payload: positionId });
  };

  const selectPosition = (position: Position | null) => {
    dispatch({ type: 'SELECT_POSITION', payload: position });
  };

  const setTheme = (theme: 'light' | 'dark') => {
    dispatch({ type: 'SET_THEME', payload: theme });
  };

  const loadData = () => {
    dispatch({ type: 'LOAD_DATA' });
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadData();
  }, []);

  const contextValue: AppContextType = {
    state,
    dispatch,
    addPosition,
    updatePosition,
    deletePosition,
    selectPosition,
    setTheme,
    loadData
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

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
  
  return React.useMemo(() => {
    const totalPositions = positions.length;
    const longPositions = positions.filter(p => p.side === 'long').length;
    const shortPositions = positions.filter(p => p.side === 'short').length;
    const totalMargin = positions.reduce((sum, p) => sum + p.margin, 0);
    
    return {
      totalPositions,
      longPositions,
      shortPositions,
      totalMargin
    };
  }, [positions]);
}
