import { useCallback, RefObject } from 'react';

interface UseCalculatorEditingProps {
  expression: string;
  inputRef: RefObject<HTMLInputElement | null>;
  setIsEditing: (value: boolean) => void;
  setCursorPosition: (value: number) => void;
}

export function useCalculatorEditing({
  expression,
  inputRef,
  setIsEditing,
  setCursorPosition,
}: UseCalculatorEditingProps) {
  // 设置光标位置
  const setCursorPositionInInput = useCallback(
    (position: number) => {
      if (inputRef.current && typeof inputRef.current.setSelectionRange === 'function') {
        try {
          inputRef.current.setSelectionRange(position, position);
          setCursorPosition(position);
          console.log('setCursorPositionInInput - position set to:', position);
        } catch (error) {
          console.warn('设置光标位置失败:', error);
          setCursorPosition(position);
        }
      }
    },
    [inputRef, setCursorPosition]
  );

  // 进入编辑模式
  const enterEditMode = useCallback(() => {
    setIsEditing(true);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        setCursorPositionInInput(expression.length);
      }
    }, 0);
  }, [expression.length, inputRef, setIsEditing, setCursorPositionInInput]);

  // 退出编辑模式
  const exitEditMode = useCallback(() => {
    setIsEditing(false);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  }, [inputRef, setIsEditing]);

  return {
    setCursorPositionInInput,
    enterEditMode,
    exitEditMode,
  };
}
