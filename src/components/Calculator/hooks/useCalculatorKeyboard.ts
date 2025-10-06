import { useCallback } from 'react';

interface UseCalculatorKeyboardProps {
  isEditing: boolean;
  cursorPosition: number;
  expression: string;
  setExpression: (value: string) => void;
  setDisplay: (value: string) => void;
  setCursorPosition: (value: number) => void;
  setCursorPositionInInput: (position: number) => void;
  handleBackspace: () => void;
  handleCalculate: () => Promise<void>;
  exitEditMode: () => void;
  handleInput: (value: string) => void;
}

export function useCalculatorKeyboard({
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
}: UseCalculatorKeyboardProps) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!isEditing) return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          if (cursorPosition > 0) {
            const newPosition = cursorPosition - 1;
            setCursorPosition(newPosition);
            setCursorPositionInInput(newPosition);
          }
          break;
        case 'ArrowRight':
          event.preventDefault();
          if (cursorPosition < expression.length) {
            const newPosition = cursorPosition + 1;
            setCursorPosition(newPosition);
            setCursorPositionInInput(newPosition);
          }
          break;
        case 'Home':
          event.preventDefault();
          setCursorPosition(0);
          setCursorPositionInInput(0);
          break;
        case 'End': {
          event.preventDefault();
          const endPosition = expression.length;
          setCursorPosition(endPosition);
          setCursorPositionInInput(endPosition);
          break;
        }
        case 'Delete':
          event.preventDefault();
          if (cursorPosition < expression.length) {
            const newExpression =
              expression.slice(0, cursorPosition) + expression.slice(cursorPosition + 1);
            setExpression(newExpression);
            setDisplay(newExpression || '0');
          }
          break;
        case 'Backspace':
          event.preventDefault();
          handleBackspace();
          break;
        case 'Enter':
        case '=':
          event.preventDefault();
          handleCalculate();
          break;
        case 'Escape':
          event.preventDefault();
          exitEditMode();
          break;
        default:
          if (/[0-9+\-*/.()]/.test(event.key)) {
            event.preventDefault();
            handleInput(event.key === '*' ? '*' : event.key);
          }
          break;
      }
    },
    [
      isEditing,
      cursorPosition,
      expression,
      setCursorPosition,
      setCursorPositionInInput,
      setExpression,
      setDisplay,
      handleBackspace,
      handleCalculate,
      exitEditMode,
      handleInput,
    ]
  );

  return { handleKeyDown };
}
