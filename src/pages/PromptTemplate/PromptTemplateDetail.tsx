/**
 * 提示词模板详情展示页面（只读）
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDynamicPageTitle } from '../../utils/titleManager';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  ContentCopy as CopyIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { PromptTemplate, PromptDataConfig } from '../../utils/storage/types';
import {
  getPromptTemplateById,
} from '../../utils/storage/promptTemplateStorage';
import { fetchPromptData } from '../../services/promptDataService';

export default function PromptTemplateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<PromptTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [copying, setCopying] = useState(false);

  // 设置动态页面标题
  useDynamicPageTitle('prompt-template-detail', template?.name, '提示词模板');

  // 通知
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // 加载模板数据
  useEffect(() => {
    if (id) {
      loadTemplate(id);
    }
  }, [id]);

  const loadTemplate = async (templateId: string) => {
    setLoading(true);
    try {
      const data = await getPromptTemplateById(templateId);
      if (data) {
        setTemplate(data);
      } else {
        showSnackbar('模板不存在', 'error');
        navigate('/prompt-template');
      }
    } catch (error) {
      console.error('加载模板失败:', error);
      showSnackbar('加载模板失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 返回列表
  const handleBack = () => {
    navigate('/prompt-template');
  };

  // 编辑模板
  const handleEdit = () => {
    navigate(`/prompt-template/${id}/edit`);
  };

  // 复制提示词（包含数据）
  const handleCopy = async () => {
    if (!template) return;

    setCopying(true);
    try {
      // 获取所有配置的数据
      const dataContent = await fetchPromptData(template.dataConfigs);

      // 拼接最终内容
      const finalContent = `${template.content}\n\n---\n\n${dataContent}`;

      // 复制到剪贴板
      await navigator.clipboard.writeText(finalContent);
      showSnackbar('已复制到剪贴板', 'success');
    } catch (error) {
      console.error('复制失败:', error);
      showSnackbar('复制失败', 'error');
    } finally {
      setCopying(false);
    }
  };

  // 复制模板内容（不包含数据）
  const handleCopyContentOnly = async () => {
    if (!template) return;

    try {
      await navigator.clipboard.writeText(template.content);
      showSnackbar('已复制模板内容', 'success');
    } catch (error) {
      console.error('复制失败:', error);
      showSnackbar('复制失败', 'error');
    }
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString('zh-CN');
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!template) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography>模板不存在</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* 标题栏 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton onClick={handleBack} aria-label="返回">
            <BackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {template.name}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            编辑
          </Button>
          <Button
            variant="contained"
            startIcon={<CopyIcon />}
            onClick={handleCopy}
            disabled={copying || template.dataConfigs.length === 0}
          >
            {copying ? '复制中...' : '复制完整内容'}
          </Button>
        </Box>
      </Box>

      {/* 模板信息 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            创建时间: {formatDate(template.createdAt)}
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            更新时间: {formatDate(template.updatedAt)}
          </Typography>
        </Box>
      </Paper>

      {/* 模板内容 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            模板内容
          </Typography>
          <Button
            size="small"
            startIcon={<CopyIcon />}
            onClick={handleCopyContentOnly}
          >
            复制
          </Button>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <Box
          sx={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
            p: 2,
            borderRadius: 1,
            maxHeight: '400px',
            overflow: 'auto',
          }}
        >
          {template.content || '暂无内容'}
        </Box>
      </Paper>

      {/* 数据配置 */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          数据配置
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {template.dataConfigs.length === 0 ? (
          <Typography color="text.secondary">暂无数据配置</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {template.dataConfigs.map((config, index) => (
              <Paper
                key={config.id}
                variant="outlined"
                sx={{ p: 2 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="subtitle2" color="primary">
                    配置 {index + 1}
                  </Typography>
                  <Chip label={config.type} size="small" />
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 1, fontSize: '0.875rem' }}>
                  {config.symbol && (
                    <>
                      <Typography color="text.secondary">交易对:</Typography>
                      <Typography>{config.symbol}</Typography>
                    </>
                  )}
                  {config.interval && (
                    <>
                      <Typography color="text.secondary">时间间隔:</Typography>
                      <Typography>{config.interval}</Typography>
                    </>
                  )}
                  {config.limit && (
                    <>
                      <Typography color="text.secondary">数据量:</Typography>
                      <Typography>{config.limit}</Typography>
                    </>
                  )}
                </Box>
              </Paper>
            ))}
          </Box>
        )}
      </Paper>

      {/* 通知 */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

