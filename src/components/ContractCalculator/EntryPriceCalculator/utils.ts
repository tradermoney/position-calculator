// 验证数字输入 - 允许用户输入过程中的中间状态
export const validateNumberInput = (value: string): number => {
  // 允许空字符串、单独的小数点、或者以小数点开头的数字
  if (value === '' || value === '.' || value === '0.') return 0;

  // 验证输入格式：只允许数字和一个小数点
  const numberRegex = /^\d*\.?\d*$/;
  if (!numberRegex.test(value)) return 0;

  const num = parseFloat(value);
  return isNaN(num) ? 0 : Math.max(0, num); // 确保非负数
};

// 格式化数字显示 - 保持用户输入的原始格式
export const formatInputValue = (value: number): string => {
  return value === 0 ? '' : value.toString();
};

// 计算相对于当前价格的波动率
export const calculateVolatilityFromCurrent = (
  currentPrice: number,
  positionPrice: number
): string => {
  if (!currentPrice || currentPrice <= 0 || positionPrice <= 0) {
    return '-';
  }
  const volatility = ((positionPrice - currentPrice) / currentPrice) * 100;
  return `${volatility >= 0 ? '+' : ''}${volatility.toFixed(2)}%`;
};

// 计算相对于上一个仓位的波动率
export const calculateVolatilityFromPrevious = (
  positions: Array<{ price: number }>,
  currentIndex: number
): string => {
  if (currentIndex === 0) {
    return '-'; // 第一个仓位没有上一个仓位
  }
  const currentPosition = positions[currentIndex];
  const previousPosition = positions[currentIndex - 1];

  if (
    !currentPosition.price ||
    currentPosition.price <= 0 ||
    !previousPosition.price ||
    previousPosition.price <= 0
  ) {
    return '-';
  }

  const volatility =
    ((currentPosition.price - previousPosition.price) / previousPosition.price) * 100;
  return `${volatility >= 0 ? '+' : ''}${volatility.toFixed(2)}%`;
};
