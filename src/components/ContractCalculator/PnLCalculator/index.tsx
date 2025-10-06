import React, { useState } from 'react';
import { Stack, Alert, Snackbar } from '@mui/material';
import { usePnLCalculator } from './usePnLCalculator';
import PnLForm from './components/PnLForm';
import PnLResultPanel from './components/PnLResultPanel';
import PositionManager from '../../PositionManager/PositionManager';
import { RestorePositionParams } from '../../../types/position';

export default function PnLCalculator() {
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

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
    inputValues,
    restorePosition,
    importPositions,
    importPositionConfig,
    editingPosition,
    setEditingPosition,
  } = usePnLCalculator();

  // 处理仓位恢复
  const handleRestorePosition = (params: RestorePositionParams) => {
    try {
      restorePosition(params);
      setSnackbarMessage(`已恢复仓位：${params.name}`);
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (error) {
      setSnackbarMessage(`恢复仓位失败：${error instanceof Error ? error.message : '未知错误'}`);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // 处理保存成功
  const handleSaveSuccess = () => {
    setSnackbarMessage('仓位保存成功');
    setSnackbarSeverity('success');
    setSnackbarOpen(true);
  };

  // 处理错误
  const handleError = (error: string) => {
    setSnackbarMessage(error);
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
  };

  return (
    <Stack spacing={2} sx={{ width: '100%', maxWidth: '100%', px: 0 }}>
      {/* 仓位管理 */}
      <PositionManager
        side={side}
        capital={capital}
        leverage={leverage}
        positions={positions}
        inputValues={inputValues}
        onRestorePosition={handleRestorePosition}
        onSaveSuccess={handleSaveSuccess}
        onError={handleError}
        editingPosition={editingPosition}
        onClearEditing={() => setEditingPosition(null)}
        onImportPositions={importPositions}
        onImportConfig={importPositionConfig}
      />

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
        onImportPositions={importPositions}
        onImportConfig={importPositionConfig}
      />
      <PnLResultPanel result={result} />

      {/* 消息提示 */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
