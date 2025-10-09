/**
 * 币安API错误处理工具
 */

/**
 * 币安API错误码枚举
 * 参考：https://developers.binance.com/docs/zh-CN/derivatives/error-code
 */
export enum BinanceErrorCode {
  /** 未知错误 */
  UNKNOWN = -1000,
  /** 连接断开 */
  DISCONNECTED = -1001,
  /** 未授权 */
  UNAUTHORIZED = -1002,
  /** 请求过多 */
  TOO_MANY_REQUESTS = -1003,
  /** 服务器忙 */
  SERVER_BUSY = -1004,
  /** 不支持的操作 */
  UNSUPPORTED_OPERATION = -1005,
  /** 接收到无效的消息 */
  INVALID_MESSAGE = -1006,
  /** 未知的订单组合类型 */
  UNKNOWN_ORDER_COMPOSITION = -1007,
  /** 请求超时 */
  TIMEOUT = -1008,
  /** 未知的订单 */
  UNKNOWN_ORDER = -1009,
  /** API密钥格式无效 */
  INVALID_API_KEY = -2014,
  /** 无效的API密钥、IP或操作权限 */
  INVALID_API_KEY_IP_OR_PERMISSIONS = -2015,
  /** 订单会立即触发自成交 */
  ORDER_WOULD_TRIGGER_IMMEDIATELY = -2010,
  /** 账户余额不足 */
  INSUFFICIENT_BALANCE = -2019,
  /** 参数错误 */
  BAD_PARAMETER = -1100,
  /** 参数发送了太多 */
  TOO_MANY_PARAMETERS = -1101,
  /** 强制要求参数没有发送 */
  MANDATORY_PARAM_EMPTY_OR_MALFORMED = -1102,
  /** 未知的参数 */
  UNKNOWN_PARAM = -1103,
  /** 不支持的参数组合 */
  UNSUPPORTED_PARAM_COMBINATION = -1104,
  /** 参数格式错误 */
  INVALID_PARAM = -1105,
  /** 参数值太大 */
  PARAM_TOO_LARGE = -1106,
  /** 参数值太小 */
  PARAM_TOO_SMALL = -1107,
  /** 参数值不正确 */
  INVALID_PARAM_VALUE = -1111,
  /** 时间戳不在接收窗口内 */
  TIMESTAMP_OUT_OF_RECV_WINDOW = -1021,
  /** 签名无效 */
  INVALID_SIGNATURE = -1022,
  /** 开始时间大于结束时间 */
  START_TIME_GREATER_THAN_END_TIME = -1023,
}

/**
 * 币安API错误类
 */
export class BinanceError extends Error {
  public readonly code: number;
  public readonly httpStatus?: number;
  public readonly timestamp: Date;

  constructor(message: string, code: number = BinanceErrorCode.UNKNOWN, httpStatus?: number) {
    super(message);
    this.name = 'BinanceError';
    this.code = code;
    this.httpStatus = httpStatus;
    this.timestamp = new Date();

    // 维护原型链
    Object.setPrototypeOf(this, BinanceError.prototype);
  }

  /**
   * 判断是否是速率限制错误
   */
  isRateLimitError(): boolean {
    return this.code === BinanceErrorCode.TOO_MANY_REQUESTS || this.httpStatus === 429;
  }

  /**
   * 判断是否是认证错误
   */
  isAuthenticationError(): boolean {
    return (
      this.code === BinanceErrorCode.UNAUTHORIZED ||
      this.code === BinanceErrorCode.INVALID_API_KEY ||
      this.code === BinanceErrorCode.INVALID_API_KEY_IP_OR_PERMISSIONS ||
      this.code === BinanceErrorCode.INVALID_SIGNATURE
    );
  }

  /**
   * 判断是否是参数错误
   */
  isParameterError(): boolean {
    return (
      this.code === BinanceErrorCode.BAD_PARAMETER ||
      this.code === BinanceErrorCode.TOO_MANY_PARAMETERS ||
      this.code === BinanceErrorCode.MANDATORY_PARAM_EMPTY_OR_MALFORMED ||
      this.code === BinanceErrorCode.UNKNOWN_PARAM ||
      this.code === BinanceErrorCode.UNSUPPORTED_PARAM_COMBINATION ||
      this.code === BinanceErrorCode.INVALID_PARAM ||
      this.code === BinanceErrorCode.INVALID_PARAM_VALUE
    );
  }

  /**
   * 判断是否是时间戳错误
   */
  isTimestampError(): boolean {
    return this.code === BinanceErrorCode.TIMESTAMP_OUT_OF_RECV_WINDOW;
  }

