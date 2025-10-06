import { useRef, useCallback } from 'react';

/**
 * 用于管理输入框焦点的 Hook
 */
export function useFocusManager() {
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());
  const activeInputKeyRef = useRef<string | null>(null);

  /**
   * 注册输入框引用
   */
  const registerInputRef = useCallback((key: string) => (element: HTMLInputElement | null) => {
    const refs = inputRefs.current;
    if (element) {
      refs.set(key, element);
    } else {
      refs.delete(key);
    }
  }, []);

  /**
   * 输入框获得焦点
   */
  const handleInputFocus = useCallback((key: string) => {
    activeInputKeyRef.current = key;
  }, []);

  /**
   * 输入框失去焦点
   */
  const handleInputBlur = useCallback((key: string) => {
    setTimeout(() => {
      if (typeof document === 'undefined') {
        return;
      }
      const activeElement = document.activeElement as HTMLElement | null;
      const entry = Array.from(inputRefs.current.entries()).find(([, element]) => element === activeElement);

      if (!activeElement || activeElement === document.body) {
        activeInputKeyRef.current = key;
      } else if (entry) {
        activeInputKeyRef.current = entry[0];
      } else {
        activeInputKeyRef.current = null;
      }
    }, 0);
  }, []);

  /**
   * 维护焦点状态
   */
  const maintainFocus = useCallback(() => {
    if (!activeInputKeyRef.current || typeof document === 'undefined') {
      return;
    }
    const target = inputRefs.current.get(activeInputKeyRef.current);
    if (!target) {
      return;
    }

    const activeElement = document.activeElement;
    if (activeElement === target) {
      return;
    }

    if (!activeElement || activeElement === document.body) {
      target.focus();
      const cursorPosition = target.value.length;
      target.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, []);

  return {
    inputRefs,
    activeInputKey: activeInputKeyRef.current,
    registerInputRef,
    handleInputFocus,
    handleInputBlur,
    maintainFocus,
  };
}
