import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
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
import { PositionSide, formatNumber } from '../../../utils/contractCalculations';
import { MaxPositionFormProps } from './types';

export function FormSection({
  params,
  onParamsChange,
  onCalculate,
  onReset,
  errors,
}: MaxPositionFormProps) {
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

  // 快速设置钱包余额
  const quickSetBalance = (balance: number) => {
    onParamsChange({ ...params, walletBalance: balance });
  };

  // 获取当前价格（模拟）
  const getCurrentPrice = () => {
    // 这里可以集成实时价格API
    onParamsChange({ ...params, entryPrice: 50000 }); // 示例价格
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          交易参数
        </Typography>

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
          <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
            当前杠杆倍数最高可持有头寸：{formatNumber(params.walletBalance * params.leverage, 0)} USDT
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* 开仓价格 */}
        <Box mb={3}>
          <TextField
            fullWidth
            label="开仓价格"
            type="number"
            value={params.entryPrice || ''}
            onChange={(e) => onParamsChange({ ...params, entryPrice: parseFloat(e.target.value) || 0 })}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2">USDT</Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={getCurrentPrice}
                      sx={{ minWidth: 'auto', px: 1 }}
                    >
                      最新
                    </Button>
                  </Box>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* 钱包余额 */}
        <Box mb={3}>
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

          {/* 快速设置余额 */}
          <Box mt={2}>
            <Typography variant="subtitle2" gutterBottom>
              快速设置
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {[100, 500, 1000, 5000, 10000].map((balance) => (
                <Button
                  key={balance}
                  size="small"
                  variant="outlined"
                  onClick={() => quickSetBalance(balance)}
                >
                  {balance >= 1000 ? `${balance / 1000}K` : balance} USDT
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

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
