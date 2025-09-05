import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Fab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';
import PositionForm from '../components/Position/PositionForm';
import { usePageTitle } from '../utils/titleManager';
import PositionList from '../components/Position/PositionList';

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

export default function PositionManagement() {
  const { state } = useAppContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // 设置页面标题
  usePageTitle('positions');

  const handleOpenDialog = () => {
    setEditingPosition(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPosition(null);
  };

  const handleEditPosition = (position: any) => {
    setEditingPosition(position);
    setOpenDialog(true);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        maxWidth: 'xl',
        mx: 'auto',
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      {/* 页面标题和操作按钮 */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        flexDirection={{ xs: 'column', sm: 'row' }}
        gap={2}
      >
        <Typography
          variant={isMobile ? "h5" : "h4"}
          component="h1"
          sx={{
            fontWeight: 700,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          仓位管理
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{
            display: { xs: 'none', sm: 'flex' },
            borderRadius: 3,
            px: 3,
            py: 1.5,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
              transform: 'translateY(-2px)',
              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
            },
            transition: 'all 0.3s ease-in-out',
          }}
        >
          创建仓位
        </Button>
      </Box>

      <PositionList onEditPosition={handleEditPosition} />

      {/* 移动端浮动按钮 */}
      <Fab
        color="primary"
        aria-label="创建仓位"
        onClick={handleOpenDialog}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', sm: 'none' },
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
            transform: 'scale(1.1)',
          },
          transition: 'all 0.3s ease-in-out',
          boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)',
        }}
      >
        <AddIcon />
      </Fab>

      {/* 创建/编辑仓位对话框 */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1a1d3a 0%, #2d3748 100%)'
              : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {editingPosition ? '编辑仓位' : '创建新仓位'}
            </Typography>
            <IconButton
              aria-label="关闭"
              onClick={handleCloseDialog}
              sx={{
                color: 'grey.500',
                '&:hover': {
                  background: theme.palette.action.hover,
                  transform: 'rotate(90deg)',
                },
                transition: 'all 0.3s ease-in-out',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          <PositionForm
            position={editingPosition}
            onSubmit={handleCloseDialog}
            onCancel={handleCloseDialog}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
}
