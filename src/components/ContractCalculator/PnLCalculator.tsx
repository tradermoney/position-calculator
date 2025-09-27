import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  IconButton,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
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
  formatNumber,
  formatPercentage,
} from '../../utils/contractCalculations';

// 仓位类型枚举
enum PositionType {
  OPEN = 'open',
  CLOSE = 'close'
}

// 仓位接口
interface Position {
  id: number;
  type: PositionType;      // 开仓或平仓
  price: number;           // 价格
  quantity: number;        // 成交数量（币）
  quantityUsdt: number;    // 成交数量（U）
  enabled: boolean;        // 是否启用此仓位参与计算
}

// 计算结果接口
interface PnLResult {
  totalPnL: number;        // 总盈亏
  totalInvestment: number; // 总投入资金
  totalReturn: number;     // 总回报
  roe: number;            // 回报率
  openPositions: Position[];  // 开仓仓位
  closePositions: Position[]; // 平仓仓位
}

interface PositionStat {
  holdings: number;        // 累计持仓数量（做空用负数表示）
  averagePrice: number | null; // 当前持仓均价
  cumulativePnL: number;   // 累计盈亏
  isActive: boolean;       // 当前行是否参与计算
}

export default function PnLCalculator() {
  const [side, setSide] = useState<PositionSide>(PositionSide.LONG);
  const [capital, setCapital] = useState<number>(0); // 总资金
  const [positions, setPositions] = useState<Position[]>([
    { id: 1, type: PositionType.OPEN, price: 0, quantity: 0, quantityUsdt: 0, enabled: true },
    { id: 2, type: PositionType.CLOSE, price: 0, quantity: 0, quantityUsdt: 0, enabled: true },
  ]);
  const [result, setResult] = useState<PnLResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 处理输入框的实时输入，保持原始字符串格式
  const [inputValues, setInputValues] = useState<{[key: string]: string}>({});
  const [activeInputKey, setActiveInputKey] = useState<string | null>(null);
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const registerInputRef = useCallback((key: string) => (element: HTMLInputElement | null) => {
    const refs = inputRefs.current;
    if (element) {
      refs.set(key, element);
    } else {
      refs.delete(key);
    }
  }, []);

  const handleInputFocus = useCallback((key: string) => {
    setActiveInputKey(key);
  }, []);

  const handleInputBlur = useCallback((key: string) => {
    setTimeout(() => {
      if (typeof document === 'undefined') {
        return;
      }
      const activeElement = document.activeElement as HTMLElement | null;
      const entry = Array.from(inputRefs.current.entries()).find(([, element]) => element === activeElement);

      if (!activeElement || activeElement === document.body) {
        setActiveInputKey(key);
      } else if (entry) {
        setActiveInputKey(entry[0]);
      } else {
        setActiveInputKey(null);
      }
    }, 0);
  }, []);

  const maintainFocus = useCallback(() => {
    if (!activeInputKey) {
      return;
    }
    if (typeof document === 'undefined') {
      return;
    }
    const target = inputRefs.current.get(activeInputKey);
    if (!target) {
      return;
    }

    const activeElement = document.activeElement;
    if (activeElement === target) {
      return;
    }

    if (!activeElement || activeElement === document.body) {
      target.focus();
      const cursorPosition = target.value.length;
      target.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [activeInputKey]);

  useEffect(() => {
    maintainFocus();
  }, [positions, inputValues, maintainFocus]);

  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 生成唯一ID
  const generateId = () => Date.now() + Math.random();

  // 验证数字输入
  const validateNumberInput = (value: string): number => {
    if (value === '' || value === '.') return 0;
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  // 获取输入框显示值
  const getInputValue = (id: number, field: 'price' | 'quantity' | 'quantityUsdt' | 'capital', fallbackValue: number): string => {
    const key = id === 0 ? `capital` : `${id}-${field}`;
    return inputValues[key] !== undefined ? inputValues[key] : (fallbackValue === 0 ? '' : fallbackValue.toString());
  };

  // 处理输入框变化
  const handleInputChange = (id: number, field: 'price' | 'quantity' | 'quantityUsdt', value: string) => {
    const key = `${id}-${field}`;

    // 验证输入格式
    const numberRegex = /^\d*\.?\d*$/;
    if (value === '' || numberRegex.test(value)) {
      // 更新显示值
      setInputValues(prev => ({ ...prev, [key]: value }));

      // 更新数值
      const numValue = validateNumberInput(value);
      updatePosition(id, field, numValue);
    }
  };

  // 处理资金输入变化
  const handleCapitalChange = (value: string) => {
    const key = 'capital';

    // 验证输入格式
    const numberRegex = /^\d*\.?\d*$/;
    if (value === '' || numberRegex.test(value)) {
      // 更新显示值
      setInputValues(prev => ({ ...prev, [key]: value }));

      // 更新数值
      const numValue = validateNumberInput(value);
      setCapital(numValue);
    }
  };

  // 添加新仓位
  const addPosition = () => {
    const newPosition: Position = {
      id: generateId(),
      type: PositionType.OPEN,
      price: 0,
      quantity: 0,
      quantityUsdt: 0,
      enabled: true
    };
    setPositions(prev => [...prev, newPosition]);
  };

  // 删除仓位
  const removePosition = (id: number) => {
    if (positions.length > 1) {
      setPositions(prev => prev.filter(p => p.id !== id));
    }
  };

  // 在指定位置插入新仓位
  const insertPosition = (index: number, direction: 'above' | 'below') => {
    const newPosition: Position = {
      id: generateId(),
      type: PositionType.OPEN,
      price: 0,
      quantity: 0,
      quantityUsdt: 0,
      enabled: true
    };

    const insertIndex = direction === 'above' ? index : index + 1;
    setPositions(prev => [
      ...prev.slice(0, insertIndex),
      newPosition,
      ...prev.slice(insertIndex)
    ]);
  };

  // 拖拽结束处理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPositions((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // 更新仓位信息
  const updatePosition = (id: number, field: keyof Position, value: any) => {
    setPositions(prev => prev.map(p => {
      if (p.id === id) {
        const updatedPosition = { ...p, [field]: value };

        // 自动绑定逻辑：当价格和其中一个数量字段都有值时，自动计算另一个数量字段
        if (field === 'quantity' && typeof value === 'number' && value > 0 && updatedPosition.price > 0) {
          // 当更新币数量时，自动计算USDT数量
          updatedPosition.quantityUsdt = updatedPosition.price * value;
        } else if (field === 'quantityUsdt' && typeof value === 'number' && value > 0 && updatedPosition.price > 0) {
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

  // 验证输入参数
  const validateParams = (): string[] => {
    const errors: string[] = [];

    const validPositions = positions.filter(p => p.enabled && p.price > 0 && p.quantity > 0);

    if (validPositions.length === 0) {
      errors.push('至少需要一个有效的仓位（价格和数量都大于0）');
      return errors;
    }

    // 验证每个仓位
    validPositions.forEach((position, index) => {
      if (position.price <= 0) {
        errors.push(`第${index + 1}个仓位的价格必须大于0`);
      }
      if (position.quantity <= 0) {
        errors.push(`第${index + 1}个仓位的数量必须大于0`);
      }
    });

    return errors;
  };

  // 计算盈亏
  const calculatePnL = (): PnLResult => {
    const validPositions = positions.filter(p => p.enabled && p.price > 0 && p.quantity > 0);
    const openPositions = validPositions.filter(p => p.type === PositionType.OPEN);
    const closePositions = validPositions.filter(p => p.type === PositionType.CLOSE);

    // 计算开仓总成本和总数量
    const totalOpenCost = openPositions.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const totalOpenQuantity = openPositions.reduce((sum, p) => sum + p.quantity, 0);

    // 计算平仓总收入和总数量
    const totalCloseCost = closePositions.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    const totalCloseQuantity = closePositions.reduce((sum, p) => sum + p.quantity, 0);

    // 计算盈亏
    let totalPnL = 0;
    if (side === PositionSide.LONG) {
      // 做多：平仓收入 - 开仓成本
      totalPnL = totalCloseCost - (totalOpenCost * (totalCloseQuantity / totalOpenQuantity));
    } else {
      // 做空：开仓收入 - 平仓成本
      totalPnL = (totalOpenCost * (totalCloseQuantity / totalOpenQuantity)) - totalCloseCost;
    }

    // 计算回报率
    const totalInvestment = totalOpenCost;
    const roe = totalInvestment > 0 ? (totalPnL / totalInvestment) * 100 : 0;

    return {
      totalPnL,
      totalInvestment,
      totalReturn: totalInvestment + totalPnL,
      roe,
      openPositions,
      closePositions
    };
  };

  // 计算盈亏
  const handleCalculate = () => {
    const validationErrors = validateParams();
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      const calculationResult = calculatePnL();
      setResult(calculationResult);
    } else {
      setResult(null);
    }
  };

  // 重置表单
  const handleReset = () => {
    setSide(PositionSide.LONG);
    setCapital(0);
    setPositions([
      { id: 1, type: PositionType.OPEN, price: 0, quantity: 0, quantityUsdt: 0, enabled: true },
      { id: 2, type: PositionType.CLOSE, price: 0, quantity: 0, quantityUsdt: 0, enabled: true },
    ]);
    setResult(null);
    setErrors([]);
  };

  // 自动计算（当有有效仓位时）
  useEffect(() => {
    const validPositions = positions.filter(p => p.enabled && p.price > 0 && p.quantity > 0);

    if (validPositions.length === 0) {
      setResult(null);
      setErrors([]);
      return;
    }

    const validationErrors = validateParams();
    if (validationErrors.length === 0) {
      const calculationResult = calculatePnL();
      setResult(calculationResult);
      setErrors([]);
    } else {
      setResult(null);
      setErrors(validationErrors);
    }
  }, [positions, side]);

  // 计算仓位使用率
  const calculatePositionUsage = (): number => {
    if (capital <= 0) return 0;
    const totalInvestment = positions
      .filter(p => p.enabled && p.type === PositionType.OPEN && p.price > 0 && p.quantity > 0)
      .reduce((sum, p) => sum + (p.price * p.quantity), 0);
    return (totalInvestment / capital) * 100;
  };

  const positionStats = useMemo(() => {
    let currentQuantity = 0;
    let totalCost = 0;
    let cumulativePnL = 0;
    const stats = new Map<number, PositionStat>();

    const getDisplayQuantity = () => (side === PositionSide.SHORT ? -currentQuantity : currentQuantity);
    const getAveragePrice = () => (currentQuantity > 0 ? totalCost / currentQuantity : null);

    positions.forEach((position) => {
      let isActive = false;

      if (position.enabled && position.price > 0 && position.quantity > 0) {
        isActive = true;

        if (position.type === PositionType.OPEN) {
          totalCost += position.price * position.quantity;
          currentQuantity += position.quantity;
        } else {
          const averagePrice = getAveragePrice() ?? position.price;
          const executableQuantity = Math.min(position.quantity, currentQuantity);

          if (executableQuantity > 0) {
            if (side === PositionSide.LONG) {
              cumulativePnL += (position.price - averagePrice) * executableQuantity;
            } else {
              cumulativePnL += (averagePrice - position.price) * executableQuantity;
            }
            totalCost -= averagePrice * executableQuantity;
            currentQuantity -= executableQuantity;
          }

          const remainingQuantity = position.quantity - executableQuantity;
          if (remainingQuantity > 0) {
            if (side === PositionSide.LONG) {
              cumulativePnL += (position.price - averagePrice) * remainingQuantity;
            } else {
              cumulativePnL += (averagePrice - position.price) * remainingQuantity;
            }
            currentQuantity = 0;
            totalCost = 0;
          }
        }
      }

      stats.set(position.id, {
        holdings: getDisplayQuantity(),
        averagePrice: getAveragePrice(),
        cumulativePnL,
        isActive,
      });
    });

    return stats;
  }, [positions, side]);

  // 可排序的表格行组件
  function SortableTableRow({ position, index, stats }: { position: Position; index: number; stats?: PositionStat }) {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: position.id });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <TableRow ref={setNodeRef} style={style} {...attributes}>
        {/* 拖拽手柄 */}
        <TableCell sx={{ width: 44, textAlign: 'center', whiteSpace: 'nowrap' }}>
          <IconButton size="small" {...listeners}>
            <DragIcon />
          </IconButton>
        </TableCell>

        {/* 启用复选框 */}
        <TableCell sx={{ width: 60, textAlign: 'center', whiteSpace: 'nowrap' }}>
          <Checkbox
            checked={position.enabled}
            onChange={(e) => updatePosition(position.id, 'enabled', e.target.checked)}
          />
        </TableCell>

        {/* 序号 */}
        <TableCell sx={{ width: 56, textAlign: 'center', whiteSpace: 'nowrap' }}>
          {index + 1}
        </TableCell>

        {/* 仓位类型 */}
        <TableCell sx={{ minWidth: 120, whiteSpace: 'nowrap' }}>
          <FormControl fullWidth size="small">
            <Select
              value={position.type}
              onChange={(e) => updatePosition(position.id, 'type', e.target.value)}
            >
              <MenuItem value={PositionType.OPEN}>开仓</MenuItem>
              <MenuItem value={PositionType.CLOSE}>平仓</MenuItem>
            </Select>
          </FormControl>
        </TableCell>

        {/* 价格 */}
        <TableCell sx={{ minWidth: 140, whiteSpace: 'nowrap' }}>
          <TextField
            fullWidth
            size="small"
            type="text"
            value={getInputValue(position.id, 'price', position.price)}
            onChange={(e) => handleInputChange(position.id, 'price', e.target.value)}
            placeholder="0.00"
            inputProps={{
              pattern: '[0-9]*\\.?[0-9]*',
              inputMode: 'decimal'
            }}
            inputRef={registerInputRef(`${position.id}-price`)}
            onFocus={() => handleInputFocus(`${position.id}-price`)}
            onBlur={() => handleInputBlur(`${position.id}-price`)}
          />
        </TableCell>

        {/* 成交数量（币） */}
        <TableCell sx={{ minWidth: 140, whiteSpace: 'nowrap' }}>
          <TextField
            fullWidth
            size="small"
            type="text"
            value={getInputValue(position.id, 'quantity', position.quantity)}
            onChange={(e) => handleInputChange(position.id, 'quantity', e.target.value)}
            placeholder="0.00"
            inputProps={{
              pattern: '[0-9]*\\.?[0-9]*',
              inputMode: 'decimal'
            }}
            inputRef={registerInputRef(`${position.id}-quantity`)}
            onFocus={() => handleInputFocus(`${position.id}-quantity`)}
            onBlur={() => handleInputBlur(`${position.id}-quantity`)}
          />
        </TableCell>

        {/* 成交数量（U） */}
        <TableCell sx={{ minWidth: 140, whiteSpace: 'nowrap' }}>
          <TextField
            fullWidth
            size="small"
            type="text"
            value={getInputValue(position.id, 'quantityUsdt', position.quantityUsdt)}
            onChange={(e) => handleInputChange(position.id, 'quantityUsdt', e.target.value)}
            placeholder="0.00"
            inputProps={{
              pattern: '[0-9]*\\.?[0-9]*',
              inputMode: 'decimal'
            }}
            inputRef={registerInputRef(`${position.id}-quantityUsdt`)}
            onFocus={() => handleInputFocus(`${position.id}-quantityUsdt`)}
            onBlur={() => handleInputBlur(`${position.id}-quantityUsdt`)}
          />
        </TableCell>

        {/* 持仓与成本 */}
        <TableCell sx={{ minWidth: 160, whiteSpace: 'nowrap' }}>
          {stats && stats.isActive ? (
            <Box display="flex" flexDirection="column">
              <Typography variant="body2">{formatNumber(stats.holdings, 4)} 币</Typography>
              <Typography variant="caption" color="textSecondary">
                {stats.averagePrice !== null ? `${formatNumber(stats.averagePrice, 2)} USDT` : '--'}
              </Typography>
            </Box>
          ) : (
            <Typography variant="body2" color="textSecondary">--</Typography>
          )}
        </TableCell>

        {/* 累计盈亏 */}
        <TableCell sx={{ minWidth: 140, whiteSpace: 'nowrap' }}>
          {stats && stats.isActive ? (
            <Typography
              variant="body2"
              color={stats.cumulativePnL >= 0 ? 'success.main' : 'error.main'}
            >
              {stats.cumulativePnL >= 0 ? '+' : ''}{formatNumber(stats.cumulativePnL, 2)} USDT
            </Typography>
          ) : (
            <Typography variant="body2" color="textSecondary">--</Typography>
          )}
        </TableCell>

        {/* 操作按钮 */}
        <TableCell sx={{ minWidth: 120, whiteSpace: 'nowrap' }}>
          <Box display="flex" gap={0.5}>
            <IconButton
              size="small"
              onClick={() => insertPosition(index, 'above')}
              title="在上方插入"
            >
              <ArrowUpIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => insertPosition(index, 'below')}
              title="在下方插入"
            >
              <ArrowDownIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => removePosition(position.id)}
              title="删除"
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
    );
  }

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

            {/* 总资金输入 */}
            <Box mb={3}>
              <Typography variant="subtitle2" gutterBottom>
                总资金（可选）
              </Typography>
          <TextField
            fullWidth
            type="text"
            value={getInputValue(0, 'capital', capital)}
            onChange={(e) => handleCapitalChange(e.target.value)}
            placeholder="输入总资金以计算仓位使用率"
            inputProps={{
              pattern: '[0-9]*\\.?[0-9]*',
              inputMode: 'decimal'
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">USDT</InputAdornment>,
            }}
            inputRef={registerInputRef('capital')}
            onFocus={() => handleInputFocus('capital')}
            onBlur={() => handleInputBlur('capital')}
          />
              {capital > 0 && (
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  仓位使用率: {formatPercentage(calculatePositionUsage(), 2)}%
                </Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 委托单列表 */}
            <Box mb={3}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2">
                  委托单列表
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={addPosition}
                  variant="outlined"
                >
                  增加仓位
                </Button>
              </Box>

              {/* 仓位表格 */}
              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: 400,
                  overflowY: 'auto',
                  overflowX: 'hidden'
                }}
              >
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <Table stickyHeader size="small" sx={{ tableLayout: 'auto' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>拖拽</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>启用</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>序号</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>类型</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>价格 (USDT)</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>数量 (币)</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>数量 (U)</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>持有币 / 币成本价</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>盈亏计算</TableCell>
                        <TableCell sx={{ whiteSpace: 'nowrap' }}>操作</TableCell>
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
                            stats={positionStats.get(position.id)}
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
                fullWidth
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
                  请输入仓位信息，系统将自动计算结果
                </Typography>
              </Box>
            ) : (
              <Box>
                {/* 总盈亏 */}
                <Box mb={3} p={3} bgcolor="primary.50" borderRadius={1} textAlign="center">
                  <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                    总盈亏
                  </Typography>
                  <Typography
                    variant="h4"
                    color={result.totalPnL >= 0 ? 'success.main' : 'error.main'}
                    gutterBottom
                  >
                    {result.totalPnL >= 0 ? '+' : ''}{formatNumber(result.totalPnL, 2)} USDT
                  </Typography>
                </Box>

                {/* 详细信息 */}
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      总投入:
                    </Typography>
                    <Typography variant="body2">
                      {formatNumber(result.totalInvestment, 2)} USDT
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      总回报:
                    </Typography>
                    <Typography variant="body2">
                      {formatNumber(result.totalReturn, 2)} USDT
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      回报率:
                    </Typography>
                    <Typography
                      variant="body2"
                      color={result.roe >= 0 ? 'success.main' : 'error.main'}
                    >
                      {result.roe >= 0 ? '+' : ''}{formatPercentage(result.roe, 2)}%
                    </Typography>
                  </Box>
                </Box>

                {/* 仓位统计 */}
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  仓位统计
                </Typography>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      开仓仓位:
                    </Typography>
                    <Typography variant="body2">
                      {result.openPositions.length} 个
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      平仓仓位:
                    </Typography>
                    <Typography variant="body2">
                      {result.closePositions.length} 个
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      开仓总量:
                    </Typography>
                    <Typography variant="body2">
                      {formatNumber(result.openPositions.reduce((sum, p) => sum + p.quantity, 0), 4)} 币
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="textSecondary">
                      平仓总量:
                    </Typography>
                    <Typography variant="body2">
                      {formatNumber(result.closePositions.reduce((sum, p) => sum + p.quantity, 0), 4)} 币
                    </Typography>
                  </Box>
                </Box>

                {/* 提示信息 */}
                <Alert severity="info" sx={{ mt: 2 }}>
                  <Typography variant="body2">
                    盈亏计算基于开仓和平仓仓位的价格差异。此计算不考虑手续费和滑点。
                  </Typography>
                </Alert>

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
