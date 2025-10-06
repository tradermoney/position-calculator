import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DndContextProps } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { PositionSide } from '../../../utils/contractCalculations';
import { InputValueMap, PnLResult, Position, PositionType } from './types';
import { RestorePositionParams } from '../../../types/position';
import { createEmptyPosition, generateId, parseValueWithUnit } from './helpers';
import { buildPositionStats, calculatePnL, calculatePositionUsage, validatePositions } from './calculations';
import { PnLCalculatorStorageService, StoredState } from '../../../services/pnlCalculatorStorage';
import { useFocusManager } from './focusManager';
import { createCapitalChangeHandler, createGetInputValue, createInputChangeHandler } from './inputHandlers';
import { useStorageReady } from '../../../hooks/useStorage';

export function usePnLCalculator() {
  const { isStorageReady } = useStorageReady();
  const [isLoaded, setIsLoaded] = useState(false);
  const [side, setSide] = useState<PositionSide>(PositionSide.LONG);
  const [capital, setCapital] = useState<number>(0);
  const [leverage, setLeverage] = useState<number>(10);
  const [positions, setPositions] = useState<Position[]>([
    createEmptyPosition(1),
    createEmptyPosition(2, PositionType.CLOSE),
  ]);
  const [result, setResult] = useState<PnLResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [inputValues, setInputValues] = useState<InputValueMap>({});

  // 焦点管理
  const {
    registerInputRef,
    handleInputFocus,
    handleInputBlur,
    maintainFocus,
  } = useFocusManager();

  // 从 IndexedDB 加载初始状态（等待存储就绪）
  useEffect(() => {
    if (!isStorageReady) {
      return;
    }

    PnLCalculatorStorageService.loadState().then(state => {
      if (state) {
        setSide(state.side);
        setCapital(state.capital);
        setLeverage(state.leverage || 10);

        // 确保旧数据兼容：添加缺失的 marginUsdt 字段
        const migratedPositions = state.positions.map(pos => ({
          ...pos,
          marginUsdt: pos.marginUsdt ?? 0,
        }));
        setPositions(migratedPositions);
        setInputValues(state.inputValues);
      }
      setIsLoaded(true);
    }).catch(error => {
      console.error('Failed to load PnL calculator state:', error);
      setIsLoaded(true);
    });
  }, [isStorageReady]);

  // 保存状态到 IndexedDB（防抖）
  useEffect(() => {
    if (!isLoaded || !isStorageReady) return;

    const timer = setTimeout(() => {
      const state: StoredState = {
        side,
        capital,
        leverage,
        positions,
        inputValues,
      };
      PnLCalculatorStorageService.saveState(state).catch(error => {
        console.error('Failed to save PnL calculator state:', error);
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [side, capital, leverage, positions, inputValues, isLoaded, isStorageReady]);

  // 拖拽传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  ) as DndContextProps['sensors'];

  // 维护焦点
  useEffect(() => {
    maintainFocus();
  }, [positions, inputValues, maintainFocus]);

  // 当杠杆变化时,重新计算所有仓位的保证金
  useEffect(() => {
    if (!isLoaded || leverage <= 0) return;

    setPositions(prev => prev.map(position => {
      if (position.quantityUsdt > 0) {
        const newMarginUsdt = position.quantityUsdt / leverage;
        setInputValues(prevInputs => ({
          ...prevInputs,
          [`${position.id}-marginUsdt`]: newMarginUsdt.toString()
        }));
        return { ...position, marginUsdt: newMarginUsdt };
      }
      return position;
    }));
  }, [leverage, isLoaded]);

  // 获取输入值
  const getInputValue = useMemo(
    () => createGetInputValue(inputValues),
    [inputValues]
  );

  // 更新仓位
  const updatePosition = useCallback((id: number, field: keyof Position, value: unknown) => {
    setPositions(prev => prev.map(position => {
      if (position.id !== id) {
        return position;
      }

      const updated = { ...position, [field]: value } as Position;

      if (field === 'quantity' && typeof value === 'number' && value > 0 && updated.price > 0) {
        updated.quantityUsdt = updated.price * value;
      } else if (field === 'quantityUsdt' && typeof value === 'number' && value > 0 && updated.price > 0) {
        updated.quantity = value / updated.price;
      } else if (field === 'price' && typeof value === 'number' && value > 0) {
        if (updated.quantity > 0) {
          updated.quantityUsdt = value * updated.quantity;
        } else if (updated.quantityUsdt > 0) {
          updated.quantity = updated.quantityUsdt / value;
        }
      }

      return updated;
    }));
  }, []);

  // 处理输入变化
  const handleInputChange = useMemo(
    () => createInputChangeHandler(leverage, setInputValues, setPositions),
    [leverage]
  );

  // 处理资金变化
  const handleCapitalChange = useMemo(
    () => createCapitalChangeHandler(setInputValues, setCapital),
    []
  );

  const addPosition = useCallback(() => {
    const id = generateId();
    setPositions(prev => [...prev, createEmptyPosition(id)]);
  }, []);

  const removePosition = useCallback((id: number) => {
    setPositions(prev => (prev.length > 1 ? prev.filter(position => position.id !== id) : prev));
  }, []);

  const insertPosition = useCallback((index: number, direction: 'above' | 'below') => {
    const id = generateId();
    const insertIndex = direction === 'above' ? index : index + 1;
    const next = createEmptyPosition(id);
    setPositions(prev => [
      ...prev.slice(0, insertIndex),
      next,
      ...prev.slice(insertIndex),
    ]);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    setPositions(items => {
      const oldIndex = items.findIndex(item => item.id === active.id);
      const newIndex = items.findIndex(item => item.id === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  }, []);

  const handleCalculate = useCallback(() => {
    const validationErrors = validatePositions(positions, capital);
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      setResult(calculatePnL(positions, side));
    } else {
      setResult(null);
    }
  }, [positions, side, capital]);

  const handleReset = useCallback(() => {
    setSide(PositionSide.LONG);
    setCapital(0);
    setLeverage(10);
    setPositions([createEmptyPosition(1), createEmptyPosition(2, PositionType.CLOSE)]);
    setResult(null);
    setErrors([]);
    setInputValues({});
  }, []);

  useEffect(() => {
    const validPositions = positions.filter(p => p.enabled && p.price > 0 && p.quantity > 0);

    if (validPositions.length === 0) {
      setResult(null);
      setErrors([]);
      return;
    }

    const validationErrors = validatePositions(positions, capital);
    if (validationErrors.length === 0) {
      setResult(calculatePnL(positions, side));
      setErrors([]);
    } else {
      setResult(null);
      setErrors(validationErrors);
    }
  }, [positions, side, capital]);

  const positionUsage = useCallback(() => calculatePositionUsage(positions, capital), [positions, capital]);

  const positionStats = useMemo(() => buildPositionStats(positions, side, capital, leverage), [positions, side, capital, leverage]);

  // 恢复仓位
  const restorePosition = useCallback((params: RestorePositionParams) => {
    setSide(params.side);
    setCapital(params.capital);
    setLeverage(params.leverage);
    setPositions(params.positions);
    setInputValues(params.inputValues);
    setResult(null);
    setErrors([]);
  }, []);

  // 导入仓位数据
  const importPositions = useCallback((importedPositions: Position[]) => {
    // 为导入的仓位生成新的ID，避免冲突
    const newPositions = importedPositions.map((pos, index) => ({
      ...pos,
      id: generateId() + index,
      // 解析可能包含单位的数值字段
      price: typeof pos.price === 'string' ? parseValueWithUnit(pos.price) : pos.price,
      quantity: typeof pos.quantity === 'string' ? parseValueWithUnit(pos.quantity) : pos.quantity,
      quantityUsdt: typeof pos.quantityUsdt === 'string' ? parseValueWithUnit(pos.quantityUsdt) : pos.quantityUsdt,
      marginUsdt: typeof pos.marginUsdt === 'string' ? parseValueWithUnit(pos.marginUsdt) : pos.marginUsdt,
    }));
    
    setPositions(newPositions);
    setResult(null);
    setErrors([]);
  }, []);

  // 导入完整仓位配置
  const importPositionConfig = useCallback((config: {
    side: PositionSide;
    capital: number;
    leverage: number;
    positions: Position[];
  }) => {
    setSide(config.side);
    setCapital(config.capital);
    setLeverage(config.leverage);
    
    // 为导入的仓位生成新的ID，避免冲突
    const newPositions = config.positions.map((pos, index) => ({
      ...pos,
      id: generateId() + index,
      // 解析可能包含单位的数值字段
      price: typeof pos.price === 'string' ? parseValueWithUnit(pos.price) : pos.price,
      quantity: typeof pos.quantity === 'string' ? parseValueWithUnit(pos.quantity) : pos.quantity,
      quantityUsdt: typeof pos.quantityUsdt === 'string' ? parseValueWithUnit(pos.quantityUsdt) : pos.quantityUsdt,
      marginUsdt: typeof pos.marginUsdt === 'string' ? parseValueWithUnit(pos.marginUsdt) : pos.marginUsdt,
    }));
    
    setPositions(newPositions);
    setResult(null);
    setErrors([]);
  }, []);

  // 导出完整仓位配置
  const exportPositionConfig = useCallback(() => {
    return {
      side,
      capital,
      leverage,
      positions,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
  }, [side, capital, leverage, positions]);

  return {
    side,
    setSide,
    capital,
    handleCapitalChange,
    leverage,
    setLeverage,
    positions,
    addPosition,
    insertPosition,
    removePosition,
    updatePosition,
    sensors,
    handleDragEnd,
    getInputValue,
    handleInputChange,
    registerInputRef,
    handleInputFocus,
    handleInputBlur,
    calculatePositionUsage: positionUsage,
    positionStats,
    result,
    errors,
    handleCalculate,
    handleReset,
    inputValues,
    restorePosition,
    importPositions,
    importPositionConfig,
    exportPositionConfig,
  };
}

export type UsePnLCalculatorReturn = ReturnType<typeof usePnLCalculator>;
export { PositionType } from './types';
