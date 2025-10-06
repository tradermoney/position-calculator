// 验证正向计算输入参数
export const validateForwardInputs = (price1: string, price2: string): string[] => {
  const errors: string[] = [];

  const p1 = parseFloat(price1);
  const p2 = parseFloat(price2);

  if (!price1 || isNaN(p1) || p1 <= 0) {
    errors.push('起始价格必须是大于0的有效数字');
  }

  if (!price2 || isNaN(p2) || p2 <= 0) {
    errors.push('目标价格必须是大于0的有效数字');
  }

  if (p1 === p2 && !isNaN(p1) && !isNaN(p2)) {
    errors.push('两个价格不能相同');
  }

  return errors;
};

// 验证反向计算输入参数
export const validateReverseInputs = (price1: string, volatilityInput: string): string[] => {
  const errors: string[] = [];

  const p1 = parseFloat(price1);
  const vol = parseFloat(volatilityInput);

  if (!price1 || isNaN(p1) || p1 <= 0) {
    errors.push('起始价格必须是大于0的有效数字');
  }

  if (!volatilityInput || isNaN(vol) || vol <= 0) {
    errors.push('波动率必须是大于0的有效数字');
  }

  if (vol >= 100) {
    errors.push('波动率不能大于等于100%');
  }

  return errors;
};
