/**
 * 计算器存储服务
 * 使用统一的DAO层进行数据操作
 */

import { 
  saveCalculatorRecord, 
  getCalculatorRecords, 
  deleteCalculatorRecord, 
  clearAllCalculatorRecords 
} from './storage/calculatorStorage';

// 计算器历史记录存储
export interface CalculatorRecord {
  id: string;
  expression: string;
  result: string;
  calculatedAt: Date;
}

class CalculatorStorageClass {
  async saveRecord(record: CalculatorRecord): Promise<string> {
    return saveCalculatorRecord(record);
  }

  async getRecords(limit: number = 20): Promise<CalculatorRecord[]> {
    return getCalculatorRecords(limit);
  }

  async clearAllRecords(): Promise<void> {
    return clearAllCalculatorRecords();
  }

  async deleteRecord(id: string): Promise<void> {
    return deleteCalculatorRecord(id);
  }
}

export const CalculatorStorage = new CalculatorStorageClass();
