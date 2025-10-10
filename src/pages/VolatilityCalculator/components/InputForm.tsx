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
import FieldTooltip from './FieldTooltip';

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
        <Typography variant="subtitle2" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          计算模式
          <FieldTooltip
            title={
              <Box sx={{ p: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  计算模式选择
                </Typography>
                <Typography variant="body2" paragraph>
                  选择波动率的计算方式：
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>正向计算：</strong><br/>
                  输入起始价格和目标价格，系统计算价格变动的波动率百分比。<br/>
                  例如：从100涨到110，计算出波动率为10%。
                </Typography>
                <Typography variant="body2">
                  <strong>反向计算：</strong><br/>
                  输入起始价格和期望的波动率，系统计算达到该波动率时的目标价格。<br/>
                  例如：从100开始，涨10%，计算出目标价格为110。
                </Typography>
              </Box>
            }
            placement="right"
          />
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
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                起始价格
                <FieldTooltip
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        起始价格
                      </Typography>
                      <Typography variant="body2" paragraph>
                        波动率计算的基准价格，通常是买入价或当前价格。
                      </Typography>
                      <Typography variant="body2">
                        <strong>示例：</strong>如果你以50000美元买入BTC，这里就填入50000。
                      </Typography>
                    </Box>
                  }
                  placement="right"
                />
              </Box>
            }
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
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  目标价格
                  <FieldTooltip
                    title={
                      <Box sx={{ p: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          目标价格
                        </Typography>
                        <Typography variant="body2" paragraph>
                          要计算波动率的目标价格，可以是预期价格或止盈/止损价格。
                        </Typography>
                        <Typography variant="body2">
                          <strong>示例：</strong>如果预期BTC涨到55000美元，这里填入55000，系统会计算从起始价格到目标价格的波动率。
                        </Typography>
                      </Box>
                    }
                    placement="right"
                  />
                </Box>
              }
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
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  波动率 (%)
                  <FieldTooltip
                    title={
                      <Box sx={{ p: 0.5 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                          波动率百分比
                        </Typography>
                        <Typography variant="body2" paragraph>
                          期望的价格波动百分比，可以是正数（上涨）或负数（下跌）。
                        </Typography>
                        <Typography variant="body2" paragraph>
                          <strong>示例：</strong><br/>
                          • 输入 10 表示上涨10%<br/>
                          • 输入 -10 表示下跌10%
                        </Typography>
                        <Typography variant="body2">
                          系统会根据起始价格和波动率计算出对应的目标价格。
                        </Typography>
                      </Box>
                    }
                    placement="right"
                  />
                </Box>
              }
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
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                投资金额
                <FieldTooltip
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        投资金额（可选）
                      </Typography>
                      <Typography variant="body2" paragraph>
                        输入实际投资金额后，系统会计算价格波动对投资的实际影响金额。
                      </Typography>
                      <Typography variant="body2" paragraph>
                        <strong>示例：</strong>投资10000美元，价格上涨10%，系统会显示盈利1000美元。
                      </Typography>
                      <Typography variant="body2">
                        <strong>💡 提示：</strong>此字段为可选项，如果不填写，系统只计算波动率百分比。
                      </Typography>
                    </Box>
                  }
                  placement="right"
                />
              </Box>
            }
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
