// 基础类型定义

// 仓位方向枚举
export enum PositionSide {
  LONG = 'long',   // 多头
  SHORT = 'short'  // 空头
}

// 仓位状态枚举
export enum PositionStatus {
  ACTIVE = 'active',     // 活跃
  CLOSED = 'closed',     // 已关闭
  LIQUIDATED = 'liquidated', // 已爆仓
  PARTIAL = 'partial'    // 部分平仓
}

// 基础仓位接口
export interface Position {
  id: string;
  symbol: string;           // 币种符号，如 'BTC/USDT'
  side: PositionSide;       // 仓位方向
  leverage: number;         // 杠杆倍数
  entryPrice: number;       // 开仓价格
  quantity: number;         // 持有数量
  margin: number;           // 保证金
  status: PositionStatus;   // 仓位状态
  createdAt: Date;          // 创建时间
  updatedAt: Date;          // 更新时间
}
