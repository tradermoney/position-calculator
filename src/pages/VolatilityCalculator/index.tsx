/**
 * 波动率计算器页面 - 集成币安数据
 * 支持手动计算和基于币安K线数据的波动率分析
 */

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Alert,
  Box,
  Button,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Timeline as TimelineIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { usePageTitle } from '../../utils/titleManager';
import { useCalculation } from './hooks/useCalculation';
import { useHistory } from './hooks/useHistory';
import { CalculationMode } from './types';
import { InputForm } from './components/InputForm';
import { ForwardResult } from './components/ForwardResult';
import { ReverseResult } from './components/ReverseResult';
import { HistorySidebar } from './components/HistorySidebar';
import { InfoSection } from './components/InfoSection';
import { SymbolSelector } from './components/SymbolSelector';
import { IntervalSelector } from './components/IntervalSelector';
import { PeriodSelector } from './components/PeriodSelector';
import { VolatilityChart } from './components/VolatilityChart';
import { VolatilityStatsCard } from './components/VolatilityStatsCard';
import {
  binanceDataService,
  type VolatilityStats,
  KlineInterval,
} from '../../services/binance';
import {
  VolatilityContainer,
  ResponsiveGrid,
  CalculatorMain,
  HistorySidebar as HistorySidebarStyled,
} from '../../styles/volatilityCalculator';

