import React from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import type { DndContextProps } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import PositionRow from './PositionRow';
import { Position, PositionStat } from '../types';

interface PositionTableProps {
  positions: Position[];
  positionStats: Map<number, PositionStat>;
  leverage: number;
  sensors: DndContextProps['sensors'];
  onDragEnd: (event: DragEndEvent) => void;
  onAddPosition: () => void;
  insertPosition: (index: number, direction: 'above' | 'below') => void;
  removePosition: (id: number) => void;
  getInputValue: (id: number, field: 'price' | 'quantity' | 'quantityUsdt' | 'marginUsdt', fallbackValue: number) => string;
  handleInputChange: (id: number, field: 'price' | 'quantity' | 'quantityUsdt' | 'marginUsdt', value: string) => void;
  updatePosition: (id: number, field: keyof Position, value: unknown) => void;
  registerInputRef: (key: string) => (element: HTMLInputElement | null) => void;
  handleInputFocus: (key: string) => void;
  handleInputBlur: (key: string) => void;
}

export default function PositionTable({
  positions,
  positionStats,
  leverage,
  sensors,
  onDragEnd,
  onAddPosition,
  insertPosition,
  removePosition,
  getInputValue,
  handleInputChange,
  updatePosition,
  registerInputRef,
  handleInputFocus,
  handleInputBlur,
}: PositionTableProps) {
  return (
    <Box mb={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="subtitle2">委托单列表</Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={onAddPosition} variant="outlined">
          增加仓位
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ maxHeight: 400, overflowY: 'auto', overflowX: 'auto', width: '100%' }}>
        <DndContext sensors={sensors} onDragEnd={onDragEnd} collisionDetection={closestCenter}>
          <Table stickyHeader size="small" sx={{ tableLayout: 'auto', width: 'max-content', minWidth: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>拖拽</TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>启用</TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>序号</TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>类型</TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>价格 (USDT)</TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>数量 (币)</TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>杠杆前 (U)</TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>杠杆后数量 (U)</TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>持有币 / 币成本价</TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>占用本金 (U)</TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>资金使用率</TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>实际资金使用率</TableCell>
                <TableCell sx={{ padding: '4px 8px', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>盈亏计算</TableCell>
                <TableCell sx={{ padding: '4px', whiteSpace: 'nowrap', fontSize: '0.875rem' }}>操作</TableCell>
              </TableRow>
            </TableHead>
            <SortableContext items={positions.map(position => position.id)} strategy={verticalListSortingStrategy}>
              <TableBody>
                {positions.map((position, index) => (
                  <PositionRow
                    key={position.id}
                    position={position}
                    index={index}
                    stats={positionStats.get(position.id)}
                    leverage={leverage}
                    getInputValue={getInputValue}
                    handleInputChange={handleInputChange}
                    updatePosition={updatePosition}
                    insertPosition={insertPosition}
                    removePosition={removePosition}
                    registerInputRef={registerInputRef}
                    handleInputFocus={handleInputFocus}
                    handleInputBlur={handleInputBlur}
                  />
                ))}
              </TableBody>
            </SortableContext>
          </Table>
        </DndContext>
      </TableContainer>
    </Box>
  );
}
