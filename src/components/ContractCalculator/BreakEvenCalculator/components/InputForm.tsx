import React from 'react';
import {
  CardContent,
  Typography,
  Grid,
  TextField,
  FormControl,
  FormLabel,
  Box,
  IconButton,
  Tooltip,
  Link,
  Select,
  MenuItem,
  FormControlLabel,
  RadioGroup,
  Radio,
  CircularProgress,
} from '@mui/material';
import { Info as InfoIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { BreakEvenInputs } from '../../../../utils/breakEvenCalculations';
import { StyledCard, StyledSlider } from '../styles';
import TimeShortcutsButtons from './TimeShortcutsButtons';

interface InputFormProps {
  inputs: BreakEvenInputs;
  errors: string[];
  symbols: string[];
  symbolsLoading: boolean;
  fundingDataLoading: boolean;
  onLeverageChange: (value: number) => void;
  onOpenFeeRateChange: (value: number) => void;
  onCloseFeeRateChange: (value: number) => void;
  onFundingRateChange: (value: number) => void;
  onFundingPeriodChange: (value: number) => void;
  onHoldingTimeChange: (value: number) => void;
  onSymbolChange: (value: string) => void;
  onPositionDirectionChange: (value: 'long' | 'short') => void;
  onReset: () => void;
}

export default function InputForm({
  inputs,
  errors,
  symbols,
  symbolsLoading,
  fundingDataLoading,
  onLeverageChange,
  onOpenFeeRateChange,
  onCloseFeeRateChange,
  onFundingRateChange,
  onFundingPeriodChange,
  onHoldingTimeChange,
  onSymbolChange,
  onPositionDirectionChange,
  onReset,
}: InputFormProps) {
  return (
    <StyledCard>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" component="h2" fontWeight="bold">
            计算参数设置
          </Typography>
          <Tooltip title="重置为默认值">
            <IconButton onClick={onReset} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {errors.length > 0 && (
          <Box mb={2}>
            {errors.map((error, index) => (
              <Typography key={index} color="error" variant="body2">
                • {error}
              </Typography>
            ))}
          </Box>
        )}

        <Grid container spacing={3} sx={{ margin: 0, width: '100%' }}>
          {/* 交易对选择 */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                交易对
                <Tooltip title="选择要计算保本回报率的交易对">
                  <InfoIcon sx={{ fontSize: 16, ml: 0.5, color: 'text.secondary' }} />
                </Tooltip>
              </FormLabel>
              <Select
                value={inputs.symbol}
                onChange={(e) => onSymbolChange(e.target.value)}
                size="small"
                fullWidth
                disabled={symbolsLoading}
              >
                {symbolsLoading ? (
                  <MenuItem disabled>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    加载中...
                  </MenuItem>
                ) : (
                  symbols.map((symbol) => (
                    <MenuItem key={symbol} value={symbol}>
                      {symbol}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* 开仓方向 */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                开仓方向
                <Tooltip title="选择开仓方向，影响资金费率的计算">
                  <InfoIcon sx={{ fontSize: 16, ml: 0.5, color: 'text.secondary' }} />
                </Tooltip>
              </FormLabel>
              <RadioGroup
                value={inputs.positionDirection}
                onChange={(e) => onPositionDirectionChange(e.target.value as 'long' | 'short')}
                row
              >
                <FormControlLabel value="long" control={<Radio />} label="做多" />
                <FormControlLabel value="short" control={<Radio />} label="做空" />
              </RadioGroup>
            </FormControl>
          </Grid>

          {/* 杠杆倍数 */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                杠杆倍数
                <Tooltip title="杠杆倍数越高，相同成本占本金的比例越高">
                  <InfoIcon sx={{ fontSize: 16, ml: 0.5, color: 'text.secondary' }} />
                </Tooltip>
              </FormLabel>
              <Box sx={{ px: 1 }}>
                <StyledSlider
                  value={inputs.leverage}
                  onChange={(_, value) => onLeverageChange(value as number)}
                  min={1}
                  max={200}
                  step={1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}x`}
                />
              </Box>
              <TextField
                value={inputs.leverage}
                onChange={(e) => onLeverageChange(Number(e.target.value) || 1)}
                type="number"
                inputProps={{ min: 1, max: 200, step: 1 }}
                size="small"
                sx={{ mt: 1 }}
                InputProps={{
                  endAdornment: <Typography variant="body2" color="text.secondary">倍</Typography>
                }}
              />
            </FormControl>
          </Grid>

          {/* 开仓手续费率 */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                开仓手续费率
                <Tooltip title="开仓时交易所收取的手续费率">
                  <InfoIcon sx={{ fontSize: 16, ml: 0.5, color: 'text.secondary' }} />
                </Tooltip>
              </FormLabel>
              <Box sx={{ px: 1 }}>
                <StyledSlider
                  value={inputs.openFeeRate}
                  onChange={(_, value) => onOpenFeeRateChange(value as number)}
                  min={0}
                  max={1}
                  step={0.001}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Box>
              <TextField
                value={inputs.openFeeRate}
                onChange={(e) => onOpenFeeRateChange(Number(e.target.value) || 0)}
                type="number"
                inputProps={{ min: 0, max: 1, step: 0.001 }}
                size="small"
                sx={{ mt: 1 }}
                InputProps={{
                  endAdornment: <Typography variant="body2" color="text.secondary">%</Typography>
                }}
              />
            </FormControl>
          </Grid>

          {/* 平仓手续费率 */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                平仓手续费率
                <Tooltip title="平仓时交易所收取的手续费率">
                  <InfoIcon sx={{ fontSize: 16, ml: 0.5, color: 'text.secondary' }} />
                </Tooltip>
              </FormLabel>
              <Box sx={{ px: 1 }}>
                <StyledSlider
                  value={inputs.closeFeeRate}
                  onChange={(_, value) => onCloseFeeRateChange(value as number)}
                  min={0}
                  max={1}
                  step={0.001}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Box>
              <TextField
                value={inputs.closeFeeRate}
                onChange={(e) => onCloseFeeRateChange(Number(e.target.value) || 0)}
                type="number"
                inputProps={{ min: 0, max: 1, step: 0.001 }}
                size="small"
                sx={{ mt: 1 }}
                InputProps={{
                  endAdornment: <Typography variant="body2" color="text.secondary">%</Typography>
                }}
              />
            </FormControl>
          </Grid>

          {/* 资金费率 */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                资金费率
                <Tooltip title="永续合约的资金费率，可以为正（支付）或负（获得）。系统会自动获取7天平均费率">
                  <InfoIcon sx={{ fontSize: 16, ml: 0.5, color: 'text.secondary' }} />
                </Tooltip>
                {fundingDataLoading && (
                  <CircularProgress size={16} sx={{ ml: 1 }} />
                )}
              </FormLabel>
              <Box sx={{ px: 1 }}>
                <StyledSlider
                  value={inputs.fundingRate}
                  onChange={(_, value) => onFundingRateChange(value as number)}
                  min={-0.5}
                  max={0.5}
                  step={0.001}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                  disabled={fundingDataLoading}
                />
              </Box>
              <TextField
                value={inputs.fundingRate}
                onChange={(e) => onFundingRateChange(Number(e.target.value) || 0)}
                type="number"
                inputProps={{ min: -0.5, max: 0.5, step: 0.001 }}
                size="small"
                sx={{ mt: 1 }}
                disabled={fundingDataLoading}
                InputProps={{
                  endAdornment: <Typography variant="body2" color="text.secondary">%</Typography>
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                系统自动获取 {inputs.symbol} 的7天平均资金费率
                <Link
                  href="https://www.binance.com/zh-CN/futures/funding-history/perpetual/real-time-funding-rate"
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ ml: 0.5 }}
                >
                  查看实时费率
                </Link>
              </Typography>
            </FormControl>
          </Grid>

          {/* 资金费率结算周期 */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                资金费率结算周期
                <Tooltip title="资金费率结算的时间间隔，系统会根据历史数据自动计算">
                  <InfoIcon sx={{ fontSize: 16, ml: 0.5, color: 'text.secondary' }} />
                </Tooltip>
              </FormLabel>
              <TextField
                select
                value={inputs.fundingPeriod}
                onChange={(e) => onFundingPeriodChange(Number(e.target.value))}
                size="small"
                fullWidth
                disabled={fundingDataLoading}
                SelectProps={{
                  native: true,
                }}
              >
                <option value={1}>1小时</option>
                <option value={4}>4小时</option>
                <option value={8}>8小时</option>
                <option value={24}>24小时</option>
              </TextField>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                系统会根据 {inputs.symbol} 的历史数据自动计算实际结算周期
              </Typography>
            </FormControl>
          </Grid>

          {/* 持仓时间 */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
                预期持仓时间
                <Tooltip title="预计持有仓位的时间，影响资金费率总成本">
                  <InfoIcon sx={{ fontSize: 16, ml: 0.5, color: 'text.secondary' }} />
                </Tooltip>
              </FormLabel>
              <Box sx={{ px: 1 }}>
                <StyledSlider
                  value={inputs.holdingTime}
                  onChange={(_, value) => onHoldingTimeChange(value as number)}
                  min={0}
                  max={168} // 一周
                  step={1}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}h`}
                />
              </Box>
              <TextField
                value={inputs.holdingTime}
                onChange={(e) => onHoldingTimeChange(Number(e.target.value) || 0)}
                type="number"
                inputProps={{ min: 0, max: 8760, step: 1 }}
                size="small"
                sx={{ mt: 1 }}
                InputProps={{
                  endAdornment: <Typography variant="body2" color="text.secondary">小时</Typography>
                }}
              />
              <TimeShortcutsButtons
                onSelectTime={onHoldingTimeChange}
                currentHours={inputs.holdingTime}
              />
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </StyledCard>
  );
}