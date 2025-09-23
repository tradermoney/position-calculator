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
  TargetPriceCalculatorParams,
  TargetPriceCalculatorResult,
  calculateTargetPrice,
  formatNumber,
} from '../../utils/contractCalculations';

export default function TargetPriceCalculator() {
  const [params, setParams] = useState<TargetPriceCalculatorParams>({
    side: PositionSide.LONG,
    entryPrice: 0,
    targetROE: 0,
  });

  const [result, setResult] = useState<TargetPriceCalculatorResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 验证输入参数
  const validateParams = (): string[] => {
    const errors: string[] = [];
    
    if (params.entryPrice <= 0) {
      errors.push('开仓价格必须大于0');
    }
    
    if (params.targetROE === 0) {
      errors.push('目标回报率不能为0');
    }
    
    if (Math.abs(params.targetROE) > 1000) {
      errors.push('目标回报率应在-1000%到1000%之间');
    }
    
    return errors;
  };

  // 计算目标价格
  const handleCalculate = () => {
    const validationErrors = validateParams();
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      const calculationResult = calculateTargetPrice(params);
      setResult(calculationResult);
    } else {
      setResult(null);
    }
  };

  // 重置表单
  const handleReset = () => {
    setParams({
      side: PositionSide.LONG,
      entryPrice: 0,
      targetROE: 0,
    });
    setResult(null);
    setErrors([]);
  };

  // 自动计算（当所有必要参数都有值时）
  useEffect(() => {
    if (params.entryPrice > 0 && params.targetROE !== 0) {
      const validationErrors = validateParams();
      if (validationErrors.length === 0) {
        const calculationResult = calculateTargetPrice(params);
        setResult(calculationResult);
        setErrors([]);
      }
    }
  }, [params]);

  // 快速设置回报率
  const quickSetROE = (roe: number) => {
    setParams({ ...params, targetROE: roe });
  };

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
                onChange={(e) => setParams({ ...params, targetROE: parseFloat(e.target.value) || 0 })}
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
                {/* 目标价格 */}
                <Box mb={3} p={3} bgcolor="grey.50" borderRadius={1} textAlign="center">
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    目标价格
                  </Typography>
                  <Typography variant="h4" color="primary.main" gutterBottom>
                    {formatNumber(result.targetPrice, 4)} USDT
                  </Typography>
                  
                  {/* 价格变化信息 */}
                  <Box mt={2}>
                    <Typography variant="body2" color="textSecondary">
                      从 {formatNumber(params.entryPrice, 4)} USDT 到 {formatNumber(result.targetPrice, 4)} USDT
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={params.targetROE >= 0 ? 'success.main' : 'error.main'}
                    >
                      价格变化: {params.side === PositionSide.LONG 
                        ? (result.targetPrice > params.entryPrice ? '上涨' : '下跌')
                        : (result.targetPrice < params.entryPrice ? '下跌' : '上涨')
                      } {formatNumber(Math.abs(result.targetPrice - params.entryPrice), 4)} USDT
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color={params.targetROE >= 0 ? 'success.main' : 'error.main'}
                    >
                      变化幅度: {formatNumber(Math.abs((result.targetPrice - params.entryPrice) / params.entryPrice * 100), 2)}%
                    </Typography>
                  </Box>
                </Box>

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
                      开仓价格:
                    </Typography>
                    <Typography variant="body2">
                      {formatNumber(params.entryPrice, 4)} USDT
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      目标回报率:
                    </Typography>
                    <Typography 
                      variant="body2"
                      color={params.targetROE >= 0 ? 'success.main' : 'error.main'}
                    >
                      {params.targetROE >= 0 ? '+' : ''}{params.targetROE}%
                    </Typography>
                  </Box>
                </Box>

                {/* 风险提示 */}
                {Math.abs(params.targetROE) > 100 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    高回报率目标意味着高风险，请谨慎设置止盈止损
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
