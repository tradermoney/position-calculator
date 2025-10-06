import React from 'react';
import { Paper, Box, Typography, IconButton, Tooltip, Divider } from '@mui/material';
import { History as HistoryIcon, Delete as DeleteIcon, DeleteOutline as DeleteOutlineIcon } from '@mui/icons-material';
import { CalculatorRecord } from '../../../utils/calculatorStorage';
import { HistorySection } from '../../../styles/calculator';

interface HistoryPanelProps {
  history: CalculatorRecord[];
  handleRestoreFromHistory: (record: CalculatorRecord) => void;
  handleDeleteRecord: (recordId: string) => void;
  handleClearHistory: () => void;
  formatTime: (date: Date) => string;
}

export function HistoryPanel({
  history,
  handleRestoreFromHistory,
  handleDeleteRecord,
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
                position: 'relative',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  '& .delete-button': {
                    opacity: 1,
                  },
                },
              }}
              onClick={() => handleRestoreFromHistory(record)}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 1,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
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
                <Tooltip title="删除此记录">
                  <IconButton
                    className="delete-button"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRecord(record.id);
                    }}
                    sx={{
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      color: 'error.main',
                      '&:hover': {
                        backgroundColor: 'error.light',
                        color: 'error.contrastText',
                      },
                    }}
                  >
                    <DeleteOutlineIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          ))
        )}
      </HistorySection>
    </Paper>
  );
}
