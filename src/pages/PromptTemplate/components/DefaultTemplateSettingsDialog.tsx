/**
 * 默认模板设置对话框
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Alert,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Restore as RestoreIcon,
} from '@mui/icons-material';
import {
  getDefaultTemplateSettings,
  saveDefaultTemplateSettings,
} from '../../../utils/storage/promptTemplateStorage';

interface DefaultTemplateSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export function DefaultTemplateSettingsDialog({
  open,
  onClose,
  onSave,
}: DefaultTemplateSettingsDialogProps) {
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // 加载默认模板设置
  const loadSettings = async () => {
    setLoading(true);
    setError('');
    try {
      const settings = await getDefaultTemplateSettings();
      setContent(settings.content);
      setOriginalContent(settings.content);
    } catch (err) {
      console.error('加载默认模板设置失败:', err);
      setError('加载设置失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 当对话框打开时加载设置
  useEffect(() => {
    if (open) {
      loadSettings();
      setSuccess(false);
      setError('');
    }
  }, [open]);

  // 保存设置
  const handleSave = async () => {
    if (!content.trim()) {
      setError('模板内容不能为空');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const success = await saveDefaultTemplateSettings(content);
      if (success) {
        setOriginalContent(content);
        setSuccess(true);
        onSave?.();
        setTimeout(() => {
          setSuccess(false);
        }, 2000);
      } else {
        setError('保存失败，请重试');
      }
    } catch (err) {
      console.error('保存默认模板设置失败:', err);
      setError('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 重置到原始内容
  const handleReset = () => {
    setContent(originalContent);
    setError('');
    setSuccess(false);
  };

  // 关闭对话框
  const handleClose = () => {
    setError('');
    setSuccess(false);
    onClose();
  };

  // 检查是否有未保存的更改
  const hasUnsavedChanges = content !== originalContent;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { height: '80vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">默认模板设置</Typography>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          设置创建新模板时的默认内容。支持 Markdown 格式。
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            设置已保存成功！
          </Alert>
        )}

        <TextField
          label="默认模板内容"
          multiline
          rows={20}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请输入默认的模板内容..."
          disabled={loading}
          sx={{ flexGrow: 1 }}
          InputProps={{
            sx: {
              fontFamily: 'monospace',
              fontSize: '0.875rem',
            }
          }}
        />

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            字符数: {content.length}
          </Typography>
          {hasUnsavedChanges && (
            <Typography variant="caption" color="warning.main">
              有未保存的更改
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button
          onClick={handleReset}
          disabled={loading || !hasUnsavedChanges}
          startIcon={<RestoreIcon />}
        >
          重置
        </Button>
        <Box sx={{ flexGrow: 1 }} />
        <Button onClick={handleClose} disabled={saving}>
          取消
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || saving || !content.trim()}
          startIcon={<SaveIcon />}
        >
          {saving ? '保存中...' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
