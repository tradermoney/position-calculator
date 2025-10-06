import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
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
} from '@mui/icons-material';
import { PositionSide } from '../../utils/contractCalculations';
import { PositionListItem, SavePositionParams, RestorePositionParams } from '../../types/position';
import { SavedPositionStorage } from '../../utils/storage/savedPositionStorage';
import { Position } from '../ContractCalculator/PnLCalculator/types';

interface PositionManagerProps {
  // 当前仓位数据
  side: PositionSide;
  capital: number;
  leverage: number;
  positions: Position[];
  inputValues: { [key: string]: string };
  
  // 回调函数
  onRestorePosition: (params: RestorePositionParams) => void;
  onSaveSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function PositionManager({
  side,
  capital,
  leverage,
  positions,
  inputValues,
  onRestorePosition,
  onSaveSuccess,
  onError,
}: PositionManagerProps) {
  const [savedPositions, setSavedPositions] = useState<PositionListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [positionName, setPositionName] = useState('');
  const [listDialogOpen, setListDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载保存的仓位列表
  const loadSavedPositions = async () => {
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
  };

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

      await SavedPositionStorage.savePosition(saveParams);
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

  // 初始化时加载仓位列表
  useEffect(() => {
    loadSavedPositions();
  }, []);

  return (
    <Box>
      {/* 操作按钮 */}
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={() => setSaveDialogOpen(true)}
          disabled={loading}
        >
          保存仓位
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

      {/* 保存仓位对话框 */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>保存当前仓位</DialogTitle>
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
            {loading ? '保存中...' : '保存'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 仓位列表对话框 */}
      <Dialog open={listDialogOpen} onClose={() => setListDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">保存的仓位列表</Typography>
            <IconButton onClick={() => setListDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
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
    </Box>
  );
}
