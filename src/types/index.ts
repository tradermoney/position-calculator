// 仓位方向枚举
export enum PositionSide {
  LONG = 'long',   // 多头
  SHORT = 'short'  // 空头
}

// 加仓策略枚举
export enum PyramidStrategy {
  EQUAL_RATIO = 'equal_ratio',  // 等比加仓
  DOUBLE = 'double',            // 加倍加仓
  FIBONACCI = 'fibonacci',      // 斐波那契加仓
  CUSTOM = 'custom'             // 自定义加仓
}

// 订单类型枚举
export enum OrderType {
  MARKET = 'market',     // 市价单
  LIMIT = 'limit',       // 限价单
  STOP = 'stop',         // 止损单
  STOP_LIMIT = 'stop_limit' // 止损限价单
}

// 仓位状态枚举
export enum PositionStatus {
  ACTIVE = 'active',     // 活跃
  CLOSED = 'closed',     // 已关闭
  LIQUIDATED = 'liquidated', // 已爆仓
  PARTIAL = 'partial'    // 部分平仓
}

// 交易所枚举
export enum Exchange {
  BINANCE = 'binance',
  OKEX = 'okex',
  HUOBI = 'huobi',
  BYBIT = 'bybit',
  BITGET = 'bitget',
  OTHER = 'other'
}

// 风险等级枚举
export enum RiskLevel {
  LOW = 'low',       // 低风险
  MEDIUM = 'medium', // 中风险
  HIGH = 'high',     // 高风险
  EXTREME = 'extreme' // 极高风险
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
  exchange?: Exchange;      // 交易所
  riskLevel?: RiskLevel;    // 风险等级
  stopLoss?: number;        // 止损价格
  takeProfit?: number;      // 止盈价格
  notes?: string;           // 备注
  tags?: string[];          // 标签
  createdAt: Date;          // 创建时间
  updatedAt: Date;          // 更新时间
  closedAt?: Date;          // 关闭时间
}

// 补仓参数接口
export interface AddPositionParams {
  positionId: string;       // 原仓位ID
  addPrice: number;         // 补仓价格
  addQuantity: number;      // 补仓数量
  addMargin: number;        // 补仓保证金
  orderType?: OrderType;    // 订单类型
  notes?: string;           // 补仓备注
}

// 平仓参数接口
export interface ClosePositionParams {
  positionId: string;       // 仓位ID
  closePrice: number;       // 平仓价格
  closeQuantity: number;    // 平仓数量
  orderType?: OrderType;    // 订单类型
  reason?: string;          // 平仓原因
  notes?: string;           // 平仓备注
}

// 止损止盈设置接口
export interface StopLossTakeProfitParams {
  positionId: string;       // 仓位ID
  stopLoss?: number;        // 止损价格
  takeProfit?: number;      // 止盈价格
  trailingStop?: number;    // 追踪止损百分比
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
  maxTotalMargin?: number;  // 最大总保证金限制
  minPriceGap?: number;     // 最小价格间隔
  customRatios?: number[];  // 自定义加仓比例（用于CUSTOM策略）
  stopLoss?: number;        // 整体止损价格
  takeProfit?: number;      // 整体止盈价格
  notes?: string;           // 备注
}

// 计算结果接口
export interface CalculationResult {
  averagePrice: number;     // 平均成本价
  totalQuantity: number;    // 总持有量
  totalMargin: number;      // 总保证金
  liquidationPrice: number; // 爆仓价格
  unrealizedPnl: number;    // 未实现盈亏
  roe: number;              // 收益率
  totalValue: number;       // 总价值
  marginRatio: number;      // 保证金率
  riskLevel: RiskLevel;     // 风险等级
  distanceToLiquidation: number; // 距离爆仓的价格距离（百分比）
}

// 风险分析结果接口
export interface RiskAnalysisResult {
  riskLevel: RiskLevel;     // 风险等级
  riskScore: number;        // 风险评分 (0-100)
  marginRatio: number;      // 保证金率
  leverageRisk: number;     // 杠杆风险评分
  concentrationRisk: number; // 集中度风险评分
  liquidationDistance: number; // 爆仓距离百分比
  recommendations: string[]; // 风险建议
}

