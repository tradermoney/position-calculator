import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  useTheme,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { useAppContext } from '../../contexts/AppContext';

// 本地类型定义
enum PositionSide {
  LONG = 'long',
  SHORT = 'short'
}

enum PositionStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
  LIQUIDATED = 'liquidated',
  PARTIAL = 'partial'
}

interface Position {
  id: string;
  symbol: string;
  side: PositionSide;
  leverage: number;
  entryPrice: number;
  quantity: number;
  margin: number;
  status: PositionStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface PositionListProps {
  onEditPosition: (position: Position) => void;
}

interface PositionCardProps {
  position: Position;
  onEdit: () => void;
  onDelete: () => void;
}

function PositionCard({ position, onEdit, onDelete }: PositionCardProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // 简单的爆仓价格计算
  const calculateLiquidationPrice = (position: Position) => {
    const maintenanceMarginRate = 0.005;
    if (position.side === PositionSide.LONG) {
      return position.entryPrice * (1 - 1/position.leverage + maintenanceMarginRate);
    } else {
      return position.entryPrice * (1 + 1/position.leverage - maintenanceMarginRate);
    }
  };

  const liquidationPrice = calculateLiquidationPrice(position);
  const profitColor = theme.palette.mode === 'dark' ? '#4caf50' : '#2e7d32';

  // 简单的格式化函数
  const formatNumber = (value: number, decimals: number = 4): string => {
    if (isNaN(value) || !isFinite(value)) return '0';
    return value.toFixed(decimals);
  };

  const formatPercentage = (value: number, decimals: number = 2): string => {
    if (isNaN(value) || !isFinite(value)) return '0.00%';
    return `${value.toFixed(decimals)}%`;
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    handleMenuClose();
    onEdit();
  };

  const handleDelete = () => {
    handleMenuClose();
    onDelete();
  };

  return (
    <Card sx={{ mb: 2, position: 'relative' }}>
      <CardContent>
        {/* 头部信息 */}
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" component="div" fontWeight={600}>
              {position.symbol}
            </Typography>
            <Box display="flex" gap={1} mt={0.5}>
              <Chip
                label={position.side === 'long' ? '多头' : '空头'}
                color={position.side === 'long' ? 'success' : 'error'}
                size="small"
                icon={position.side === 'long' ? <TrendingUpIcon /> : <TrendingDownIcon />}
              />
              <Chip
                label={`${position.leverage}x`}
                variant="outlined"
                size="small"
              />
            </Box>
          </Box>
          
          <IconButton
            aria-label="更多操作"
            onClick={handleMenuOpen}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={handleEdit}>
              <EditIcon sx={{ mr: 1, fontSize: 20 }} />
              编辑
            </MenuItem>
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
              删除
            </MenuItem>
          </Menu>
        </Box>
        
        {/* 仓位详情 */}
        <Grid container spacing={2} mb={2}>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="textSecondary">
              开仓价格
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              ${formatNumber(position.entryPrice)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="textSecondary">
              持有数量
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {formatNumber(position.quantity)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="textSecondary">
              保证金
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              ${formatNumber(position.margin)}
            </Typography>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Typography variant="body2" color="textSecondary">
              爆仓价格
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              ${formatNumber(liquidationPrice)}
            </Typography>
          </Grid>
        </Grid>
        
        {/* 状态信息 */}
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            borderRadius: 1,
            p: 2,
          }}
        >
          <Typography variant="body2" color="textSecondary">
            状态: {position.status === 'active' ? '活跃' : position.status}
          </Typography>
        </Box>
        
        {/* 时间信息 */}
        <Box mt={2} display="flex" justifyContent="space-between">
          <Typography variant="caption" color="textSecondary">
            创建时间: {position.createdAt.toLocaleString()}
          </Typography>
          {position.updatedAt.getTime() !== position.createdAt.getTime() && (
            <Typography variant="caption" color="textSecondary">
              更新时间: {position.updatedAt.toLocaleString()}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function PositionList({ onEditPosition }: PositionListProps) {
  const { state, deletePosition } = useAppContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);

  const handleDeleteClick = (position: Position) => {
    setPositionToDelete(position);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (positionToDelete) {
      deletePosition(positionToDelete.id);
      setDeleteDialogOpen(false);
      setPositionToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setPositionToDelete(null);
  };

  if (state.positions.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="body1" color="textSecondary" textAlign="center" py={4}>
            暂无仓位数据，请点击"创建仓位"按钮添加新仓位
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {state.positions.map((position) => (
        <PositionCard
          key={position.id}
          position={position}
          onEdit={() => onEditPosition(position)}
          onDelete={() => handleDeleteClick(position)}
        />
      ))}

      {/* 删除确认对话框 */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          确认删除仓位
        </DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            您确定要删除仓位 "{positionToDelete?.symbol}" 吗？此操作无法撤销。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="primary">
            取消
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            删除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
