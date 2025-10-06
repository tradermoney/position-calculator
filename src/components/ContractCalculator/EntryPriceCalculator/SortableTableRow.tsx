import React from 'react';
import {
  TableRow,
  TableCell,
  Box,
  IconButton,
  Checkbox,
  Typography,
  TextField,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  KeyboardArrowUp as ArrowUpIcon,
  KeyboardArrowDown as ArrowDownIcon,
  DragIndicator as DragIcon,
} from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Position } from './types';
import { calculateVolatilityFromCurrent, calculateVolatilityFromPrevious } from './utils';

interface SortableTableRowProps {
  position: Position;
  index: number;
  positions: Position[];
  currentPrice: number;
  getInputValue: (id: number, field: 'price' | 'quantity' | 'quantityUsdt', numValue: number) => string;
  handleInputChange: (id: number, field: 'price' | 'quantity' | 'quantityUsdt', value: string) => void;
  updatePosition: (id: number, field: 'price' | 'quantity' | 'quantityUsdt' | 'enabled', value: number | boolean) => void;
  insertPosition: (index: number, direction: 'above' | 'below') => void;
  removePosition: (id: number) => void;
}

export function SortableTableRow({
  position,
  index,
  positions,
  currentPrice,
  getInputValue,
  handleInputChange,
  updatePosition,
  insertPosition,
  removePosition,
}: SortableTableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: position.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      sx={{
        opacity: position.enabled ? 1 : 0.5,
        backgroundColor: position.enabled ? 'inherit' : 'action.hover',
      }}
    >
      <TableCell
        sx={{
          width: { xs: '0%', sm: '8%' },
          display: { xs: 'none', sm: 'table-cell' },
        }}
      >
        <Box display="flex" alignItems="center" gap={0.5}>
          <IconButton size="small" {...attributes} {...listeners}>
            <DragIcon fontSize="small" />
          </IconButton>
        </Box>
      </TableCell>
      <TableCell
        sx={{
          width: { xs: '8%', sm: '8%' },
        }}
      >
        <Checkbox
          checked={position.enabled}
          onChange={(e) => updatePosition(position.id, 'enabled', e.target.checked)}
          color="primary"
          size="small"
        />
      </TableCell>
      <TableCell
        sx={{
          width: { xs: '8%', sm: '8%' },
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
          {index + 1}
        </Typography>
      </TableCell>
      <TableCell
        sx={{
          width: { xs: '25%', sm: '20%' },
        }}
      >
        <TextField
          size="small"
          type="text"
          value={getInputValue(position.id, 'price', position.price)}
          onChange={(e) => handleInputChange(position.id, 'price', e.target.value)}
          placeholder="0.00"
          disabled={!position.enabled}
          inputProps={{
            pattern: '[0-9]*\\.?[0-9]*',
            inputMode: 'decimal',
          }}
          sx={{
            width: '100%',
            '& .MuiInputBase-input': {
              color: position.enabled ? 'inherit' : 'text.disabled',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              padding: { xs: '4px 6px', sm: '8px 12px' },
            },
          }}
        />
      </TableCell>
      <TableCell
        sx={{
          width: { xs: '20%', sm: '16%' },
        }}
      >
        <TextField
          size="small"
          type="text"
          value={getInputValue(position.id, 'quantity', position.quantity)}
          onChange={(e) => handleInputChange(position.id, 'quantity', e.target.value)}
          placeholder="0.00"
          disabled={!position.enabled}
          inputProps={{
            pattern: '[0-9]*\\.?[0-9]*',
            inputMode: 'decimal',
          }}
          sx={{
            width: '100%',
            '& .MuiInputBase-input': {
              color: position.enabled ? 'inherit' : 'text.disabled',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              padding: { xs: '4px 6px', sm: '8px 12px' },
            },
          }}
        />
      </TableCell>
      <TableCell
        sx={{
          width: { xs: '20%', sm: '16%' },
        }}
      >
        <TextField
          size="small"
          type="text"
          value={getInputValue(position.id, 'quantityUsdt', position.quantityUsdt)}
          onChange={(e) => handleInputChange(position.id, 'quantityUsdt', e.target.value)}
          placeholder="0.00"
          disabled={!position.enabled}
          inputProps={{
            pattern: '[0-9]*\\.?[0-9]*',
            inputMode: 'decimal',
          }}
          sx={{
            width: '100%',
            '& .MuiInputBase-input': {
              color: position.enabled ? 'inherit' : 'text.disabled',
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              padding: { xs: '4px 6px', sm: '8px 12px' },
            },
          }}
        />
      </TableCell>
      <TableCell
        sx={{
          width: { xs: '0%', sm: '0%', md: '12%' },
          textAlign: 'center',
          display: { xs: 'none', md: 'table-cell' },
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
          color={
            calculateVolatilityFromCurrent(currentPrice, position.price) === '-'
              ? 'text.secondary'
              : calculateVolatilityFromCurrent(currentPrice, position.price).startsWith('+')
              ? 'success.main'
              : 'error.main'
          }
        >
          {calculateVolatilityFromCurrent(currentPrice, position.price)}
        </Typography>
      </TableCell>
      <TableCell
        sx={{
          width: { xs: '0%', sm: '0%', md: '12%' },
          textAlign: 'center',
          display: { xs: 'none', md: 'table-cell' },
        }}
      >
        <Typography
          variant="body2"
          sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
          color={
            calculateVolatilityFromPrevious(positions, index) === '-'
              ? 'text.secondary'
              : calculateVolatilityFromPrevious(positions, index).startsWith('+')
              ? 'success.main'
              : 'error.main'
          }
        >
          {calculateVolatilityFromPrevious(positions, index)}
        </Typography>
      </TableCell>
      <TableCell
        sx={{
          width: { xs: '19%', sm: '24%', md: '20%' },
        }}
      >
        <Box display="flex" gap={{ xs: 0.25, sm: 0.5 }} flexWrap="wrap" justifyContent="center">
          <IconButton
            size="small"
            onClick={() => insertPosition(index, 'above')}
            title="在上方插入"
            sx={{
              minWidth: 'auto',
              padding: { xs: '2px', sm: '4px' },
              '& .MuiSvgIcon-root': { fontSize: { xs: '12px', sm: '16px' } },
            }}
          >
            <ArrowUpIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => insertPosition(index, 'below')}
            title="在下方插入"
            sx={{
              minWidth: 'auto',
              padding: { xs: '2px', sm: '4px' },
              '& .MuiSvgIcon-root': { fontSize: { xs: '12px', sm: '16px' } },
            }}
          >
            <ArrowDownIcon />
          </IconButton>
          <IconButton
            size="small"
            color="error"
            onClick={() => removePosition(position.id)}
            disabled={positions.length <= 1}
            title="删除"
            sx={{
              minWidth: 'auto',
              padding: { xs: '2px', sm: '4px' },
              '& .MuiSvgIcon-root': { fontSize: { xs: '12px', sm: '16px' } },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      </TableCell>
    </TableRow>
  );
}
