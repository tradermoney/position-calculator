import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Button,
  Alert,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  History as HistoryIcon,
  Clear as ClearIcon,
  Info as InfoIcon,
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

// 波动率计算结果接口
interface VolatilityResult {
  volatility: number;
  sign: '+' | '-';
  difference: number;
  maxPrice: number;
  formula: string;
}

export default function VolatilityCalculator() {
  usePageTitle('volatility-calculator');

  // 状态管理
  const [price1, setPrice1] = useState<string>('');
  const [price2, setPrice2] = useState<string>('');
  const [result, setResult] = useState<VolatilityResult | null>(null);
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

  // 验证输入参数
  const validateInputs = useCallback((): string[] => {
    const errors: string[] = [];
    
    const p1 = parseFloat(price1);
    const p2 = parseFloat(price2);
    
    if (!price1 || isNaN(p1) || p1 <= 0) {
      errors.push('价格1必须是大于0的有效数字');
    }
    
    if (!price2 || isNaN(p2) || p2 <= 0) {
      errors.push('价格2必须是大于0的有效数字');
    }
    
    if (p1 === p2 && !isNaN(p1) && !isNaN(p2)) {
      errors.push('两个价格不能相同');
    }
    
    return errors;
  }, [price1, price2]);

  // 计算波动率
  const calculateVolatility = useCallback((): VolatilityResult | null => {
    const validationErrors = validateInputs();
    if (validationErrors.length > 0) {
      return null;
    }
    
    const p1 = parseFloat(price1);
    const p2 = parseFloat(price2);
    
    // 计算差值和符号
    const difference = p1 - p2;
    const sign: '+' | '-' = difference >= 0 ? '+' : '-';
    
    // 计算波动率：|价格1-价格2|/max(价格1,价格2)*100
    const maxPrice = Math.max(p1, p2);
    const volatility = (Math.abs(difference) / maxPrice) * 100;
    
    // 生成计算公式
    const formula = `|${p1} - ${p2}| / max(${p1}, ${p2}) × 100 = ${Math.abs(difference).toFixed(4)} / ${maxPrice} × 100`;
    
    return {
      volatility,
      sign,
      difference: Math.abs(difference),
      maxPrice,
      formula
    };
  }, [price1, price2, validateInputs]);

  // 实时计算
  useEffect(() => {
    const validationErrors = validateInputs();
    setErrors(validationErrors);
    
    if (validationErrors.length === 0 && price1 && price2) {
      const calculationResult = calculateVolatility();
      setResult(calculationResult);
    } else {
      setResult(null);
    }
  }, [price1, price2, validateInputs, calculateVolatility]);

  // 保存计算记录
  const saveRecord = useCallback(async () => {
    if (!result) return;

    try {
      const record: VolatilityRecord = {
        id: Date.now().toString(),
        price1: parseFloat(price1),
        price2: parseFloat(price2),
        volatility: result.volatility,
        sign: result.sign,
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
  }, [result, price1, price2]);

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
      setResult(null);
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
              价格输入
            </Typography>
            
            <InputSection>
              <InputGroup>
                <PriceInput
                  label="价格 1"
                  type="number"
                  value={price1}
                  onChange={(e) => setPrice1(e.target.value)}
                  placeholder="请输入第一个价格"
                  fullWidth
                  inputProps={{
                    min: 0,
                    step: 0.0001,
                  }}
                />
              </InputGroup>
              
              <InputGroup>
                <PriceInput
                  label="价格 2"
                  type="number"
                  value={price2}
                  onChange={(e) => setPrice2(e.target.value)}
                  placeholder="请输入第二个价格"
                  fullWidth
                  inputProps={{
                    min: 0,
                    step: 0.0001,
                  }}
                />
              </InputGroup>
            </InputSection>

            {/* 操作按钮 */}
            <ActionSection>
              <Button
                variant="contained"
                startIcon={<CalculateIcon />}
                onClick={saveRecord}
                disabled={!result}
                size="large"
              >
                保存记录
              </Button>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={clearInputs}
                size="large"
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

          {/* 结果显示 */}
          {result && (
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
                  <div><strong>计算公式：</strong> |价格1 - 价格2| ÷ max(价格1, 价格2) × 100</div>
                  <div><strong>详细计算：</strong> {result.formula}</div>
                  <div><strong>价格差值：</strong> {formatNumber(result.difference)}</div>
                  <div><strong>基准价格：</strong> {formatNumber(result.maxPrice)}</div>
                  <div><strong>变化方向：</strong> {result.sign === '+' ? '价格1 > 价格2' : '价格1 < 价格2'}</div>
                </CalculationDetails>
              </ResultSection>
            </CalculatorCard>
          )}

          {/* 使用说明 */}
          <InfoText>
            <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            <strong>使用说明：</strong>
            输入两个价格后自动计算波动率。波动率 = |价格1-价格2|/max(价格1,价格2)×100%。
            正号表示价格1大于价格2，负号表示价格1小于价格2。
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
