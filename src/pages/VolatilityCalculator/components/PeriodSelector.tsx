/**
 * 数据周期数量选择器组件
 * 用于选择获取多少个K线周期的数据
 */

import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Slider,
  Chip,
} from '@mui/material';
import { DataUsage as DataUsageIcon } from '@mui/icons-material';
import FieldTooltip from './FieldTooltip';

export interface PeriodSelectorProps {
  /** 当前选中的周期数 */
  value: number;
  /** 周期数变更回调 */
  onChange: (periods: number) => void;
  /** 最小值，默认10 */
  min?: number;
  /** 最大值，默认1000 */
  max?: number;
  /** 是否禁用 */
  disabled?: boolean;
}

// 快捷选择的周期数
const QUICK_PERIODS = [50, 100, 200, 500, 1000];

/**
 * 数据周期数量选择器组件
 */
export function PeriodSelector({
  value,
  onChange,
  min = 10,
  max = 1000,
  disabled = false,
}: PeriodSelectorProps) {
  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    onChange(newValue as number);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value === '' ? min : Number(event.target.value);
    if (newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    if (value < min) {
      onChange(min);
    } else if (value > max) {
      onChange(max);
    }
  };

  // 计算滑块的刻度
  const marks = [
    { value: min, label: `${min}` },
    { value: 100, label: '100' },
    { value: 250, label: '250' },
    { value: 500, label: '500' },
    { value: max, label: `${max}` },
  ];

  return (
    <Box>
      <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <DataUsageIcon sx={{ mr: 0.5, fontSize: 18 }} />
        数据周期数
        <FieldTooltip
          title={
            <Box sx={{ p: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                数据周期数量
              </Typography>
              <Typography variant="body2" paragraph>
                设置要获取多少个K线周期的历史数据用于波动率分析。例如，选择100个周期 + 1小时K线，将分析最近100小时的数据。
              </Typography>
              <Typography variant="body2" paragraph>
                <strong>数量选择建议：</strong><br/>
                • 50-100个 - 快速分析，适合短期波动观察<br/>
                • 100-200个 - 平衡速度和准确性，推荐日常使用<br/>
                • 200-500个 - 中期分析，获得更稳定的统计结果<br/>
                • 500-1000个 - 长期分析，适合深度研究和策略回测
              </Typography>
              <Typography variant="body2">
                <strong>💡 提示：</strong>数据越多，统计结果越准确可靠，但加载和计算时间会相应增加。建议根据分析需求选择合适的数量。
              </Typography>
            </Box>
          }
          placement="right"
        />
      </Typography>

      {/* 快捷选择 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" gutterBottom display="block">
          快速选择:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {QUICK_PERIODS.map((period) => (
            <Chip
              key={period}
              label={`${period}个`}
              size="small"
              color={value === period ? 'primary' : 'default'}
              variant={value === period ? 'filled' : 'outlined'}
              onClick={() => onChange(period)}
              disabled={disabled}
              sx={{ 
                cursor: 'pointer',
                fontWeight: value === period ? 'bold' : 'normal',
              }}
            />
          ))}
        </Box>
      </Box>

      {/* 数值输入框 */}
      <Box sx={{ mb: 2 }}>
        <TextField
          type="number"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          disabled={disabled}
          size="small"
          fullWidth
          inputProps={{
            min,
            max,
            step: 10,
          }}
          helperText={`请输入 ${min} 到 ${max} 之间的数值`}
          sx={{
            '& input': {
              textAlign: 'center',
              fontSize: '1.25rem',
              fontWeight: 'bold',
            },
          }}
        />
      </Box>

      {/* 滑块 */}
      <Box sx={{ px: 1 }}>
        <Slider
          value={value}
          onChange={handleSliderChange}
          min={min}
          max={max}
          step={10}
          marks={marks}
          valueLabelDisplay="auto"
          disabled={disabled}
          sx={{
            '& .MuiSlider-markLabel': {
              fontSize: '0.7rem',
            },
          }}
        />
      </Box>

      {/* 说明信息 */}
      <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          将获取最近 <strong>{value}</strong> 个周期的K线数据进行波动率分析
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          💡 提示: 数据越多，统计结果越稳定，但加载时间也会增加
        </Typography>
      </Box>
    </Box>
  );
}

export default PeriodSelector;


