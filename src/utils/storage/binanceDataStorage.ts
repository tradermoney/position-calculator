/**
 * 币安数据输入状态存储服务
 * 使用IndexedDB存储用户的币安数据输入状态
 */

import { IndexedDBUtil } from './indexedDBUtil';
import type { BinanceDataInputState } from './types';

export class BinanceDataStorageService {
  private static readonly STORAGE_KEY = 'binanceDataInputs';
  private static readonly DEFAULT_STATE: BinanceDataInputState = {
    selectedSymbol: 'BTCUSDT',
    selectedInterval: '1h',
    selectedPeriods: 100,
    lastUpdated: new Date(),
  };

  /**
   * 保存币安数据输入状态
   * @param state 输入状态
   */
  static async saveInputState(state: Partial<BinanceDataInputState>): Promise<void> {
    try {
      const currentState = await this.getInputState();
      const newState: BinanceDataInputState = {
        ...currentState,
        ...state,
        lastUpdated: new Date(),
      };

      await IndexedDBUtil.save(this.STORAGE_KEY, 'current', newState);
      console.log('币安数据输入状态已保存:', newState);
    } catch (error) {
      console.error('保存币安数据输入状态失败:', error);
      throw error;
    }
  }

  /**
   * 获取币安数据输入状态
   * @returns 输入状态
   */
  static async getInputState(): Promise<BinanceDataInputState> {
    try {
      const state = await IndexedDBUtil.get<BinanceDataInputState>(
        this.STORAGE_KEY,
        'current'
      );

      if (!state) {
        console.log('未找到币安数据输入状态，使用默认状态');
        return { ...this.DEFAULT_STATE };
      }

      return state;
    } catch (error) {
      console.error('获取币安数据输入状态失败:', error);
      return { ...this.DEFAULT_STATE };
    }
  }

  /**
   * 清除币安数据输入状态
   */
  static async clearInputState(): Promise<void> {
    try {
      await IndexedDBUtil.delete(this.STORAGE_KEY, 'current');
      console.log('币安数据输入状态已清除');
    } catch (error) {
      console.error('清除币安数据输入状态失败:', error);
      throw error;
    }
  }

  /**
   * 保存选中的交易对
   * @param symbol 交易对符号
   */
  static async saveSelectedSymbol(symbol: string | null): Promise<void> {
    await this.saveInputState({ selectedSymbol: symbol });
  }

  /**
   * 保存选中的K线周期
   * @param interval K线周期
   */
  static async saveSelectedInterval(interval: string): Promise<void> {
    await this.saveInputState({ selectedInterval: interval });
  }

  /**
   * 保存选中的数据周期数
   * @param periods 周期数
   */
  static async saveSelectedPeriods(periods: number): Promise<void> {
    await this.saveInputState({ selectedPeriods: periods });
  }

  /**
   * 批量保存输入状态
   * @param symbol 交易对符号
   * @param interval K线周期
   * @param periods 周期数
   */
  static async saveAllInputs(
    symbol: string | null,
    interval: string,
    periods: number
  ): Promise<void> {
    await this.saveInputState({
      selectedSymbol: symbol,
      selectedInterval: interval,
      selectedPeriods: periods,
    });
  }
}

export default BinanceDataStorageService;
