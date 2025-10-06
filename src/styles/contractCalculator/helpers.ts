/**
 * 按钮与结果的辅助类名生成方法
 */
export const getPositionButtonClass = (side: 'long' | 'short', selected: boolean) =>
  `${side} ${selected ? 'selected' : ''}`;

export const getResultValueClass = (value: number) => {
  if (value > 0) return 'profit';
  if (value < 0) return 'loss';
  return 'neutral';
};
