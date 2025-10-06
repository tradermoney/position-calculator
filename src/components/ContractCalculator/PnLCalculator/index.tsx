import React from 'react';
import { Stack } from '@mui/material';
import { usePnLCalculator } from './usePnLCalculator';
import PnLForm from './components/PnLForm';
import PnLResultPanel from './components/PnLResultPanel';

export default function PnLCalculator() {
  const {
    side,
    setSide,
    capital,
    handleCapitalChange,
    leverage,
    setLeverage,
    calculatePositionUsage,
    positions,
    positionStats,
    sensors,
    handleDragEnd,
    addPosition,
    insertPosition,
    removePosition,
    updatePosition,
    getInputValue,
    handleInputChange,
    registerInputRef,
    handleInputFocus,
    handleInputBlur,
    handleCalculate,
    handleReset,
    errors,
    result,
  } = usePnLCalculator();

  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: '100%', px: 0 }}>
      <PnLForm
        side={side}
        setSide={setSide}
        capital={capital}
        handleCapitalChange={handleCapitalChange}
        leverage={leverage}
        setLeverage={setLeverage}
        calculatePositionUsage={calculatePositionUsage}
        positions={positions}
        positionStats={positionStats}
        sensors={sensors}
        onDragEnd={handleDragEnd}
        addPosition={addPosition}
        insertPosition={insertPosition}
        removePosition={removePosition}
        updatePosition={updatePosition}
        getInputValue={(id, field, fallback) => getInputValue(id, field, fallback)}
        handleInputChange={handleInputChange}
        registerInputRef={registerInputRef}
        handleInputFocus={handleInputFocus}
        handleInputBlur={handleInputBlur}
        handleCalculate={handleCalculate}
        handleReset={handleReset}
        errors={errors}
      />
      <PnLResultPanel result={result} />
    </Stack>
  );
}
