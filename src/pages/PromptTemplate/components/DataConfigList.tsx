/**
 * 数据配置列表组件
 */

import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Box,
  Typography,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { PromptDataConfig } from '../../../utils/storage/types';

interface DataConfigListProps {
  configs: PromptDataConfig[];
  onDelete: (configId: string) => void;
  onUpdate: (config: PromptDataConfig) => void;
}

export function DataConfigList({ configs, onDelete }: DataConfigListProps) {
  // 格式化配置信息
  const formatConfigInfo = (config: PromptDataConfig): string => {
    const parts: string[] = [];

    if (config.symbol) {
      parts.push(`交易对: ${config.symbol}`);
    }

    switch (config.type) {
      case 'kline':
        parts.push(`时间粒度: ${config.interval || '1m'}`);
        parts.push(`数据点数: ${config.limit || 1000}`);
        break;
      case 'fundingRate':
        parts.push(`天数: ${config.days || 3}`);
        break;
      case 'orderBook':
        parts.push(`区间: ±${config.priceRangePercent || 10}%, 档位: ${config.aggregationLevels || 20}`);
        break;
    }

    return parts.join(', ');
  };

  // 获取类型标签文本
  const getTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      symbol: '交易对',
      kline: 'K线数据',
      fundingRate: '资金费率',
      orderBook: '订单薄',
    };
    return typeMap[type] || type;
  };

  if (configs.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          还没有添加数据配置，点击"添加数据"按钮开始
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {configs.map((config) => (
        <ListItem
          key={config.id}
          secondaryAction={
            <Box>
              <IconButton
                edge="end"
                aria-label="删除"
                onClick={() => onDelete(config.id)}
              >
                <DeleteIcon />
              </IconButton>
            </Box>
          }
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            mb: 1,
          }}
        >
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip label={getTypeLabel(config.type)} size="small" color="primary" />
                {config.symbol && (
                  <Chip label={config.symbol} size="small" variant="outlined" />
                )}
              </Box>
            }
            secondary={formatConfigInfo(config)}
          />
        </ListItem>
      ))}
    </List>
  );
}


