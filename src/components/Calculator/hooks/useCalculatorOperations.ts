import { useCallback } from 'react';
import { CalculatorRecord } from '../../../utils/calculatorStorage';
import { isValidExpression, evaluateExpression, formatResult } from '../utils/calculations';

interface UseCalculatorOperationsProps {
  expression: string;
  display: string;
  isResult: boolean;
  isEditing: boolean;
  cursorPosition: number;
  setExpression: (value: string) => void;
  setDisplay: (value: string) => void;
  setError: (value: string) => void;
  setIsResult: (value: boolean) => void;
  setCursorPosition: (value: number) => void;
  setIsEditing: (value: boolean) => void;
  setCursorPositionInInput: (position: number) => void;
  addHistoryRecord: (record: CalculatorRecord) => Promise<void>;
}

export function useCalculatorOperations({
  expression,
  display,
  isResult,
  isEditing,
  cursorPosition,
  setExpression,
  setDisplay,
  setError,
  setIsResult,
  setCursorPosition,
  setIsEditing,
  setCursorPositionInInput,
  addHistoryRecord,
}: UseCalculatorOperationsProps) {
  // 清空显示
  const handleClear = useCallback(() => {
    setDisplay('0');
    setExpression('');
    setError('');
    setIsResult(false);
    setCursorPosition(0);
    setIsEditing(false);
  }, [setDisplay, setExpression, setError, setIsResult, setCursorPosition, setIsEditing]);

  // 退格
  const handleBackspace = useCallback(() => {
    if (isResult) {
      handleClear();
      return;
    }

    if (isEditing) {
      if (cursorPosition > 0) {
        const newExpression =
          expression.slice(0, cursorPosition - 1) + expression.slice(cursorPosition);
        setExpression(newExpression);
        setDisplay(newExpression || '0');
        const newPosition = cursorPosition - 1;
        setCursorPosition(newPosition);
        setTimeout(() => setCursorPositionInInput(newPosition), 0);
      }
    } else {
      if (expression.length <= 1) {
        setDisplay('0');
        setExpression('');
        setCursorPosition(0);
      } else {
        const newExpression = expression.slice(0, -1);
        setExpression(newExpression);
        setDisplay(newExpression || '0');
        setCursorPosition(newExpression.length);
      }
    }
    setError('');
  }, [
    expression,
    isResult,
    isEditing,
    cursorPosition,
    handleClear,
    setCursorPositionInInput,
    setExpression,
    setDisplay,
    setError,
    setCursorPosition,
  ]);

  // 输入数字或操作符
  const handleInput = useCallback(
    (value: string) => {
      setError('');

      if (isResult && /[0-9]/.test(value)) {
        setExpression(value);
        setDisplay(value);
        setIsResult(false);
        setCursorPosition(1);
        return;
      }

      if (isResult && /[+\-*/()]/.test(value)) {
        const newExpression = display + value;
        setExpression(newExpression);
        setDisplay(newExpression);
        setIsResult(false);
        setCursorPosition(newExpression.length);
        return;
      }

      let newExpression: string;
      let newPosition: number;

      if (expression === '' && value === '0') {
        return;
      }

      if (isEditing) {
        const currentCursorPos = cursorPosition;

        if (expression === '0' && /[0-9]/.test(value)) {
          newExpression = value;
          newPosition = 1;
        } else {
          newExpression =
            expression.slice(0, currentCursorPos) + value + expression.slice(currentCursorPos);
          newPosition = currentCursorPos + 1;
        }
        setCursorPosition(newPosition);
        setTimeout(() => setCursorPositionInInput(newPosition), 0);
      } else {
        if (expression === '0' && /[0-9]/.test(value)) {
          newExpression = value;
        } else {
          newExpression = expression + value;
        }
        newPosition = newExpression.length;
        setCursorPosition(newPosition);
      }

      setExpression(newExpression);
      setDisplay(newExpression);
      setIsResult(false);
    },
    [
      expression,
      display,
      isResult,
      isEditing,
      cursorPosition,
      setCursorPositionInInput,
      setError,
      setExpression,
      setDisplay,
      setIsResult,
      setCursorPosition,
    ]
  );

  // 计算结果
  const handleCalculate = useCallback(async () => {
    if (!expression || expression === '0') return;

    try {
      if (!isValidExpression(expression)) {
        setError('无效的表达式');
        return;
      }

      const result = evaluateExpression(expression);

      if (!isFinite(result)) {
        setError('计算结果无效');
        return;
      }

      const resultStr = formatResult(result);
      setDisplay(resultStr);
      setIsResult(true);
      setError('');
      setIsEditing(false);
      setCursorPosition(0);

      const record: CalculatorRecord = {
        id: Date.now().toString(),
        expression,
        result: resultStr,
        calculatedAt: new Date(),
      };

      await addHistoryRecord(record);
    } catch (error) {
      setError('计算错误');
      console.error('计算错误:', error);
    }
  }, [
    expression,
    setDisplay,
    setIsResult,
    setError,
    setIsEditing,
    setCursorPosition,
    addHistoryRecord,
  ]);

  // 处理输入框变化
  const handleExpressionChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setExpression(newValue);
      setDisplay(newValue || '0');
      setError('');
      setIsResult(false);
    },
    [setExpression, setDisplay, setError, setIsResult]
  );

  // 从历史记录恢复
  const handleRestoreFromHistory = useCallback(
    (record: CalculatorRecord) => {
      setExpression(record.expression);
      setDisplay(record.expression);
      setIsResult(false);
      setError('');
      setCursorPosition(record.expression.length);
      setIsEditing(false);
    },
    [setExpression, setDisplay, setIsResult, setError, setCursorPosition, setIsEditing]
  );

  return {
    handleClear,
    handleBackspace,
    handleInput,
    handleCalculate,
    handleExpressionChange,
    handleRestoreFromHistory,
  };
}
