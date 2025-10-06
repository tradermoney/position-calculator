import { useState, useRef } from 'react';

export function useCalculatorState() {
  const [display, setDisplay] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isResult, setIsResult] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  return {
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
  };
}
