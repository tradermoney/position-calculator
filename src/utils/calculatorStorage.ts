// 计算器历史记录存储
export interface CalculatorRecord {
  id: string;
  expression: string;
  result: string;
  calculatedAt: Date;
}

class CalculatorStorageClass {
  private dbName = 'CalculatorDB';
  private version = 1;
  private storeName = 'calculations';

  private async openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          store.createIndex('calculatedAt', 'calculatedAt', { unique: false });
        }
      };
    });
  }

  async saveRecord(record: CalculatorRecord): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    // 转换Date对象为字符串以便存储
    const recordToStore = {
      ...record,
      calculatedAt: record.calculatedAt.toISOString(),
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(recordToStore);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getRecords(limit: number = 20): Promise<CalculatorRecord[]> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readonly');
    const store = transaction.objectStore(this.storeName);
    const index = store.index('calculatedAt');
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev'); // 按时间倒序
      const records: CalculatorRecord[] = [];
      
      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor && records.length < limit) {
          const record = cursor.value;
          // 转换字符串回Date对象
          records.push({
            ...record,
            calculatedAt: new Date(record.calculatedAt),
          });
          cursor.continue();
        } else {
          resolve(records);
        }
      };
    });
  }

  async clearAllRecords(): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async deleteRecord(id: string): Promise<void> {
    const db = await this.openDB();
    const transaction = db.transaction([this.storeName], 'readwrite');
    const store = transaction.objectStore(this.storeName);
    
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}

export const CalculatorStorage = new CalculatorStorageClass();
