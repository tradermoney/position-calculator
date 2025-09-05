import React, { useState } from 'react';
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
  Divider,
  Alert,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';
import { usePageTitle } from '../utils/titleManager';

// 本地类型定义
enum PositionSide {
  LONG = 'long',
  SHORT = 'short'
}

enum PositionStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  LIQUIDATED = 'liquidated',
  PARTIAL = 'partial'
}

interface Position {
  id: string;
  symbol: string;
  side: PositionSide;
  leverage: number;
  entryPrice: number;
  quantity: number;
  margin: number;
  status: PositionStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface AddPositionParams {
  addPrice: number;
  addQuantity: number;
  addMargin: number;
}

interface AddPositionResult {
  originalPosition: Position;
  addParams: AddPositionParams;
  newAveragePrice: number;
  newTotalQuantity: number;
  newTotalMargin: number;
  newLiquidationPrice: number;
  priceImprovement: number;
  marginIncrease: number;
}

export default function AddPositionCalculator() {
  const { state, updatePosition } = useAppContext();
  const [selectedPositionId, setSelectedPositionId] = useState<string>('');
  const [addParams, setAddParams] = useState<AddPositionParams>({
    addPrice: 0,
    addQuantity: 0,
    addMargin: 0,
  });
  const [result, setResult] = useState<AddPositionResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 设置页面标题
  usePageTitle('add-position');

  // 获取活跃仓位
  const activePositions = state.positions.filter(p => p.status === PositionStatus.ACTIVE);
  const selectedPosition = activePositions.find(p => p.id === selectedPositionId);

  // 计算平均成本价
  const calculateAveragePrice = (
    originalPrice: number,
    originalQuantity: number,
    addPrice: number,
    addQuantity: number
  ): number => {
    const totalValue = originalPrice * originalQuantity + addPrice * addQuantity;
    const totalQuantity = originalQuantity + addQuantity;
    return totalQuantity > 0 ? totalValue / totalQuantity : 0;
  };

  // 计算爆仓价格
  const calculateLiquidationPrice = (
    side: PositionSide,
    leverage: number,
    averagePrice: number,
    totalMargin: number,
    totalQuantity: number
  ): number => {
    if (totalQuantity === 0 || totalMargin === 0) return 0;

    const maintenanceMarginRate = 0.005;

    if (side === PositionSide.LONG) {
      return averagePrice * (1 - 1/leverage + maintenanceMarginRate);
    } else {
      return averagePrice * (1 + 1/leverage - maintenanceMarginRate);
    }
  };

  // 验证补仓参数
  const validateAddParams = (): string[] => {
    const errors: string[] = [];

    if (!selectedPosition) {
      errors.push('请选择要补仓的仓位');
      return errors;
    }

    if (addParams.addPrice <= 0) {
      errors.push('补仓价格必须大于0');
    }

    if (addParams.addQuantity <= 0) {
      errors.push('补仓数量必须大于0');
    }

    if (addParams.addMargin <= 0) {
      errors.push('补仓保证金必须大于0');
    }

    // 验证补仓方向是否合理
    if (selectedPosition && addParams.addPrice > 0) {
      const isReasonableAddPrice = selectedPosition.side === PositionSide.LONG
        ? addParams.addPrice < selectedPosition.entryPrice  // 多头应该在价格下跌时补仓
        : addParams.addPrice > selectedPosition.entryPrice; // 空头应该在价格上涨时补仓

      if (!isReasonableAddPrice) {
        errors.push(
          selectedPosition.side === PositionSide.LONG
            ? '多头建议在价格低于开仓价时补仓'
            : '空头建议在价格高于开仓价时补仓'
        );
      }
    }

    return errors;
  };

  // 计算补仓结果
  const calculateAddPosition = (): void => {
    const validationErrors = validateAddParams();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResult(null);
      return;
    }

    if (!selectedPosition) return;

    setErrors([]);

    const newAveragePrice = calculateAveragePrice(
      selectedPosition.entryPrice,
      selectedPosition.quantity,
      addParams.addPrice,
      addParams.addQuantity
    );

    const newTotalQuantity = selectedPosition.quantity + addParams.addQuantity;
    const newTotalMargin = selectedPosition.margin + addParams.addMargin;

    const newLiquidationPrice = calculateLiquidationPrice(
      selectedPosition.side,
      selectedPosition.leverage,
      newAveragePrice,
      newTotalMargin,
      newTotalQuantity
    );

    const originalLiquidationPrice = calculateLiquidationPrice(
      selectedPosition.side,
      selectedPosition.leverage,
      selectedPosition.entryPrice,
      selectedPosition.margin,
      selectedPosition.quantity
    );

    const priceImprovement = selectedPosition.side === PositionSide.LONG
      ? ((newAveragePrice - selectedPosition.entryPrice) / selectedPosition.entryPrice) * 100
      : ((selectedPosition.entryPrice - newAveragePrice) / selectedPosition.entryPrice) * 100;

    const marginIncrease = ((newTotalMargin - selectedPosition.margin) / selectedPosition.margin) * 100;

    setResult({
      originalPosition: selectedPosition,
      addParams,
      newAveragePrice,
      newTotalQuantity,
      newTotalMargin,
      newLiquidationPrice,
      priceImprovement,
      marginIncrease,
    });
  };

  // 应用补仓方案
  const applyAddPosition = (): void => {
    if (!result || !selectedPosition) return;

    const updatedPosition: Position = {
      ...selectedPosition,
      entryPrice: result.newAveragePrice,
      quantity: result.newTotalQuantity,
      margin: result.newTotalMargin,
      updatedAt: new Date(),
    };

    updatePosition(updatedPosition);

    // 重置表单
    resetForm();

    // 显示成功消息
    alert('补仓方案已应用成功！');
  };

