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
} from '@mui/material';
import {
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAppContext } from '../contexts/AppContext';
import PositionForm from '../components/Position/PositionForm';
import PositionList from '../components/Position/PositionList';

export default function PositionManagement() {
  const { state } = useAppContext();
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);

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
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          仓位管理
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{ display: { xs: 'none', sm: 'flex' } }}
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
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
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
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              {editingPosition ? '编辑仓位' : '创建新仓位'}
            </Typography>
            <IconButton
              aria-label="关闭"
              onClick={handleCloseDialog}
              sx={{ color: 'grey.500' }}
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
