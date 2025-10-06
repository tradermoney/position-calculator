import { ValidationRule } from './types';

export const validationRules = {
  required: (message?: string): ValidationRule => ({
    test: (value) => value !== null && value !== undefined && value.toString().trim() !== '',
    message: message || '此字段为必填项',
  }),

  minLength: (min: number, message?: string): ValidationRule => ({
    test: (value) => value.toString().length >= min,
    message: message || `最少需要${min}个字符`,
  }),

  maxLength: (max: number, message?: string): ValidationRule => ({
    test: (value) => value.toString().length <= max,
    message: message || `最多允许${max}个字符`,
  }),

  email: (message?: string): ValidationRule => ({
    test: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toString()),
    message: message || '请输入有效的邮箱地址',
  }),

  number: (message?: string): ValidationRule => ({
    test: (value) => !isNaN(Number(value)) && isFinite(Number(value)),
    message: message || '请输入有效的数字',
  }),

  positiveNumber: (message?: string): ValidationRule => ({
    test: (value) => !isNaN(Number(value)) && Number(value) > 0,
    message: message || '请输入大于0的数字',
  }),

  range: (min: number, max: number, message?: string): ValidationRule => ({
    test: (value) => {
      const num = Number(value);
      return !isNaN(num) && num >= min && num <= max;
    },
    message: message || `请输入${min}到${max}之间的数字`,
  }),
};
