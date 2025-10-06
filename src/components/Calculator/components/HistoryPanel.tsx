import React from 'react';
import { Paper, Box, Typography, IconButton, Tooltip, Divider } from '@mui/material';
import { History as HistoryIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { CalculatorRecord } from '../../../utils/calculatorStorage';
import { HistorySection } from '../../../styles/calculator';

interface HistoryPanelProps {
  history: CalculatorRecord[];
  handleRestoreFromHistory: (record: CalculatorRecord) => void;
  handleClearHistory: () => void;
  formatTime: (date: Date) => string;
}

export function HistoryPanel({
  history,
  handleRestoreFromHistory,
  handleClearHistory,
  formatTime,
}: HistoryPanelProps) {
  return (
    <Paper elevation={3} sx={{ p: 2, height: 'fit-content' }}>
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}
      >
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon />
          历史记录
        </Typography>
        {history.length > 0 && (
          <Tooltip title="清空历史记录">
            <IconButton size="small" onClick={handleClearHistory}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      <HistorySection>
        {history.length === 0 ? (
          <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
            暂无计算记录
          </Typography>
        ) : (
          history.map((record) => (
            <Box
              key={record.id}
              sx={{
                p: 2,
                mb: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
              onClick={() => handleRestoreFromHistory(record)}
            >
              <Typography variant="body2" sx={{ fontFamily: 'monospace', mb: 0.5 }}>
                {record.expression}
              </Typography>
              <Typography
                variant="body2"
                color="primary"
                sx={{ fontFamily: 'monospace', fontWeight: 'bold', mb: 0.5 }}
              >
                = {record.result}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {formatTime(record.calculatedAt)}
              </Typography>
            </Box>
          ))
        )}
      </HistorySection>
    </Paper>
  );
}
