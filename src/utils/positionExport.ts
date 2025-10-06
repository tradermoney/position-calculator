import { SavedPosition } from '../types/position';

/**
 * 导出仓位数据为JSON文件
 */
export function exportPositionToFile(position: SavedPosition): void {
  try {
    // 准备导出数据
    const exportData = {
      name: position.name,
      side: position.side,
      capital: position.capital,
      leverage: position.leverage,
      positions: position.positions,
      inputValues: position.inputValues,
      createdAt: position.createdAt.toISOString(),
      updatedAt: position.updatedAt.toISOString(),
      exportedAt: new Date().toISOString(),
    };

    // 创建JSON字符串
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // 创建Blob对象
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `position_${position.name}_${new Date().toISOString().split('T')[0]}.json`;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 清理URL对象
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('导出仓位失败:', error);
    throw new Error('导出仓位失败');
  }
}

/**
 * 复制仓位数据到剪贴板
 */
export async function copyPositionToClipboard(position: SavedPosition): Promise<void> {
  try {
    // 准备复制数据
    const exportData = {
      name: position.name,
      side: position.side,
      capital: position.capital,
      leverage: position.leverage,
      positions: position.positions,
      inputValues: position.inputValues,
      createdAt: position.createdAt.toISOString(),
      updatedAt: position.updatedAt.toISOString(),
      exportedAt: new Date().toISOString(),
    };

    // 转换为JSON字符串
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // 复制到剪贴板
    await navigator.clipboard.writeText(jsonString);
  } catch (error) {
    console.error('复制仓位到剪贴板失败:', error);
    throw new Error('复制仓位到剪贴板失败');
  }
}

/**
 * 格式化仓位数据为可读文本
 */
export function formatPositionAsText(position: SavedPosition): string {
  const lines: string[] = [];
  
  lines.push(`仓位名称: ${position.name}`);
  lines.push(`方向: ${position.side === 'long' ? '做多' : '做空'}`);
  lines.push(`资金: ${position.capital.toLocaleString()} USDT`);
  lines.push(`杠杆: ${position.leverage}x`);
  lines.push(`委托单数量: ${position.positions.length} 个`);
  lines.push(`创建时间: ${position.createdAt.toLocaleString()}`);
  lines.push(`更新时间: ${position.updatedAt.toLocaleString()}`);
  lines.push('');
  
  if (position.positions.length > 0) {
    lines.push('委托单详情:');
    lines.push('序号 | 类型 | 价格 | 数量 | 数量(USDT) | 保证金 | 启用');
    lines.push('-'.repeat(60));
    
    position.positions.forEach((pos, index) => {
      const type = pos.type === 'open' ? '开仓' : '平仓';
      const enabled = pos.enabled ? '是' : '否';
      lines.push(
        `${(index + 1).toString().padStart(2)} | ${type.padEnd(4)} | ${pos.price.toFixed(2).padStart(8)} | ${pos.quantity.toFixed(4).padStart(8)} | ${pos.quantityUsdt.toFixed(2).padStart(10)} | ${pos.marginUsdt.toFixed(2).padStart(8)} | ${enabled}`
      );
    });
  }
  
  if (Object.keys(position.inputValues).length > 0) {
    lines.push('');
    lines.push('输入值:');
    Object.entries(position.inputValues).forEach(([key, value]) => {
      lines.push(`${key}: ${value}`);
    });
  }
  
  return lines.join('\n');
}

/**
 * 复制格式化的仓位文本到剪贴板
 */
export async function copyPositionTextToClipboard(position: SavedPosition): Promise<void> {
  try {
    const text = formatPositionAsText(position);
    await navigator.clipboard.writeText(text);
  } catch (error) {
    console.error('复制仓位文本到剪贴板失败:', error);
    throw new Error('复制仓位文本到剪贴板失败');
  }
}
