import React from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Slider,
  Alert,
  Divider,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import {
  PositionSide,
  MarginMode,
  PositionMode,
} from '../../../utils/contractCalculations';
import { LiquidationFormProps } from './types';

export function FormSection({
  params,
  onParamsChange,
  onCalculate,
  onReset,
  errors,
}: LiquidationFormProps) {
  // 杠杆倍数标记
  const leverageMarks = [
    { value: 1, label: '1x' },
    { value: 15, label: '15x' },
    { value: 30, label: '30x' },
    { value: 45, label: '45x' },
    { value: 60, label: '60x' },
    { value: 75, label: '75x' },
    { value: 100, label: '100x' },
    { value: 125, label: '125x' },
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          交易参数
        </Typography>

        {/* 保证金模式和持仓模式 */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>保证金模式</InputLabel>
              <Select
                value={params.marginMode}
                label="保证金模式"
                onChange={(e) => onParamsChange({ ...params, marginMode: e.target.value as MarginMode })}
              >
                <MenuItem value={MarginMode.CROSS}>全仓</MenuItem>
                <MenuItem value={MarginMode.ISOLATED}>逐仓</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth>
              <InputLabel>持仓模式</InputLabel>
              <Select
                value={params.positionMode}
                label="持仓模式"
                onChange={(e) => onParamsChange({ ...params, positionMode: e.target.value as PositionMode })}
              >
                <MenuItem value={PositionMode.ONE_WAY}>单向持仓</MenuItem>
                <MenuItem value={PositionMode.HEDGE}>双向持仓</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* 仓位方向 */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            仓位方向
          </Typography>
          <Box display="flex" gap={1}>
            <Button
              variant={params.side === PositionSide.LONG ? 'contained' : 'outlined'}
              color="success"
              startIcon={<TrendingUpIcon />}
              onClick={() => onParamsChange({ ...params, side: PositionSide.LONG })}
              sx={{ flex: 1 }}
            >
              做多
            </Button>
            <Button
              variant={params.side === PositionSide.SHORT ? 'contained' : 'outlined'}
              color="error"
              startIcon={<TrendingDownIcon />}
              onClick={() => onParamsChange({ ...params, side: PositionSide.SHORT })}
              sx={{ flex: 1 }}
            >
              做空
            </Button>
          </Box>
        </Box>

        {/* 杠杆倍数 */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            杠杆倍数: {params.leverage}x
          </Typography>
          <Box px={2}>
            <Slider
              value={params.leverage}
              onChange={(_, value) => onParamsChange({ ...params, leverage: value as number })}
              min={1}
              max={125}
              marks={leverageMarks}
              valueLabelDisplay="auto"
              sx={{ mt: 2 }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 价格和数量输入 */}
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="开仓价格"
              type="number"
              value={params.entryPrice || ''}
              onChange={(e) => onParamsChange({ ...params, entryPrice: parseFloat(e.target.value) || 0 })}
              InputProps={{
                endAdornment: <InputAdornment position="end">USDT</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="成交数量"
              type="number"
              value={params.quantity || ''}
              onChange={(e) => onParamsChange({ ...params, quantity: parseFloat(e.target.value) || 0 })}
              InputProps={{
                endAdornment: <InputAdornment position="end">币</InputAdornment>,
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="钱包余额"
              type="number"
              value={params.walletBalance || ''}
              onChange={(e) => onParamsChange({ ...params, walletBalance: parseFloat(e.target.value) || 0 })}
              InputProps={{
                endAdornment: <InputAdornment position="end">USDT</InputAdornment>,
              }}
            />
          </Grid>
        </Grid>

        {/* 操作按钮 */}
        <Box mt={3} display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={onCalculate}
            fullWidth
          >
            计算
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onReset}
            sx={{ whiteSpace: 'nowrap' }}
          >
            重置
          </Button>
        </Box>

        {/* 错误提示 */}
        {errors.length > 0 && (
          <Box mt={2}>
            {errors.map((error, index) => (
              <Alert key={index} severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
