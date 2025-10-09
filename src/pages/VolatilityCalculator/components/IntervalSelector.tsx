/**
 * K线周期选择器组件
 * 支持选择1m到1M的所有K线周期
 */

import React from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Chip,
} from '@mui/material';
import { Timeline as TimelineIcon } from '@mui/icons-material';
import { KlineInterval } from '../../../types/binance';

export interface IntervalSelectorProps {
  /** 当前选中的周期 */
  value: KlineInterval;
  /** 周期变更回调 */
  onChange: (interval: KlineInterval) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

// K线周期配置
const INTERVAL_GROUPS = [
  {
    label: '分钟',
    intervals: [
      { value: '1m' as KlineInterval, label: '1分钟' },
      { value: '3m' as KlineInterval, label: '3分钟' },
      { value: '5m' as KlineInterval, label: '5分钟' },
      { value: '15m' as KlineInterval, label: '15分钟' },
      { value: '30m' as KlineInterval, label: '30分钟' },
    ],
  },
  {
    label: '小时',
    intervals: [
      { value: '1h' as KlineInterval, label: '1小时' },
      { value: '2h' as KlineInterval, label: '2小时' },
      { value: '4h' as KlineInterval, label: '4小时' },
      { value: '6h' as KlineInterval, label: '6小时' },
      { value: '8h' as KlineInterval, label: '8小时' },
      { value: '12h' as KlineInterval, label: '12小时' },
    ],
  },
  {
    label: '天/周/月',
    intervals: [
      { value: '1d' as KlineInterval, label: '1天' },
      { value: '3d' as KlineInterval, label: '3天' },
      { value: '1w' as KlineInterval, label: '1周' },
      { value: '1M' as KlineInterval, label: '1月' },
    ],
  },
];

// 热门周期
const POPULAR_INTERVALS: Array<{ value: KlineInterval; label: string }> = [
  { value: KlineInterval['1m'], label: '1分钟' },
  { value: KlineInterval['5m'], label: '5分钟' },
  { value: KlineInterval['15m'], label: '15分钟' },
  { value: KlineInterval['1h'], label: '1小时' },
  { value: KlineInterval['4h'], label: '4小时' },
  { value: KlineInterval['1d'], label: '1天' },
];

/**
 * K线周期选择器组件
 */
export function IntervalSelector({
  value,
  onChange,
  disabled = false,
}: IntervalSelectorProps) {
  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <TimelineIcon sx={{ mr: 0.5, fontSize: 18 }} />
        K线周期
      </Typography>

      {/* 热门周期快捷选择 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          常用周期:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {POPULAR_INTERVALS.map((interval) => (
            <Chip
              key={interval.value}
              label={interval.label}
              size="small"
              color={value === interval.value ? 'primary' : 'default'}
              variant={value === interval.value ? 'filled' : 'outlined'}
              onClick={() => onChange(interval.value)}
              disabled={disabled}
              sx={{ 
                cursor: 'pointer',
                fontWeight: value === interval.value ? 'bold' : 'normal',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* 分组的周期选择 */}
      {INTERVAL_GROUPS.map((group) => (
        <Box key={group.label} sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" gutterBottom display="block">
            {group.label}:
          </Typography>
          <ToggleButtonGroup
            value={value}
            exclusive
            onChange={(_, newValue) => {
              if (newValue !== null) {
                onChange(newValue);
              }
            }}
            size="small"
            disabled={disabled}
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap',
              gap: 0.5,
              '& .MuiToggleButton-root': {
                px: 1.5,
                py: 0.5,
                fontSize: '0.75rem',
                textTransform: 'none',
                border: '1px solid',
                borderColor: 'divider',
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              },
            }}
          >
            {group.intervals.map((interval) => (
              <ToggleButton 
                key={interval.value} 
                value={interval.value}
                aria-label={interval.label}
              >
                {interval.label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      ))}

      {/* 当前选择提示 */}
      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          当前周期: <strong>
            {INTERVAL_GROUPS.flatMap(g => g.intervals).find(i => i.value === value)?.label || value}
          </strong>
        </Typography>
      </Box>
    </Box>
  );
}

export default IntervalSelector;

