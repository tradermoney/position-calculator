import { InputValueMap, Position } from './types';
import { NUMBER_REGEX, parseNumericInput } from './helpers';

/**
 * 处理资金输入变化
 */
export function createCapitalChangeHandler(
  setInputValues: React.Dispatch<React.SetStateAction<InputValueMap>>,
  setCapital: React.Dispatch<React.SetStateAction<number>>
) {
  return (value: string) => {
    if (value === '' || NUMBER_REGEX.test(value)) {
      setInputValues(prev => ({ ...prev, capital: value }));
      setCapital(parseNumericInput(value));
    }
  };
}

/**
 * 获取输入值
 */
export function createGetInputValue(inputValues: InputValueMap) {
  return (id: number, field: 'price' | 'quantity' | 'quantityUsdt' | 'marginUsdt' | 'capital', fallbackValue: number): string => {
    const key = id === 0 ? 'capital' : `${id}-${field}`;
    const cached = inputValues[key];
    if (cached !== undefined) {
      return cached;
    }
    return fallbackValue === 0 ? '' : fallbackValue.toString();
  };
}

/**
 * 处理输入变化
 */
export function createInputChangeHandler(
  leverage: number,
  setInputValues: React.Dispatch<React.SetStateAction<InputValueMap>>,
  setPositions: React.Dispatch<React.SetStateAction<Position[]>>
) {
  return (id: number, field: 'price' | 'quantity' | 'quantityUsdt' | 'marginUsdt', value: string) => {
    const key = `${id}-${field}`;

    if (value === '' || NUMBER_REGEX.test(value)) {
      const numValue = parseNumericInput(value);

      // 更新当前字段
      setInputValues(prev => ({ ...prev, [key]: value }));

      // 计算并同步关联字段
      setPositions(prev => prev.map(position => {
        if (position.id !== id) {
          return position;
        }

        const updated = { ...position, [field]: numValue } as Position;

        // 关系：数量(币) × 价格 = 杠杆后数量(U)
        // 关系：杠杆后数量(U) ÷ 杠杆倍数 = 杠杆前(U) = 保证金

        if (field === 'quantity' && numValue > 0 && updated.price > 0) {
          // 更新 杠杆后数量(U)
          updated.quantityUsdt = updated.price * numValue;
          setInputValues(prev => ({ ...prev, [`${id}-quantityUsdt`]: updated.quantityUsdt.toString() }));

          // 更新 杠杆前(U)
          if (leverage > 0) {
            updated.marginUsdt = updated.quantityUsdt / leverage;
            setInputValues(prev => ({ ...prev, [`${id}-marginUsdt`]: updated.marginUsdt.toString() }));
          }
        } else if (field === 'quantityUsdt' && numValue > 0) {
          // 更新 数量(币)
          if (updated.price > 0) {
            updated.quantity = numValue / updated.price;
            setInputValues(prev => ({ ...prev, [`${id}-quantity`]: updated.quantity.toString() }));
          }

          // 更新 杠杆前(U)
          if (leverage > 0) {
            updated.marginUsdt = numValue / leverage;
            setInputValues(prev => ({ ...prev, [`${id}-marginUsdt`]: updated.marginUsdt.toString() }));
          }
        } else if (field === 'marginUsdt' && numValue > 0) {
          // 更新 杠杆后数量(U)
          updated.quantityUsdt = numValue * leverage;
          setInputValues(prev => ({ ...prev, [`${id}-quantityUsdt`]: updated.quantityUsdt.toString() }));

          // 更新 数量(币)
          if (updated.price > 0) {
            updated.quantity = updated.quantityUsdt / updated.price;
            setInputValues(prev => ({ ...prev, [`${id}-quantity`]: updated.quantity.toString() }));
          }
        } else if (field === 'price' && numValue > 0) {
          if (updated.quantity > 0) {
            // 更新 杠杆后数量(U)
            updated.quantityUsdt = numValue * updated.quantity;
            setInputValues(prev => ({ ...prev, [`${id}-quantityUsdt`]: updated.quantityUsdt.toString() }));

            // 更新 杠杆前(U)
            if (leverage > 0) {
              updated.marginUsdt = updated.quantityUsdt / leverage;
              setInputValues(prev => ({ ...prev, [`${id}-marginUsdt`]: updated.marginUsdt.toString() }));
            }
          } else if (updated.quantityUsdt > 0) {
            // 更新 数量(币)
            updated.quantity = updated.quantityUsdt / numValue;
            setInputValues(prev => ({ ...prev, [`${id}-quantity`]: updated.quantity.toString() }));
          } else if (updated.marginUsdt > 0) {
            // 更新 杠杆后数量(U)
            updated.quantityUsdt = updated.marginUsdt * leverage;
            setInputValues(prev => ({ ...prev, [`${id}-quantityUsdt`]: updated.quantityUsdt.toString() }));

            // 更新 数量(币)
            updated.quantity = updated.quantityUsdt / numValue;
            setInputValues(prev => ({ ...prev, [`${id}-quantity`]: updated.quantity.toString() }));
          }
        }

        return updated;
      }));
    }
  };
}
