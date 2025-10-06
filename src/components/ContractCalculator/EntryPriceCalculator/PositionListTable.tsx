import React from 'react';
import {
  Box,
  Button,
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Position } from './types';
import { SortableTableRow } from './SortableTableRow';

interface PositionListTableProps {
  positions: Position[];
  currentPrice: number;
  setPositions: React.Dispatch<React.SetStateAction<Position[]>>;
  addPosition: () => void;
  insertPosition: (index: number, direction: 'above' | 'below') => void;
  removePosition: (id: number) => void;
  getInputValue: (id: number, field: 'price' | 'quantity' | 'quantityUsdt', numValue: number) => string;
  handleInputChange: (id: number, field: 'price' | 'quantity' | 'quantityUsdt', value: string) => void;
  updatePosition: (id: number, field: 'price' | 'quantity' | 'quantityUsdt' | 'enabled', value: number | boolean) => void;
}

export function PositionListTable({
  positions,
  currentPrice,
  setPositions,
  addPosition,
  insertPosition,
  removePosition,
  getInputValue,
  handleInputChange,
  updatePosition,
}: PositionListTableProps) {
  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setPositions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  return (
    <Box mb={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle2">仓位列表</Typography>
        <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={addPosition}>
          增加仓位
        </Button>
      </Box>

      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{
          width: '100%',
          overflowX: 'auto',
          maxWidth: '100%',
        }}
      >
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <Table
            size="small"
            sx={{
              minWidth: { xs: '600px', sm: '700px', md: '100%' },
              width: '100%',
              tableLayout: 'auto',
              '& .MuiTableCell-root': {
                padding: { xs: '4px', sm: '8px' },
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    width: { xs: '0%', sm: '8%' },
                    display: { xs: 'none', sm: 'table-cell' },
                  }}
                >
                  <Box sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>拖拽</Box>
                </TableCell>
                <TableCell
                  sx={{
                    width: { xs: '8%', sm: '8%' },
                  }}
                >
                  <Box sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>启用</Box>
                </TableCell>
                <TableCell
                  sx={{
                    width: { xs: '8%', sm: '8%' },
                    textAlign: 'center',
                  }}
                >
                  <Box sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>序号</Box>
                </TableCell>
                <TableCell
                  sx={{
                    width: { xs: '25%', sm: '20%' },
                  }}
                >
                  <Box sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>开仓价格</Box>
                </TableCell>
                <TableCell
                  sx={{
                    width: { xs: '20%', sm: '16%' },
                  }}
                >
                  <Box sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>数量(币)</Box>
                </TableCell>
                <TableCell
                  sx={{
                    width: { xs: '20%', sm: '16%' },
                  }}
                >
                  <Box sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>数量(U)</Box>
                </TableCell>
                <TableCell
                  sx={{
                    width: { xs: '0%', sm: '0%', md: '12%' },
                    textAlign: 'center',
                    display: { xs: 'none', md: 'table-cell' },
                  }}
                >
                  <Box sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, lineHeight: 1.2 }}>
                    当前波动率
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    width: { xs: '0%', sm: '0%', md: '12%' },
                    textAlign: 'center',
                    display: { xs: 'none', md: 'table-cell' },
                  }}
                >
                  <Box sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' }, lineHeight: 1.2 }}>
                    上仓波动率
                  </Box>
                </TableCell>
                <TableCell
                  sx={{
                    width: { xs: '19%', sm: '24%', md: '20%' },
                  }}
                >
                  <Box sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>操作</Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <SortableContext
                items={positions.map((p) => p.id)}
                strategy={verticalListSortingStrategy}
              >
                {positions.map((position, index) => (
                  <SortableTableRow
                    key={position.id}
                    position={position}
                    index={index}
                    positions={positions}
                    currentPrice={currentPrice}
                    getInputValue={getInputValue}
                    handleInputChange={handleInputChange}
                    updatePosition={updatePosition}
                    insertPosition={insertPosition}
                    removePosition={removePosition}
                  />
                ))}
              </SortableContext>
            </TableBody>
          </Table>
        </DndContext>
      </TableContainer>
    </Box>
  );
}
