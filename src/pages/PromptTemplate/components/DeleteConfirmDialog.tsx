/**
 * 删除确认对话框
 */

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

interface DeleteConfirmDialogProps {
  open: boolean;
  templateName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmDialog({
  open,
  templateName,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>确认删除</DialogTitle>
      <DialogContent>
        <Typography>
          确定要删除模板 "<strong>{templateName}</strong>" 吗？此操作无法撤销。
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>取消</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          删除
        </Button>
      </DialogActions>
    </Dialog>
  );
}


