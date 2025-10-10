/**
 * 参数输入卡片组件
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Typography,
  Autocomplete,
  CircularProgress,
  Alert,
  Link,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { calculateFundingPeriods, SymbolInfo } from '../../../services/binanceApi';
import TimeShortcutsButtons from './TimeShortcutsButtons';
import PositionInput from './PositionInput';
import FieldTooltip from './FieldTooltip';
import { BINANCE_FUNDING_RATE_URL } from '../constants';
import { TOOLTIPS } from '../tooltips';

interface ParameterInputCardProps {
  symbol: string;
  symbolInfo: SymbolInfo | null;
  // 做多仓位
  longInputMode: 'direct' | 'price';
  longPositionSize: string;
  longEntryPrice: string;
  longQuantity: string;
  // 做空仓位
  shortInputMode: 'direct' | 'price';
  shortPositionSize: string;
  shortEntryPrice: string;
  shortQuantity: string;
  // 其他
  timeMode: 'historical' | 'future';
  holdingHours: string;
  symbols: string[];
  symbolsLoading: boolean;
  error: string | null;
  // 回调函数
  onSymbolChange: (symbol: string) => void;
  onTimeModeChange: (mode: 'historical' | 'future') => void;
  onLongInputModeChange: (mode: 'direct' | 'price') => void;
  onLongPositionSizeChange: (size: string) => void;
  onLongEntryPriceChange: (price: string) => void;
  onLongQuantityChange: (quantity: string) => void;
  onShortInputModeChange: (mode: 'direct' | 'price') => void;
  onShortPositionSizeChange: (size: string) => void;
  onShortEntryPriceChange: (price: string) => void;
  onShortQuantityChange: (quantity: string) => void;
  onHoldingHoursChange: (hours: string) => void;
}

const ParameterInputCard: React.FC<ParameterInputCardProps> = ({
  symbol,
  symbolInfo,
  longInputMode,
  longPositionSize,
  longEntryPrice,
  longQuantity,
  shortInputMode,
  shortPositionSize,
  shortEntryPrice,
  shortQuantity,
  timeMode,
  holdingHours,
  symbols,
  symbolsLoading,
  error,
  onSymbolChange,
  onLongInputModeChange,
  onLongPositionSizeChange,
  onLongEntryPriceChange,
  onLongQuantityChange,
  onShortInputModeChange,
  onShortPositionSizeChange,
  onShortEntryPriceChange,
  onShortQuantityChange,
  onTimeModeChange,
  onHoldingHoursChange,
}) => {
  const holdingHoursNum = parseFloat(holdingHours) || 0;
  const fundingIntervalHours = symbolInfo?.fundingIntervalHours || 8;
  const periods = calculateFundingPeriods(holdingHoursNum, fundingIntervalHours);

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          计算参数
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                交易对
              </Typography>
              <FieldTooltip title={TOOLTIPS.symbol} />
            </Box>
            <Autocomplete
              value={symbol}
              onChange={(_, newValue) => {
                if (newValue) onSymbolChange(newValue);
              }}
              options={symbols}
              loading={symbolsLoading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  placeholder="选择交易对"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {symbolsLoading ? <CircularProgress size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
            />
          </Box>

          <PositionInput
            label="做多仓位"
            mode={longInputMode}
            positionSize={longPositionSize}
            entryPrice={longEntryPrice}
            quantity={longQuantity}
            onModeChange={onLongInputModeChange}
            onPositionSizeChange={onLongPositionSizeChange}
            onEntryPriceChange={onLongEntryPriceChange}
            onQuantityChange={onLongQuantityChange}
          />

          <PositionInput
            label="做空仓位"
            mode={shortInputMode}
            positionSize={shortPositionSize}
            entryPrice={shortEntryPrice}
            quantity={shortQuantity}
            onModeChange={onShortInputModeChange}
            onPositionSizeChange={onShortPositionSizeChange}
            onEntryPriceChange={onShortEntryPriceChange}
            onQuantityChange={onShortQuantityChange}
          />

          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  持有时间
                </Typography>
                <FieldTooltip title={TOOLTIPS.holdingTime} />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <FieldTooltip title={TOOLTIPS.timeMode} placement="left" />
                <ToggleButtonGroup
                  value={timeMode}
                  exclusive
                  onChange={(_, newMode) => {
                    if (newMode !== null) {
                      onTimeModeChange(newMode);
                    }
                  }}
                  size="small"
                  sx={{ ml: 0.5 }}
                >
                  <ToggleButton value="historical" sx={{ py: 0.25, px: 1.5, fontSize: '0.75rem' }}>
                    已持有时间
                  </ToggleButton>
                  <ToggleButton value="future" sx={{ py: 0.25, px: 1.5, fontSize: '0.75rem' }}>
                    预估持有时间
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>
            
            <TextField
              type="number"
              value={holdingHours}
              onChange={(e) => onHoldingHoursChange(e.target.value)}
              variant="outlined"
              fullWidth
              inputProps={{ min: 0, step: 1 }}
              helperText={`约 ${(holdingHoursNum / 24).toFixed(1)} 天，${periods} 个资金费率周期（每 ${fundingIntervalHours} 小时结算一次）`}
              placeholder="输入持有小时数"
            />
            <TimeShortcutsButtons
              onSelectTime={(hours) => onHoldingHoursChange(hours.toString())}
              currentHours={holdingHoursNum}
            />
          </Box>

          {/* 币安资金费率链接 */}
          <Box sx={{ mt: 1, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              参考资料：
            </Typography>
            <Link
              href={BINANCE_FUNDING_RATE_URL}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ fontSize: '0.875rem' }}
            >
              币安实时资金费率
            </Link>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default ParameterInputCard;

