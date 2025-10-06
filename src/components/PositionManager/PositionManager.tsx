import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  FolderOpen as FolderOpenIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  ContentCopy as ContentCopyIcon,
  FileDownload as FileDownloadIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { PositionSide } from '../../utils/contractCalculations';
import { PositionListItem, SavePositionParams, RestorePositionParams, SavedPosition } from '../../types/position';
import { SavedPositionStorage } from '../../utils/storage/savedPositionStorage';
import { Position } from '../ContractCalculator/PnLCalculator/types';
import { 
  exportPositionToFile, 
  copyPositionToClipboard, 
  copyPositionTextToClipboard 
} from '../../utils/positionExport';
import ImportExportDialog from '../ContractCalculator/PnLCalculator/components/ImportExportDialog';

interface PositionManagerProps {
  // 当前仓位数据
  side: PositionSide;
  capital: number;
  leverage: number;
  positions: Position[];
  inputValues: { [key: string]: string };
  
  // 编辑状态
  editingPosition?: {
    id: string;
    name: string;
  } | null;
  
  // 回调函数
  onRestorePosition: (params: RestorePositionParams) => void;
  onSaveSuccess?: () => void;
  onError?: (error: string) => void;
  onClearEditing?: () => void;
  
  // 导入导出功能
  onImportPositions?: (positions: Position[]) => void;
  onImportConfig?: (config: any) => void;
}

