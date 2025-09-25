import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import {
  PositionSide,
  EntryPriceCalculatorParams,
  EntryPriceCalculatorResult,
  calculateEntryPrice,
  formatNumber,
} from '../../utils/contractCalculations';

interface Position {
  id: number;
  price: number;
  quantity: number;      // 成交数量（币）
  quantityUsdt: number;  // 成交数量（U）
  enabled: boolean;      // 是否启用此仓位参与计算
}

export default function EntryPriceCalculator() {
  const [side, setSide] = useState<PositionSide>(PositionSide.LONG);
  const [positions, setPositions] = useState<Position[]>([
    { id: 1, price: 0, quantity: 0, quantityUsdt: 0, enabled: true },
    { id: 2, price: 0, quantity: 0, quantityUsdt: 0, enabled: true },
  ]);
  const [result, setResult] = useState<EntryPriceCalculatorResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 验证输入参数
  const validateParams = (): string[] => {
    const errors: string[] = [];

    const enabledPositions = positions.filter(p => p.enabled);
    const validPositions = enabledPositions.filter(p => p.price > 0 && p.quantity > 0);

    if (enabledPositions.length === 0) {
      errors.push('至少需要启用一个仓位');
    } else if (validPositions.length === 0) {
      errors.push('至少需要输入一个有效的启用仓位（价格和数量都大于0）');
    }

    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      if (pos.enabled && ((pos.price > 0 && pos.quantity <= 0) || (pos.price <= 0 && pos.quantity > 0))) {
        errors.push(`仓位 ${i + 1}: 价格和数量必须同时大于0或同时为空`);
      }
    }

    return errors;
  };

  // 计算平均开仓价格
  const handleCalculate = () => {
    const validationErrors = validateParams();
    setErrors(validationErrors);
    
    if (validationErrors.length === 0) {
      const validPositions = positions.filter(p => p.enabled && p.price > 0 && p.quantity > 0);
      const params: EntryPriceCalculatorParams = {
        positions: validPositions.map(p => ({ price: p.price, quantity: p.quantity }))
      };
      const calculationResult = calculateEntryPrice(params);
      setResult(calculationResult);
    } else {
      setResult(null);
    }
  };

  // 重置表单
  const handleReset = () => {
    setSide(PositionSide.LONG);
    setPositions([
      { id: 1, price: 0, quantity: 0, quantityUsdt: 0, enabled: true },
      { id: 2, price: 0, quantity: 0, quantityUsdt: 0, enabled: true },
    ]);
    setResult(null);
    setErrors([]);
  };

  // 添加仓位
  const addPosition = () => {
    const newId = Math.max(...positions.map(p => p.id)) + 1;
    setPositions([...positions, { id: newId, price: 0, quantity: 0, quantityUsdt: 0, enabled: true }]);
  };

  // 删除仓位
  const removePosition = (id: number) => {
    if (positions.length > 1) {
      setPositions(positions.filter(p => p.id !== id));
    }
  };

  // 更新仓位
  const updatePosition = (id: number, field: 'price' | 'quantity' | 'quantityUsdt' | 'enabled', value: number | boolean) => {
    setPositions(positions.map(p => {
      if (p.id === id) {
        const updatedPosition = { ...p, [field]: value };

        // 自动绑定逻辑：当价格和其中一个数量字段都有值时，自动计算另一个数量字段
        if (field === 'quantity' && typeof value === 'number' && updatedPosition.price > 0) {
          // 当更新币数量时，自动计算USDT数量
          updatedPosition.quantityUsdt = updatedPosition.price * value;
        } else if (field === 'quantityUsdt' && typeof value === 'number' && updatedPosition.price > 0) {
          // 当更新USDT数量时，自动计算币数量
          updatedPosition.quantity = value / updatedPosition.price;
        } else if (field === 'price' && typeof value === 'number' && value > 0) {
          // 当更新价格时，如果币数量有值，重新计算USDT数量
          if (updatedPosition.quantity > 0) {
            updatedPosition.quantityUsdt = value * updatedPosition.quantity;
          } else if (updatedPosition.quantityUsdt > 0) {
            // 如果USDT数量有值，重新计算币数量
            updatedPosition.quantity = updatedPosition.quantityUsdt / value;
          }
        }

        return updatedPosition;
      }
      return p;
    }));
  };

  // 自动计算（当有有效仓位时）
  useEffect(() => {
    const validPositions = positions.filter(p => p.enabled && p.price > 0 && p.quantity > 0);
    if (validPositions.length > 0) {
      const validationErrors = validateParams();
      if (validationErrors.length === 0) {
        const params: EntryPriceCalculatorParams = {
          positions: validPositions.map(p => ({ price: p.price, quantity: p.quantity }))
        };
        const calculationResult = calculateEntryPrice(params);
        setResult(calculationResult);
        setErrors([]);
      }
    }
  }, [positions]);

  return (
    <Grid container spacing={3}>
      {/* 左侧：参数输入 */}
      <Grid item xs={12} md={7}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              仓位信息
            </Typography>

            {/* 仓位方向 */}
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                仓位方向
              </Typography>
              <Box display="flex" gap={1}>
                <Button
                  variant={side === PositionSide.LONG ? 'contained' : 'outlined'}
                  color="success"
                  startIcon={<TrendingUpIcon />}
                  onClick={() => setSide(PositionSide.LONG)}
                  sx={{ flex: 1 }}
                >
                  做多
                </Button>
                <Button
                  variant={side === PositionSide.SHORT ? 'contained' : 'outlined'}
                  color="error"
                  startIcon={<TrendingDownIcon />}
                  onClick={() => setSide(PositionSide.SHORT)}
                  sx={{ flex: 1 }}
                >
                  做空
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 仓位列表 */}
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2">
                  仓位列表
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addPosition}
                >
                  增加仓位
                </Button>
              </Box>

              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>启用</TableCell>
                      <TableCell>序号</TableCell>
                      <TableCell>开仓价格 (USDT)</TableCell>
                      <TableCell>成交数量 (币)</TableCell>
                      <TableCell>成交数量 (U)</TableCell>
                      <TableCell>操作</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {positions.map((position, index) => (
                      <TableRow
                        key={position.id}
                        sx={{
                          opacity: position.enabled ? 1 : 0.5,
                          backgroundColor: position.enabled ? 'inherit' : 'action.hover'
                        }}
                      >
                        <TableCell>
                          <Checkbox
                            checked={position.enabled}
                            onChange={(e) => updatePosition(position.id, 'enabled', e.target.checked)}
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={position.price || ''}
                            onChange={(e) => updatePosition(position.id, 'price', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            disabled={!position.enabled}
                            sx={{
                              width: '100%',
                              '& .MuiInputBase-input': {
                                color: position.enabled ? 'inherit' : 'text.disabled'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={position.quantity || ''}
                            onChange={(e) => updatePosition(position.id, 'quantity', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            disabled={!position.enabled}
                            sx={{
                              width: '100%',
                              '& .MuiInputBase-input': {
                                color: position.enabled ? 'inherit' : 'text.disabled'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <TextField
                            size="small"
                            type="number"
                            value={position.quantityUsdt || ''}
                            onChange={(e) => updatePosition(position.id, 'quantityUsdt', parseFloat(e.target.value) || 0)}
                            placeholder="0.00"
                            disabled={!position.enabled}
                            sx={{
                              width: '100%',
                              '& .MuiInputBase-input': {
                                color: position.enabled ? 'inherit' : 'text.disabled'
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => removePosition(position.id)}
                            disabled={positions.length <= 1}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
                  请输入仓位信息并点击计算
                </Typography>
              </Box>
            ) : (
              <Box>
                {/* 平均开仓价格 */}
                <Box mb={3} p={3} bgcolor="primary.50" borderRadius={1} textAlign="center">
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    平均开仓价格
                  </Typography>
                  <Typography variant="h4" color="primary.main" gutterBottom>
                    {formatNumber(result.averageEntryPrice, 4)} USDT
                  </Typography>
                </Box>

                {/* 汇总信息 */}
                <Grid container spacing={2} mb={3}>
                  <Grid item xs={6}>
                    <Box p={2} bgcolor="grey.50" borderRadius={1} textAlign="center">
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        总数量
                      </Typography>
                      <Typography variant="h6">
                        {formatNumber(result.totalQuantity, 6)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        币
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6}>
                    <Box p={2} bgcolor="grey.50" borderRadius={1} textAlign="center">
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        总价值
                      </Typography>
                      <Typography variant="h6">
                        {formatNumber(result.totalValue, 2)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        USDT
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* 仓位详情 */}
                <Box p={2} bgcolor="grey.50" borderRadius={1}>
                  <Typography variant="subtitle2" gutterBottom>
                    仓位详情
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      仓位方向:
                    </Typography>
                    <Typography variant="body2">
                      {side === PositionSide.LONG ? '做多' : '做空'}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      仓位数量:
                    </Typography>
                    <Typography variant="body2">
                      {positions.filter(p => p.price > 0 && p.quantity > 0).length} 笔
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      价格区间:
                    </Typography>
                    <Typography variant="body2">
                      {(() => {
                        const validPositions = positions.filter(p => p.enabled && p.price > 0 && p.quantity > 0);
                        if (validPositions.length === 0) return '-';
                        const prices = validPositions.map(p => p.price);
                        const minPrice = Math.min(...prices);
                        const maxPrice = Math.max(...prices);
                        return `${formatNumber(minPrice, 4)} - ${formatNumber(maxPrice, 4)} USDT`;
                      })()}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="textSecondary">
                      平均成本:
                    </Typography>
                    <Typography variant="body2">
                      {formatNumber(result.averageEntryPrice, 4)} USDT
                    </Typography>
                  </Box>
                </Box>

                {/* 提示信息 */}
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    平均开仓价格 = 总价值 ÷ 总数量。此计算不考虑手续费和滑点。
                  </Typography>
                </Alert>

                {/* 复选框使用说明 */}
                <Alert severity="success" sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    💡 使用复选框可以临时排除某些仓位的计算，无需删除数据。取消勾选的仓位将不参与平均价格计算。
                  </Typography>
                </Alert>
              </Box>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
