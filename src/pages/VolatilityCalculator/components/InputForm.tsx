import React from 'react';
import { Typography, Button, Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import {
  Calculate as CalculateIcon,
  Clear as ClearIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { CalculationMode } from '../types';
import {
  CalculatorCard,
  InputSection,
  InputGroup,
  PriceInput,
  ActionSection,
} from '../../../styles/volatilityCalculator';

interface InputFormProps {
  calculationMode: CalculationMode;
  price1: string;
  price2: string;
  volatilityInput: string;
  investmentAmount: string;
  onModeChange: (mode: CalculationMode) => void;
  onPrice1Change: (value: string) => void;
  onPrice2Change: (value: string) => void;
  onVolatilityChange: (value: string) => void;
  onInvestmentAmountChange: (value: string) => void;
  onSaveRecord: () => void;
  onClearInputs: () => void;
  canSave: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({
  calculationMode,
  price1,
  price2,
  volatilityInput,
  investmentAmount,
  onModeChange,
  onPrice1Change,
  onPrice2Change,
  onVolatilityChange,
  onInvestmentAmountChange,
  onSaveRecord,
  onClearInputs,
  canSave,
}) => {
  return (
    <CalculatorCard>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CalculateIcon />
        计算设置
      </Typography>

      {/* 计算模式选择器 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          计算模式
        </Typography>
        <ToggleButtonGroup
          value={calculationMode}
          exclusive
          onChange={(_, newMode) => {
            if (newMode !== null) {
              onModeChange(newMode);
            }
          }}
          size="small"
          fullWidth
        >
          <ToggleButton value={CalculationMode.FORWARD}>
            <TrendingUpIcon sx={{ mr: 1 }} />
            正向计算
          </ToggleButton>
          <ToggleButton value={CalculationMode.REVERSE}>
            <TrendingDownIcon sx={{ mr: 1 }} />
            反向计算
          </ToggleButton>
        </ToggleButtonGroup>
        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
          {calculationMode === CalculationMode.FORWARD
            ? '输入起始价格和目标价格，计算波动率'
            : '输入起始价格和波动率，计算目标价格'
          }
        </Typography>
      </Box>

      <InputSection>
        <InputGroup>
          <PriceInput
            label="起始价格"
            type="number"
            value={price1}
            onChange={(e) => onPrice1Change(e.target.value)}
            placeholder="请输入起始价格"
            fullWidth
            inputProps={{
              min: 0,
              step: 0.0001,
            }}
          />
        </InputGroup>

        {calculationMode === CalculationMode.FORWARD ? (
          <InputGroup>
            <PriceInput
              label="目标价格"
              type="number"
              value={price2}
              onChange={(e) => onPrice2Change(e.target.value)}
              placeholder="请输入目标价格"
              fullWidth
              inputProps={{
                min: 0,
                step: 0.0001,
              }}
            />
          </InputGroup>
        ) : (
          <InputGroup>
            <PriceInput
              label="波动率 (%)"
              type="number"
              value={volatilityInput}
              onChange={(e) => onVolatilityChange(e.target.value)}
              placeholder="请输入波动率"
              fullWidth
              inputProps={{
                min: 0,
                max: 99.99,
                step: 0.01,
              }}
            />
          </InputGroup>
        )}

        <InputGroup>
          <PriceInput
            label="投资金额"
            type="number"
            value={investmentAmount}
            onChange={(e) => onInvestmentAmountChange(e.target.value)}
            placeholder="请输入投资金额"
            fullWidth
            inputProps={{
              min: 0,
              step: 0.01,
            }}
            helperText="可选，计算波动影响"
          />
        </InputGroup>
      </InputSection>

      {/* 操作按钮 */}
      <ActionSection>
        <Button
          variant="contained"
          startIcon={<CalculateIcon />}
          onClick={onSaveRecord}
          disabled={!canSave}
          size="large"
        >
          保存记录
        </Button>
        <Button
          variant="outlined"
          startIcon={<ClearIcon />}
          onClick={onClearInputs}
          size="large"
          sx={{ whiteSpace: 'nowrap' }}
        >
          清空输入
        </Button>
      </ActionSection>
    </CalculatorCard>
  );
};
