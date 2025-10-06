import React from 'react';
import {
  Box,
  Grid,
  Typography,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
} from '@mui/material';
import { HelpOutline as HelpIcon } from '@mui/icons-material';
import { RiskAdjustment } from '../../../utils/kellyCalculations';
import { formatPercentage } from '../../../utils/kellyCalculations';

interface RiskAdjustmentSettingsProps {
  riskAdjustment: RiskAdjustment;
  onRiskAdjustmentChange: (value: RiskAdjustment) => void;
}

export function RiskAdjustmentSettings({
  riskAdjustment,
  onRiskAdjustmentChange,
}: RiskAdjustmentSettingsProps) {
  return (
    <>
      <Typography variant="subtitle2" gutterBottom>
        风险调整设置
      </Typography>

      <Grid container spacing={{ xs: 1, sm: 2, md: 3 }}>
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography gutterBottom>
              分数凯里系数: {formatPercentage(riskAdjustment.fractionalFactor)}
            </Typography>
            <Tooltip title="使用凯利比例的一定百分比来降低风险。例如：50%表示使用计算出的凯利比例的一半。建议使用25%-50%来平衡收益与风险">
              <IconButton size="small">
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Slider
            value={riskAdjustment.fractionalFactor}
            onChange={(e, value) =>
              onRiskAdjustmentChange({ ...riskAdjustment, fractionalFactor: value as number })
            }
            min={0.1}
            max={1}
            step={0.1}
            marks={[
              { value: 0.25, label: '25%' },
              { value: 0.5, label: '50%' },
              { value: 0.75, label: '75%' },
              { value: 1, label: '100%' },
            ]}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography gutterBottom>
              最大仓位限制: {formatPercentage(riskAdjustment.maxPosition)}
            </Typography>
            <Tooltip title="设置单次交易的最大仓位比例上限。即使凯利公式计算出更高的比例，也不会超过此限制。建议设置为10%-25%">
              <IconButton size="small">
                <HelpIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          <Slider
            value={riskAdjustment.maxPosition}
            onChange={(e, value) =>
              onRiskAdjustmentChange({ ...riskAdjustment, maxPosition: value as number })
            }
            min={0.05}
            max={0.5}
            step={0.05}
            marks={[
              { value: 0.1, label: '10%' },
              { value: 0.25, label: '25%' },
              { value: 0.5, label: '50%' },
            ]}
          />
        </Grid>
      </Grid>

      <Box mt={2} display="flex" alignItems="center" gap={1}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>风险偏好</InputLabel>
          <Select
            value={riskAdjustment.riskTolerance}
            onChange={(e) =>
              onRiskAdjustmentChange({ ...riskAdjustment, riskTolerance: e.target.value as 'conservative' | 'moderate' | 'aggressive' })
            }
            label="风险偏好"
          >
            <MenuItem value="conservative">保守</MenuItem>
            <MenuItem value="moderate">适中</MenuItem>
            <MenuItem value="aggressive">激进</MenuItem>
          </Select>
        </FormControl>
        <Tooltip title="风险偏好设置：保守（建议新手使用，降低波动），适中（平衡收益与风险），激进（追求更高收益，承受更大波动）">
          <IconButton size="small">
            <HelpIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </>
  );
}
