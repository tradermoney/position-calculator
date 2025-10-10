import React from 'react';
import { Stack, CircularProgress, Box } from '@mui/material';
import { useBreakEvenCalculator } from './useBreakEvenCalculator';
import InputForm from './components/InputForm';
import ResultPanel from './components/ResultPanel';

export default function BreakEvenCalculator() {
  const {
    inputs,
    errors,
    result,
    isLoading,
    symbols,
    symbolInfo,
    fundingHistory,
    currentFundingRate,
    symbolsLoading,
    fundingDataLoading,
    updateLeverage,
    updateOpenFeeRate,
    updateCloseFeeRate,
    updateFundingRate,
    updateFundingPeriod,
    updateHoldingTime,
    updateSymbol,
    updatePositionDirection,
    reset,
    loadFundingData,
  } = useBreakEvenCalculator();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

        return (
          <Stack spacing={3} sx={{ width: '100%', maxWidth: '100%', px: 0 }}>
            <InputForm
              inputs={inputs}
              errors={errors}
              symbols={symbols}
              symbolsLoading={symbolsLoading}
              fundingDataLoading={fundingDataLoading}
              onLeverageChange={updateLeverage}
              onOpenFeeRateChange={updateOpenFeeRate}
              onCloseFeeRateChange={updateCloseFeeRate}
              onFundingRateChange={updateFundingRate}
              onFundingPeriodChange={updateFundingPeriod}
              onHoldingTimeChange={updateHoldingTime}
              onSymbolChange={updateSymbol}
              onPositionDirectionChange={updatePositionDirection}
              onReset={reset}
            />
            <ResultPanel result={result} />
          </Stack>
        );
}