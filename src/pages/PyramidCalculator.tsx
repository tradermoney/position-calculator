import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  InputAdornment,
  Chip,
  Divider,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Timeline as TimelineIcon,
} from '@mui/icons-material';
import { usePageTitle } from '../utils/titleManager';

// 本地类型定义
enum PositionSide {
  LONG = 'long',
  SHORT = 'short'
}

enum PyramidStrategy {
  EQUAL_RATIO = 'equal_ratio',    // 等比加仓
  DOUBLE_DOWN = 'double_down'     // 加倍加仓
}

interface PyramidParams {
  symbol: string;
  side: PositionSide;
  leverage: number | '';
  initialPrice: number | '';
  initialQuantity: number | '';
  initialMargin: number | '';
  pyramidLevels: number | '';
  strategy: PyramidStrategy;
  priceDropPercent: number | '';  // 每次加仓的价格下跌百分比
  ratioMultiplier: number | '';   // 等比加仓的倍数
}

interface PyramidLevel {
  level: number;
  price: number;
  quantity: number;
  margin: number;
  cumulativeQuantity: number;
  cumulativeMargin: number;
  averagePrice: number;
  liquidationPrice: number;
  priceDropFromPrevious: number;
}

interface PyramidResult {
  params: PyramidParams;
  levels: PyramidLevel[];
  totalQuantity: number;
  totalMargin: number;
  finalAveragePrice: number;
  finalLiquidationPrice: number;
  maxDrawdown: number;
}

