/**
 * 提示词渲染组件
 * 用于展示提示词模板的渲染结果
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  Visibility as PreviewIcon,
  Code as CodeIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import ReactMarkdown from 'react-markdown';
import { PromptTemplate } from '../../../utils/storage/types';
import { fetchPromptData } from '../../../services/promptDataService';

interface PromptRendererProps {
  template: PromptTemplate;
  onCopy?: (content: string) => void;
}

export function PromptRenderer({ template, onCopy }: PromptRendererProps) {
  const [renderedContent, setRenderedContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<'markdown' | 'raw'>('markdown');

  // 渲染提示词内容
  const renderPrompt = async () => {
    if (template.dataConfigs.length === 0) {
      setRenderedContent(template.content);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // 获取所有配置的数据
      const dataContent = await fetchPromptData(template.dataConfigs);
      
      // 拼接最终内容
      let finalContent = template.content;
      if (template.content && dataContent) {
        finalContent = `${template.content}\n\n---\n\n${dataContent}`;
      } else if (dataContent) {
        finalContent = dataContent;
      }
      setRenderedContent(finalContent);
    } catch (err) {
      console.error('渲染失败:', err);
      setError(err instanceof Error ? err.message : '渲染失败');
      setRenderedContent(template.content); // 降级显示原始内容
    } finally {
      setLoading(false);
    }
  };

  // 初始渲染
  useEffect(() => {
    renderPrompt();
  }, [template]);

  // 复制渲染内容
  const handleCopy = async () => {
    if (renderedContent && onCopy) {
      onCopy(renderedContent);
    }
  };

  // 刷新渲染
  const handleRefresh = () => {
    renderPrompt();
  };

  // 切换视图模式
  const handleViewModeChange = (_: React.SyntheticEvent, newValue: 'markdown' | 'raw') => {
    setViewMode(newValue);
  };

  return (
    <Paper sx={{ p: 3 }}>
      {/* 标题栏 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          渲染结果
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {template.dataConfigs.length > 0 && (
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={loading}
            >
              刷新数据
            </Button>
          )}
          <Button
            size="small"
            startIcon={<CopyIcon />}
            onClick={handleCopy}
            disabled={loading || !renderedContent}
          >
            复制
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* 错误提示 */}
      {error && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          数据获取失败: {error}，显示模板原始内容
        </Alert>
      )}

      {/* 视图模式切换 */}
      {renderedContent && (
        <Box sx={{ mb: 2 }}>
          <Tabs
            value={viewMode}
            onChange={handleViewModeChange}
          >
            <Tab
              icon={<PreviewIcon />}
              label="预览"
              value="markdown"
              iconPosition="start"
            />
            <Tab
              icon={<CodeIcon />}
              label="原始"
              value="raw"
              iconPosition="start"
            />
          </Tabs>
        </Box>
      )}

      {/* 渲染内容 */}
      <Box
        sx={{
          minHeight: 200,
          maxHeight: 600,
          overflow: 'auto',
          backgroundColor: renderedContent ? 'grey.50' : 'grey.100',
          p: 2,
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.300',
          display: 'flex',
          alignItems: renderedContent ? 'flex-start' : 'center',
          justifyContent: renderedContent ? 'flex-start' : 'center',
        }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={24} />
            <Typography color="text.secondary">
              正在获取数据并渲染...
            </Typography>
          </Box>
        ) : renderedContent ? (
          viewMode === 'markdown' ? (
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
                // 自定义分隔线样式
                hr: () => (
                  <hr style={{ 
                    margin: '24px 0', 
                    border: 'none', 
                    borderTop: '2px solid #e0e0e0',
                    backgroundColor: 'transparent'
                  }} />
                ),
              }}
            >
              {renderedContent}
            </ReactMarkdown>
          ) : (
            <Box
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
                fontSize: '0.875rem',
                margin: 0,
                width: '100%',
              }}
            >
              {renderedContent}
            </Box>
          )
        ) : (
          <Typography color="text.secondary">
            暂无内容
          </Typography>
        )}
      </Box>

      {/* 内容统计 */}
      {renderedContent && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            字符数: {renderedContent.length.toLocaleString()}
          </Typography>
          {template.dataConfigs.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              包含 {template.dataConfigs.length} 个数据源
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}
