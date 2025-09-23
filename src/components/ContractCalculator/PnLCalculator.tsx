import React, { useState, useEffect } from 'react';
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
  Chip,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import {
  PositionSide,
  PnLCalculatorParams,
  PnLCalculatorResult,
  calculatePnL,
  formatNumber,
  formatPercentage,
} from '../../utils/contractCalculations';

export default function PnLCalculator() {
  const [params, setParams] = useState<PnLCalculatorParams>({
    side: PositionSide.LONG,
    leverage: 20,
    entryPrice: 0,
    exitPrice: 0,
    quantity: 0,
  });

  const [result, setResult] = useState<PnLCalculatorResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 验证输入参数
  const validateParams = (): string[] => {
    const errors: string[] = [];
    
    if (params.entryPrice <= 0) {
      errors.push('开仓价格必须大于0');
    }
    
    if (params.exitPrice <= 0) {
      errors.push('平仓价格必须大于0');
    }
    
    if (params.quantity <= 0) {
      errors.push('成交数量必须大于0');
    }
    
    if (params.leverage <= 0 || params.leverage > 125) {
      errors.push('杠杆倍数必须在1-125之间');
    }
    
    return errors;
  };

  // 计算盈亏
  const handleCalculate = () => {
    const validationErrors = validateParams();
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      const calculationResult = calculatePnL(params);
      setResult(calculationResult);
    } else {
      setResult(null);
    }
  };

  // 重置表单
  const handleReset = () => {
    setParams({
      side: PositionSide.LONG,
      leverage: 20,
      entryPrice: 0,
      exitPrice: 0,
      quantity: 0,
    });
    setResult(null);
    setErrors([]);
  };

  // 自动计算（当所有必要参数都有值时）
  useEffect(() => {
    if (params.entryPrice > 0 && params.exitPrice > 0 && params.quantity > 0 && params.leverage > 0) {
      const validationErrors = validateParams();
      if (validationErrors.length === 0) {
        const calculationResult = calculatePnL(params);
        setResult(calculationResult);
        setErrors([]);
      }
    }
  }, [params]);

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
    <Grid container spacing={3}>
      {/* 左侧：参数输入 */}
      <Grid item xs={12} md={6}>
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
                  onClick={() => setParams({ ...params, side: PositionSide.LONG })}
                  sx={{ flex: 1 }}
                >
                  做多
                </Button>
                <Button
                  variant={params.side === PositionSide.SHORT ? 'contained' : 'outlined'}
                  color="error"
                  startIcon={<TrendingDownIcon />}
                  onClick={() => setParams({ ...params, side: PositionSide.SHORT })}
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
                  onChange={(_, value) => setParams({ ...params, leverage: value as number })}
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
                  onChange={(e) => setParams({ ...params, entryPrice: parseFloat(e.target.value) || 0 })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">USDT</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="平仓价格"
                  type="number"
                  value={params.exitPrice || ''}
                  onChange={(e) => setParams({ ...params, exitPrice: parseFloat(e.target.value) || 0 })}
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
                  onChange={(e) => setParams({ ...params, quantity: parseFloat(e.target.value) || 0 })}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">币</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>

            {/* 操作按钮 */}
            <Box mt={3} display="flex" gap={2}>
              <Button
                variant="contained"
                startIcon={<CalculateIcon />}
                onClick={handleCalculate}
                fullWidth
              >
                计算
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
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
      </Grid>

      {/* 右侧：计算结果 */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              计算结果
            </Typography>

            {!result ? (
              <Box
                display="flex"
                alignItems="center"
                justifyContent="center"
                minHeight={200}
              >
                <Typography variant="body1" color="textSecondary">
                  请输入交易参数并点击计算
                </Typography>
              </Box>
            ) : (
              <Box>
                {/* 起始保证金 */}
                <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="subtitle2" color="textSecondary">
                    起始保证金
                  </Typography>
                  <Typography variant="h6">
                    {formatNumber(result.initialMargin, 2)} USDT
                  </Typography>
                </Box>

                {/* 盈亏 */}
                <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="subtitle2" color="textSecondary">
                    盈亏
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color={result.pnl >= 0 ? 'success.main' : 'error.main'}
                  >
                    {result.pnl >= 0 ? '+' : ''}{formatNumber(result.pnl, 2)} USDT
                  </Typography>
                </Box>

                {/* 回报率 */}
                <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="subtitle2" color="textSecondary">
                    回报率
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color={result.roe >= 0 ? 'success.main' : 'error.main'}
                  >
                    {result.roe >= 0 ? '+' : ''}{formatPercentage(result.roe, 2)}%
                  </Typography>
                </Box>

                {/* 仓位价值 */}
                <Box p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="subtitle2" color="textSecondary">
                    仓位价值
                  </Typography>
                  <Typography variant="h6">
                    {formatNumber(result.positionValue, 2)} USDT
                  </Typography>
                </Box>

                {/* 风险提示 */}
                {Math.abs(result.roe) > 100 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    高回报率意味着高风险，请谨慎交易
                  </Alert>
                )}
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
