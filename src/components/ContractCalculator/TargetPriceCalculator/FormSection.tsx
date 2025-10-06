import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Alert,
  Divider,
  Slider,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { PositionSide } from '../../../utils/contractCalculations';
import { TargetPriceFormProps } from './types';

export function FormSection({
  params,
  onParamsChange,
  onCalculate,
  onReset,
  errors,
}: TargetPriceFormProps) {
  // 快速设置回报率
  const quickSetROE = (roe: number) => {
    onParamsChange({ ...params, targetROE: roe });
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
              marks={[
                { value: 1, label: '1x' },
                { value: 15, label: '15x' },
                { value: 30, label: '30x' },
                { value: 45, label: '45x' },
                { value: 60, label: '60x' },
                { value: 75, label: '75x' },
                { value: 100, label: '100x' },
                { value: 125, label: '125x' },
              ]}
              valueLabelDisplay="auto"
              sx={{ mt: 2 }}
            />
          </Box>
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
              endAdornment: <InputAdornment position="end">USDT</InputAdornment>,
            }}
          />
        </Box>

        {/* 目标回报率 */}
        <Box mb={3}>
          <TextField
            fullWidth
            label="目标回报率"
            type="number"
            value={params.targetROE || ''}
            onChange={(e) => onParamsChange({ ...params, targetROE: parseFloat(e.target.value) || 0 })}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
            helperText="正数表示盈利，负数表示亏损"
          />
        </Box>

        {/* 快速设置回报率 */}
        <Box mb={3}>
          <Typography variant="subtitle2" gutterBottom>
            快速设置
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {[10, 25, 50, 100, 200, -10, -25, -50].map((roe) => (
              <Button
                key={roe}
                size="small"
                variant="outlined"
                onClick={() => quickSetROE(roe)}
                color={roe > 0 ? 'success' : 'error'}
              >
                {roe > 0 ? '+' : ''}{roe}%
              </Button>
            ))}
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
