import React, { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { useAppContext } from '../contexts/AppContext';
import { usePageTitle } from '../utils/titleManager';
import {
  Position,
  PositionStatus,
  AddPositionParams,
  AddPositionResult
} from '../types/addPosition';
import {
  validateAddParams,
  calculateAddPositionResult
} from '../utils/addPositionCalculations';
import AddPositionForm from '../components/AddPosition/AddPositionForm';
import AddPositionResults from '../components/AddPosition/AddPositionResults';

export default function AddPositionCalculator() {
  const { state, updatePosition } = useAppContext();
  const [selectedPositionId, setSelectedPositionId] = useState<string>('');
  const [addParams, setAddParams] = useState<AddPositionParams>({
    addPrice: 0,
    addQuantity: 0,
    addMargin: 0,
  });
  const [result, setResult] = useState<AddPositionResult | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  // 设置页面标题
  usePageTitle('add-position');

  // 获取活跃仓位
  const activePositions = state.positions.filter(p => p.status === PositionStatus.ACTIVE);
  const selectedPosition = activePositions.find(p => p.id === selectedPositionId);

  // 计算补仓结果
  const calculateAddPosition = (): void => {
    const validationErrors = validateAddParams(selectedPosition, addParams);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setResult(null);
      return;
    }

    if (!selectedPosition) return;

    setErrors([]);

    const calculationResult = calculateAddPositionResult(selectedPosition, addParams);
    setResult(calculationResult);
  };

  // 应用补仓方案
  const applyAddPosition = (): void => {
    if (!result || !selectedPosition) return;

    const updatedPosition: Position = {
      ...selectedPosition,
      entryPrice: result.newAveragePrice,
      quantity: result.newTotalQuantity,
      margin: result.newTotalMargin,
      updatedAt: new Date(),
    };

    updatePosition(updatedPosition);

    // 重置表单
    resetForm();

    // 显示成功消息
    alert('补仓方案已应用成功！');
  };

  // 重置表单
  const resetForm = (): void => {
    setSelectedPositionId('');
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
          选择已有仓位，计算补仓后的成本价和风险变化
        </Typography>

        <Grid container spacing={3}>
          {/* 左侧：补仓参数输入 */}
          <Grid item xs={12} md={6}>
            <AddPositionForm
              activePositions={activePositions}
              selectedPositionId={selectedPositionId}
              selectedPosition={selectedPosition}
              addParams={addParams}
              errors={errors}
              onPositionSelect={setSelectedPositionId}
              onParamsChange={setAddParams}
              onCalculate={calculateAddPosition}
              onReset={resetForm}
            />
          </Grid>

          {/* 右侧：计算结果显示 */}
          <Grid item xs={12} md={6}>
            <AddPositionResults
              result={result}
              onApply={applyAddPosition}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
