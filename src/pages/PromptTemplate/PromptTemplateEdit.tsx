/**
 * 提示词模板编辑/创建页面
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDynamicPageTitle } from '../../utils/titleManager';
import {
  Container,
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  IconButton,
  Snackbar,
  Alert,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as BackIcon,
  ContentCopy as CopyIcon,
  Visibility as PreviewIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { PromptTemplate, PromptDataConfig } from '../../utils/storage/types';
import {
  getPromptTemplateById,
  createPromptTemplate,
  updatePromptTemplate,
  getDefaultTemplateContent,
} from '../../utils/storage/promptTemplateStorage';
import { fetchPromptData } from '../../services/promptDataService';
import { DataConfigForm } from './components/DataConfigForm';

export default function PromptTemplateEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // 判断是否为新建模板：检查路径是否以 /new 结尾
  const isNewTemplate = location.pathname.endsWith('/new');

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [dataConfigs, setDataConfigs] = useState<PromptDataConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [copying, setCopying] = useState(false);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [previewMode, setPreviewMode] = useState<'markdown' | 'raw'>('markdown');

  // 设置动态页面标题
  useDynamicPageTitle(
    isNewTemplate ? 'prompt-template-new' : 'prompt-template-edit',
    name || (isNewTemplate ? undefined : '加载中...'),
    '提示词模板'
  );

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
    if (!isNewTemplate && id) {
      loadTemplate(id);
    } else if (isNewTemplate) {
      loadDefaultContent();
    }
  }, [id, isNewTemplate]);

  const loadTemplate = async (templateId: string) => {
    setLoading(true);
    try {
      const template = await getPromptTemplateById(templateId);
      if (template) {
        setName(template.name);
        setContent(template.content);
        setDataConfigs(template.dataConfigs);
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

  // 加载默认模板内容
  const loadDefaultContent = async () => {
    try {
      const defaultContent = await getDefaultTemplateContent();
      setContent(defaultContent);
    } catch (error) {
      console.error('加载默认模板内容失败:', error);
      // 不显示错误提示，使用空内容即可
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // 返回
  const handleBack = () => {
    if (isNewTemplate) {
      navigate('/prompt-template');
    } else {
      navigate(`/prompt-template/${id}`);
    }
  };

  // 保存模板
  const handleSave = async () => {
    console.log('开始保存模板...');
    console.log('模板名称:', name);
    console.log('模板内容:', content);
    console.log('数据配置:', dataConfigs);
    console.log('isNewTemplate:', isNewTemplate);
    console.log('id:', id);
    
    if (!name.trim()) {
      showSnackbar('请输入模板名称', 'error');
      return;
    }

    setSaving(true);
    try {
      if (isNewTemplate) {
        console.log('创建新模板...');
        const newTemplate = await createPromptTemplate({
          name: name.trim(),
          content: content.trim(),
          dataConfigs,
        });
        console.log('新模板创建成功:', newTemplate);
        showSnackbar('模板创建成功', 'success');
        setTimeout(() => {
          navigate(`/prompt-template/${newTemplate.id}`);
        }, 1000);
      } else if (id) {
        console.log('更新现有模板...');
        await updatePromptTemplate(id, {
          name: name.trim(),
          content: content.trim(),
          dataConfigs,
        });
        console.log('模板更新成功');
        showSnackbar('模板保存成功', 'success');
        setTimeout(() => {
          navigate(`/prompt-template/${id}`);
        }, 1000);
      } else {
        console.log('既不是新模板也没有ID，无法保存');
      }
    } catch (error) {
      console.error('保存模板失败:', error);
      showSnackbar('保存模板失败', 'error');
    } finally {
      setSaving(false);
    }
  };

  // 复制提示词（包含数据）
  const handleCopy = async () => {
    setCopying(true);
    try {
      // 获取所有配置的数据
      const dataContent = await fetchPromptData(dataConfigs);

      // 拼接最终内容
      const finalContent = `${content}\n\n---\n\n${dataContent}`;

      // 设置预览内容
      setPreviewContent(finalContent);

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

  // 更新数据配置
  const handleDataConfigsChange = (newConfigs: PromptDataConfig[]) => {
    setDataConfigs(newConfigs);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography>加载中...</Typography>
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
            {isNewTemplate ? '创建提示词模板' : '编辑提示词模板'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            startIcon={<CopyIcon />}
            onClick={handleCopy}
            disabled={copying || dataConfigs.length === 0}
          >
            {copying ? '复制中...' : '预览复制'}
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? '保存中...' : '保存'}
          </Button>
        </Box>
      </Box>

      {/* 预览区域 - 移到顶部 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            提示词预览
          </Typography>
          {previewContent && (
            <Tabs
              value={previewMode}
              onChange={(_, newValue) => setPreviewMode(newValue)}
              size="small"
            >
              <Tab
                icon={<PreviewIcon />}
                label="渲染"
                value="markdown"
                sx={{ minHeight: 'auto', py: 1 }}
              />
              <Tab
                icon={<CodeIcon />}
                label="原始"
                value="raw"
                sx={{ minHeight: 'auto', py: 1 }}
              />
            </Tabs>
          )}
        </Box>
        <Box
          sx={{
            minHeight: 200,
            maxHeight: 600,
            overflow: 'auto',
            backgroundColor: previewContent ? 'grey.50' : 'grey.100',
            p: 2,
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'grey.300',
            display: 'flex',
            alignItems: previewContent ? 'flex-start' : 'center',
            justifyContent: previewContent ? 'flex-start' : 'center',
          }}
        >
          {previewContent ? (
            previewMode === 'markdown' ? (
              <ReactMarkdown
                components={{
                  // 自定义表格样式
                  table: ({ children }) => (
                    <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: '16px' }}>
                      {children}
                    </table>
                  ),
                  th: ({ children }) => (
                    <th style={{ border: '1px solid #ddd', padding: '8px', backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {children}
                    </td>
                  ),
                  // 自定义代码块样式
                  code: ({ children, className }) => (
                    <code
                      style={{
                        backgroundColor: className ? '#f5f5f5' : '#f0f0f0',
                        padding: className ? '16px' : '2px 4px',
                        borderRadius: '4px',
                        fontFamily: 'monospace',
                        fontSize: '0.875rem',
                        display: className ? 'block' : 'inline',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {children}
                    </code>
                  ),
                }}
              >
                {previewContent}
              </ReactMarkdown>
            ) : (
              <Typography
                component="pre"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  lineHeight: 1.5,
                  margin: 0,
                  width: '100%',
                }}
              >
                {previewContent}
              </Typography>
            )
          ) : (
            <Box sx={{ textAlign: 'center', color: 'grey.500' }}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                暂无预览内容
              </Typography>
              <Typography variant="body2">
                点击"预览复制"按钮生成并预览提示词内容
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* 模板名称 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          fullWidth
          label="模板名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="请输入模板名称"
          required
        />
      </Paper>

      {/* 模板内容 */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          模板内容（Markdown）
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={10}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="请输入模板内容，支持 Markdown 格式"
        />
      </Paper>

      {/* 数据配置 */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          数据配置
        </Typography>
        <DataConfigForm
          configs={dataConfigs}
          onChange={handleDataConfigsChange}
        />
      </Box>


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

