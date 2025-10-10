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
import { useLocation, useNavigate } from 'react-router-dom';
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
import { EChartsVolatilityChart } from './components/EChartsVolatilityChart';
import { VolatilityStatsCard } from './components/VolatilityStatsCard';
import { RollingVolatilityChart } from './components/RollingVolatilityChart';
import { VolatilityDistributionChart } from './components/VolatilityDistributionChart';
import { VolatilityReturnScatterChart } from './components/VolatilityReturnScatterChart';
import { VolatilityAutocorrelationChart } from './components/VolatilityAutocorrelationChart';
import { PriceVolatilityChart } from './components/PriceVolatilityChart';
import { VolatilityBoxPlotChart } from './components/VolatilityBoxPlotChart';
import { MultiTimeframeVolatilityChart } from './components/MultiTimeframeVolatilityChart';
import { AnnualizedVolatilityChart } from './components/AnnualizedVolatilityChart';
import { ParkinsonVolatilityChart } from './components/ParkinsonVolatilityChart';
import { VolatilityHeatmapChart } from './components/VolatilityHeatmapChart';
import { VolatilityForecastChart } from './components/VolatilityForecastChart';
import { VolatilityConeChart } from './components/VolatilityConeChart';
import { VolatilityContributionChart } from './components/VolatilityContributionChart';
import { VolatilityJumpDetectionChart } from './components/VolatilityJumpDetectionChart';
import { VolatilityRatioChart } from './components/VolatilityRatioChart';
import FieldTooltip from './components/FieldTooltip';
import {
  binanceDataService,
  type VolatilityStats,
  KlineInterval,
} from '../../services/binance';
import { BinanceDataStorageService } from '../../utils/storage/binanceDataStorage';
import {
  VolatilityContainer,
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
  const location = useLocation();
  const navigate = useNavigate();
  
  // 根据URL确定初始标签页
  const isBinanceRoute = location.pathname.includes('/binance');
  const isManualRoute = location.pathname.includes('/manual');
  const initialTabValue = isBinanceRoute ? 1 : 0;
  
  // 确定页面标题
  const pageTitle = isBinanceRoute 
    ? 'volatility-calculator-binance' 
    : isManualRoute 
    ? 'volatility-calculator-manual' 
    : 'volatility-calculator';
  
  usePageTitle(pageTitle as import('../../utils/titleManager').PageKey);

  // Tab 状态
  const [tabValue, setTabValue] = useState(initialTabValue);

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

  // 加载保存的输入状态
  useEffect(() => {
    const loadSavedState = async () => {
      try {
        const savedState = await BinanceDataStorageService.getInputState();
        setSelectedSymbol(savedState.selectedSymbol);
        setSelectedInterval(savedState.selectedInterval as KlineInterval);
        setSelectedPeriods(savedState.selectedPeriods);
      } catch (error) {
        console.error('加载保存的输入状态失败:', error);
      }
    };

    loadSavedState();
  }, []);

  // 监听URL变化，更新标签页状态
  useEffect(() => {
    const newIsBinanceRoute = location.pathname.includes('/binance');
    const newTabValue = newIsBinanceRoute ? 1 : 0;
    if (newTabValue !== tabValue) {
      setTabValue(newTabValue);
    }
  }, [location.pathname, tabValue]);

  // 保存输入状态
  useEffect(() => {
    const saveState = async () => {
      try {
        await BinanceDataStorageService.saveAllInputs(
          selectedSymbol,
          selectedInterval,
          selectedPeriods
        );
      } catch (error) {
        console.error('保存输入状态失败:', error);
      }
    };

    // 延迟保存，避免频繁保存
    const timeoutId = setTimeout(saveState, 500);
    return () => clearTimeout(timeoutId);
  }, [selectedSymbol, selectedInterval, selectedPeriods]);

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
    
    // 更新URL
    if (newValue === 1) {
      navigate('/volatility-calculator/binance');
    } else {
      navigate('/volatility-calculator/manual');
    }
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

        {/* 历史记录（显示在下方） */}
        <Box sx={{ mt: 4 }}>
          <HistorySidebar
            history={history}
            onRestore={restoreFromHistory}
            onDelete={deleteRecord}
            onClearHistory={clearHistory}
          />
        </Box>
      </TabPanel>

      {/* Tab 面板 2: 币安数据分析 */}
      <TabPanel value={tabValue} index={1}>
            {/* 数据选择区域 */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography variant="h6">
                    数据选择
                  </Typography>
                  <FieldTooltip
                    title={
                      <Box sx={{ p: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          数据选择说明
                        </Typography>
                        <Typography variant="body2" paragraph>
                          这个区域用于配置要分析的币安数据。你需要选择三个参数：
                        </Typography>
                        <Typography variant="body2" paragraph>
                          <strong>1. 交易对：</strong>选择要分析的加密货币交易对（如 BTCUSDT）<br/>
                          <strong>2. K线周期：</strong>选择K线的时间间隔（如 1小时、4小时、1天）<br/>
                          <strong>3. 数据周期数：</strong>选择要获取多少个K线周期的历史数据
                        </Typography>
                        <Typography variant="body2">
                          <strong>💡 提示：</strong>选择完成后，系统会自动从币安获取数据并计算波动率，生成多种分析图表。
                        </Typography>
                      </Box>
                    }
                    placement="right"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FieldTooltip
                    title={
                      <Box sx={{ p: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          刷新数据按钮
                        </Typography>
                        <Typography variant="body2" paragraph>
                          点击此按钮可以重新从币安API获取最新的数据并更新所有图表。
                        </Typography>
                        <Typography variant="body2" paragraph>
                          <strong>使用场景：</strong><br/>
                          • 获取最新的市场数据<br/>
                          • 更新实时波动率分析<br/>
                          • 重新计算统计指标
                        </Typography>
                        <Typography variant="body2">
                          <strong>💡 提示：</strong>数据会自动缓存，避免频繁刷新。通常每5-10分钟刷新一次即可。
                        </Typography>
                      </Box>
                    }
                    placement="left"
                  />
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
                {/* 统计总结卡片 - 包含所有重要的统计指标 */}
                <VolatilityStatsCard data={volatilityData} />

                {/* 核心图表区域 */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2, mb: 2 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      📊 核心波动率图表
                    </Typography>
                    <FieldTooltip
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            核心波动率图表说明
                          </Typography>
                          <Typography variant="body2" paragraph>
                            这个区域展示了最基础也是最重要的波动率分析图表：
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>📈 波动率趋势图：</strong>显示每个时间点的波动率变化，帮助识别市场波动的增减趋势<br/>
                            <strong>💹 价格与波动率联合图：</strong>同时展示价格走势和波动率，发现价格剧烈变动时的波动率特征
                          </Typography>
                          <Typography variant="body2">
                            <strong>💡 应用：</strong>波动率升高通常意味着市场不确定性增加，可能是入场或止损的信号。
                          </Typography>
                        </Box>
                      }
                      placement="right"
                    />
                  </Box>
                  
                  {/* 基础波动率趋势图 */}
                  <EChartsVolatilityChart data={volatilityData} height={500} />
                  
                  {/* 价格与波动率联合分析 */}
                  <PriceVolatilityChart data={volatilityData} height={500} />
                </Box>

                {/* 移动窗口分析区域 */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      📈 移动窗口波动率分析
                    </Typography>
                    <FieldTooltip
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            移动窗口波动率分析
                          </Typography>
                          <Typography variant="body2" paragraph>
                            使用不同大小的时间窗口（7、14、30个周期）计算滚动波动率，对比短期和长期波动特征。
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>窗口含义：</strong><br/>
                            • 7周期窗口 - 敏感度高，快速反映市场变化<br/>
                            • 14周期窗口 - 平衡灵敏性和稳定性（推荐）<br/>
                            • 30周期窗口 - 平滑噪声，展现长期趋势
                          </Typography>
                          <Typography variant="body2">
                            <strong>💡 应用：</strong>当短期窗口波动率显著高于长期时，表明市场正经历短期剧烈波动。
                          </Typography>
                        </Box>
                      }
                      placement="right"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                    对比不同时间窗口的波动率，观察短期波动与长期趋势的差异
                  </Typography>
                  
                  <RollingVolatilityChart data={volatilityData} height={450} />
                </Box>

                {/* 多时间周期分析区域 */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      ⏱️ 多时间周期波动率对比
                    </Typography>
                    <FieldTooltip
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            多时间周期波动率对比
                          </Typography>
                          <Typography variant="body2" paragraph>
                            同时加载并对比多个时间尺度（1小时、4小时、1天）的K线数据，计算各自的波动率。
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>时间尺度含义：</strong><br/>
                            • 1小时 - 捕捉短期市场噪声和快速波动<br/>
                            • 4小时 - 观察日内中期趋势<br/>
                            • 1天 - 反映市场整体波动水平
                          </Typography>
                          <Typography variant="body2">
                            <strong>💡 应用：</strong>不同时间尺度的波动率差异可以帮助选择合适的交易周期和仓位管理策略。
                          </Typography>
                        </Box>
                      }
                      placement="right"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                    对比不同时间尺度（1小时、4小时、1天）的波动率，揭示短期噪声与长期趋势
                  </Typography>
                  
                  <MultiTimeframeVolatilityChart 
                    symbol={selectedSymbol || 'BTCUSDT'} 
                    periods={selectedPeriods}
                    height={500}
                  />
                </Box>

                {/* 年化波动率分析区域 */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      📊 年化波动率分析
                    </Typography>
                    <FieldTooltip
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            年化波动率分析
                          </Typography>
                          <Typography variant="body2" paragraph>
                            将不同时间周期的波动率统一换算成年化值（例如：日波动率 × √365），使得不同市场、不同时段的数据具有可比性。
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>年化公式：</strong>年化波动率 = 周期波动率 × √(年化系数)<br/>
                            • 1分钟数据：× √525600<br/>
                            • 1小时数据：× √8760<br/>
                            • 1天数据：× √365
                          </Typography>
                          <Typography variant="body2">
                            <strong>💡 应用：</strong>用于对比不同市场风险水平、评估期权定价、制定风险管理策略。
                          </Typography>
                        </Box>
                      }
                      placement="right"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                    标准化为年化波动率，便于跨市场、跨时段比较和策略评估
                  </Typography>
                  
                  <AnnualizedVolatilityChart data={volatilityData} height={450} />
                </Box>

                {/* 统计分布分析区域 */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      📊 统计分布分析
                    </Typography>
                    <FieldTooltip
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            统计分布分析
                          </Typography>
                          <Typography variant="body2" paragraph>
                            使用统计学方法分析波动率的整体分布特征，包括直方图和箱线图。
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>📊 直方图：</strong>显示波动率的频数分布，了解波动率集中在哪个区间<br/>
                            <strong>📦 箱线图：</strong>展示中位数、四分位数、最大最小值和离群值
                          </Typography>
                          <Typography variant="body2">
                            <strong>💡 应用：</strong>识别波动率的正常范围和异常值，为风险控制提供参考。
                          </Typography>
                        </Box>
                      }
                      placement="right"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                    通过统计学方法分析波动率的分布特征和分位数信息
                  </Typography>
                  
                  <VolatilityDistributionChart data={volatilityData} height={400} />
                  <VolatilityBoxPlotChart data={volatilityData} height={400} />
                </Box>

                {/* 波动结构分析区域 */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      🔬 波动结构分析
                    </Typography>
                    <FieldTooltip
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            波动结构分析
                          </Typography>
                          <Typography variant="body2" paragraph>
                            深入分析波动率的内在结构特征和时间序列性质。
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>📈 自相关分析（ACF）：</strong>检测波动聚集性（Volatility Clustering），即"高波动后面跟高波动"的GARCH效应<br/>
                            <strong>📊 波动率-收益率散点图：</strong>分析波动率与收益率的关系，验证是否存在杠杆效应
                          </Typography>
                          <Typography variant="body2">
                            <strong>💡 应用：</strong>理解波动率的持续性和预测性，优化时间序列模型。
                          </Typography>
                        </Box>
                      }
                      placement="right"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                    深入分析波动率的内在结构特征，包括自相关性和与收益率的关系
                  </Typography>
                  
                  {/* 波动率聚集性分析 */}
                  <VolatilityAutocorrelationChart data={volatilityData} height={400} maxLag={20} />
                  
                  {/* 波动率与收益率关系 */}
                  <VolatilityReturnScatterChart data={volatilityData} height={450} />
                </Box>

                {/* 高级波动率分析区域 */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      🎯 高级波动率分析
                    </Typography>
                    <FieldTooltip
                      title={
                        <Box sx={{ p: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            高级波动率分析工具
                          </Typography>
                          <Typography variant="body2" paragraph>
                            专业级的波动率分析工具集，适合深度研究和量化策略开发。
                          </Typography>
                          <Typography variant="body2" paragraph>
                            <strong>包含工具：</strong><br/>
                            • Parkinson波动率 - 利用最高最低价计算，比收盘价更准确<br/>
                            • 热力图 - 时间+波动率的二维可视化<br/>
                            • EWMA预测 - 指数加权移动平均预测未来波动<br/>
                            • 锥形图 - 展示波动率的历史分位数区间<br/>
                            • 贡献分解 - 分析哪些时段贡献了主要波动<br/>
                            • 跳跃检测 - 识别异常的波动跳跃事件<br/>
                            • 比率分析 - 短期/长期波动率比值
                          </Typography>
                          <Typography variant="body2">
                            <strong>💡 应用：</strong>适合专业交易员和量化分析师进行深度波动率研究。
                          </Typography>
                        </Box>
                      }
                      placement="right"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph sx={{ mb: 2 }}>
                    Parkinson波动率、热力图、预测、锥形图等专业分析工具
                  </Typography>
                  
                  {/* Parkinson波动率 */}
                  <ParkinsonVolatilityChart data={volatilityData} height={500} />
                  
                  {/* 波动率热力图 */}
                  <VolatilityHeatmapChart data={volatilityData} height={400} />
                  
                  {/* 波动率预测 */}
                  <VolatilityForecastChart data={volatilityData} height={450} forecastPeriods={10} />
                  
                  {/* 波动率锥形图 */}
                  <VolatilityConeChart data={volatilityData} height={450} />
                  
                  {/* 波动率贡献分解 */}
                  <VolatilityContributionChart data={volatilityData} height={400} />
                  
                  {/* 波动率跳跃检测 */}
                  <VolatilityJumpDetectionChart data={volatilityData} height={450} threshold={2.5} />
                  
                  {/* 波动率比率分析 */}
                  <VolatilityRatioChart data={volatilityData} height={450} />
                </Box>

                {/* 使用说明 */}
                <Paper elevation={2} sx={{ p: 3, mt: 3, bgcolor: 'info.light' }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                    📖 图表使用指南
                  </Typography>
                  <Typography variant="body2" paragraph sx={{ mt: 2 }}>
                    <strong>📊 核心图表:</strong> 展示波动率的基本趋势和价格走势中的极端波动事件
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>📈 移动窗口分析:</strong> 对比7、14、30周期的滚动波动率，短窗口敏感度高，长窗口平滑性好
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>⏱️ 多时间周期对比:</strong> 对比1小时、4小时、1天等不同时间尺度的波动率，揭示短期与长期差异
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>📊 年化波动率:</strong> 标准化为年化值，便于跨市场比较和策略评估
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>📊 统计分布:</strong> 通过直方图和箱线图了解波动率的集中区间和离群值情况
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>🔬 结构分析:</strong> ACF图检测波动聚集性（GARCH效应），散点图分析波动率与收益率关系
                  </Typography>
                  <Typography variant="body2" paragraph>
                    <strong>🎯 高级分析:</strong> Parkinson、热力图、EWMA预测、锥形图、贡献分解、跳跃检测、比率分析
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2, p: 1.5, bgcolor: 'background.paper', borderRadius: 1 }}>
                    💡 <strong>提示:</strong> 所有图表支持交互操作，鼠标悬停查看详细数据，部分图表支持缩放和拖动。
                    建议结合多个图表综合分析，制定更科学的交易策略。
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
    </VolatilityContainer>
  );
}
