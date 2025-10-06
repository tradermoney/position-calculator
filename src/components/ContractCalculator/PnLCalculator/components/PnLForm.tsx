import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  InputAdornment,
  TextField,
  Typography,
  Alert,
  Slider,
} from '@mui/material';
import {
  Calculate as CalculateIcon,
  Refresh as RefreshIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import type { DndContextProps, DragEndEvent } from '@dnd-kit/core';
import { PositionSide, formatPercentage } from '../../../../utils/contractCalculations';
import PositionTable from './PositionTable';
import TooltipIcon from '../../../common/TooltipIcon';
import { Position, PositionStat } from '../types';

interface PnLFormProps {
  side: PositionSide;
  setSide: (side: PositionSide) => void;
  capital: number;
  handleCapitalChange: (value: string) => void;
  leverage: number;
  setLeverage: (value: number) => void;
  calculatePositionUsage: () => number;
  positions: Position[];
  positionStats: Map<number, PositionStat>;
  sensors: DndContextProps['sensors'];
  onDragEnd: (event: DragEndEvent) => void;
  addPosition: () => void;
  insertPosition: (index: number, direction: 'above' | 'below') => void;
  removePosition: (id: number) => void;
  updatePosition: (id: number, field: keyof Position, value: unknown) => void;
  getInputValue: (id: number, field: 'price' | 'quantity' | 'quantityUsdt' | 'marginUsdt' | 'capital', fallbackValue: number) => string;
  handleInputChange: (id: number, field: 'price' | 'quantity' | 'quantityUsdt' | 'marginUsdt', value: string) => void;
  registerInputRef: (key: string) => (element: HTMLInputElement | null) => void;
  handleInputFocus: (key: string) => void;
  handleInputBlur: (key: string) => void;
  handleCalculate: () => void;
  handleReset: () => void;
  errors: string[];
  onImportPositions: (positions: Position[]) => void;
  onImportConfig: (config: {
    side: PositionSide;
    capital: number;
    leverage: number;
    positions: Position[];
  }) => void;
}

export default function PnLForm({
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
  onDragEnd,
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
  onImportPositions,
  onImportConfig,
}: PnLFormProps) {
  return (
    <>
      <Card>
        <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
          <Typography variant="h6" gutterBottom>
            仓位信息
          </Typography>

          <Box mb={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle2">
                仓位方向
              </Typography>
              <TooltipIcon title="选择交易方向：做多表示看涨，做空表示看跌" />
            </Box>
            <Box display="flex" gap={1}>
              <Button
                variant={side === PositionSide.LONG ? 'contained' : 'outlined'}
                color="success"
                startIcon={<TrendingUpIcon />}
                onClick={() => setSide(PositionSide.LONG)}
                sx={{ flex: 1 }}
              >
                做多
              </Button>
              <Button
                variant={side === PositionSide.SHORT ? 'contained' : 'outlined'}
                color="error"
                startIcon={<TrendingDownIcon />}
                onClick={() => setSide(PositionSide.SHORT)}
                sx={{ flex: 1 }}
              >
                做空
              </Button>
            </Box>
          </Box>

          <Box mb={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle2">
                总资金（可选）
              </Typography>
              <TooltipIcon title="输入您的总资金，用于计算仓位使用率。不填写则不会显示使用率信息" />
            </Box>
            <TextField
              fullWidth
              type="text"
              value={getInputValue(0, 'capital', capital)}
              onChange={(e) => handleCapitalChange(e.target.value)}
              placeholder="输入总资金以计算仓位使用率"
              inputProps={{ pattern: '[0-9]*\\.?[0-9]*', inputMode: 'decimal' }}
              InputProps={{ endAdornment: <InputAdornment position="end">USDT</InputAdornment> }}
              inputRef={registerInputRef('capital')}
              onFocus={() => handleInputFocus('capital')}
              onBlur={() => handleInputBlur('capital')}
            />
            {capital > 0 && (
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                仓位使用率: {formatPercentage(calculatePositionUsage(), 2)}%
              </Typography>
            )}
          </Box>

          <Box mb={3}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography variant="subtitle2">
                杠杆倍数
              </Typography>
              <TooltipIcon title="杠杆倍数决定资金放大比例。例如10倍杠杆意味着用1元可以控制10元的仓位" />
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <TextField
                type="text"
                value={leverage === 0 ? '' : leverage}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setLeverage(0);
                  } else if (/^\d+$/.test(value)) {
                    const numValue = parseInt(value);
                    if (numValue <= 125) {
                      setLeverage(numValue);
                    }
                  }
                }}
                onBlur={() => {
                  if (leverage < 1 || leverage === 0) setLeverage(1);
                  if (leverage > 125) setLeverage(125);
                }}
                placeholder="1-125"
                inputProps={{ pattern: '[0-9]*', inputMode: 'numeric' }}
                InputProps={{ endAdornment: <InputAdornment position="end">x</InputAdornment> }}
                sx={{ width: 120 }}
              />
              <Box flex={1}>
                <Slider
                  value={leverage || 1}
                  onChange={(e, value) => setLeverage(value as number)}
                  min={1}
                  max={125}
                  step={1}
                  marks={[
                    { value: 1, label: '1x' },
                    { value: 25, label: '25x' },
                    { value: 50, label: '50x' },
                    { value: 75, label: '75x' },
                    { value: 100, label: '100x' },
                    { value: 125, label: '125x' },
                  ]}
                  valueLabelDisplay="auto"
                />
              </Box>
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />

          <PositionTable
            positions={positions}
            positionStats={positionStats}
            leverage={leverage}
            sensors={sensors}
            onDragEnd={onDragEnd}
            onAddPosition={addPosition}
            insertPosition={insertPosition}
            removePosition={removePosition}
            getInputValue={(id, field, fallback) => getInputValue(id, field, fallback)}
            handleInputChange={handleInputChange}
            updatePosition={updatePosition}
            registerInputRef={registerInputRef}
            handleInputFocus={handleInputFocus}
            handleInputBlur={handleInputBlur}
          />

          <Box mt={3} display="flex" gap={2}>
            <Button variant="contained" startIcon={<CalculateIcon />} onClick={handleCalculate} fullWidth>
              计算
            </Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleReset} fullWidth>
              重置
            </Button>
          </Box>

          {errors.length > 0 && (
            <Box mt={2}>
              {errors.map((error, index) => (
                <Alert key={index} severity="error" sx={{ mb: 1 }}>
                  {error}
                </Alert>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

    </>
  );
}
