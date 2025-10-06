import React, { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { usePageTitle } from '../utils/titleManager';
import {
  AddPositionParams,
  AddPositionResult,
  ManualPositionInputs,
  PositionSide,
} from '../types/addPosition';
import {
  validateAddParams,
  calculateAddPositionResult,
  buildPositionFromManualInputs,
  validateManualPosition,
} from '../utils/addPositionCalculations';
import AddPositionForm from '../components/AddPosition/AddPositionForm';
import AddPositionResults from '../components/AddPosition/AddPositionResults';

export default function AddPositionCalculator() {
  const [positionInputs, setPositionInputs] = useState<ManualPositionInputs>({
    symbol: '',
    side: PositionSide.LONG,
    leverage: '',
    entryPrice: '',
    quantity: '',
    margin: '',
  });
  const [addParams, setAddParams] = useState<AddPositionParams>({
    addPrice: 0,
    addQuantity: 0,
    addMargin: 0,
  });
  const [result, setResult] = useState<AddPositionResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 设置页面标题
  usePageTitle('add-position');

  // 计算补仓结果
  const calculateAddPosition = (): void => {
    const baseErrors = validateManualPosition(positionInputs);
    if (baseErrors.length > 0) {
      setErrors(baseErrors);
      setResult(null);
      return;
    }

    const currentPosition = buildPositionFromManualInputs(positionInputs);

    const validationErrors = validateAddParams(currentPosition, addParams);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResult(null);
      return;
    }

    setErrors([]);

    const calculationResult = calculateAddPositionResult(currentPosition, addParams);
    setResult(calculationResult);
  };

  // 重置表单
  const resetForm = (): void => {
    setPositionInputs({
      symbol: '',
      side: PositionSide.LONG,
      leverage: '',
      entryPrice: '',
      quantity: '',
      margin: '',
    });
    setAddParams({
      addPrice: 0,
      addQuantity: 0,
      addMargin: 0,
    });
    setResult(null);
    setErrors([]);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: '#fafafa',
        py: 4
      }}
    >
      <Box maxWidth="lg" width="100%">
        <Typography variant="h4" component="h1" textAlign="center" gutterBottom>
          补仓计算器
        </Typography>

        <Typography variant="body1" color="textSecondary" textAlign="center" paragraph>
          输入当前仓位信息以及计划补仓数据，快速评估补仓后的成本与风险
        </Typography>

        <Grid container spacing={3}>
          {/* 左侧：补仓参数输入 */}
          <Grid item xs={12} md={6}>
            <AddPositionForm
              positionInputs={positionInputs}
              addParams={addParams}
              errors={errors}
              onPositionChange={(field, value) => setPositionInputs(prev => ({ ...prev, [field]: value }))}
              onParamsChange={setAddParams}
              onCalculate={calculateAddPosition}
              onReset={resetForm}
            />
          </Grid>

          {/* 右侧：计算结果显示 */}
          <Grid item xs={12} md={6}>
            <AddPositionResults
              result={result}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
