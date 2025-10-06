import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import { Position } from '../types/basic';
import {
  IndexedDBThemeStorage,
  DataMigration
} from '../utils/indexedDBStorage';

// 应用状态接口
interface AppState {
  positions: Position[];
  selectedPosition: Position | null;
  theme: 'light' | 'dark';
  loading: boolean;
}

// 定义Action类型
type AppAction =
  | { type: 'SET_POSITIONS'; payload: Position[] }
  | { type: 'ADD_POSITION'; payload: Position }
  | { type: 'UPDATE_POSITION'; payload: Position }
  | { type: 'DELETE_POSITION'; payload: string }
  | { type: 'SELECT_POSITION'; payload: Position | null }
  | { type: 'SET_THEME'; payload: 'light' | 'dark' }
  | { type: 'LOAD_DATA' }
  | { type: 'SET_LOADING'; payload: boolean };

// 初始状态
const initialState: AppState = {
  positions: [],
  selectedPosition: null,
  theme: 'light',
  loading: false
};

// Reducer函数 - 现在只处理状态更新，不处理存储
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_POSITIONS':
      return {
        ...state,
        positions: action.payload,
        loading: false
      };

    case 'ADD_POSITION':
      return {
        ...state,
        positions: [...state.positions, action.payload]
      };

    case 'UPDATE_POSITION': {
      const updatedPositions = state.positions.map(position =>
        position.id === action.payload.id ? action.payload : position
      );
      return {
        ...state,
        positions: updatedPositions,
        selectedPosition: state.selectedPosition?.id === action.payload.id
          ? action.payload
          : state.selectedPosition
      };
    }

    case 'DELETE_POSITION': {
      const filteredPositions = state.positions.filter(
        position => position.id !== action.payload
      );
      return {
        ...state,
        positions: filteredPositions,
        selectedPosition: state.selectedPosition?.id === action.payload
          ? null
          : state.selectedPosition
      };
    }

    case 'SELECT_POSITION':
      return {
        ...state,
        selectedPosition: action.payload
      };

    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    default:
      return state;
  }
}

// Context类型定义
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  // 异步便捷方法
  addPosition: (position: Position) => Promise<void>;
  updatePosition: (position: Position) => Promise<void>;
  deletePosition: (positionId: string) => Promise<void>;
  selectPosition: (position: Position | null) => void;
  setTheme: (theme: 'light' | 'dark') => Promise<void>;
  loadData: () => Promise<void>;
}

// 创建Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider组件属性
interface AppProviderProps {
  children: ReactNode;
}

// Provider组件
export default function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // 异步便捷方法
  const addPosition = async (position: Position) => {
    try {
      dispatch({ type: 'ADD_POSITION', payload: position });
      // 注意：具体的存储逻辑已移至专门的存储服务中
      console.log('仓位已添加到状态，具体存储由专门的存储服务处理');
    } catch (error) {
      console.error('添加仓位失败:', error);
      // 回滚状态
      dispatch({ type: 'DELETE_POSITION', payload: position.id });
      throw error;
    }
  };

  const updatePosition = async (position: Position) => {
    const originalPosition = state.positions.find(p => p.id === position.id);
    try {
      dispatch({ type: 'UPDATE_POSITION', payload: position });
      // 注意：具体的存储逻辑已移至专门的存储服务中
      console.log('仓位已更新到状态，具体存储由专门的存储服务处理');
    } catch (error) {
      console.error('更新仓位失败:', error);
      // 回滚状态
      if (originalPosition) {
        dispatch({ type: 'UPDATE_POSITION', payload: originalPosition });
      }
      throw error;
    }
  };

  const deletePosition = async (positionId: string) => {
    const originalPosition = state.positions.find(p => p.id === positionId);
    try {
      dispatch({ type: 'DELETE_POSITION', payload: positionId });
      // 注意：具体的存储逻辑已移至专门的存储服务中
      console.log('仓位已从状态删除，具体存储由专门的存储服务处理');
    } catch (error) {
      console.error('删除仓位失败:', error);
      // 回滚状态
      if (originalPosition) {
        dispatch({ type: 'ADD_POSITION', payload: originalPosition });
      }
      throw error;
    }
  };

  const selectPosition = (position: Position | null) => {
    dispatch({ type: 'SELECT_POSITION', payload: position });
  };

  const setTheme = async (theme: 'light' | 'dark') => {
    try {
      dispatch({ type: 'SET_THEME', payload: theme });
      await IndexedDBThemeStorage.saveTheme(theme);
    } catch (error) {
      console.error('保存主题失败:', error);
      throw error;
    }
  };

  const loadData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // 检查是否需要数据迁移
      if (await DataMigration.needsMigration()) {
        console.log('检测到需要数据迁移，开始迁移...');
        await DataMigration.migrateFromLocalStorage();
        // 迁移完成后清理localStorage（可选）
        // DataMigration.cleanupLocalStorage();
      }

      // 加载数据
      const [theme] = await Promise.all([
        IndexedDBThemeStorage.loadTheme()
      ]);

      // 注意：仓位数据现在由专门的存储服务管理，这里只加载主题
      dispatch({ type: 'SET_POSITIONS', payload: [] });
      dispatch({ type: 'SET_THEME', payload: theme });
    } catch (error) {
      console.error('加载数据失败:', error);
      dispatch({ type: 'SET_LOADING', payload: false });
    }
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

// 导出AppContext供hooks使用
export { AppContext };
