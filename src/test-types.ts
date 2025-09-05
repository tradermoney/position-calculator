import { Position, PositionSide } from './types';

console.log('Types imported successfully');

const testPosition: Position = {
  id: '1',
  symbol: 'BTC/USDT',
  side: PositionSide.LONG,
  leverage: 10,
  entryPrice: 50000,
  quantity: 1,
  margin: 5000,
  createdAt: new Date(),
  updatedAt: new Date(),
};

console.log('Test position:', testPosition);
