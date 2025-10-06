import React from 'react';
import { Typography, Alert } from '@mui/material';
import { usePageTitle } from '../../utils/titleManager';
import { useCalculation } from './hooks/useCalculation';
import { useHistory } from './hooks/useHistory';
import { CalculationMode } from './types';
import { InputForm } from './components/InputForm';
import { ForwardResult } from './components/ForwardResult';
import { ReverseResult } from './components/ReverseResult';
import { HistorySidebar } from './components/HistorySidebar';
import { InfoSection } from './components/InfoSection';
import {
  VolatilityContainer,
  ResponsiveGrid,
  CalculatorMain,
  HistorySidebar as HistorySidebarStyled,
} from '../../styles/volatilityCalculator';

export default function VolatilityCalculator() {
  usePageTitle('volatility-calculator');

  // 使用计算 hook
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

  // 使用历史记录 hook
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
        </CalculatorMain>

        {/* 历史记录侧边栏 */}
        <HistorySidebarStyled>
          <HistorySidebar
            history={history}
            onRestore={restoreFromHistory}
            onDelete={deleteRecord}
            onClearHistory={clearHistory}
          />
        </HistorySidebarStyled>
      </ResponsiveGrid>
    </VolatilityContainer>
  );
}
