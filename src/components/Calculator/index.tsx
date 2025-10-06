import React from 'react';
import { Paper, Grid } from '@mui/material';
import { CalculatorContainer } from '../../styles/calculator';
import { DisplayArea } from './components/DisplayArea';
import { ButtonPanel } from './components/ButtonPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { useCalculator } from './hooks';
import { formatTime } from './utils/calculations';

export default function Calculator() {
  const {
    display,
    expression,
    history,
    error,
    isResult,
    isEditing,
    inputRef,
    handleClear,
    handleBackspace,
    handleInput,
    handleCalculate,
    handleKeyDown,
    handleExpressionChange,
    enterEditMode,
    exitEditMode,
    setCursorPosition,
    handleRestoreFromHistory,
    handleDeleteRecord,
    handleClearHistory,
  } = useCalculator();

  return (
    <CalculatorContainer>
      <Grid container spacing={3}>
        {/* 计算器主体 */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <DisplayArea
              isEditing={isEditing}
              expression={expression}
              display={display}
              isResult={isResult}
              error={error}
              inputRef={inputRef}
              handleExpressionChange={handleExpressionChange}
              handleKeyDown={handleKeyDown}
              exitEditMode={exitEditMode}
              enterEditMode={enterEditMode}
              setCursorPosition={setCursorPosition}
            />

            <ButtonPanel
              isEditing={isEditing}
              handleClear={handleClear}
              handleBackspace={handleBackspace}
              handleInput={handleInput}
              handleCalculate={handleCalculate}
            />
          </Paper>
        </Grid>

        {/* 历史记录 */}
        <Grid item xs={12} md={4}>
          <HistoryPanel
            history={history}
            handleRestoreFromHistory={handleRestoreFromHistory}
            handleDeleteRecord={handleDeleteRecord}
            handleClearHistory={handleClearHistory}
            formatTime={formatTime}
          />
        </Grid>
      </Grid>
    </CalculatorContainer>
  );
}
