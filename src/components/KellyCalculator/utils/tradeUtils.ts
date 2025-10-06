import { TradeRecord } from '../../../utils/kellyCalculations';

// 生成唯一ID
export const generateId = () => Date.now() + Math.random();

// 添加交易记录
export const addTrade = (trades: TradeRecord[]): TradeRecord[] => {
  const newTrade: TradeRecord = {
    id: generateId(),
    profit: 0,
    enabled: true,
  };
  return [...trades, newTrade];
};

// 删除交易记录
export const removeTrade = (trades: TradeRecord[], id: number): TradeRecord[] => {
  if (trades.length > 1) {
    return trades.filter(trade => trade.id !== id);
  }
  return trades;
};

// 更新交易记录
export const updateTrade = (
  trades: TradeRecord[],
  id: number,
  field: keyof TradeRecord,
  value: string | number | boolean
): TradeRecord[] => {
  return trades.map(trade =>
    trade.id === id ? { ...trade, [field]: value } : trade
  );
};
