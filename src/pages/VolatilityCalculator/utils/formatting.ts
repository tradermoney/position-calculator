// 格式化时间
export const formatTime = (date: Date): string => {
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// 格式化数字
export const formatNumber = (num: number, decimals: number = 4): string => {
  return num.toFixed(decimals);
};
