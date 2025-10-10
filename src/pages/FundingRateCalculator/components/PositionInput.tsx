/**
 * 仓位输入组件 - 支持直接输入和价格×数量两种模式
 */

import React from 'react';
import { Box, TextField, ToggleButton, ToggleButtonGroup, Typography, Tooltip } from '@mui/material';
import FieldTooltip from './FieldTooltip';
import { TOOLTIPS } from '../tooltips';

interface PositionInputProps {
  label: string;
  mode: 'direct' | 'price';
  positionSize: string;
  entryPrice: string;
  quantity: string;
  onModeChange: (mode: 'direct' | 'price') => void;
  onPositionSizeChange: (value: string) => void;
  onEntryPriceChange: (value: string) => void;
  onQuantityChange: (value: string) => void;
}

const PositionInput: React.FC<PositionInputProps> = ({
  label,
  mode,
  positionSize,
  entryPrice,
  quantity,
  onModeChange,
  onPositionSizeChange,
  onEntryPriceChange,
  onQuantityChange,
}) => {
  // 计算实际仓位大小
  const calculatedSize = mode === 'price' 
    ? (parseFloat(entryPrice) || 0) * (parseFloat(quantity) || 0)
    : parseFloat(positionSize) || 0;

  // 根据 label 判断是做多还是做空
  const isLong = label.includes('做多');
  const positionTooltip = isLong ? TOOLTIPS.longPosition : TOOLTIPS.shortPosition;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {label}
          </Typography>
          <FieldTooltip title={positionTooltip} />
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={mode === 'direct' ? TOOLTIPS.directInputMode : TOOLTIPS.priceQuantityMode} placement="left" arrow>
            <Box>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(_, newMode) => {
                  if (newMode !== null) {
                    onModeChange(newMode);
                  }
                }}
                size="small"
              >
                <ToggleButton value="direct" sx={{ py: 0.25, px: 1.5, fontSize: '0.75rem' }}>
                  直接输入
                </ToggleButton>
                <ToggleButton value="price" sx={{ py: 0.25, px: 1.5, fontSize: '0.75rem' }}>
                  价格×数量
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Tooltip>
        </Box>
      </Box>

      {mode === 'direct' ? (
        <TextField
          type="number"
          value={positionSize}
          onChange={(e) => onPositionSizeChange(e.target.value)}
          variant="outlined"
          fullWidth
          inputProps={{ min: 0, step: 100 }}
          helperText="如果不持有此仓位，保持为0"
          placeholder="输入仓位大小（USDT）"
          InputProps={{
            endAdornment: <FieldTooltip title={positionTooltip} placement="left" />,
          }}
        />
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <TextField
            type="number"
            value={entryPrice}
            onChange={(e) => onEntryPriceChange(e.target.value)}
            variant="outlined"
            fullWidth
            inputProps={{ min: 0, step: 0.01 }}
            placeholder="输入开仓价格（USDT）"
            InputProps={{
              endAdornment: <FieldTooltip title={TOOLTIPS.entryPrice} placement="left" />,
            }}
          />
          <TextField
            type="number"
            value={quantity}
            onChange={(e) => onQuantityChange(e.target.value)}
            variant="outlined"
            fullWidth
            inputProps={{ min: 0, step: 0.001 }}
            placeholder="输入持仓数量"
            InputProps={{
              endAdornment: <FieldTooltip title={TOOLTIPS.quantity} placement="left" />,
            }}
          />
          <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              仓位大小 = {(parseFloat(entryPrice) || 0).toFixed(2)} × {parseFloat(quantity) || 0} = {calculatedSize.toFixed(2)} USDT
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PositionInput;

