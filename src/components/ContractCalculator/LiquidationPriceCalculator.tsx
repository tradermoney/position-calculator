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
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import {
  PositionSide,
  MarginMode,
  PositionMode,
  LiquidationPriceCalculatorParams,
  LiquidationPriceCalculatorResult,
  calculateLiquidationPrice,
  formatNumber,
} from '../../utils/contractCalculations';

export default function LiquidationPriceCalculator() {
  const [params, setParams] = useState<LiquidationPriceCalculatorParams>({
    side: PositionSide.LONG,
    marginMode: MarginMode.CROSS,
    positionMode: PositionMode.ONE_WAY,
    leverage: 20,
    entryPrice: 0,
    quantity: 0,
    walletBalance: 0,
    maintenanceMarginRate: 0.004, // 0.4%
  });

  const [result, setResult] = useState<LiquidationPriceCalculatorResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 验证输入参数
  const validateParams = (): string[] => {
    const errors: string[] = [];
    
    if (params.entryPrice <= 0) {
      errors.push('开仓价格必须大于0');
    }
    
    if (params.quantity <= 0) {
      errors.push('成交数量必须大于0');
    }
    
    if (params.leverage <= 0 || params.leverage > 125) {
      errors.push('杠杆倍数必须在1-125之间');
    }
    
    if (params.walletBalance < 0) {
      errors.push('钱包余额不能为负数');
    }
    
    return errors;
  };

  // 计算强平价格
  const handleCalculate = () => {
    const validationErrors = validateParams();
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      const calculationResult = calculateLiquidationPrice(params);
      setResult(calculationResult);
    } else {
      setResult(null);
    }
  };

  // 重置表单
  const handleReset = () => {
    setParams({
      side: PositionSide.LONG,
      marginMode: MarginMode.CROSS,
      positionMode: PositionMode.ONE_WAY,
      leverage: 20,
      entryPrice: 0,
      quantity: 0,
      walletBalance: 0,
      maintenanceMarginRate: 0.004,
    });
    setResult(null);
    setErrors([]);
  };

  // 自动计算（当所有必要参数都有值时）
  useEffect(() => {
    if (params.entryPrice > 0 && params.quantity > 0 && params.leverage > 0 && params.walletBalance >= 0) {
      const validationErrors = validateParams();
      if (validationErrors.length === 0) {
        const calculationResult = calculateLiquidationPrice(params);
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

  // 计算风险距离
  const getRiskDistance = (): number => {
    if (!result || params.entryPrice <= 0) return 0;
    return Math.abs((result.liquidationPrice - params.entryPrice) / params.entryPrice * 100);
  };

  const riskDistance = getRiskDistance();

  return (
    <Grid container spacing={3}>
      {/* 左侧：参数输入 */}
      <Grid item xs={12} md={6}>
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
                    onChange={(e) => setParams({ ...params, marginMode: e.target.value as MarginMode })}
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
                    onChange={(e) => setParams({ ...params, positionMode: e.target.value as PositionMode })}
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
                  label="成交数量"
                  type="number"
                  value={params.quantity || ''}
                  onChange={(e) => setParams({ ...params, quantity: parseFloat(e.target.value) || 0 })}
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
                  onChange={(e) => setParams({ ...params, walletBalance: parseFloat(e.target.value) || 0 })}
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
                {/* 强平价格 */}
                <Box mb={3} p={3} bgcolor="error.50" borderRadius={1} textAlign="center">
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    强平价格
                  </Typography>
                  <Typography variant="h4" color="error.main" gutterBottom>
                    {formatNumber(result.liquidationPrice, 4)} USDT
                  </Typography>
                  
                  {/* 风险距离 */}
                  <Box mt={2}>
                    <Typography variant="body2" color="textSecondary">
                      距离当前价格: {formatNumber(riskDistance, 2)}%
                    </Typography>
                    {riskDistance < 10 && (
                      <Box display="flex" alignItems="center" justifyContent="center" mt={1}>
                        <WarningIcon color="error" fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="error.main">
                          高风险：距离强平价格过近
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>

                {/* 交易摘要 */}
                <Box p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    交易摘要
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      保证金模式:
                    </Typography>
                    <Typography variant="body2">
                      {params.marginMode === MarginMode.CROSS ? '全仓' : '逐仓'}
                    </Typography>
                  </Box>
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
                      仓位价值:
                    </Typography>
                    <Typography variant="body2">
                      {formatNumber(params.entryPrice * params.quantity, 2)} USDT
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      起始保证金:
                    </Typography>
                    <Typography variant="body2">
                      {formatNumber((params.entryPrice * params.quantity) / params.leverage, 2)} USDT
                    </Typography>
                  </Box>
                </Box>

                {/* 风险提示 */}
                <Alert severity="warning" sx={{ mt: 2 }}>
                  强平价格的计算考虑了您现有的持仓，持有仓位的未实现盈亏和占用保证金将影响强平价格计算。
                </Alert>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
