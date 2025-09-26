import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Button,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup,
  Box,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  History as HistoryIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { usePageTitle } from '../utils/titleManager';
import {
  IndexedDBVolatilityStorage,
  VolatilityRecord as StoredVolatilityRecord,
  VolatilityInputState
} from '../utils/indexedDBStorage';
import {
  VolatilityContainer,
  CalculatorCard,
  InputSection,
  InputGroup,
  PriceInput,
  ResultSection,
  VolatilityResult,
  ResultLabel,
  CalculationDetails,
  HistoryCard,
  HistoryItem,
  HistoryContent,
  HistoryData,
  HistoryTime,
  EmptyState,
  ActionSection,
  InfoText,
  ResponsiveGrid,
  CalculatorMain,
  HistorySidebar,
} from '../styles/volatilityCalculator';

// 使用存储模块中的接口
export type VolatilityRecord = StoredVolatilityRecord;

// 计算模式枚举
enum CalculationMode {
  FORWARD = 'forward',   // 正向计算：起始价格 + 目标价格 → 波动率
  REVERSE = 'reverse'    // 反向计算：起始价格 + 波动率 → 目标价格
}

// 波动率计算结果接口
interface VolatilityResult {
  volatility: number;
  sign: '+' | '-';
  difference: number;
  maxPrice: number;
  formula: string;
  // 投资金额相关计算结果
  investmentVolatility?: {
    amount: number;
    volatilityAmount: number;
    upperBound: number;
    lowerBound: number;
  };
}

// 反向计算结果接口
interface ReverseCalculationResult {
  targetPrice: number;
  volatility: number;
  sign: '+' | '-';
  difference: number;
  formula: string;
  // 投资金额相关计算结果
  investmentVolatility?: {
    amount: number;
    volatilityAmount: number;
    upperBound: number;
    lowerBound: number;
  };
}

