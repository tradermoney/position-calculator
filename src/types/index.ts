// 仓位方向枚举
export enum PositionSide {
  LONG = 'long',   // 多头
  SHORT = 'short'  // 空头
}

// 加仓策略枚举
export enum PyramidStrategy {
  EQUAL_RATIO = 'equal_ratio',  // 等比加仓
  DOUBLE = 'double'             // 加倍加仓
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
  createdAt: Date;          // 创建时间
  updatedAt: Date;          // 更新时间
}

// 补仓参数接口
export interface AddPositionParams {
  positionId: string;       // 原仓位ID
  addPrice: number;         // 补仓价格
  addQuantity: number;      // 补仓数量
  addMargin: number;        // 补仓保证金
}

// 金字塔加仓参数接口
export interface PyramidOrderParams {
  symbol: string;           // 币种符号
  side: PositionSide;       // 仓位方向
  leverage: number;         // 杠杆倍数
  initialPrice: number;     // 初始价格
  initialQuantity: number;  // 初始数量
  initialMargin: number;    // 初始保证金
  addTimes: number;         // 加仓次数
  strategy: PyramidStrategy; // 加仓策略
  priceStep: number;        // 价格步长（百分比）
}

// 计算结果接口
export interface CalculationResult {
  averagePrice: number;     // 平均成本价
  totalQuantity: number;    // 总持有量
  totalMargin: number;      // 总保证金
  liquidationPrice: number; // 爆仓价格
  unrealizedPnl: number;    // 未实现盈亏
  roe: number;              // 收益率
}

// 补仓计算结果接口
export interface AddPositionResult extends CalculationResult {
  originalPosition: Position;
  addParams: AddPositionParams;
  newPosition: Position;
}

// 金字塔加仓单步结果接口
export interface PyramidStep {
  step: number;             // 第几步
  price: number;            // 加仓价格
  quantity: number;         // 加仓数量
  margin: number;           // 加仓保证金
  cumulativeQuantity: number; // 累计数量
  cumulativeMargin: number;   // 累计保证金
  averagePrice: number;     // 平均价格
  liquidationPrice: number; // 爆仓价格
}

// 金字塔加仓计算结果接口
export interface PyramidOrderResult {
  params: PyramidOrderParams;
  steps: PyramidStep[];
  finalResult: CalculationResult;
}

// 应用状态接口
export interface AppState {
  positions: Position[];
  selectedPosition: Position | null;
  theme: 'light' | 'dark';
}

// 表单验证错误接口
export interface ValidationError {
  field: string;
  message: string;
}

// API响应接口
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: ValidationError[];
}