export default function PositionManager({
  side,
  capital,
  leverage,
  positions,
  inputValues,
  editingPosition,
  onRestorePosition,
  onSaveSuccess,
  onError,
  onClearEditing,
  onImportPositions,
  onImportConfig,
}: PositionManagerProps) {
  const [loading, setLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [positionName, setPositionName] = useState('');
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedPositions, setSavedPositions] = useState<PositionListItem[]>([]);
  const [importExportOpen, setImportExportOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // 加载保存的仓位列表
  const loadSavedPositions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const positions = await SavedPositionStorage.getPositionList();
      setSavedPositions(positions);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '加载仓位列表失败';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [onError]);

  // 保存当前仓位
  const handleSavePosition = async () => {
    if (!positionName.trim()) {
      setError('请输入仓位名称');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const saveParams: SavePositionParams = {
        name: positionName.trim(),
        side,
        capital,
        leverage,
        positions,
        inputValues,
      };

      if (editingPosition) {
        // 更新现有仓位
        await SavedPositionStorage.updatePosition(editingPosition.id, saveParams);
        onClearEditing?.();
      } else {
        // 保存新仓位
        await SavedPositionStorage.savePosition(saveParams);
      }
      
      setSaveDialogOpen(false);
      setPositionName('');
      await loadSavedPositions();
      onSaveSuccess?.();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '保存仓位失败';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 恢复仓位
  const handleRestorePosition = async (positionId: string) => {
    try {
      setLoading(true);
      setError(null);

      const savedPosition = await SavedPositionStorage.getPositionById(positionId);
      if (!savedPosition) {
        throw new Error('仓位不存在');
      }

      const restoreParams: RestorePositionParams = {
        id: savedPosition.id,
        name: savedPosition.name,
        side: savedPosition.side,
        capital: savedPosition.capital,
        leverage: savedPosition.leverage,
        positions: savedPosition.positions,
        inputValues: savedPosition.inputValues,
      };

      onRestorePosition(restoreParams);
      setListDialogOpen(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '恢复仓位失败';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 删除仓位
  const handleDeletePosition = async (positionId: string) => {
    if (!window.confirm('确定要删除这个仓位吗？')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await SavedPositionStorage.deletePosition(positionId);
      await loadSavedPositions();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '删除仓位失败';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 导出仓位为JSON文件
  const handleExportPosition = async (positionId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const position = await SavedPositionStorage.getPositionById(positionId);
      if (!position) {
        throw new Error('仓位不存在');
      }

      exportPositionToFile(position);
      setSuccessMessage(`仓位 "${position.name}" 已导出为JSON文件`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '导出仓位失败';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 复制仓位JSON到剪贴板
  const handleCopyPositionJson = async (positionId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const position = await SavedPositionStorage.getPositionById(positionId);
      if (!position) {
        throw new Error('仓位不存在');
      }

      await copyPositionToClipboard(position);
      setSuccessMessage(`仓位 "${position.name}" 的JSON数据已复制到剪贴板`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '复制仓位失败';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 复制仓位文本到剪贴板
  const handleCopyPositionText = async (positionId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      const position = await SavedPositionStorage.getPositionById(positionId);
      if (!position) {
        throw new Error('仓位不存在');
      }

      await copyPositionTextToClipboard(position);
      setSuccessMessage(`仓位 "${position.name}" 的文本数据已复制到剪贴板`);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '复制仓位失败';
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 获取方向图标
  const getSideIcon = (side: PositionSide) => {
    return side === PositionSide.LONG ? (
      <TrendingUpIcon color="success" />
    ) : (
      <TrendingDownIcon color="error" />
    );
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // 格式化资金
  const formatCapital = (capital: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(capital);
  };

  // 处理导入导出
  const handleImportExport = () => {
    setImportExportOpen(true);
  };

  // 处理导入委托单
  const handleImportPositions = (importedPositions: Position[]) => {
    if (onImportPositions) {
      onImportPositions(importedPositions);
      setSuccessMessage('委托单导入成功');
    }
  };

  // 处理导入配置
  const handleImportConfig = (config: any) => {
    if (onImportConfig) {
      onImportConfig(config);
      setSuccessMessage('仓位配置导入成功');
    }
  };

  // 初始化时加载仓位列表
  useEffect(() => {
    loadSavedPositions();
  }, [loadSavedPositions]);

  // 当编辑状态改变时，预填充仓位名称
  useEffect(() => {
    if (editingPosition) {
      setPositionName(editingPosition.name);
    } else {
      setPositionName('');
    }
  }, [editingPosition]);

  return (
    <Box>
      {/* 编辑状态指示器 */}
      {editingPosition && (
        <Alert 
          severity="info" 
          sx={{ mb: 2 }}
          icon={<EditIcon />}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => onClearEditing?.()}
            >
              取消编辑
            </Button>
          }
        >
          正在编辑仓位：<strong>{editingPosition.name}</strong>
        </Alert>
      )}

      {/* 操作按钮 */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => setSaveDialogOpen(true)}
          disabled={loading}
        >
          {editingPosition ? `更新仓位 ${editingPosition.name}` : '保存仓位'}
        </Button>
        <Button
          variant="outlined"
          startIcon={<FolderOpenIcon />}
          onClick={() => setListDialogOpen(true)}
          disabled={loading}
        >
          查看仓位 ({savedPositions.length})
        </Button>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadSavedPositions}
          disabled={loading}
        >
          刷新
        </Button>
      </Stack>

      {/* 错误提示 */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* 成功提示 */}
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {/* 保存仓位对话框 */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingPosition ? `更新仓位：${editingPosition.name}` : '保存当前仓位'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="仓位名称"
            fullWidth
            variant="outlined"
            value={positionName}
            onChange={(e) => setPositionName(e.target.value)}
            placeholder="请输入仓位名称"
            disabled={loading}
          />
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              将保存以下信息：
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • 交易方向：{side === PositionSide.LONG ? '做多' : '做空'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • 总资金：{formatCapital(capital)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • 杠杆倍数：{leverage}x
            </Typography>
            <Typography variant="body2" color="textSecondary">
              • 委托单数量：{positions.length} 个
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)} disabled={loading}>
            取消
          </Button>
          <Button
            onClick={handleSavePosition}
            variant="contained"
            disabled={loading || !positionName.trim()}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {loading ? (editingPosition ? '更新中...' : '保存中...') : (editingPosition ? '更新' : '保存')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 仓位列表对话框 */}
      <Dialog open={listDialogOpen} onClose={() => setListDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">保存的仓位列表</Typography>
            <Box display="flex" gap={1} alignItems="center">
              <Button 
                size="small" 
                startIcon={<FileDownloadIcon />} 
                onClick={handleImportExport} 
                variant="outlined"
              >
                导入/导出
              </Button>
              <IconButton onClick={() => setListDialogOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : savedPositions.length === 0 ? (
            <Box textAlign="center" p={3}>
              <Typography variant="body1" color="textSecondary">
                暂无保存的仓位
              </Typography>
            </Box>
          ) : (
            <List>
              {savedPositions.map((position, index) => (
                <React.Fragment key={position.id}>
                  <ListItem>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          {getSideIcon(position.side)}
                          <Typography variant="subtitle1" fontWeight="bold">
                            {position.name}
                          </Typography>
                          <Chip
                            label={`${position.leverage}x`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            资金：{formatCapital(position.capital)} | 委托单：{position.positionCount} 个
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            创建：{formatDate(position.createdAt)} | 更新：{formatDate(position.updatedAt)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Stack direction="row" spacing={1}>
                        <Tooltip title="恢复仓位">
                          <IconButton
                            onClick={() => handleRestorePosition(position.id)}
                            disabled={loading}
                            color="primary"
                          >
                            <RefreshIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="导出为JSON文件">
                          <IconButton
                            onClick={() => handleExportPosition(position.id)}
                            disabled={loading}
                            color="info"
                          >
                            <FileDownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="复制JSON到剪贴板">
                          <IconButton
                            onClick={() => handleCopyPositionJson(position.id)}
                            disabled={loading}
                            color="info"
                          >
                            <ContentCopyIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="复制文本到剪贴板">
                          <IconButton
                            onClick={() => handleCopyPositionText(position.id)}
                            disabled={loading}
                            color="secondary"
                          >
                            <DownloadIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="删除仓位">
                          <IconButton
                            onClick={() => handleDeletePosition(position.id)}
                            disabled={loading}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {index < savedPositions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* 导入导出对话框 */}
      <ImportExportDialog
        open={importExportOpen}
        onClose={() => setImportExportOpen(false)}
        side={side}
        capital={capital}
        leverage={leverage}
        positions={positions}
        onImportPositions={handleImportPositions}
        onImportConfig={handleImportConfig}
      />
    </Box>
  );
}