// Tab 面板组件
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`volatility-tabpanel-${index}`}
      aria-labelledby={`volatility-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

export default function VolatilityCalculator() {
  usePageTitle('volatility-calculator');

  // Tab 状态
  const [tabValue, setTabValue] = useState(0);

  // 手动计算相关 hooks
  const {
    calculationMode,
    price1,
    price2,
    volatilityInput,
    investmentAmount,
    result,
    reverseResult,
    errors,
    setPrice1,
    setPrice2,
    setVolatilityInput,
    setInvestmentAmount,
    handleModeChange,
    clearInputs,
  } = useCalculation();

  const {
    history,
    saveRecord,
    restoreFromHistory,
    deleteRecord,
    clearHistory,
    clearInputsWithStorage,
  } = useHistory({
    price1,
    price2,
    setPrice1,
    setPrice2,
    calculationMode,
    result,
    reverseResult,
    clearInputs,
  });

  // 币安数据相关状态
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>('BTCUSDT');
  const [selectedInterval, setSelectedInterval] = useState<KlineInterval>(KlineInterval['1h']);
  const [selectedPeriods, setSelectedPeriods] = useState<number>(100);
  const [volatilityData, setVolatilityData] = useState<VolatilityStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 自动加载币安数据
  useEffect(() => {
    if (tabValue === 1 && selectedSymbol) {
      loadBinanceData();
    }
  }, [tabValue, selectedSymbol, selectedInterval, selectedPeriods]);

  // 加载币安数据
  const loadBinanceData = async () => {
    if (!selectedSymbol) {
      setError('请选择交易对');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await binanceDataService.getVolatilityStats(
        selectedSymbol,
        selectedInterval,
        selectedPeriods
      );

      setVolatilityData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载币安数据失败';
      setError(errorMessage);
      console.error('加载币安数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 手动刷新
  const handleRefresh = () => {
    loadBinanceData();
  };

  // Tab 切换
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <VolatilityContainer>
      {/* 页面标题 */}
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          mb: 3,
          px: { xs: 2, sm: 0 },
        }}
      >
        波动率计算器
      </Typography>
      <Typography
        variant="body1"
        color="textSecondary"
        sx={{
          mb: 4,
          px: { xs: 2, sm: 0 },
        }}
      >
        支持手动计算价格波动率和基于币安K线数据的波动率分析
      </Typography>

      <ResponsiveGrid>
        {/* 计算器主区域 */}
        <CalculatorMain>
          {/* Tab 切换 */}
          <Paper elevation={0} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="波动率计算模式">
              <Tab
                icon={<CalculateIcon />}
                label="手动计算"
                iconPosition="start"
                id="volatility-tab-0"
                aria-controls="volatility-tabpanel-0"
              />
              <Tab
                icon={<TimelineIcon />}
                label="币安数据分析"
                iconPosition="start"
                id="volatility-tab-1"
                aria-controls="volatility-tabpanel-1"
              />
            </Tabs>
          </Paper>

          {/* Tab 面板 1: 手动计算 */}
          <TabPanel value={tabValue} index={0}>
            {/* 输入区域 */}
            <InputForm
              calculationMode={calculationMode}
              price1={price1}
              price2={price2}
              volatilityInput={volatilityInput}
              investmentAmount={investmentAmount}
              onModeChange={handleModeChange}
              onPrice1Change={setPrice1}
              onPrice2Change={setPrice2}
              onVolatilityChange={setVolatilityInput}
              onInvestmentAmountChange={setInvestmentAmount}
              onSaveRecord={saveRecord}
              onClearInputs={clearInputsWithStorage}
              canSave={!!(result || reverseResult)}
            />

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
              <ForwardResult result={result} />
            )}

            {/* 反向计算结果显示 */}
            {reverseResult && calculationMode === CalculationMode.REVERSE && (
              <ReverseResult result={reverseResult} />
            )}

            {/* 使用说明 */}
            <InfoSection calculationMode={calculationMode} />
          </TabPanel>

          {/* Tab 面板 2: 币安数据分析 */}
          <TabPanel value={tabValue} index={1}>
            {/* 数据选择区域 */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">
                  数据选择
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={handleRefresh}
                  disabled={loading || !selectedSymbol}
                  size="small"
                >
                  刷新数据
                </Button>
              </Box>

              {/* 交易对选择器 */}
              <Box sx={{ mb: 3 }}>
                <SymbolSelector
                  value={selectedSymbol}
                  onChange={setSelectedSymbol}
                  disabled={loading}
                />
              </Box>

              {/* K线周期选择器 */}
              <Box sx={{ mb: 3 }}>
                <IntervalSelector
                  value={selectedInterval}
                  onChange={setSelectedInterval}
                  disabled={loading}
                />
              </Box>

              {/* 数据周期数选择器 */}
              <Box>
                <PeriodSelector
                  value={selectedPeriods}
                  onChange={setSelectedPeriods}
                  disabled={loading}
                  min={10}
                  max={1000}
                />
              </Box>
            </Paper>

            {/* 加载状态 */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                  正在加载数据...
                </Typography>
              </Box>
            )}

            {/* 错误提示 */}
            {error && !loading && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {/* 数据展示区域 */}
            {!loading && volatilityData && (
              <>
                {/* 统计总结卡片 */}
                <VolatilityStatsCard data={volatilityData} />

                {/* 波动率图表 */}
                <VolatilityChart data={volatilityData} height={400} />

                {/* 使用说明 */}
                <Paper elevation={2} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    📖 使用说明
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • <strong>波动率计算公式：</strong>波动率 = (最高价 - 最低价) / 开盘价 × 100%
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • <strong>平均波动率：</strong>反映该交易对在选定周期内的平均价格波动幅度
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • <strong>标准差：</strong>反映波动率的稳定性，标准差越小说明波动率越稳定
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    • <strong>应用场景：</strong>可用于评估交易风险、选择合适的交易策略、设置止损止盈等
                  </Typography>
                </Paper>
              </>
            )}

            {/* 初始提示 */}
            {!loading && !volatilityData && !error && (
              <Paper elevation={2} sx={{ p: 4, textAlign: 'center' }}>
                <TimelineIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  请选择交易对开始分析
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  选择交易对、K线周期和数据量后，系统会自动加载并分析波动率数据
                </Typography>
              </Paper>
            )}
          </TabPanel>
        </CalculatorMain>

        {/* 历史记录侧边栏（仅手动计算模式显示） */}
        {tabValue === 0 && (
          <HistorySidebarStyled>
            <HistorySidebar
              history={history}
              onRestore={restoreFromHistory}
              onDelete={deleteRecord}
              onClearHistory={clearHistory}
            />
          </HistorySidebarStyled>
        )}
      </ResponsiveGrid>
    </VolatilityContainer>
  );
}
