import { useState, useEffect, useCallback } from 'react';
import {
  PositionSide,
  EntryPriceCalculatorParams,
  EntryPriceCalculatorResult,
  calculateEntryPrice,
} from '../../../utils/contractCalculations';
import { Position, InputValues } from './types';
import { validateNumberInput, formatInputValue } from './utils';

export function useEntryPriceForm() {
  const [side, setSide] = useState<PositionSide>(PositionSide.LONG);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [positions, setPositions] = useState<Position[]>([
    { id: 1, price: 0, quantity: 0, quantityUsdt: 0, enabled: true },
    { id: 2, price: 0, quantity: 0, quantityUsdt: 0, enabled: true },
  ]);
  const [result, setResult] = useState<EntryPriceCalculatorResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [inputValues, setInputValues] = useState<InputValues>({});

  // 验证输入参数
  const validateParams = useCallback((): string[] => {
    const errors: string[] = [];

    const enabledPositions = positions.filter((p) => p.enabled);
    const validPositions = enabledPositions.filter((p) => p.price > 0 && p.quantity > 0);

    if (enabledPositions.length === 0) {
      errors.push('至少需要启用一个仓位');
    } else if (validPositions.length === 0) {
      errors.push('至少需要输入一个有效的启用仓位（价格和数量都大于0）');
    }

    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      if (
        pos.enabled &&
        ((pos.price > 0 && pos.quantity <= 0) || (pos.price <= 0 && pos.quantity > 0))
      ) {
        errors.push(`仓位 ${i + 1}: 价格和数量必须同时大于0或同时为空`);
      }
    }

    return errors;
  }, [positions]);

  // 计算平均开仓价格
  const handleCalculate = () => {
    const validationErrors = validateParams();
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      const validPositions = positions.filter(
        (p) => p.enabled && p.price > 0 && p.quantity > 0
      );
      const params: EntryPriceCalculatorParams = {
        positions: validPositions.map((p) => ({ price: p.price, quantity: p.quantity })),
      };
      const calculationResult = calculateEntryPrice(params);
      setResult(calculationResult);
    } else {
      setResult(null);
    }
  };

  // 重置表单
  const handleReset = () => {
    setSide(PositionSide.LONG);
    setCurrentPrice(0);
    setPositions([
      { id: 1, price: 0, quantity: 0, quantityUsdt: 0, enabled: true },
      { id: 2, price: 0, quantity: 0, quantityUsdt: 0, enabled: true },
    ]);
    setResult(null);
    setErrors([]);
    setInputValues({});
  };

  // 添加仓位
  const addPosition = () => {
    const newId = Math.max(...positions.map((p) => p.id)) + 1;
    setPositions([...positions, { id: newId, price: 0, quantity: 0, quantityUsdt: 0, enabled: true }]);
  };

  // 在指定位置插入仓位
  const insertPosition = (index: number, direction: 'above' | 'below') => {
    const newId = Math.max(...positions.map((p) => p.id)) + 1;
    const newPosition = { id: newId, price: 0, quantity: 0, quantityUsdt: 0, enabled: true };
    const insertIndex = direction === 'above' ? index : index + 1;
    const newPositions = [...positions];
    newPositions.splice(insertIndex, 0, newPosition);
    setPositions(newPositions);
  };

  // 删除仓位
  const removePosition = (id: number) => {
    if (positions.length > 1) {
      setPositions(positions.filter((p) => p.id !== id));
    }
  };

  // 处理输入框的实时输入，保持原始字符串格式
  const handleInputChange = (
    id: number,
    field: 'price' | 'quantity' | 'quantityUsdt',
    value: string
  ) => {
    const key = `${id}-${field}`;

    // 验证输入格式
    const numberRegex = /^\d*\.?\d*$/;
    if (value === '' || numberRegex.test(value)) {
      // 更新显示值
      setInputValues((prev) => ({ ...prev, [key]: value }));

      // 更新数值
      const numValue = validateNumberInput(value);
      updatePosition(id, field, numValue);
    }
  };

  const getInputValue = (
    id: number,
    field: 'price' | 'quantity' | 'quantityUsdt',
    numValue: number
  ): string => {
    const key = `${id}-${field}`;
    return inputValues[key] !== undefined ? inputValues[key] : formatInputValue(numValue);
  };

  // 更新仓位 - 只处理数值，不处理字符串
  const updatePosition = (
    id: number,
    field: 'price' | 'quantity' | 'quantityUsdt' | 'enabled',
    value: number | boolean
  ) => {
    setPositions(
      positions.map((p) => {
        if (p.id === id) {
          let updatedPosition = { ...p };

          if (field === 'enabled') {
            updatedPosition.enabled = value as boolean;
          } else {
            const numValue = value as number;
            updatedPosition = { ...updatedPosition, [field]: numValue };

            // 自动绑定逻辑：当价格和其中一个数量字段都有值时，自动计算另一个数量字段
            if (field === 'quantity' && numValue > 0 && updatedPosition.price > 0) {
              // 当更新币数量时，自动计算USDT数量
              updatedPosition.quantityUsdt = updatedPosition.price * numValue;
            } else if (field === 'quantityUsdt' && numValue > 0 && updatedPosition.price > 0) {
              // 当更新USDT数量时，自动计算币数量
              updatedPosition.quantity = numValue / updatedPosition.price;
            } else if (field === 'price' && numValue > 0) {
              // 当更新价格时，如果币数量有值，重新计算USDT数量
              if (updatedPosition.quantity > 0) {
                updatedPosition.quantityUsdt = numValue * updatedPosition.quantity;
              } else if (updatedPosition.quantityUsdt > 0) {
                // 如果USDT数量有值，重新计算币数量
                updatedPosition.quantity = updatedPosition.quantityUsdt / numValue;
              }
            }
          }

          return updatedPosition;
        }
        return p;
      })
    );
  };

  // 自动计算（当有有效仓位时）
  useEffect(() => {
    const validPositions = positions.filter((p) => p.enabled && p.price > 0 && p.quantity > 0);
    if (validPositions.length > 0) {
      const validationErrors = validateParams();
      if (validationErrors.length === 0) {
        const params: EntryPriceCalculatorParams = {
          positions: validPositions.map((p) => ({ price: p.price, quantity: p.quantity })),
        };
        const calculationResult = calculateEntryPrice(params);
        setResult(calculationResult);
        setErrors([]);
      }
    }
  }, [positions, validateParams]);

  return {
    side,
    setSide,
    currentPrice,
    setCurrentPrice,
    positions,
    setPositions,
    result,
    errors,
    inputValues,
    setInputValues,
    handleCalculate,
    handleReset,
    addPosition,
    insertPosition,
    removePosition,
    handleInputChange,
    getInputValue,
    updatePosition,
  };
}
