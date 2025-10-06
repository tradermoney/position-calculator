import React from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Checkbox,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
} from '@mui/material';
import { DragIndicator as DragIcon, Delete as DeleteIcon, KeyboardArrowDown as ArrowDownIcon, KeyboardArrowUp as ArrowUpIcon } from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatNumber } from '../../../../utils/contractCalculations';
import { Position, PositionStat, PositionType } from '../types';

interface PositionRowProps {
  position: Position;
  index: number;
  stats?: PositionStat;
  getInputValue: (id: number, field: 'price' | 'quantity' | 'quantityUsdt' | 'marginUsdt', fallbackValue: number) => string;
  handleInputChange: (id: number, field: 'price' | 'quantity' | 'quantityUsdt' | 'marginUsdt', value: string) => void;
  updatePosition: (id: number, field: keyof Position, value: unknown) => void;
  insertPosition: (index: number, direction: 'above' | 'below') => void;
  removePosition: (id: number) => void;
  registerInputRef: (key: string) => (element: HTMLInputElement | null) => void;
  handleInputFocus: (key: string) => void;
  handleInputBlur: (key: string) => void;
}

export default function PositionRow({
  position,
  index,
  stats,
  getInputValue,
  handleInputChange,
  updatePosition,
  insertPosition,
  removePosition,
  registerInputRef,
  handleInputFocus,
  handleInputBlur,
}: PositionRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: position.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  } as const;

  return (
    <TableRow ref={setNodeRef} style={style} {...attributes}>
      <TableCell sx={{ padding: '4px', textAlign: 'center', whiteSpace: 'nowrap' }}>
        <IconButton size="small" {...listeners}>
          <DragIcon fontSize="small" />
        </IconButton>
      </TableCell>
      <TableCell sx={{ padding: '4px', textAlign: 'center', whiteSpace: 'nowrap' }}>
        <Checkbox
          size="small"
          checked={position.enabled}
          onChange={(e) => updatePosition(position.id, 'enabled', e.target.checked)}
        />
      </TableCell>
      <TableCell sx={{ padding: '4px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
        {index + 1}
      </TableCell>
      <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap' }}>
        <FormControl size="small" sx={{ minWidth: '80px' }}>
          <Select
            value={position.type}
            onChange={(e) => updatePosition(position.id, 'type', e.target.value)}
            sx={{ fontSize: '0.875rem' }}
          >
            <MenuItem value={PositionType.OPEN}>开仓</MenuItem>
            <MenuItem value={PositionType.CLOSE}>平仓</MenuItem>
          </Select>
        </FormControl>
      </TableCell>
      <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap' }}>
        <TextField
          size="small"
          type="text"
          value={getInputValue(position.id, 'price', position.price)}
          onChange={(e) => handleInputChange(position.id, 'price', e.target.value)}
          placeholder="0.00"
          inputProps={{ pattern: '[0-9]*\\.?[0-9]*', inputMode: 'decimal', style: { fontSize: '0.875rem', padding: '4px 8px' } }}
          inputRef={registerInputRef(`${position.id}-price`)}
          onFocus={() => handleInputFocus(`${position.id}-price`)}
          onBlur={() => handleInputBlur(`${position.id}-price`)}
          sx={{ minWidth: '90px' }}
        />
      </TableCell>
      <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap' }}>
        <TextField
          size="small"
          type="text"
          value={getInputValue(position.id, 'quantity', position.quantity)}
          onChange={(e) => handleInputChange(position.id, 'quantity', e.target.value)}
          placeholder="0.00"
          inputProps={{ pattern: '[0-9]*\\.?[0-9]*', inputMode: 'decimal', style: { fontSize: '0.875rem', padding: '4px 8px' } }}
          inputRef={registerInputRef(`${position.id}-quantity`)}
          onFocus={() => handleInputFocus(`${position.id}-quantity`)}
          onBlur={() => handleInputBlur(`${position.id}-quantity`)}
          sx={{ minWidth: '90px' }}
        />
      </TableCell>
      <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap' }}>
        <TextField
          size="small"
          type="text"
          value={getInputValue(position.id, 'marginUsdt', position.marginUsdt)}
          onChange={(e) => handleInputChange(position.id, 'marginUsdt', e.target.value)}
          placeholder="0.00"
          inputProps={{ pattern: '[0-9]*\\.?[0-9]*', inputMode: 'decimal', style: { fontSize: '0.875rem', padding: '4px 8px' } }}
          inputRef={registerInputRef(`${position.id}-marginUsdt`)}
          onFocus={() => handleInputFocus(`${position.id}-marginUsdt`)}
          onBlur={() => handleInputBlur(`${position.id}-marginUsdt`)}
          sx={{ minWidth: '90px' }}
        />
      </TableCell>
      <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap' }}>
        <TextField
          size="small"
          type="text"
          value={getInputValue(position.id, 'quantityUsdt', position.quantityUsdt)}
          onChange={(e) => handleInputChange(position.id, 'quantityUsdt', e.target.value)}
          placeholder="0.00"
          inputProps={{ pattern: '[0-9]*\\.?[0-9]*', inputMode: 'decimal', style: { fontSize: '0.875rem', padding: '4px 8px' } }}
          inputRef={registerInputRef(`${position.id}-quantityUsdt`)}
          onFocus={() => handleInputFocus(`${position.id}-quantityUsdt`)}
          onBlur={() => handleInputBlur(`${position.id}-quantityUsdt`)}
          sx={{ minWidth: '90px' }}
        />
      </TableCell>
      <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap' }}>
        {stats && stats.isActive ? (
          <Box display="flex" flexDirection="column">
            <Typography variant="body2" fontSize="0.875rem">{formatNumber(Math.abs(stats.holdings), 4)} 币</Typography>
            <Typography variant="caption" color="textSecondary" fontSize="0.75rem">
              {stats.averagePrice !== null ? `${formatNumber(stats.averagePrice, 2)} USDT` : '--'}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary" fontSize="0.875rem">--</Typography>
        )}
      </TableCell>
      <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap' }}>
        {stats && stats.isActive ? (
          <Typography variant="body2" fontSize="0.875rem">
            {formatNumber(stats.usedCapital, 2)} USDT
          </Typography>
        ) : (
          <Typography variant="body2" color="textSecondary" fontSize="0.875rem">--</Typography>
        )}
      </TableCell>
      <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap' }}>
        {stats && stats.isActive ? (
          <Typography
            variant="body2"
            fontSize="0.875rem"
            sx={{
              color: stats.capitalUsageRate > 1 ? 'error.main' :
                     stats.capitalUsageRate > 0.9 ? 'error.main' :
                     stats.capitalUsageRate > 0.7 ? 'warning.main' :
                     stats.capitalUsageRate > 0.5 ? 'info.main' : 'success.main',
              fontWeight: stats.capitalUsageRate > 0.8 ? 600 : 400
            }}
          >
            {stats.capitalUsageRate > 0 ? `${formatNumber(stats.capitalUsageRate * 100, 1)}%` : '--'}
          </Typography>
        ) : (
          <Typography variant="body2" color="textSecondary" fontSize="0.875rem">--</Typography>
        )}
      </TableCell>
      <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap' }}>
        {stats && stats.isActive ? (
          <Typography variant="body2" fontSize="0.875rem" color={stats.cumulativePnL >= 0 ? 'success.main' : 'error.main'}>
            {stats.cumulativePnL >= 0 ? '+' : ''}{formatNumber(stats.cumulativePnL, 2)} USDT
          </Typography>
        ) : (
          <Typography variant="body2" color="textSecondary" fontSize="0.875rem">--</Typography>
        )}
      </TableCell>
      <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap' }}>
        <Box display="flex" gap={0.5}>
          <IconButton size="small" onClick={() => insertPosition(index, 'above')} title="在上方插入">
            <ArrowUpIcon />
          </IconButton>
          <IconButton size="small" onClick={() => insertPosition(index, 'below')} title="在下方插入">
            <ArrowDownIcon />
          </IconButton>
          <IconButton size="small" onClick={() => removePosition(position.id)} title="删除" color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );
}
