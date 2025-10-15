/**
 * 币安API客户端基础类
 * 提供HTTP请求的基础功能和配置管理
 */

import type { BinanceClientConfig, BinanceAPIError } from '../../types/binance';

/**
 * 币安API端点配置（仅期货）
 */
export const BINANCE_ENDPOINTS = {
  /** 合约API (USDT本位) */
  FUTURES: 'https://fapi.binance.com',
  /** 合约API (币本位) */
  DELIVERY: 'https://dapi.binance.com',
  /** 合约测试网 (USDT本位) */
  FUTURES_TESTNET: 'https://testnet.binancefuture.com',
} as const;

/**
 * 默认配置
 */
const DEFAULT_CONFIG: Required<Omit<BinanceClientConfig, 'apiKey' | 'apiSecret'>> = {
  baseURL: BINANCE_ENDPOINTS.FUTURES,
  timeout: 10000,
  enableLogging: false,
  useTestnet: false,
};

/**
 * 币安API客户端基础类
 */
export class BinanceClient {
  protected config: Required<BinanceClientConfig>;
  
  constructor(config: BinanceClientConfig = {}) {
    this.config = {
      apiKey: config.apiKey || '',
      apiSecret: config.apiSecret || '',
      baseURL: config.baseURL || (config.useTestnet ? BINANCE_ENDPOINTS.FUTURES_TESTNET : DEFAULT_CONFIG.baseURL),
      timeout: config.timeout || DEFAULT_CONFIG.timeout,
      enableLogging: config.enableLogging !== undefined ? config.enableLogging : DEFAULT_CONFIG.enableLogging,
      useTestnet: config.useTestnet !== undefined ? config.useTestnet : DEFAULT_CONFIG.useTestnet,
    };

    this.log('BinanceClient initialized', this.config);
  }

  /**
   * 日志输出
   */
  protected log(message: string, ...args: unknown[]): void {
    if (this.config.enableLogging) {
      console.log(`[BinanceClient] ${message}`, ...args);
    }
  }

  /**
   * 错误日志输出
   */
  protected logError(message: string, ...args: unknown[]): void {
    if (this.config.enableLogging) {
      console.error(`[BinanceClient] ${message}`, ...args);
    }
  }

  /**
   * 构建查询字符串
   */
  protected buildQueryString(params: Record<string, unknown>): string {
    const cleanParams = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
      .join('&');
    
    return cleanParams ? `?${cleanParams}` : '';
  }

  /**
   * 发送GET请求（带重试机制）
   */
  protected async get<T>(endpoint: string, params: Record<string, unknown> = {}): Promise<T> {
    const maxRetries = 3;
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const queryString = this.buildQueryString(params);
        const url = `${this.config.baseURL}${endpoint}${queryString}`;
        
        this.log(`GET ${url} (尝试 ${attempt}/${maxRetries})`);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: this.buildHeaders(),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        return await this.handleResponse<T>(response);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logError(`GET request failed (尝试 ${attempt}/${maxRetries})`, error);
        
        // 如果不是最后一次尝试，等待后重试
        if (attempt < maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // 指数退避
          this.log(`等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
    }
    
    throw this.handleError(lastError || new Error('Unknown error'));
  }

  /**
   * 发送POST请求
   */
  protected async post<T>(endpoint: string, params: Record<string, unknown> = {}): Promise<T> {
    const url = `${this.config.baseURL}${endpoint}`;
    
    this.log(`POST ${url}`, params);
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...this.buildHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      return await this.handleResponse<T>(response);
    } catch (error) {
      this.logError('POST request failed', error);
      throw this.handleError(error);
    }
  }

  /**
   * 构建请求头
   */
  protected buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.config.apiKey) {
      headers['X-MBX-APIKEY'] = this.config.apiKey;
    }

    return headers;
  }

  /**
   * 处理响应
   */
  protected async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');
    
    // 尝试解析响应体
    let data: unknown;
    if (isJson) {
      data = await response.json();
    } else {
      const text = await response.text();
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }

    // 检查HTTP状态码
    if (!response.ok) {
      this.logError(`HTTP ${response.status}: ${response.statusText}`, data);
      
      // 如果是币安API错误格式
      if (this.isBinanceError(data)) {
        throw new Error(`Binance API Error ${data.code}: ${data.msg}`);
      }
      
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // 检查是否是币安错误响应（即使HTTP状态码是200）
    if (this.isBinanceError(data)) {
      this.logError('Binance API Error', data);
      throw new Error(`Binance API Error ${data.code}: ${data.msg}`);
    }

    this.log('Response received', data);
    return data as T;
  }

  /**
   * 判断是否是币安API错误响应
   */
  protected isBinanceError(data: unknown): data is BinanceAPIError {
    return (
      typeof data === 'object' &&
      data !== null &&
      'code' in data &&
      'msg' in data &&
      typeof (data as BinanceAPIError).code === 'number' &&
      typeof (data as BinanceAPIError).msg === 'string'
    );
  }

  /**
   * 处理错误
   */
  protected handleError(error: unknown): Error {
    if (error instanceof Error) {
      // 请求超时
      if (error.name === 'AbortError') {
        return new Error('Request timeout');
      }
      return error;
    }
    
    if (typeof error === 'string') {
      return new Error(error);
    }
    
    return new Error('Unknown error occurred');
  }

  /**
   * 更新配置
   */
  public updateConfig(config: Partial<BinanceClientConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };
    this.log('Config updated', this.config);
  }

  /**
   * 获取当前配置
   */
  public getConfig(): Readonly<BinanceClientConfig> {
    return { ...this.config };
  }
}
