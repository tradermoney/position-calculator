import React from 'react';
import { Typography, Divider, IconButton, Tooltip, Box } from '@mui/material';
import { History as HistoryIcon, Clear as ClearIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { VolatilityRecord } from '../types';
import { formatTime, formatNumber } from '../utils/formatting';
import {
  HistoryCard,
  HistoryItem,
  HistoryContent,
  HistoryData,
  HistoryTime,
  EmptyState,
} from '../../../styles/volatilityCalculator';

interface HistorySidebarProps {
  history: VolatilityRecord[];
  onRestore: (record: VolatilityRecord) => void;
  onDelete: (recordId: string) => void;
  onClearHistory: () => void;
}

export const HistorySidebar: React.FC<HistorySidebarProps> = ({
  history,
  onRestore,
  onDelete,
  onClearHistory,
}) => {
  return (
    <HistoryCard>
      <div style={{ padding: '16px 16px 0 16px' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HistoryIcon />
          历史记录
          {history.length > 0 && (
            <Tooltip title="清空历史记录">
              <IconButton size="small" onClick={onClearHistory} sx={{ ml: 'auto' }}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Typography>
      </div>

      <Divider />

      {history.length === 0 ? (
        <EmptyState>
          <Typography variant="body2">
            暂无历史记录
          </Typography>
          <Typography variant="caption" color="textSecondary">
            完成计算后点击"保存记录"
          </Typography>
        </EmptyState>
      ) : (
        history.map((record) => (
          <HistoryItem key={record.id}>
            <Box
              sx={{
                flex: 1,
                cursor: 'pointer',
              }}
              onClick={() => onRestore(record)}
            >
              <HistoryContent>
                <HistoryData>
                  <Typography variant="body2" fontWeight={500}>
                    {formatNumber(record.price1)} → {formatNumber(record.price2)}
                  </Typography>
                  <Typography
                    variant="body2"
                    color={record.sign === '+' ? 'success.main' : 'error.main'}
                    fontWeight={600}
                  >
                    {record.sign}{formatNumber(record.volatility, 2)}%
                  </Typography>
                </HistoryData>
                <HistoryTime>
                  {formatTime(record.calculatedAt)}
                </HistoryTime>
              </HistoryContent>
            </Box>
            <Tooltip title="删除此记录">
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(record.id);
                }}
                sx={{
                  ml: 1,
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.light',
                    color: 'error.dark',
                  },
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </HistoryItem>
        ))
      )}
    </HistoryCard>
  );
};
