import { useCalculatorState } from './useCalculatorState';
import { useCalculatorHistory } from './useCalculatorHistory';
import { useCalculatorEditing } from './useCalculatorEditing';
import { useCalculatorOperations } from './useCalculatorOperations';
import { useCalculatorKeyboard } from './useCalculatorKeyboard';

export function useCalculator() {
  // 基础状态
  const {
    display,
    setDisplay,
    expression,
    setExpression,
    error,
    setError,
    isResult,
    setIsResult,
    cursorPosition,
    setCursorPosition,
    isEditing,
    setIsEditing,
    inputRef,
  } = useCalculatorState();

  // 历史记录管理
  const { history, addHistoryRecord, handleDeleteRecord, handleClearHistory } = useCalculatorHistory();

  // 编辑模式管理
  const { setCursorPositionInInput, enterEditMode, exitEditMode } = useCalculatorEditing({
    expression,
    inputRef,
    setIsEditing,
    setCursorPosition,
  });

  // 计算器操作
  const {
    handleClear,
    handleBackspace,
    handleInput,
    handleCalculate,
    handleExpressionChange,
    handleRestoreFromHistory,
  } = useCalculatorOperations({
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
  });

  // 键盘事件处理
  const { handleKeyDown } = useCalculatorKeyboard({
    isEditing,
    cursorPosition,
    expression,
    setExpression,
    setDisplay,
    setCursorPosition,
    setCursorPositionInInput,
    handleBackspace,
    handleCalculate,
    exitEditMode,
    handleInput,
  });

  return {
    display,
    expression,
    history,
    error,
    isResult,
    cursorPosition,
    isEditing,
    inputRef,
    handleClear,
    handleBackspace,
    handleInput,
    handleCalculate,
    handleKeyDown,
    handleExpressionChange,
    enterEditMode,
    exitEditMode,
    setCursorPosition,
    handleRestoreFromHistory,
    handleDeleteRecord,
    handleClearHistory,
  };
}