export default function PyramidCalculator() {
  const [params, setParams] = useState<PyramidParams>({
    symbol: 'BTC/USDT',
    side: PositionSide.LONG,
    leverage: 10,
    initialPrice: 50000,
    initialQuantity: 1,
    initialMargin: 5000,
    pyramidLevels: 5,
    strategy: PyramidStrategy.EQUAL_RATIO,
    priceDropPercent: 5,
    ratioMultiplier: 1.5,
  });

  const [result, setResult] = useState<PyramidResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 设置页面标题
  usePageTitle('pyramid');

  // 计算爆仓价格
  const calculateLiquidationPrice = (
    side: PositionSide,
    leverage: number,
    averagePrice: number
  ): number => {
    const maintenanceMarginRate = 0.005;

    if (side === PositionSide.LONG) {
      return averagePrice * (1 - 1/leverage + maintenanceMarginRate);
    } else {
      return averagePrice * (1 + 1/leverage - maintenanceMarginRate);
    }
  };

  // 验证参数
  const validateParams = (): string[] => {
    const errors: string[] = [];

    if (!params.symbol || params.symbol.trim() === '') {
      errors.push('请输入交易对符号');
    }

    const leverage = typeof params.leverage === 'number' ? params.leverage : parseFloat(params.leverage as string);
    if (isNaN(leverage) || leverage <= 0 || leverage > 125) {
      errors.push('杠杆倍率必须在1-125倍之间');
    }

    const initialPrice = typeof params.initialPrice === 'number' ? params.initialPrice : parseFloat(params.initialPrice as string);
    if (isNaN(initialPrice) || initialPrice <= 0) {
      errors.push('首次开仓价格必须大于0');
    }

    const initialQuantity = typeof params.initialQuantity === 'number' ? params.initialQuantity : parseFloat(params.initialQuantity as string);
    if (isNaN(initialQuantity) || initialQuantity <= 0) {
      errors.push('首次仓位大小必须大于0');
    }

    const initialMargin = typeof params.initialMargin === 'number' ? params.initialMargin : parseFloat(params.initialMargin as string);
    if (isNaN(initialMargin) || initialMargin <= 0) {
      errors.push('首次保证金必须大于0');
    }

    const pyramidLevels = typeof params.pyramidLevels === 'number' ? params.pyramidLevels : parseInt(params.pyramidLevels as string);
    if (isNaN(pyramidLevels) || pyramidLevels < 2 || pyramidLevels > 10) {
      errors.push('建仓档位数必须在2-10档之间');
    }

    const priceDropPercent = typeof params.priceDropPercent === 'number' ? params.priceDropPercent : parseFloat(params.priceDropPercent as string);
    if (isNaN(priceDropPercent) || priceDropPercent <= 0 || priceDropPercent > 50) {
      errors.push('加仓触发间距必须在0.1%-50%之间');
    }

    if (params.strategy === PyramidStrategy.EQUAL_RATIO) {
      const ratioMultiplier = typeof params.ratioMultiplier === 'number' ? params.ratioMultiplier : parseFloat(params.ratioMultiplier as string);
      if (isNaN(ratioMultiplier) || ratioMultiplier <= 1 || ratioMultiplier > 5) {
        errors.push('仓位递增倍数必须在1.1-5倍之间');
      }
    }

    return errors;
  };

  // 计算金字塔加仓
  const calculatePyramid = (): void => {
    const validationErrors = validateParams();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResult(null);
      return;
    }

    setErrors([]);

    // 转换参数为数字类型
    const numericParams = {
      ...params,
      leverage: typeof params.leverage === 'number' ? params.leverage : parseFloat(params.leverage as string),
      initialPrice: typeof params.initialPrice === 'number' ? params.initialPrice : parseFloat(params.initialPrice as string),
      initialQuantity: typeof params.initialQuantity === 'number' ? params.initialQuantity : parseFloat(params.initialQuantity as string),
      initialMargin: typeof params.initialMargin === 'number' ? params.initialMargin : parseFloat(params.initialMargin as string),
      pyramidLevels: typeof params.pyramidLevels === 'number' ? params.pyramidLevels : parseInt(params.pyramidLevels as string),
      priceDropPercent: typeof params.priceDropPercent === 'number' ? params.priceDropPercent : parseFloat(params.priceDropPercent as string),
      ratioMultiplier: typeof params.ratioMultiplier === 'number' ? params.ratioMultiplier : parseFloat(params.ratioMultiplier as string),
    };

    const levels: PyramidLevel[] = [];
    let cumulativeQuantity = 0;
    let cumulativeMargin = 0;

    // 计算每一层
    for (let i = 0; i < numericParams.pyramidLevels; i++) {
      const level = i + 1;
      let price: number;
      let quantity: number;
      let margin: number;

      if (level === 1) {
        // 第一层（初始仓位）
        price = numericParams.initialPrice;
        quantity = numericParams.initialQuantity;
        margin = numericParams.initialMargin;
      } else {
        // 后续层级
        const previousPrice = levels[i - 1].price;

        // 计算价格（根据方向和下跌百分比）
        if (numericParams.side === PositionSide.LONG) {
          price = previousPrice * (1 - numericParams.priceDropPercent / 100);
        } else {
          price = previousPrice * (1 + numericParams.priceDropPercent / 100);
        }

        // 计算数量（根据策略）
        if (numericParams.strategy === PyramidStrategy.EQUAL_RATIO) {
          quantity = numericParams.initialQuantity * Math.pow(numericParams.ratioMultiplier, level - 1);
        } else { // DOUBLE_DOWN
          quantity = numericParams.initialQuantity * Math.pow(2, level - 1);
        }

        // 计算保证金
        margin = (price * quantity) / numericParams.leverage;
      }

      cumulativeQuantity += quantity;
      cumulativeMargin += margin;

      // 计算平均价格
      const averagePrice = levels.reduce((sum, l) => sum + l.price * l.quantity, 0) + price * quantity;
      const avgPrice = averagePrice / cumulativeQuantity;

      // 计算爆仓价格
      const liquidationPrice = calculateLiquidationPrice(numericParams.side, numericParams.leverage, avgPrice);

      // 计算与上一层的价格差
      const priceDropFromPrevious = level === 1 ? 0 :
        Math.abs((price - levels[i - 1].price) / levels[i - 1].price) * 100;

      levels.push({
        level,
        price,
        quantity,
        margin,
        cumulativeQuantity,
        cumulativeMargin,
        averagePrice: avgPrice,
        liquidationPrice,
        priceDropFromPrevious,
      });
    }

    const finalLevel = levels[levels.length - 1];
    const maxDrawdown = numericParams.side === PositionSide.LONG
      ? ((numericParams.initialPrice - finalLevel.price) / numericParams.initialPrice) * 100
      : ((finalLevel.price - numericParams.initialPrice) / numericParams.initialPrice) * 100;

    setResult({
      params: numericParams,
      levels,
      totalQuantity: finalLevel.cumulativeQuantity,
      totalMargin: finalLevel.cumulativeMargin,
      finalAveragePrice: finalLevel.averagePrice,
      finalLiquidationPrice: finalLevel.liquidationPrice,
      maxDrawdown,
    });
  };

  // 重置表单
  const resetForm = (): void => {
    setParams({
      symbol: 'BTC/USDT',
      side: PositionSide.LONG,
      leverage: 10,
      initialPrice: 50000,
      initialQuantity: 1,
      initialMargin: 5000,
      pyramidLevels: 5,
      strategy: PyramidStrategy.EQUAL_RATIO,
      priceDropPercent: 5,
      ratioMultiplier: 1.5,
    });
    setResult(null);
    setErrors([]);
  };

  // 导出建仓方案
  const exportPyramidPlan = (): void => {
    if (!result) return;

    const csvContent = [
      ['档位', '开仓价格', '仓位大小', '保证金', '累计持仓', '累计保证金', '持仓均价', '强平价格', '回撤幅度%'].join(','),
      ...result.levels.map(level => [
        `第${level.level}档`,
        level.price.toFixed(4),
        level.quantity.toFixed(4),
        level.margin.toFixed(2),
        level.cumulativeQuantity.toFixed(4),
        level.cumulativeMargin.toFixed(2),
        level.averagePrice.toFixed(4),
        level.liquidationPrice.toFixed(4),
        level.priceDropFromPrevious.toFixed(2) + '%'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `分批建仓方案_${params.symbol.replace('/', '_')}_${Date.now()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 格式化数字
  const formatNumber = (value: number, decimals: number = 4): string => {
    if (isNaN(value) || !isFinite(value)) return '0';
    return value.toFixed(decimals);
  };

  // 格式化百分比
  const formatPercentage = (value: number, decimals: number = 2): string => {
    if (isNaN(value) || !isFinite(value)) return '0.00%';
    return `${value.toFixed(decimals)}%`;
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
      <Box maxWidth="xl" width="100%">
        <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
          合约分批建仓计算器
        </Typography>

        <Typography variant="body1" color="textSecondary" textAlign="center" paragraph>
          制定专业的分批建仓策略，优化持仓成本和风险管理
        </Typography>

        <Grid container spacing={3}>
          {/* 左侧：参数配置 */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <TimelineIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  合约建仓参数
                </Typography>

                {errors.length > 0 && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {errors.map((error, index) => (
                      <div key={index}>{error}</div>
                    ))}
                  </Alert>
                )}

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="交易对"
                      value={params.symbol}
                      onChange={(e) => setParams({...params, symbol: e.target.value})}
                      placeholder="例如: BTC/USDT"
                      required
                      helperText="选择要交易的合约品种"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>开仓方向</InputLabel>
                      <Select
                        value={params.side}
                        label="开仓方向"
                        onChange={(e) => setParams({...params, side: e.target.value as PositionSide})}
                      >
                        <MenuItem value={PositionSide.LONG}>做多 (Long)</MenuItem>
                        <MenuItem value={PositionSide.SHORT}>做空 (Short)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="杠杆倍率"
                      type="number"
                      value={params.leverage}
                      onChange={(e) => {
                        const value = e.target.value;
                        setParams({...params, leverage: value === '' ? '' : parseInt(value) || ''});
                      }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">x</InputAdornment>,
                      }}
                      inputProps={{ min: 1, max: 125 }}
                      required
                      helperText="合约杠杆倍率 (1-125倍)"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="首次开仓价格"
                      type="number"
                      value={params.initialPrice}
                      onChange={(e) => {
                        const value = e.target.value;
                        setParams({...params, initialPrice: value === '' ? '' : parseFloat(value) || ''});
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 'any' }}
                      required
                      helperText="第一档位的入场价格"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="首次仓位大小"
                      type="number"
                      value={params.initialQuantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        setParams({...params, initialQuantity: value === '' ? '' : parseFloat(value) || ''});
                      }}
                      inputProps={{ min: 0, step: 'any' }}
                      required
                      helperText="第一档位的合约数量"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="首次保证金"
                      type="number"
                      value={params.initialMargin}
                      onChange={(e) => {
                        const value = e.target.value;
                        setParams({...params, initialMargin: value === '' ? '' : parseFloat(value) || ''});
                      }}
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      }}
                      inputProps={{ min: 0, step: 'any' }}
                      required
                      helperText="第一档位所需保证金"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      分批建仓策略
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="建仓档位数"
                      type="number"
                      value={params.pyramidLevels}
                      onChange={(e) => {
                        const value = e.target.value;
                        setParams({...params, pyramidLevels: value === '' ? '' : parseInt(value) || ''});
                      }}
                      inputProps={{ min: 2, max: 10 }}
                      required
                      helperText="分批建仓的档位数量 (2-10档)"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>仓位递增策略</InputLabel>
                      <Select
                        value={params.strategy}
                        label="仓位递增策略"
                        onChange={(e) => setParams({...params, strategy: e.target.value as PyramidStrategy})}
                      >
                        <MenuItem value={PyramidStrategy.EQUAL_RATIO}>等比递增</MenuItem>
                        <MenuItem value={PyramidStrategy.DOUBLE_DOWN}>倍数递增</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="加仓触发间距"
                      type="number"
                      value={params.priceDropPercent}
                      onChange={(e) => {
                        const value = e.target.value;
                        setParams({...params, priceDropPercent: value === '' ? '' : parseFloat(value) || ''});
                      }}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      inputProps={{ min: 0.1, max: 50, step: 0.1 }}
                      required
                      helperText="价格回撤时的加仓触发间距"
                    />
                  </Grid>

                  {params.strategy === PyramidStrategy.EQUAL_RATIO && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="仓位递增倍数"
                        type="number"
                        value={params.ratioMultiplier}
                        onChange={(e) => {
                          const value = e.target.value;
                          setParams({...params, ratioMultiplier: value === '' ? '' : parseFloat(value) || ''});
                        }}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">x</InputAdornment>,
                        }}
                        inputProps={{ min: 1.1, max: 5, step: 0.1 }}
                        required
                        helperText="每档仓位大小的递增倍数"
                      />
                    </Grid>
                  )}
                </Grid>

                <Box mt={3} display="flex" gap={2}>
                  <Button
                    variant="contained"
                    startIcon={<CalculateIcon />}
                    onClick={calculatePyramid}
                    fullWidth
                  >
                    计算分批建仓方案
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

          {/* 右侧：计算结果 */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" gutterBottom>
                    分批建仓方案
                  </Typography>
                  {result && (
                    <Button
                      variant="outlined"
                      startIcon={<DownloadIcon />}
                      onClick={exportPyramidPlan}
                      size="small"
                    >
                      导出方案
                    </Button>
                  )}
                </Box>

                {!result ? (
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    minHeight={300}
                  >
                    <Typography variant="body1" color="textSecondary">
                      请配置策略参数并点击计算
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {/* 策略概览 */}
                    <Grid container spacing={2} mb={3}>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(25,118,210,0.1)', borderRadius: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            建仓档位
                          </Typography>
                          <Typography variant="h6">
                            {result.levels.length}档
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(76,175,80,0.1)', borderRadius: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            总持仓量
                          </Typography>
                          <Typography variant="h6">
                            {formatNumber(result.totalQuantity)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(255,152,0,0.1)', borderRadius: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            总保证金
                          </Typography>
                          <Typography variant="h6">
                            ${formatNumber(result.totalMargin, 2)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(156,39,176,0.1)', borderRadius: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            持仓均价
                          </Typography>
                          <Typography variant="h6">
                            ${formatNumber(result.finalAveragePrice)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* 风险指标 */}
                    <Grid container spacing={2} mb={3}>
                      <Grid item xs={6}>
                        <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(244,67,54,0.1)', borderRadius: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            最大回撤风险
                          </Typography>
                          <Typography variant="h6" color="error.main">
                            {formatPercentage(result.maxDrawdown)}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box textAlign="center" p={2} sx={{ backgroundColor: 'rgba(255,193,7,0.1)', borderRadius: 1 }}>
                          <Typography variant="body2" color="textSecondary">
                            强平价格
                          </Typography>
                          <Typography variant="h6" color="warning.main">
                            ${formatNumber(result.finalLiquidationPrice)}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* 详细建仓方案表格 */}
                    <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell align="center">档位</TableCell>
                            <TableCell align="center">开仓价格</TableCell>
                            <TableCell align="center">仓位大小</TableCell>
                            <TableCell align="center">保证金</TableCell>
                            <TableCell align="center">累计持仓</TableCell>
                            <TableCell align="center">累计保证金</TableCell>
                            <TableCell align="center">持仓均价</TableCell>
                            <TableCell align="center">强平价格</TableCell>
                            <TableCell align="center">回撤幅度</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {result.levels.map((level) => (
                            <TableRow key={level.level} hover>
                              <TableCell align="center">
                                <Chip
                                  label={`第${level.level}档`}
                                  color={level.level === 1 ? 'primary' : 'default'}
                                  size="small"
                                />
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" fontWeight={500}>
                                  ${formatNumber(level.price)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">
                                  {formatNumber(level.quantity)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2">
                                  ${formatNumber(level.margin, 2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" fontWeight={500}>
                                  {formatNumber(level.cumulativeQuantity)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" fontWeight={500}>
                                  ${formatNumber(level.cumulativeMargin, 2)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" color="primary.main" fontWeight={500}>
                                  ${formatNumber(level.averagePrice)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                <Typography variant="body2" color="error.main">
                                  ${formatNumber(level.liquidationPrice)}
                                </Typography>
                              </TableCell>
                              <TableCell align="center">
                                {level.level === 1 ? (
                                  <Typography variant="body2" color="textSecondary">
                                    -
                                  </Typography>
                                ) : (
                                  <Typography
                                    variant="body2"
                                    color={level.priceDropFromPrevious > 0 ? 'error.main' : 'success.main'}
                                  >
                                    {formatPercentage(level.priceDropFromPrevious)}
                                  </Typography>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {/* 策略说明 */}
                    <Box mt={3} p={2} sx={{ backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        分批建仓策略说明
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        • <strong>等比递增</strong>：每档仓位按固定倍数递增，适合趋势明确的市场环境<br/>
                        • <strong>倍数递增</strong>：每档仓位翻倍增长，快速摊薄持仓成本但风险较高<br/>
                        • <strong>风险提示</strong>：分批建仓会增加总持仓量和保证金占用，请严格控制资金规模和风险敞口<br/>
                        • <strong>建议</strong>：建仓前请设置好止损价格，避免超出风险承受能力
                      </Typography>
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
