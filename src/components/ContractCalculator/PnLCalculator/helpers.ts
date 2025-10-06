import { PositionType, Position } from './types';

export const NUMBER_REGEX = /^\d*\.?\d*$/;

export const createEmptyPosition = (id: number, type: PositionType = PositionType.OPEN): Position => ({
  id,
  type,
  price: 0,
  quantity: 0,
  quantityUsdt: 0,
  marginUsdt: 0,
  enabled: true,
});

export const generateId = () => Date.now() + Math.random();

export const parseNumericInput = (value: string): number => {
  if (value === '' || value === '.') return 0;
  const num = parseFloat(value);
  return Number.isFinite(num) ? num : 0;
};
