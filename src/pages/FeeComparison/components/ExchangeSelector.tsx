import React, { useState } from 'react';
import {
  Box,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Chip,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { ExchangeFeeConfig, CustomExchangeConfig } from '../types';
import { validateCustomFee } from '../utils/calculations';

interface ExchangeSelectorProps {
  allExchanges: ExchangeFeeConfig[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onAddCustomExchange: (exchange: ExchangeFeeConfig) => void;
}

export default function ExchangeSelector({
  allExchanges,
  selectedIds,
  onSelectionChange,
  onAddCustomExchange,
}: ExchangeSelectorProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [customConfig, setCustomConfig] = useState<CustomExchangeConfig>({
    name: '',
    makerFee: '',
    takerFee: '',
  });
  const [customErrors, setCustomErrors] = useState<string[]>([]);

  const handleToggle = (id: string) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    onSelectionChange(allExchanges.map((ex) => ex.id));
  };

  const handleDeselectAll = () => {
    onSelectionChange([]);
  };

  const handleAddCustom = () => {
    const errors = validateCustomFee(customConfig.makerFee, customConfig.takerFee);
    if (!customConfig.name.trim()) {
      errors.push('交易所名称不能为空');
    }

    if (errors.length > 0) {
      setCustomErrors(errors);
      return;
    }

    const newExchange: ExchangeFeeConfig = {
      id: `custom-${Date.now()}`,
      name: customConfig.name,
      makerFee: parseFloat(customConfig.makerFee),
      takerFee: parseFloat(customConfig.takerFee),
    };

    onAddCustomExchange(newExchange);
    setDialogOpen(false);
    setCustomConfig({ name: '', makerFee: '', takerFee: '' });
    setCustomErrors([]);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">选择对比交易所</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" onClick={handleSelectAll}>
            全选
          </Button>
          <Button size="small" onClick={handleDeselectAll}>
            清空
          </Button>
          <Button
            size="small"
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            自定义
          </Button>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {allExchanges.map((exchange) => (
          <FormControlLabel
            key={exchange.id}
            control={
              <Checkbox
                checked={selectedIds.includes(exchange.id)}
                onChange={() => handleToggle(exchange.id)}
                size="small"
              />
            }
            label={
              <Box>
                <Typography variant="body2">{exchange.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  M: {exchange.makerFee}% / T: {exchange.takerFee}%
                </Typography>
              </Box>
            }
            sx={{ mr: 2, mb: 1 }}
          />
        ))}
      </Box>

      {selectedIds.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            已选择 {selectedIds.length} 个交易所
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedIds.map((id) => {
              const exchange = allExchanges.find((ex) => ex.id === id);
              return exchange ? (
                <Chip
                  key={id}
                  label={exchange.name}
                  size="small"
                  onDelete={() => handleToggle(id)}
                />
              ) : null;
            })}
          </Box>
        </Box>
      )}

      {/* 自定义交易所对话框 */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>添加自定义交易所</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2 }}>
            <TextField
              label="交易所名称"
              value={customConfig.name}
              onChange={(e) => setCustomConfig({ ...customConfig, name: e.target.value })}
              fullWidth
              placeholder="例如：Binance (VIP 3)"
            />
            <TextField
              label="Maker费率 (%)"
              type="number"
              value={customConfig.makerFee}
              onChange={(e) => setCustomConfig({ ...customConfig, makerFee: e.target.value })}
              fullWidth
              placeholder="例如：0.02"
              inputProps={{ step: 0.001, min: 0, max: 1 }}
            />
            <TextField
              label="Taker费率 (%)"
              type="number"
              value={customConfig.takerFee}
              onChange={(e) => setCustomConfig({ ...customConfig, takerFee: e.target.value })}
              fullWidth
              placeholder="例如：0.04"
              inputProps={{ step: 0.001, min: 0, max: 1 }}
            />

            {customErrors.length > 0 && (
              <Box
                sx={{
                  p: 2,
                  backgroundColor: 'error.light',
                  borderRadius: 1,
                  color: 'error.contrastText',
                }}
              >
                {customErrors.map((error, index) => (
                  <Typography key={index} variant="body2">
                    • {error}
                  </Typography>
                ))}
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button onClick={handleAddCustom} variant="contained">
            添加
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}


