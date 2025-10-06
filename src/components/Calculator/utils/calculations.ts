// 验证表达式是否有效
export const isValidExpression = (expr: string): boolean => {
  // 检查括号是否匹配
  let parenthesesCount = 0;
  for (const char of expr) {
    if (char === '(') parenthesesCount++;
    if (char === ')') parenthesesCount--;
    if (parenthesesCount < 0) return false;
  }
  if (parenthesesCount !== 0) return false;

  // 检查是否包含无效字符
  if (!/^[0-9+\-*/().\s]+$/.test(expr)) return false;

  // 检查是否以操作符结尾
  if (/[+\-*/]$/.test(expr.trim())) return false;

  return true;
};

// 安全计算表达式
export const evaluateExpression = (expr: string): number => {
  // 移除空格
  const cleanExpr = expr.replace(/\s/g, '');

  // 使用Function构造器进行安全计算
  try {
    const result = Function(`"use strict"; return (${cleanExpr})`)();
    return Number(result);
  } catch {
    throw new Error('计算表达式失败');
  }
};

// 格式化结果
export const formatResult = (result: number): string => {
  if (Number.isInteger(result)) {
    return result.toString();
  }

  // 保留最多10位小数，去除尾随零
  return parseFloat(result.toFixed(10)).toString();
};

// 格式化时间
export const formatTime = (date: Date): string => {
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