  /**
   * 获取错误的友好描述
   */
  getFriendlyMessage(): string {
    const errorMessages: Record<number, string> = {
      [BinanceErrorCode.UNKNOWN]: '未知错误，请稍后重试',
      [BinanceErrorCode.DISCONNECTED]: '网络连接断开，请检查网络',
      [BinanceErrorCode.UNAUTHORIZED]: '未授权访问，请检查API密钥',
      [BinanceErrorCode.TOO_MANY_REQUESTS]: '请求过于频繁，请稍后重试',
      [BinanceErrorCode.SERVER_BUSY]: '服务器繁忙，请稍后重试',
      [BinanceErrorCode.TIMEOUT]: '请求超时，请重试',
      [BinanceErrorCode.INVALID_API_KEY]: 'API密钥格式无效',
      [BinanceErrorCode.INVALID_API_KEY_IP_OR_PERMISSIONS]: 'API密钥无效或IP地址未授权',
      [BinanceErrorCode.INSUFFICIENT_BALANCE]: '账户余额不足',
      [BinanceErrorCode.BAD_PARAMETER]: '请求参数错误',
      [BinanceErrorCode.MANDATORY_PARAM_EMPTY_OR_MALFORMED]: '必需参数缺失或格式错误',
      [BinanceErrorCode.TIMESTAMP_OUT_OF_RECV_WINDOW]: '时间戳不在有效范围内',
      [BinanceErrorCode.INVALID_SIGNATURE]: '签名验证失败',
      [BinanceErrorCode.START_TIME_GREATER_THAN_END_TIME]: '开始时间不能大于结束时间',
    };

    return errorMessages[this.code] || this.message;
  }

  /**
   * 转换为JSON格式
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      httpStatus: this.httpStatus,
      timestamp: this.timestamp,
      friendlyMessage: this.getFriendlyMessage(),
    };
  }
}

/**
 * 网络错误类
 */
export class NetworkError extends Error {
  public readonly timestamp: Date;

  constructor(message: string = '网络连接失败') {
    super(message);
    this.name = 'NetworkError';
    this.timestamp = new Date();
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * 超时错误类
 */
export class TimeoutError extends Error {
  public readonly timeout: number;
  public readonly timestamp: Date;

  constructor(timeout: number) {
    super(`请求超时（${timeout}ms）`);
    this.name = 'TimeoutError';
    this.timeout = timeout;
    this.timestamp = new Date();
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * 解析币安API错误
 */
export function parseBinanceError(error: unknown): BinanceError {
  if (error instanceof BinanceError) {
    return error;
  }

  if (error instanceof Error) {
    // 检查是否包含币安错误信息
    const match = error.message.match(/Binance API Error (\d+): (.+)/);
    if (match) {
      const code = parseInt(match[1], 10);
      const message = match[2];
      return new BinanceError(message, code);
    }

    // 网络错误
    if (error.name === 'AbortError' || error.message.includes('timeout')) {
      return new BinanceError('请求超时', BinanceErrorCode.TIMEOUT);
    }

    if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
      return new BinanceError('网络连接失败', BinanceErrorCode.DISCONNECTED);
    }

    return new BinanceError(error.message);
  }

  if (typeof error === 'string') {
    return new BinanceError(error);
  }

  return new BinanceError('未知错误');
}

/**
 * 错误重试策略
 */
export class RetryStrategy {
  private readonly maxRetries: number;
  private readonly baseDelay: number;
  private readonly maxDelay: number;

  constructor(
    maxRetries: number = 3,
    baseDelay: number = 1000,
    maxDelay: number = 10000
  ) {
    this.maxRetries = maxRetries;
    this.baseDelay = baseDelay;
    this.maxDelay = maxDelay;
  }

  /**
   * 判断错误是否可以重试
   */
  shouldRetry(error: BinanceError, attemptNumber: number): boolean {
    if (attemptNumber >= this.maxRetries) {
      return false;
    }

    // 速率限制错误可以重试
    if (error.isRateLimitError()) {
      return true;
    }

    // 服务器错误可以重试
    if (error.code === BinanceErrorCode.SERVER_BUSY || error.code === BinanceErrorCode.DISCONNECTED) {
      return true;
    }

    // 超时错误可以重试
    if (error.isTimestampError() || error.code === BinanceErrorCode.TIMEOUT) {
      return true;
    }

    return false;
  }

  /**
   * 计算重试延迟时间（指数退避）
   */
  calculateDelay(attemptNumber: number): number {
    const delay = this.baseDelay * Math.pow(2, attemptNumber - 1);
    // 添加随机抖动，避免同时重试
    const jitter = Math.random() * 1000;
    return Math.min(delay + jitter, this.maxDelay);
  }

  /**
   * 执行带重试的操作
   */
  async execute<T>(
    operation: () => Promise<T>,
    onRetry?: (error: BinanceError, attemptNumber: number, delay: number) => void
  ): Promise<T> {
    let lastError: BinanceError;
    
    for (let attempt = 1; attempt <= this.maxRetries + 1; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = parseBinanceError(error);

        if (!this.shouldRetry(lastError, attempt)) {
          throw lastError;
        }

        const delay = this.calculateDelay(attempt);
        
        if (onRetry) {
          onRetry(lastError, attempt, delay);
        }

        await this.sleep(delay);
      }
    }

    throw lastError!;
  }

  /**
   * 等待指定时间
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