  // 重置表单
  const resetForm = (): void => {
    setSelectedPositionId('');
    setAddParams({
      addPrice: 0,
      addQuantity: 0,
      addMargin: 0,
    });
    setResult(null);
    setErrors([]);
  };

  // 格式化数字
  const formatNumber = (value: number, decimals: number = 4): string => {
    if (isNaN(value) || !isFinite(value)) return '0';
    return value.toFixed(decimals);
  };

  // 格式化百分比
  const formatPercentage = (value: number, decimals: number = 2): string => {
    if (isNaN(value) || !isFinite(value)) return '0.00%';
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(decimals)}%`;
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#fafafa',
        py: 4
      }}
    >
      <Box maxWidth="lg" width="100%">
        <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
          补仓计算器
        </Typography>

        <Typography variant="body1" color="textSecondary" textAlign="center" paragraph>
          选择已有仓位，计算补仓后的成本价和风险变化
        </Typography>

        <Grid container spacing={3}>
          {/* 左侧：补仓参数输入 */}
          <Grid item xs={12} md={6}>
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

                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth required>
                      <InputLabel>选择仓位</InputLabel>
                      <Select
                        value={selectedPositionId}
                        label="选择仓位"
                        onChange={(e) => setSelectedPositionId(e.target.value)}
                      >
                        {activePositions.length === 0 ? (
                          <MenuItem disabled>暂无活跃仓位</MenuItem>
                        ) : (
                          activePositions.map((position) => (
                            <MenuItem key={position.id} value={position.id}>
                              {position.symbol} - {position.side === PositionSide.LONG ? '多头' : '空头'} - {position.leverage}x
                            </MenuItem>
                          ))
                        )}
                      </Select>
                    </FormControl>
                  </Grid>

                  {selectedPosition && (
                    <>
                      <Grid item xs={12}>
                        <Box
                          sx={{
                            p: 2,
                            backgroundColor: 'rgba(0,0,0,0.02)',
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="subtitle2" gutterBottom>
                            当前仓位信息
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="textSecondary">
                                开仓价格
                              </Typography>
                              <Typography variant="body1">
                                ${formatNumber(selectedPosition.entryPrice)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="textSecondary">
                                持有数量
                              </Typography>
                              <Typography variant="body1">
                                {formatNumber(selectedPosition.quantity)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="textSecondary">
                                保证金
                              </Typography>
                              <Typography variant="body1">
                                ${formatNumber(selectedPosition.margin, 2)}
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body2" color="textSecondary">
                                方向
                              </Typography>
                              <Chip
                                label={selectedPosition.side === PositionSide.LONG ? '多头' : '空头'}
                                color={selectedPosition.side === PositionSide.LONG ? 'success' : 'error'}
                                size="small"
                              />
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="补仓价格"
                          type="number"
                          value={addParams.addPrice || ''}
                          onChange={(e) => setAddParams({
                            ...addParams,
                            addPrice: parseFloat(e.target.value) || 0
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
                          onChange={(e) => setAddParams({
                            ...addParams,
                            addQuantity: parseFloat(e.target.value) || 0
                          })}
                          inputProps={{ min: 0, step: 'any' }}
                          required
                          helperText="增加的持有数量"
                        />
                      </Grid>

                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="补仓保证金"
                          type="number"
                          value={addParams.addMargin || ''}
                          onChange={(e) => setAddParams({
                            ...addParams,
                            addMargin: parseFloat(e.target.value) || 0
                          })}
                          InputProps={{
                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                          }}
                          inputProps={{ min: 0, step: 'any' }}
                          required
                          helperText="补仓所需的额外保证金"
                        />
                      </Grid>
                    </>
                  )}
                </Grid>

                <Box mt={3} display="flex" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<CalculateIcon />}
                    onClick={calculateAddPosition}
                    disabled={!selectedPosition}
                    fullWidth
                  >
                    计算补仓结果
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={resetForm}
                  >
                    重置
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 右侧：计算结果显示 */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  补仓计算结果
                </Typography>

                {!result ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    minHeight={200}
                  >
                    <Typography variant="body1" color="textSecondary">
                      请设置补仓参数并点击计算
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {/* 补仓前后对比 */}
                    <Typography variant="subtitle1" gutterBottom>
                      补仓前后对比
                    </Typography>

                    <Grid container spacing={2} mb={3}>
                      <Grid item xs={6}>
                        <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(255,193,7,0.1)', borderRadius: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            补仓前成本价
                          </Typography>
                          <Typography variant="h6">
                            ${formatNumber(result.originalPosition.entryPrice)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(76,175,80,0.1)', borderRadius: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            补仓后成本价
                          </Typography>
                          <Typography variant="h6" color="success.main">
                            ${formatNumber(result.newAveragePrice)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    {/* 详细数据 */}
                    <Typography variant="subtitle1" gutterBottom>
                      详细数据
                    </Typography>

                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          总持有数量
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formatNumber(result.newTotalQuantity)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          总保证金
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          ${formatNumber(result.newTotalMargin, 2)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          新爆仓价格
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          ${formatNumber(result.newLiquidationPrice)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">
                          成本价变化
                        </Typography>
                        <Typography
                          variant="body1"
                          fontWeight={500}
                          color={result.priceImprovement < 0 ? 'success.main' : 'error.main'}
                        >
                          {formatPercentage(result.priceImprovement)}
                        </Typography>
                      </Grid>
                    </Grid>

                    <Box mt={3}>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon />}
                        onClick={applyAddPosition}
                        fullWidth
                        color="success"
                      >
                        应用补仓方案
                      </Button>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
