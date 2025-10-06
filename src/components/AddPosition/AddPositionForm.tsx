/**
 * 补仓参数输入表单组件
 */

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Alert,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { ManualPositionInputs, PositionSide, AddPositionParams } from '../../types/addPosition';

interface AddPositionFormProps {
  positionInputs: ManualPositionInputs;
  addParams: AddPositionParams;
  errors: string[];
  onPositionChange: <K extends keyof ManualPositionInputs>(field: K, value: ManualPositionInputs[K]) => void;
  onParamsChange: (params: AddPositionParams) => void;
  onCalculate: () => void;
  onReset: () => void;
}

export default function AddPositionForm({
  positionInputs,
  addParams,
  errors,
  onPositionChange,
  onParamsChange,
  onCalculate,
  onReset,
}: AddPositionFormProps) {
  const handleNumericPositionChange = (
    field: Exclude<keyof ManualPositionInputs, 'symbol' | 'side'>,
  ) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    if (value === '') {
      onPositionChange(field, '');
      return;
    }

    const numericValue = Number(value);
    onPositionChange(field, Number.isFinite(numericValue) ? numericValue : '');
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          补仓参数设置
        </Typography>

        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </Alert>
        )}

        <Typography variant="subtitle1" gutterBottom>
          当前仓位信息
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="交易对"
              value={positionInputs.symbol}
              onChange={(event) => onPositionChange('symbol', event.target.value)}
              placeholder="例如：BTC/USDT"
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>仓位方向</InputLabel>
              <Select
                value={positionInputs.side}
                label="仓位方向"
                onChange={(event) => onPositionChange('side', event.target.value as PositionSide)}
              >
                <MenuItem value={PositionSide.LONG}>多头</MenuItem>
                <MenuItem value={PositionSide.SHORT}>空头</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="杠杆倍数"
              type="number"
              value={positionInputs.leverage === '' ? '' : positionInputs.leverage}
              onChange={handleNumericPositionChange('leverage')}
              InputProps={{
                endAdornment: <InputAdornment position="end">x</InputAdornment>,
              }}
              inputProps={{ min: 1, max: 125, step: 1 }}
              required
              helperText="请输入当前使用的杠杆倍数"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="开仓价格"
              type="number"
              value={positionInputs.entryPrice === '' ? '' : positionInputs.entryPrice}
              onChange={handleNumericPositionChange('entryPrice')}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 'any' }}
              required
              helperText="当前仓位的平均持仓价格"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="持仓数量"
              type="number"
              value={positionInputs.quantity === '' ? '' : positionInputs.quantity}
              onChange={handleNumericPositionChange('quantity')}
              inputProps={{ min: 0, step: 'any' }}
              required
              helperText="当前持有的合约数量"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="当前保证金"
              type="number"
              value={positionInputs.margin === '' ? '' : positionInputs.margin}
              onChange={handleNumericPositionChange('margin')}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 'any' }}
              required
              helperText="当前仓位已投入的保证金"
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" gutterBottom>
          补仓计划参数
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="补仓价格"
              type="number"
              value={addParams.addPrice || ''}
              onChange={(event) => onParamsChange({
                ...addParams,
                addPrice: parseFloat(event.target.value) || 0,
              })}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 'any' }}
              required
              helperText="建议低于开仓价格（多头）或高于开仓价格（空头）"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="补仓数量"
              type="number"
              value={addParams.addQuantity || ''}
              onChange={(event) => onParamsChange({
                ...addParams,
                addQuantity: parseFloat(event.target.value) || 0,
              })}
              inputProps={{ min: 0, step: 'any' }}
              required
              helperText="计划增加的持仓数量"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="补仓保证金"
              type="number"
              value={addParams.addMargin || ''}
              onChange={(event) => onParamsChange({
                ...addParams,
                addMargin: parseFloat(event.target.value) || 0,
              })}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 'any' }}
              required
              helperText="补仓所需额外投入的保证金"
            />
          </Grid>
        </Grid>

        <Box mt={3} display="flex" gap={2}>
          <Button
            variant="contained"
            startIcon={<CalculateIcon />}
            onClick={onCalculate}
            fullWidth
          >
            计算补仓结果
          </Button>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={onReset}
          >
            重置
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
