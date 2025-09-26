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
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [positions, setPositions] = useState<Position[]>([
    { id: 1, price: 0, quantity: 0, quantityUsdt: 0, enabled: true },
    { id: 2, price: 0, quantity: 0, quantityUsdt: 0, enabled: true },
  ]);
  const [result, setResult] = useState<EntryPriceCalculatorResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 计算相对于当前价格的波动率
  const calculateVolatilityFromCurrent = (positionPrice: number): string => {
    if (!currentPrice || currentPrice <= 0 || positionPrice <= 0) {
      return '-';
    }
    const volatility = ((positionPrice - currentPrice) / currentPrice) * 100;
    return `${volatility >= 0 ? '+' : ''}${volatility.toFixed(2)}%`;
  };

  // 计算相对于上一个仓位的波动率
  const calculateVolatilityFromPrevious = (currentIndex: number): string => {
    if (currentIndex === 0) {
      return '-'; // 第一个仓位没有上一个仓位
    }
    const currentPosition = positions[currentIndex];
    const previousPosition = positions[currentIndex - 1];

    if (!currentPosition.price || currentPosition.price <= 0 ||
        !previousPosition.price || previousPosition.price <= 0) {
      return '-';
    }

    const volatility = ((currentPosition.price - previousPosition.price) / previousPosition.price) * 100;
    return `${volatility >= 0 ? '+' : ''}${volatility.toFixed(2)}%`;
  };

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
    setCurrentPrice(0);
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

  // 在指定位置插入仓位
  const insertPosition = (index: number, direction: 'above' | 'below') => {
    const newId = Math.max(...positions.map(p => p.id)) + 1;
    const newPosition = { id: newId, price: 0, quantity: 0, quantityUsdt: 0, enabled: true };
    const insertIndex = direction === 'above' ? index : index + 1;
    const newPositions = [...positions];
    newPositions.splice(insertIndex, 0, newPosition);
    setPositions(newPositions);
  };

  // 删除仓位
  const removePosition = (id: number) => {
    if (positions.length > 1) {
      setPositions(positions.filter(p => p.id !== id));
    }
  };

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setPositions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
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

  // 可拖拽的表格行组件
  const SortableTableRow = ({ position, index }: { position: Position; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
    } = useSortable({ id: position.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
    };

    return (
      <TableRow
        ref={setNodeRef}
        style={style}
        sx={{
          opacity: position.enabled ? 1 : 0.5,
          backgroundColor: position.enabled ? 'inherit' : 'action.hover'
        }}
      >
        <TableCell sx={{ width: '60px' }}>
          <Box display="flex" alignItems="center" gap={0.5}>
            <IconButton size="small" {...attributes} {...listeners}>
              <DragIcon fontSize="small" />
            </IconButton>
          </Box>
        </TableCell>
        <TableCell>
          <Checkbox
            checked={position.enabled}
            onChange={(e) => updatePosition(position.id, 'enabled', e.target.checked)}
            color="primary"
            size="small"
          />
        </TableCell>
        <TableCell sx={{ width: '80px', textAlign: 'center', fontWeight: 'bold' }}>
          {index + 1}
        </TableCell>
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
        <TableCell sx={{ textAlign: 'center', minWidth: '100px' }}>
          <Typography variant="body2" color={
            calculateVolatilityFromCurrent(position.price) === '-' ? 'text.secondary' :
            calculateVolatilityFromCurrent(position.price).startsWith('+') ? 'success.main' : 'error.main'
          }>
            {calculateVolatilityFromCurrent(position.price)}
          </Typography>
        </TableCell>
        <TableCell sx={{ textAlign: 'center', minWidth: '100px' }}>
          <Typography variant="body2" color={
            calculateVolatilityFromPrevious(index) === '-' ? 'text.secondary' :
            calculateVolatilityFromPrevious(index).startsWith('+') ? 'success.main' : 'error.main'
          }>
            {calculateVolatilityFromPrevious(index)}
          </Typography>
        </TableCell>
        <TableCell>
          <Box display="flex" gap={0.5}>
            <IconButton
              size="small"
              onClick={() => insertPosition(index, 'above')}
              title="在上方插入"
            >
              <ArrowUpIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => insertPosition(index, 'below')}
              title="在下方插入"
            >
              <ArrowDownIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => removePosition(position.id)}
              disabled={positions.length <= 1}
              title="删除"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Grid container spacing={3}>
      {/* 左侧：参数输入 */}
      <Grid item xs={12} md={9}>
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

            {/* 当前价格 */}
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                当前价格（可选）
              </Typography>
              <TextField
                size="small"
                type="number"
                value={currentPrice || ''}
                onChange={(e) => setCurrentPrice(parseFloat(e.target.value) || 0)}
                placeholder="输入当前价格以计算波动率"
                fullWidth
                InputProps={{
                  endAdornment: <InputAdornment position="end">USDT</InputAdornment>,
                }}
                helperText="输入当前价格后，将显示每个仓位相对于当前价格的波动率"
              />
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

              <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <Table size="small" sx={{ minWidth: 1000 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '60px' }}>拖拽</TableCell>
                        <TableCell sx={{ width: '60px' }}>启用</TableCell>
                        <TableCell sx={{ width: '80px', textAlign: 'center' }}>
                          <Box sx={{ whiteSpace: 'nowrap' }}>序号</Box>
                        </TableCell>
                        <TableCell>开仓价格 (USDT)</TableCell>
                        <TableCell>成交数量 (币)</TableCell>
                        <TableCell>成交数量 (U)</TableCell>
                        <TableCell sx={{ textAlign: 'center', minWidth: '120px' }}>
                          <Box sx={{ whiteSpace: 'nowrap' }}>相对于当前价格波动率</Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center', minWidth: '120px' }}>
                          <Box sx={{ whiteSpace: 'nowrap' }}>相对于上一个仓位波动率</Box>
                        </TableCell>
                        <TableCell sx={{ width: '140px' }}>操作</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <SortableContext
                        items={positions.map(p => p.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {positions.map((position, index) => (
                          <SortableTableRow
                            key={position.id}
                            position={position}
                            index={index}
                          />
                        ))}
                      </SortableContext>
                    </TableBody>
                  </Table>
                </DndContext>
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
      <Grid item xs={12} md={3}>
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
