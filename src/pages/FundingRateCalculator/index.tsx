/**
 * 资金费率计算器主组件
 */

import React from 'react';
import { Container, Typography, Grid } from '@mui/material';
import { useFundingRateCalculator } from './hooks/useFundingRateCalculator';
import ParameterInputCard from './components/ParameterInputCard';
import ResultCard from './components/ResultCard';
import UsageGuideCard from './components/UsageGuideCard';

const FundingRateCalculator: React.FC = () => {
  const {
    symbol,
    longInputMode,
    longPositionSize,
    longEntryPrice,
    longQuantity,
    shortInputMode,
    shortPositionSize,
    shortEntryPrice,
    shortQuantity,
    timeMode,
    holdingHours,
    setSymbol,
    setLongInputMode,
    setLongPositionSize,
    setLongEntryPrice,
    setLongQuantity,
    setShortInputMode,
    setShortPositionSize,
    setShortEntryPrice,
    setShortQuantity,
    setTimeMode,
    setHoldingHours,
    symbols,
    symbolInfo,
    fundingHistory,
    currentFundingRate,
    loading,
    error,
    symbolsLoading,
    result,
  } = useFundingRateCalculator();

  // 计算实际仓位大小用于显示
  const getLongSize = () => {
    if (longInputMode === 'direct') {
      return parseFloat(longPositionSize) || 0;
    }
    return (parseFloat(longEntryPrice) || 0) * (parseFloat(longQuantity) || 0);
  };

  const getShortSize = () => {
    if (shortInputMode === 'direct') {
      return parseFloat(shortPositionSize) || 0;
    }
    return (parseFloat(shortEntryPrice) || 0) * (parseFloat(shortQuantity) || 0);
  };

  const longSize = getLongSize();
  const shortSize = getShortSize();

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        资金费率计算器
      </Typography>

      <Grid container spacing={3}>
        {/* 输入区域 */}
        <Grid item xs={12} md={6}>
          <ParameterInputCard
            symbol={symbol}
            symbolInfo={symbolInfo}
            longInputMode={longInputMode}
            longPositionSize={longPositionSize}
            longEntryPrice={longEntryPrice}
            longQuantity={longQuantity}
            shortInputMode={shortInputMode}
            shortPositionSize={shortPositionSize}
            shortEntryPrice={shortEntryPrice}
            shortQuantity={shortQuantity}
            timeMode={timeMode}
            holdingHours={holdingHours}
            symbols={symbols}
            symbolsLoading={symbolsLoading}
            error={error}
            onSymbolChange={setSymbol}
            onLongInputModeChange={setLongInputMode}
            onLongPositionSizeChange={setLongPositionSize}
            onLongEntryPriceChange={setLongEntryPrice}
            onLongQuantityChange={setLongQuantity}
            onShortInputModeChange={setShortInputMode}
            onShortPositionSizeChange={setShortPositionSize}
            onShortEntryPriceChange={setShortEntryPrice}
            onShortQuantityChange={setShortQuantity}
            onTimeModeChange={setTimeMode}
            onHoldingHoursChange={setHoldingHours}
          />
        </Grid>

        {/* 结果区域 */}
        <Grid item xs={12} md={6}>
          <ResultCard
            loading={loading}
            result={result}
            currentFundingRate={currentFundingRate}
            fundingHistoryLength={fundingHistory.length}
            longPositionSize={longSize}
            shortPositionSize={shortSize}
            timeMode={timeMode}
            symbolInfo={symbolInfo}
          />
        </Grid>

        {/* 说明信息 */}
        <Grid item xs={12}>
          <UsageGuideCard />
        </Grid>
      </Grid>
    </Container>
  );
};

export default FundingRateCalculator;
