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
  Checkbox,
  FormControlLabel,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import {
  PositionSide,
  PnLCalculatorParams,
  PnLCalculatorResult,
  ExitOrder,
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
    quantityUsdt: 0,  // 新增USDT数量字段
    exitOrders: []
  });

  const [result, setResult] = useState<PnLCalculatorResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [useMultipleExits, setUseMultipleExits] = useState<boolean>(false);

  // 生成唯一ID
  const generateId = () => `exit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 添加新的平仓委托单
  const addExitOrder = () => {
    const newOrder: ExitOrder = {
      id: generateId(),
      price: 0,
      quantity: 0,
      enabled: true
    };
    setParams(prev => ({
      ...prev,
      exitOrders: [...(prev.exitOrders || []), newOrder]
    }));
  };

  // 删除平仓委托单
  const removeExitOrder = (id: string) => {
    setParams(prev => ({
      ...prev,
      exitOrders: (prev.exitOrders || []).filter(order => order.id !== id)
    }));
  };

  // 更新平仓委托单
  const updateExitOrder = (id: string, updates: Partial<ExitOrder>) => {
    setParams(prev => ({
      ...prev,
      exitOrders: (prev.exitOrders || []).map(order =>
        order.id === id ? { ...order, ...updates } : order
      )
    }));
  };

  // 更新开仓数量（支持自动绑定）
  const updateQuantity = (field: 'quantity' | 'quantityUsdt', value: number) => {
    setParams(prev => {
      const updatedParams = { ...prev, [field]: value };

      // 自动绑定逻辑：当价格和其中一个数量字段都有值时，自动计算另一个数量字段
      if (field === 'quantity' && value > 0 && prev.entryPrice > 0) {
        updatedParams.quantityUsdt = prev.entryPrice * value;
      } else if (field === 'quantityUsdt' && value > 0 && prev.entryPrice > 0) {
        updatedParams.quantity = value / prev.entryPrice;
      }

      return updatedParams;
    });
  };

  // 更新开仓价格（支持自动绑定）
  const updateEntryPrice = (value: number) => {
    setParams(prev => {
      const updatedParams = { ...prev, entryPrice: value };

      // 当价格变化时，根据已有的数量字段自动重新计算另一个数量字段
      if (value > 0) {
        if (prev.quantity > 0) {
          updatedParams.quantityUsdt = value * prev.quantity;
        } else if (prev.quantityUsdt > 0) {
          updatedParams.quantity = prev.quantityUsdt / value;
        }
      }

      return updatedParams;
    });
  };

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

    if (useMultipleExits) {
      // 验证多个平仓委托单
      const exitOrders = params.exitOrders || [];
      const enabledOrders = exitOrders.filter(order => order.enabled);

      if (enabledOrders.length === 0) {
        errors.push('至少需要启用一个平仓委托单');
      }

      let totalExitQuantity = 0;
      enabledOrders.forEach((order, index) => {
        if (order.price <= 0) {
          errors.push(`第${index + 1}个委托单的平仓价格必须大于0`);
        }
        if (order.quantity <= 0) {
          errors.push(`第${index + 1}个委托单的数量必须大于0`);
        }
        totalExitQuantity += order.quantity;
      });

      if (totalExitQuantity > params.quantity) {
        errors.push('平仓委托单的总数量不能超过持仓数量');
      }
    } else {
      // 验证单一平仓价格
      if (params.exitPrice <= 0) {
        errors.push('平仓价格必须大于0');
      }
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
      quantityUsdt: 0,
      exitOrders: []
    });
    setResult(null);
    setErrors([]);
    setUseMultipleExits(false);
  };

  // 自动计算（当所有必要参数都有值时）
  useEffect(() => {
    const hasBasicParams = params.entryPrice > 0 && params.quantity > 0 && params.leverage > 0;

    if (!hasBasicParams) {
      setResult(null);
      setErrors([]);
      return;
    }

    let canCalculate = false;

    if (useMultipleExits) {
      // 多次平仓模式：检查是否有启用的委托单且参数有效
      const exitOrders = params.exitOrders || [];
      const enabledOrders = exitOrders.filter(order => order.enabled && order.price > 0 && order.quantity > 0);
      canCalculate = enabledOrders.length > 0;
    } else {
      // 单次平仓模式：检查平仓价格
      canCalculate = params.exitPrice > 0;
    }

    if (canCalculate) {
      const validationErrors = validateParams();
      if (validationErrors.length === 0) {
        const calculationResult = calculatePnL(params);
        setResult(calculationResult);
        setErrors([]);
      } else {
        setResult(null);
        setErrors(validationErrors);
      }
    } else {
      setResult(null);
      setErrors([]);
    }
  }, [params, useMultipleExits]);

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
                  onChange={(e) => updateEntryPrice(parseFloat(e.target.value) || 0)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">USDT</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="成交数量 (币)"
                  type="number"
                  value={params.quantity || ''}
                  onChange={(e) => updateQuantity('quantity', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">币</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="成交数量 (U)"
                  type="number"
                  value={params.quantityUsdt || ''}
                  onChange={(e) => updateQuantity('quantityUsdt', parseFloat(e.target.value) || 0)}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">USDT</InputAdornment>,
                  }}
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* 平仓模式选择 */}
            <Box mb={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={useMultipleExits}
                    onChange={(e) => setUseMultipleExits(e.target.checked)}
                  />
                }
                label="使用多次分批平仓"
              />
            </Box>

            {/* 单次平仓模式 */}
            {!useMultipleExits && (
              <Grid container spacing={2}>
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
              </Grid>
            )}

            {/* 多次平仓模式 */}
            {useMultipleExits && (
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2">
                    平仓委托单
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={addExitOrder}
                    variant="outlined"
                  >
                    添加委托单
                  </Button>
                </Box>

                {/* 平仓委托单列表 */}
                {(params.exitOrders || []).map((order, index) => (
                  <Accordion key={order.id} defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box display="flex" alignItems="center" width="100%">
                        <Checkbox
                          checked={order.enabled}
                          onChange={(e) => updateExitOrder(order.id, { enabled: e.target.checked })}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Typography sx={{ ml: 1 }}>
                          委托单 #{index + 1}
                        </Typography>
                        {order.price > 0 && order.quantity > 0 && (
                          <Chip
                            size="small"
                            label={`${formatNumber(order.price, 2)} USDT × ${formatNumber(order.quantity, 4)}`}
                            sx={{ ml: 'auto', mr: 1 }}
                          />
                        )}
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={5}>
                          <TextField
                            fullWidth
                            label="平仓价格"
                            type="number"
                            size="small"
                            value={order.price || ''}
                            onChange={(e) => updateExitOrder(order.id, { price: parseFloat(e.target.value) || 0 })}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">USDT</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid item xs={5}>
                          <TextField
                            fullWidth
                            label="平仓数量"
                            type="number"
                            size="small"
                            value={order.quantity || ''}
                            onChange={(e) => updateExitOrder(order.id, { quantity: parseFloat(e.target.value) || 0 })}
                            InputProps={{
                              endAdornment: <InputAdornment position="end">币</InputAdornment>,
                            }}
                          />
                        </Grid>
                        <Grid item xs={2}>
                          <Box display="flex" justifyContent="center">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => removeExitOrder(order.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                ))}

                {/* 如果没有委托单，显示提示 */}
                {(!params.exitOrders || params.exitOrders.length === 0) && (
                  <Box
                    p={3}
                    textAlign="center"
                    bgcolor="grey.50"
                    borderRadius={1}
                    border="1px dashed"
                    borderColor="grey.300"
                  >
                    <Typography variant="body2" color="textSecondary">
                      点击"添加委托单"开始设置分批平仓计划
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

            {/* 操作按钮 */}
            <Box mt={3} display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleReset}
                fullWidth
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
                  请输入交易参数，系统将自动计算结果
                </Typography>
              </Box>
            ) : (
              <Box>
                {/* 总体结果 */}
                <Typography variant="h6" gutterBottom>
                  总体结果
                </Typography>

                {/* 起始保证金 */}
                <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="subtitle2" color="textSecondary">
                    起始保证金
                  </Typography>
                  <Typography variant="h6">
                    {formatNumber(result.initialMargin, 2)} USDT
                  </Typography>
                </Box>

                {/* 总盈亏 */}
                <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="subtitle2" color="textSecondary">
                    总盈亏
                  </Typography>
                  <Typography
                    variant="h6"
                    color={result.pnl >= 0 ? 'success.main' : 'error.main'}
                  >
                    {result.pnl >= 0 ? '+' : ''}{formatNumber(result.pnl, 2)} USDT
                  </Typography>
                </Box>

                {/* 总回报率 */}
                <Box mb={2} p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="subtitle2" color="textSecondary">
                    总回报率
                  </Typography>
                  <Typography
                    variant="h6"
                    color={result.roe >= 0 ? 'success.main' : 'error.main'}
                  >
                    {result.roe >= 0 ? '+' : ''}{formatPercentage(result.roe, 2)}%
                  </Typography>
                </Box>

                {/* 仓位信息 */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Box p={2} bgcolor="grey.50" borderRadius={1}>
                      <Typography variant="subtitle2" color="textSecondary">
                        仓位价值
                      </Typography>
                      <Typography variant="body1">
                        {formatNumber(result.positionValue, 2)} USDT
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box p={2} bgcolor="grey.50" borderRadius={1}>
                      <Typography variant="subtitle2" color="textSecondary">
                        剩余持仓
                      </Typography>
                      <Typography variant="body1">
                        {formatNumber(result.remainingQuantity, 4)} 币
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* 多次平仓详细结果 */}
                {result.exitOrderResults && result.exitOrderResults.length > 0 && (
                  <Box mt={3}>
                    <Divider sx={{ mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      分批平仓详情
                    </Typography>

                    {result.exitOrderResults.map((orderResult, index) => (
                      <Box key={orderResult.id} mb={2} p={2} border="1px solid" borderColor="grey.300" borderRadius={1}>
                        <Typography variant="subtitle2" gutterBottom>
                          委托单 #{index + 1}
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              平仓价格
                            </Typography>
                            <Typography variant="body1">
                              {formatNumber(orderResult.price, 2)} USDT
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              平仓数量
                            </Typography>
                            <Typography variant="body1">
                              {formatNumber(orderResult.quantity, 4)} 币
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              单笔盈亏
                            </Typography>
                            <Typography
                              variant="body1"
                              color={orderResult.pnl >= 0 ? 'success.main' : 'error.main'}
                            >
                              {orderResult.pnl >= 0 ? '+' : ''}{formatNumber(orderResult.pnl, 2)} USDT
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2" color="textSecondary">
                              单笔回报率
                            </Typography>
                            <Typography
                              variant="body1"
                              color={orderResult.roe >= 0 ? 'success.main' : 'error.main'}
                            >
                              {orderResult.roe >= 0 ? '+' : ''}{formatPercentage(orderResult.roe, 2)}%
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Box>
                )}

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
