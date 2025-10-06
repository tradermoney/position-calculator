import React from 'react';
import {
  Box,
  Button,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Checkbox,
  TextField,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { TradeRecord } from '../../../utils/kellyCalculations';
import { addTrade, removeTrade, updateTrade } from '../utils';

interface HistoricalDataTableProps {
  trades: TradeRecord[];
  onTradesChange: (trades: TradeRecord[]) => void;
}

export function HistoricalDataTable({
  trades,
  onTradesChange,
}: HistoricalDataTableProps) {
  const handleAddTrade = () => {
    const newTrades = addTrade(trades);
    onTradesChange(newTrades);
  };

  const handleRemoveTrade = (id: number) => {
    const newTrades = removeTrade(trades, id);
    onTradesChange(newTrades);
  };

  const handleUpdateTrade = (id: number, field: keyof TradeRecord, value: string | number | boolean) => {
    const newTrades = updateTrade(trades, id, field, value);
    onTradesChange(newTrades);
  };

  return (
    <>
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="subtitle2">历史交易记录</Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddTrade}
          variant="outlined"
        >
          添加交易
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 300, overflow: 'auto' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>启用</TableCell>
              <TableCell>序号</TableCell>
              <TableCell>盈亏金额</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trades.map((trade, index) => (
              <TableRow key={trade.id}>
                <TableCell>
                  <Checkbox
                    checked={trade.enabled}
                    onChange={(e) => handleUpdateTrade(trade.id, 'enabled', e.target.checked)}
                  />
                </TableCell>
                <TableCell>{index + 1}</TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    type="text"
                    value={trade.profit || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === '' || /^-?\d*\.?\d*$/.test(value)) {
                        handleUpdateTrade(trade.id, 'profit', parseFloat(value) || 0);
                      }
                    }}
                    placeholder="0.00"
                    sx={{ width: 120 }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleRemoveTrade(trade.id)}
                    disabled={trades.length <= 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