// 盈亏分析结果接口
export interface PnlAnalysisResult {
  totalPnl: number;         // 总盈亏
  realizedPnl: number;      // 已实现盈亏
  unrealizedPnl: number;    // 未实现盈亏
  totalRoe: number;         // 总收益率
  winRate: number;          // 胜率
  avgWin: number;           // 平均盈利
  avgLoss: number;          // 平均亏损
  profitFactor: number;     // 盈亏比
  maxDrawdown: number;      // 最大回撤
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
  settings: AppSettings;
  filters: PositionFilters;
  sortConfig: SortConfig;
}

// 应用设置接口
export interface AppSettings {
  defaultLeverage: number;      // 默认杠杆
  defaultPriceStep: number;     // 默认价格步长
  decimalPlaces: number;        // 小数位数
  autoSave: boolean;            // 自动保存
  riskWarnings: boolean;        // 风险警告
  soundNotifications: boolean;  // 声音通知
  defaultExchange: Exchange;    // 默认交易所
  currency: string;             // 显示货币
  language: string;             // 语言设置
}

// 仓位过滤器接口
export interface PositionFilters {
  side?: PositionSide;          // 仓位方向过滤
  status?: PositionStatus;      // 状态过滤
  exchange?: Exchange;          // 交易所过滤
  riskLevel?: RiskLevel;        // 风险等级过滤
  symbol?: string;              // 币种过滤
  tags?: string[];              // 标签过滤
  dateRange?: {                 // 日期范围过滤
    start: Date;
    end: Date;
  };
}

// 排序配置接口
export interface SortConfig {
  field: keyof Position;        // 排序字段
  direction: 'asc' | 'desc';    // 排序方向
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

// 导入导出数据接口
export interface ExportData {
  positions: Position[];
  settings: AppSettings;
  exportedAt: Date;
  version: string;
}

// 统计数据接口
export interface PositionStatistics {
  totalPositions: number;       // 总仓位数
  activePositions: number;      // 活跃仓位数
  longPositions: number;        // 多头仓位数
  shortPositions: number;       // 空头仓位数
  totalMargin: number;          // 总保证金
  totalValue: number;           // 总价值
  totalPnl: number;             // 总盈亏
  avgRoe: number;               // 平均收益率
  riskDistribution: Record<RiskLevel, number>; // 风险分布
  exchangeDistribution: Record<Exchange, number>; // 交易所分布
}

// 通知接口
export interface Notification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  positionId?: string;          // 关联的仓位ID
}

// 历史记录接口
export interface HistoryRecord {
  id: string;
  type: 'create' | 'update' | 'close' | 'add' | 'liquidate';
  positionId: string;
  description: string;
  data: any;                    // 操作相关数据
  timestamp: Date;
}

// 常量定义
export const CONSTANTS = {
  // 默认值
  DEFAULT_LEVERAGE: 10,
  DEFAULT_PRICE_STEP: 5,
  DEFAULT_DECIMAL_PLACES: 4,
  DEFAULT_MAINTENANCE_MARGIN_RATE: 0.005, // 0.5%

  // 限制值
  MIN_LEVERAGE: 1,
  MAX_LEVERAGE: 125,
  MIN_QUANTITY: 0.0001,
  MAX_QUANTITY: 1000000,
  MIN_PRICE: 0.0001,
  MAX_PRICE: 1000000,

  // 风险阈值
  RISK_THRESHOLDS: {
    LOW: 25,      // 风险评分 < 25 为低风险
    MEDIUM: 50,   // 风险评分 < 50 为中风险
    HIGH: 75,     // 风险评分 < 75 为高风险
    EXTREME: 100  // 风险评分 >= 75 为极高风险
  },

  // 颜色主题
  COLORS: {
    PROFIT: '#00c853',
    LOSS: '#ff1744',
    NEUTRAL: '#757575',
    LONG: '#4caf50',
    SHORT: '#f44336',
    WARNING: '#ff9800',
    INFO: '#2196f3'
  }
} as const;

// 工具类型
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
