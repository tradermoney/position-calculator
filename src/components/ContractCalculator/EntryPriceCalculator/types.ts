export interface Position {
  id: number;
  price: number;
  quantity: number;      // 成交数量（币）
  quantityUsdt: number;  // 成交数量（U）
  enabled: boolean;      // 是否启用此仓位参与计算
}

export interface InputValues {
  [key: string]: string;
}
