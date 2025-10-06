/**
 * 金字塔加仓计算器表单组件
 */

import React from 'react';
import {
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  InputAdornment,
  Box,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { PyramidParams, PositionSide, PyramidStrategy } from '../../types/pyramid';

interface PyramidCalculatorFormProps {
  params: PyramidParams;
  onParamsChange: (params: PyramidParams) => void;
  onCalculate: () => void;
  onReset: () => void;
}

export default function PyramidCalculatorForm({
  params,
  onParamsChange,
  onCalculate,
  onReset,
}: PyramidCalculatorFormProps) {
  const handleParamChange = (field: keyof PyramidParams, value: number | PyramidStrategy | string | PositionSide | '') => {
    onParamsChange({ ...params, [field]: value });
  };

  const isDoubleStrategy = params.strategy === PyramidStrategy.DOUBLE_DOWN;

  const handleStrategyChange = (strategy: PyramidStrategy) => {
    const rawMultiplier = params.ratioMultiplier;
    const currentMultiplier = typeof rawMultiplier === 'number'
      ? rawMultiplier
      : parseFloat(rawMultiplier as string);

    let nextMultiplier: number;

    if (strategy === PyramidStrategy.DOUBLE_DOWN) {
      const safeMultiplier = Number.isFinite(currentMultiplier) ? currentMultiplier : 2;
      nextMultiplier = safeMultiplier >= 2 ? safeMultiplier : 2;
    } else {
      const safeMultiplier = Number.isFinite(currentMultiplier) ? currentMultiplier : 1.5;
      nextMultiplier = safeMultiplier > 1 ? safeMultiplier : 1.5;
    }

    onParamsChange({
      ...params,
      strategy,
      ratioMultiplier: nextMultiplier,
    });
  };

  return (
    <Card>
      <CardContent>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="交易对"
              value={params.symbol}
              onChange={(e) => handleParamChange('symbol', e.target.value)}
              placeholder="例如: BTC/USDT"
              required
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>仓位方向</InputLabel>
              <Select
                value={params.side}
                label="仓位方向"
                onChange={(e) => handleParamChange('side', e.target.value as PositionSide)}
              >
                <MenuItem value={PositionSide.LONG}>做多</MenuItem>
                <MenuItem value={PositionSide.SHORT}>做空</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="杠杆倍数"
              type="number"
              value={params.leverage}
              onChange={(e) => {
                const value = e.target.value;
                handleParamChange('leverage', value === '' ? '' : parseFloat(value) || '');
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">x</InputAdornment>,
              }}
              inputProps={{ min: 1, max: 125 }}
              required
              helperText="支持1-125倍杠杆"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="初始开仓价格"
              type="number"
              value={params.initialPrice}
              onChange={(e) => {
                const value = e.target.value;
                handleParamChange('initialPrice', value === '' ? '' : parseFloat(value) || '');
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">USDT</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
              required
              helperText="第一档建仓价格"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="初始仓位大小"
              type="number"
              value={params.initialQuantity}
              onChange={(e) => {
                const value = e.target.value;
                handleParamChange('initialQuantity', value === '' ? '' : parseFloat(value) || '');
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">币</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.001 }}
              required
              helperText="第一档建仓数量"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="初始保证金"
              type="number"
              value={params.initialMargin}
              onChange={(e) => {
                const value = e.target.value;
                handleParamChange('initialMargin', value === '' ? '' : parseFloat(value) || '');
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">USDT</InputAdornment>,
              }}
              inputProps={{ min: 0, step: 0.01 }}
              required
              helperText="第一档所需保证金"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="建仓档位数"
              type="number"
              value={params.pyramidLevels}
              onChange={(e) => {
                const value = e.target.value;
                handleParamChange('pyramidLevels', value === '' ? '' : parseInt(value) || '');
              }}
              inputProps={{ min: 2, max: 10 }}
              required
              helperText="分批建仓的档位数量 (2-10档)"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <FormControl fullWidth required>
              <InputLabel>仓位递增策略</InputLabel>
              <Select
                value={params.strategy}
                label="仓位递增策略"
                onChange={(e) => handleStrategyChange(e.target.value as PyramidStrategy)}
              >
                <MenuItem value={PyramidStrategy.EQUAL_RATIO}>等比递增</MenuItem>
                <MenuItem value={PyramidStrategy.DOUBLE_DOWN}>倍数递增</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="加仓触发间距"
              type="number"
              value={params.priceDropPercent}
              onChange={(e) => {
                const value = e.target.value;
                handleParamChange('priceDropPercent', value === '' ? '' : parseFloat(value) || '');
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              inputProps={{ min: 0.1, max: 50, step: 0.1 }}
              required
              helperText="价格变动多少百分比时触发加仓"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label={isDoubleStrategy ? '委托倍率' : '仓位递增倍数'}
              type="number"
              value={params.ratioMultiplier}
              onChange={(e) => {
                const value = e.target.value;
                handleParamChange('ratioMultiplier', value === '' ? '' : parseFloat(value) || '');
              }}
              InputProps={{
                endAdornment: <InputAdornment position="end">x</InputAdornment>,
              }}
              inputProps={{ min: 1.1, max: 5, step: 0.1 }}
              required
              helperText={isDoubleStrategy ? '倍数递增模式下每档委托相对上一档的倍数（默认为2倍）' : '每档仓位大小的递增倍数'}
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
            计算分批建仓方案
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
