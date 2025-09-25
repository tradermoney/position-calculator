import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
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
  AccountBalance as AccountBalanceIcon,
} from '@mui/icons-material';
import {
  PositionSide,
  MaxPositionCalculatorParams,
  MaxPositionCalculatorResult,
  calculateMaxPosition,
  formatNumber,
} from '../../utils/contractCalculations';

export default function MaxPositionCalculator() {
  const [params, setParams] = useState<MaxPositionCalculatorParams>({
    side: PositionSide.LONG,
    leverage: 20,
    entryPrice: 0,
    walletBalance: 0,
  });

  const [result, setResult] = useState<MaxPositionCalculatorResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 验证输入参数
  const validateParams = (): string[] => {
    const errors: string[] = [];
    
    if (params.entryPrice <= 0) {
      errors.push('开仓价格必须大于0');
    }
    
    if (params.walletBalance <= 0) {
      errors.push('钱包余额必须大于0');
    }
    
    if (params.leverage <= 0 || params.leverage > 125) {
      errors.push('杠杆倍数必须在1-125之间');
    }
    
    return errors;
  };

  // 计算最大可开仓位
  const handleCalculate = () => {
    const validationErrors = validateParams();
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      const calculationResult = calculateMaxPosition(params);
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
      walletBalance: 0,
    });
    setResult(null);
    setErrors([]);
  };

  // 自动计算（当所有必要参数都有值时）
  useEffect(() => {
    if (params.entryPrice > 0 && params.walletBalance > 0 && params.leverage > 0) {
      const validationErrors = validateParams();
      if (validationErrors.length === 0) {
        const calculationResult = calculateMaxPosition(params);
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

  // 快速设置钱包余额
  const quickSetBalance = (balance: number) => {
    setParams({ ...params, walletBalance: balance });
  };

  // 获取当前价格（模拟）
  const getCurrentPrice = () => {
    // 这里可以集成实时价格API
    setParams({ ...params, entryPrice: 50000 }); // 示例价格
  };

  return (
    <Grid container spacing={3}>
      {/* 左侧：参数输入 */}
      <Grid item xs={12} md={7}>
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
                onChange={(e) => setParams({ ...params, entryPrice: parseFloat(e.target.value) || 0 })}
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
                onChange={(e) => setParams({ ...params, walletBalance: parseFloat(e.target.value) || 0 })}
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
                onClick={handleCalculate}
                fullWidth
              >
                计算
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
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
      </Grid>

      {/* 右侧：计算结果 */}
      <Grid item xs={12} md={5}>
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
                {/* 最大可开数量 */}
                <Box mb={3} p={3} bgcolor="primary.50" borderRadius={1} textAlign="center">
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    最大可开数量
                  </Typography>
                  <Typography variant="h4" color="primary.main" gutterBottom>
                    {formatNumber(result.maxQuantity, 6)} 币
                  </Typography>
                  <Typography variant="h6" color="primary.main">
                    {formatNumber(result.maxPositionValue, 2)} USDT
                  </Typography>
                </Box>

                {/* 详细信息 */}
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={6}>
                    <Box p={2} bgcolor="grey.50" borderRadius={1} textAlign="center">
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        可开数量
                      </Typography>
                      <Typography variant="h6">
                        {formatNumber(result.maxQuantity, 6)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        币
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box p={2} bgcolor="grey.50" borderRadius={1} textAlign="center">
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        可开价值
                      </Typography>
                      <Typography variant="h6">
                        {formatNumber(result.maxPositionValue, 2)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        USDT
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* 交易摘要 */}
                <Box p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    交易摘要
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      仓位方向:
                    </Typography>
                    <Typography variant="body2">
                      {params.side === PositionSide.LONG ? '做多' : '做空'}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      杠杆倍数:
                    </Typography>
                    <Typography variant="body2">
                      {params.leverage}x
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      开仓价格:
                    </Typography>
                    <Typography variant="body2">
                      {formatNumber(params.entryPrice, 4)} USDT
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      钱包余额:
                    </Typography>
                    <Typography variant="body2">
                      {formatNumber(params.walletBalance, 2)} USDT
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      所需保证金:
                    </Typography>
                    <Typography variant="body2">
                      {formatNumber(result.maxPositionValue / params.leverage, 2)} USDT
                    </Typography>
                  </Box>
                </Box>

                {/* 数量限制提醒 */}
                <Alert severity="warning" sx={{ mt: 2 }}>
                  <Typography variant="body2" gutterBottom>
                    <strong>⚠️ 重要提醒：交易所数量限制</strong>
                  </Typography>
                  <Typography variant="body2">
                    • 每个加密货币都有最大可开数量限制，实际可开数量可能小于计算结果
                  </Typography>
                  <Typography variant="body2">
                    • 请在开仓前查看交易所的具体数量限制规则
                  </Typography>
                  <Typography variant="body2">
                    • 建议参考实际能够开仓的数量限制进行交易
                  </Typography>
                </Alert>

                {/* 风险提示 */}
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    在计算最大可开数量时将不考虑您的开仓损失。实际交易中请预留足够的保证金以应对市场波动。
                  </Typography>
                </Alert>

                {/* 高杠杆警告 */}
                {params.leverage > 50 && (
                  <Alert severity="warning" sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      高杠杆交易风险极大，请谨慎操作并设置好止损。
                    </Typography>
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