export default function VolatilityCalculator() {
  usePageTitle('volatility-calculator');

  // 状态管理
  const [calculationMode, setCalculationMode] = useState<CalculationMode>(CalculationMode.FORWARD);
  const [price1, setPrice1] = useState<string>('');
  const [price2, setPrice2] = useState<string>('');
  const [volatilityInput, setVolatilityInput] = useState<string>('');
  const [investmentAmount, setInvestmentAmount] = useState<string>('');
  const [result, setResult] = useState<VolatilityResult | null>(null);
  const [reverseResult, setReverseResult] = useState<ReverseCalculationResult | null>(null);
  const [history, setHistory] = useState<VolatilityRecord[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 初始化数据加载
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true);

        // 加载历史记录
        const records = await IndexedDBVolatilityStorage.getRecords(10);
        setHistory(records);

        // 加载输入状态
        const inputState = await IndexedDBVolatilityStorage.loadInputState();
        if (inputState.price1 || inputState.price2) {
          setPrice1(inputState.price1);
          setPrice2(inputState.price2);
        }
      } catch (error) {
        console.error('初始化数据加载失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // 自动保存输入状态
  useEffect(() => {
    if (!isLoading) {
      const saveInputState = async () => {
        try {
          const inputState: VolatilityInputState = {
            price1,
            price2,
            lastUpdated: new Date()
          };
          await IndexedDBVolatilityStorage.saveInputState(inputState);
        } catch (error) {
          console.error('保存输入状态失败:', error);
        }
      };

      // 防抖保存
      const timeoutId = setTimeout(saveInputState, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [price1, price2, isLoading]);

  // 验证正向计算输入参数
  const validateForwardInputs = useCallback((): string[] => {
    const errors: string[] = [];

    const p1 = parseFloat(price1);
    const p2 = parseFloat(price2);

    if (!price1 || isNaN(p1) || p1 <= 0) {
      errors.push('起始价格必须是大于0的有效数字');
    }

    if (!price2 || isNaN(p2) || p2 <= 0) {
      errors.push('目标价格必须是大于0的有效数字');
    }

    if (p1 === p2 && !isNaN(p1) && !isNaN(p2)) {
      errors.push('两个价格不能相同');
    }

    return errors;
  }, [price1, price2]);

  // 验证反向计算输入参数
  const validateReverseInputs = useCallback((): string[] => {
    const errors: string[] = [];

    const p1 = parseFloat(price1);
    const vol = parseFloat(volatilityInput);

    if (!price1 || isNaN(p1) || p1 <= 0) {
      errors.push('起始价格必须是大于0的有效数字');
    }

    if (!volatilityInput || isNaN(vol) || vol <= 0) {
      errors.push('波动率必须是大于0的有效数字');
    }

    if (vol >= 100) {
      errors.push('波动率不能大于等于100%');
    }

    return errors;
  }, [price1, volatilityInput]);

  // 根据计算模式验证输入
  const validateInputs = useCallback((): string[] => {
    return calculationMode === CalculationMode.FORWARD
      ? validateForwardInputs()
      : validateReverseInputs();
  }, [calculationMode, validateForwardInputs, validateReverseInputs]);

  // 计算波动率（正向计算）
  const calculateVolatility = useCallback((): VolatilityResult | null => {
    const validationErrors = validateForwardInputs();
    if (validationErrors.length > 0) {
      return null;
    }

    const p1 = parseFloat(price1);
    const p2 = parseFloat(price2);

    // 计算差值和符号（目标价格 - 起始价格）
    const difference = p2 - p1;
    const sign: '+' | '-' = difference >= 0 ? '+' : '-';

    // 计算波动率：|目标价格-起始价格|/max(起始价格,目标价格)*100
    const maxPrice = Math.max(p1, p2);
    const volatility = (Math.abs(difference) / maxPrice) * 100;

    // 生成计算公式
    const formula = `|${p2} - ${p1}| / max(${p1}, ${p2}) × 100 = ${Math.abs(difference).toFixed(4)} / ${maxPrice} × 100`;

    // 计算投资金额波动（如果用户输入了投资金额）
    let investmentVolatility = undefined;
    if (investmentAmount && parseFloat(investmentAmount) > 0) {
      const amount = parseFloat(investmentAmount);
      const volatilityAmount = (amount * volatility) / 100;
      const upperBound = amount + volatilityAmount;
      const lowerBound = amount - volatilityAmount;

      investmentVolatility = {
        amount,
        volatilityAmount,
        upperBound,
        lowerBound
      };
    }

    return {
      volatility,
      sign,
      difference: Math.abs(difference),
      maxPrice,
      formula,
      investmentVolatility
    };
  }, [price1, price2, investmentAmount, validateForwardInputs]);

  // 计算目标价格（反向计算）
  const calculateTargetPrice = useCallback((): ReverseCalculationResult | null => {
    const validationErrors = validateReverseInputs();
    if (validationErrors.length > 0) {
      return null;
    }

    const p1 = parseFloat(price1);
    const vol = parseFloat(volatilityInput);

    // 反向计算公式推导：
    // 波动率 = |目标价格 - 起始价格| / max(起始价格, 目标价格) * 100
    // 设目标价格为 p2，则：
    // vol/100 = |p2 - p1| / max(p1, p2)

    // 分两种情况：
    // 1. 如果 p2 > p1，则 max(p1, p2) = p2，公式变为：vol/100 = (p2 - p1) / p2
    //    解得：p2 = p1 / (1 - vol/100)
    // 2. 如果 p2 < p1，则 max(p1, p2) = p1，公式变为：vol/100 = (p1 - p2) / p1
    //    解得：p2 = p1 * (1 - vol/100)

    // 计算两种可能的目标价格
    const targetPriceUp = p1 / (1 - vol / 100);   // 上涨情况
    const targetPriceDown = p1 * (1 - vol / 100); // 下跌情况

    // 默认选择上涨情况，用户可以通过符号选择器来切换
    const targetPrice = targetPriceUp;
    const difference = Math.abs(targetPrice - p1);
    const sign: '+' | '-' = targetPrice >= p1 ? '+' : '-';

    // 生成计算公式
    const formula = `${p1} / (1 - ${vol}/100) = ${p1} / ${(1 - vol/100).toFixed(4)} = ${targetPrice.toFixed(4)}`;

    // 计算投资金额波动（如果用户输入了投资金额）
    let investmentVolatility = undefined;
    if (investmentAmount && parseFloat(investmentAmount) > 0) {
      const amount = parseFloat(investmentAmount);
      const volatilityAmount = (amount * vol) / 100;
      const upperBound = amount + volatilityAmount;
      const lowerBound = amount - volatilityAmount;

      investmentVolatility = {
        amount,
        volatilityAmount,
        upperBound,
        lowerBound
      };
    }

    return {
      targetPrice,
      volatility: vol,
      sign,
      difference,
      formula,
      investmentVolatility
    };
  }, [price1, volatilityInput, investmentAmount, validateReverseInputs]);

  // 实时计算
  useEffect(() => {
    const validationErrors = validateInputs();
    setErrors(validationErrors);

    if (validationErrors.length === 0) {
      if (calculationMode === CalculationMode.FORWARD && price1 && price2) {
        const calculationResult = calculateVolatility();
        setResult(calculationResult);
        setReverseResult(null);
      } else if (calculationMode === CalculationMode.REVERSE && price1 && volatilityInput) {
        const calculationResult = calculateTargetPrice();
        setReverseResult(calculationResult);
        setResult(null);
      }
    } else {
      setResult(null);
      setReverseResult(null);
    }
  }, [calculationMode, price1, price2, volatilityInput, investmentAmount, validateInputs, calculateVolatility, calculateTargetPrice]);

  // 保存计算记录
  const saveRecord = useCallback(async () => {
    const currentResult = result || reverseResult;
    if (!currentResult) return;

    try {
      const record: VolatilityRecord = {
        id: Date.now().toString(),
        price1: parseFloat(price1),
        price2: calculationMode === CalculationMode.FORWARD
          ? parseFloat(price2)
          : reverseResult?.targetPrice || 0,
        volatility: currentResult.volatility,
        sign: currentResult.sign,
        calculatedAt: new Date(),
      };

      // 保存到IndexedDB
      await IndexedDBVolatilityStorage.saveRecord(record);

      // 重新加载历史记录
      const updatedRecords = await IndexedDBVolatilityStorage.getRecords(10);
      setHistory(updatedRecords);
    } catch (error) {
      console.error('保存计算记录失败:', error);
    }
  }, [result, reverseResult, price1, price2, calculationMode]);

  // 从历史记录恢复
  const restoreFromHistory = useCallback((record: VolatilityRecord) => {
    setPrice1(record.price1.toString());
    setPrice2(record.price2.toString());
  }, []);

  // 清空历史记录
  const clearHistory = useCallback(async () => {
    try {
      await IndexedDBVolatilityStorage.clearAllRecords();
      setHistory([]);
    } catch (error) {
      console.error('清空历史记录失败:', error);
    }
  }, []);

  // 清空输入
  const clearInputs = useCallback(async () => {
    try {
      setPrice1('');
      setPrice2('');
      setVolatilityInput('');
      setInvestmentAmount('');
      setResult(null);
      setReverseResult(null);
      setErrors([]);

      // 清空IndexedDB中的输入状态
      await IndexedDBVolatilityStorage.clearInputState();
    } catch (error) {
      console.error('清空输入状态失败:', error);
    }
  }, []);

  // 格式化时间
  const formatTime = (date: Date): string => {
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 格式化数字
  const formatNumber = (num: number, decimals: number = 4): string => {
    return num.toFixed(decimals);
  };

  return (
    <VolatilityContainer>
      {/* 页面标题 */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3 }}>
        波动率计算器
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        计算两个价格之间的波动率百分比，支持历史记录和数据持久化
      </Typography>

      <ResponsiveGrid>
        {/* 计算器主区域 */}
        <CalculatorMain>
          {/* 输入区域 */}
          <CalculatorCard>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalculateIcon />
              计算设置
            </Typography>

            {/* 计算模式选择器 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                计算模式
              </Typography>
              <ToggleButtonGroup
                value={calculationMode}
                exclusive
                onChange={(_, newMode) => {
                  if (newMode !== null) {
                    setCalculationMode(newMode);
                    // 切换模式时清空相关输入
                    if (newMode === CalculationMode.FORWARD) {
                      setVolatilityInput('');
                    } else {
                      setPrice2('');
                    }
                    setResult(null);
                    setReverseResult(null);
                    setErrors([]);
                  }
                }}
                size="small"
                fullWidth
              >
                <ToggleButton value={CalculationMode.FORWARD}>
                  <TrendingUpIcon sx={{ mr: 1 }} />
                  正向计算
                </ToggleButton>
                <ToggleButton value={CalculationMode.REVERSE}>
                  <TrendingDownIcon sx={{ mr: 1 }} />
                  反向计算
                </ToggleButton>
              </ToggleButtonGroup>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                {calculationMode === CalculationMode.FORWARD
                  ? '输入起始价格和目标价格，计算波动率'
                  : '输入起始价格和波动率，计算目标价格'
                }
              </Typography>
            </Box>

            <InputSection>
              <InputGroup>
                <PriceInput
                  label="起始价格"
                  type="number"
                  value={price1}
                  onChange={(e) => setPrice1(e.target.value)}
                  placeholder="请输入起始价格"
                  fullWidth
                  inputProps={{
                    min: 0,
                    step: 0.0001,
                  }}
                />
              </InputGroup>

              {calculationMode === CalculationMode.FORWARD ? (
                <InputGroup>
                  <PriceInput
                    label="目标价格"
                    type="number"
                    value={price2}
                    onChange={(e) => setPrice2(e.target.value)}
                    placeholder="请输入目标价格"
                    fullWidth
                    inputProps={{
                      min: 0,
                      step: 0.0001,
                    }}
                  />
                </InputGroup>
              ) : (
                <InputGroup>
                  <PriceInput
                    label="波动率 (%)"
                    type="number"
                    value={volatilityInput}
                    onChange={(e) => setVolatilityInput(e.target.value)}
                    placeholder="请输入波动率"
                    fullWidth
                    inputProps={{
                      min: 0,
                      max: 99.99,
                      step: 0.01,
                    }}
                  />
                </InputGroup>
              )}

              <InputGroup>
                <PriceInput
                  label="投资金额"
                  type="number"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="请输入投资金额"
                  fullWidth
                  inputProps={{
                    min: 0,
                    step: 0.01,
                  }}
                  helperText="可选，计算波动影响"
                />
              </InputGroup>
            </InputSection>

            {/* 操作按钮 */}
            <ActionSection>
              <Button
                variant="contained"
                startIcon={<CalculateIcon />}
                onClick={saveRecord}
                disabled={!result && !reverseResult}
                size="large"
              >
                保存记录
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearInputs}
                size="large"
                sx={{ whiteSpace: 'nowrap' }}
              >
                清空输入
              </Button>
            </ActionSection>
          </CalculatorCard>

          {/* 错误提示 */}
          {errors.length > 0 && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {errors.map((error, index) => (
                <div key={index}>{error}</div>
              ))}
            </Alert>
          )}

          {/* 正向计算结果显示 */}
          {result && calculationMode === CalculationMode.FORWARD && (
            <CalculatorCard>
              <Typography variant="h6" gutterBottom>
                计算结果
              </Typography>

              <ResultSection>
                <ResultLabel>波动率</ResultLabel>
                <VolatilityResult
                  color={result.sign === '+' ? 'positive' : 'negative'}
                >
                  {result.sign}{formatNumber(result.volatility, 2)}%
                </VolatilityResult>
                
                <CalculationDetails>
                  <div><strong>计算公式：</strong> |目标价格 - 起始价格| ÷ max(起始价格, 目标价格) × 100</div>
                  <div><strong>详细计算：</strong> {result.formula}</div>
                  <div><strong>价格差值：</strong> {formatNumber(result.difference)}</div>
                  <div><strong>基准价格：</strong> {formatNumber(result.maxPrice)}</div>
                  <div><strong>变化方向：</strong> {result.sign === '+' ? '上涨（目标价格 > 起始价格）' : '下跌（目标价格 < 起始价格）'}</div>
                </CalculationDetails>

                {/* 投资金额波动分析 */}
                {result.investmentVolatility && (
                  <CalculationDetails style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      💰 投资金额波动分析
                    </Typography>
                    <div><strong>投资金额：</strong> {formatNumber(result.investmentVolatility.amount, 2)} USDT</div>
                    <div><strong>波动金额：</strong> {formatNumber(result.investmentVolatility.volatilityAmount, 2)} USDT</div>
                    <div><strong>波动区间：</strong> {formatNumber(result.investmentVolatility.lowerBound, 2)} ~ {formatNumber(result.investmentVolatility.upperBound, 2)} USDT</div>
                    <div style={{ marginTop: '8px', fontSize: '0.9em', color: '#666' }}>
                      <strong>说明：</strong> 在当前 {formatNumber(result.volatility, 2)}% 的波动率下，您的 {formatNumber(result.investmentVolatility.amount, 2)} USDT 投资可能波动 ±{formatNumber(result.investmentVolatility.volatilityAmount, 2)} USDT
                    </div>
                  </CalculationDetails>
                )}
              </ResultSection>
            </CalculatorCard>
          )}

          {/* 反向计算结果显示 */}
          {reverseResult && calculationMode === CalculationMode.REVERSE && (
            <CalculatorCard>
              <Typography variant="h6" gutterBottom>
                计算结果
              </Typography>

              <ResultSection>
                <ResultLabel>目标价格</ResultLabel>
                <VolatilityResult
                  color={reverseResult.sign === '+' ? 'positive' : 'negative'}
                >
                  {formatNumber(reverseResult.targetPrice, 4)} USDT
                </VolatilityResult>

                <CalculationDetails>
                  <div><strong>计算公式：</strong> 起始价格 ÷ (1 - 波动率/100)</div>
                  <div><strong>详细计算：</strong> {reverseResult.formula}</div>
                  <div><strong>价格差值：</strong> {formatNumber(reverseResult.difference, 4)} USDT</div>
                  <div><strong>波动率：</strong> {formatNumber(reverseResult.volatility, 2)}%</div>
                  <div><strong>变化方向：</strong> {reverseResult.sign === '+' ? '上涨（目标价格 > 起始价格）' : '下跌（目标价格 < 起始价格）'}</div>
                </CalculationDetails>

                {/* 投资金额波动分析 */}
                {reverseResult.investmentVolatility && (
                  <CalculationDetails style={{ marginTop: '16px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
                    <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      💰 投资金额波动分析
                    </Typography>
                    <div><strong>投资金额：</strong> {formatNumber(reverseResult.investmentVolatility.amount, 2)} USDT</div>
                    <div><strong>波动金额：</strong> {formatNumber(reverseResult.investmentVolatility.volatilityAmount, 2)} USDT</div>
                    <div><strong>波动区间：</strong> {formatNumber(reverseResult.investmentVolatility.lowerBound, 2)} ~ {formatNumber(reverseResult.investmentVolatility.upperBound, 2)} USDT</div>
                    <div style={{ marginTop: '8px', fontSize: '0.9em', color: '#666' }}>
                      <strong>说明：</strong> 在当前 {formatNumber(reverseResult.volatility, 2)}% 的波动率下，您的 {formatNumber(reverseResult.investmentVolatility.amount, 2)} USDT 投资可能波动 ±{formatNumber(reverseResult.investmentVolatility.volatilityAmount, 2)} USDT
                    </div>
                  </CalculationDetails>
                )}
              </ResultSection>
            </CalculatorCard>
          )}

          {/* 使用说明 */}
          <InfoText>
            <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            <strong>使用说明：</strong>
            {calculationMode === CalculationMode.FORWARD ? (
              <>
                <strong>正向计算：</strong>输入起始价格和目标价格后自动计算波动率。
                波动率 = |目标价格-起始价格|/max(起始价格,目标价格)×100%。
                正号表示上涨（目标价格大于起始价格），负号表示下跌（目标价格小于起始价格）。
              </>
            ) : (
              <>
                <strong>反向计算：</strong>输入起始价格和波动率后自动计算目标价格。
                目标价格 = 起始价格 ÷ (1 - 波动率/100)。
                此计算假设价格上涨，如需计算下跌情况，请使用负波动率。
              </>
            )}
            可选择输入投资金额，系统将计算该金额在当前波动率下的波动区间。
            点击"保存记录"可将当前计算保存到历史记录中。
          </InfoText>
        </CalculatorMain>

        {/* 历史记录侧边栏 */}
        <HistorySidebar>
          <HistoryCard>
            <div style={{ padding: '16px 16px 0 16px' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HistoryIcon />
                历史记录
                {history.length > 0 && (
                  <Tooltip title="清空历史记录">
                    <IconButton size="small" onClick={clearHistory} sx={{ ml: 'auto' }}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </Typography>
            </div>
            
            <Divider />
            
            {history.length === 0 ? (
              <EmptyState>
                <Typography variant="body2">
                  暂无历史记录
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  完成计算后点击"保存记录"
                </Typography>
              </EmptyState>
            ) : (
              history.map((record) => (
                <HistoryItem
                  key={record.id}
                  onClick={() => restoreFromHistory(record)}
                >
                  <HistoryContent>
                    <HistoryData>
                      <Typography variant="body2" fontWeight={500}>
                        {formatNumber(record.price1)} → {formatNumber(record.price2)}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color={record.sign === '+' ? 'success.main' : 'error.main'}
                        fontWeight={600}
                      >
                        {record.sign}{formatNumber(record.volatility, 2)}%
                      </Typography>
                    </HistoryData>
                    <HistoryTime>
                      {formatTime(record.calculatedAt)}
                    </HistoryTime>
                  </HistoryContent>
                </HistoryItem>
              ))
            )}
          </HistoryCard>
        </HistorySidebar>
      </ResponsiveGrid>
    </VolatilityContainer>
  );
}
