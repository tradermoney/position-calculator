/**
 * 提示词模板列表页面
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTitle } from '../../utils/titleManager';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { PromptTemplate } from '../../utils/storage/types';
import {
  getAllPromptTemplates,
  deletePromptTemplate,
  searchPromptTemplates,
} from '../../utils/storage/promptTemplateStorage';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { DefaultTemplateSettingsDialog } from './components/DefaultTemplateSettingsDialog';

export default function PromptTemplateList() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<PromptTemplate[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<PromptTemplate | null>(null);
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // 设置页面标题
  usePageTitle('prompt-template');

  // 加载模板列表
  const loadTemplates = async () => {
    setLoading(true);
    try {
      const data = await getAllPromptTemplates();
      setTemplates(data);
      setFilteredTemplates(data);
    } catch (error) {
      console.error('加载模板列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // 搜索处理
  useEffect(() => {
    const performSearch = async () => {
      if (searchKeyword.trim() === '') {
        setFilteredTemplates(templates);
      } else {
        const results = await searchPromptTemplates(searchKeyword);
        setFilteredTemplates(results);
      }
    };

    const timer = setTimeout(performSearch, 300);
    return () => clearTimeout(timer);
  }, [searchKeyword, templates]);

  // 创建新模板
  const handleCreateTemplate = () => {
    navigate('/prompt-template/new');
  };

  // 查看模板详情
  const handleViewTemplate = (id: string) => {
    navigate(`/prompt-template/${id}`);
  };

  // 编辑模板
  const handleEditTemplate = (id: string) => {
    navigate(`/prompt-template/${id}/edit`);
  };

  // 删除模板
  const handleDeleteClick = (template: PromptTemplate) => {
    setTemplateToDelete(template);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (templateToDelete) {
      const success = await deletePromptTemplate(templateToDelete.id);
      if (success) {
        await loadTemplates();
      }
    }
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  // 打开设置对话框
  const handleOpenSettings = () => {
    setSettingsDialogOpen(true);
  };

  // 关闭设置对话框
  const handleCloseSettings = () => {
    setSettingsDialogOpen(false);
  };

  // 格式化日期
  const formatDate = (date: Date) => {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleString('zh-CN');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* 标题和操作栏 */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          提示词模板
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<SettingsIcon />}
            onClick={handleOpenSettings}
          >
            设置默认内容
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateTemplate}
          >
            创建模板
          </Button>
        </Box>
      </Box>

      {/* 搜索栏 */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="搜索模板名称..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* 模板列表 */}
      {loading ? (
        <Typography>加载中...</Typography>
      ) : filteredTemplates.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {searchKeyword ? '没有找到匹配的模板' : '还没有创建任何模板'}
          </Typography>
          {!searchKeyword && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateTemplate}
              sx={{ mt: 2 }}
            >
              创建第一个模板
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredTemplates.map((template) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  },
                }}
                onClick={() => handleViewTemplate(template.id)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom noWrap>
                    {template.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {template.content || '暂无内容'}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    {template.dataConfigs.map((config) => (
                      <Chip
                        key={config.id}
                        label={config.type}
                        size="small"
                        sx={{ mr: 0.5, mb: 0.5 }}
                      />
                    ))}
                  </Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    更新: {formatDate(template.updatedAt)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditTemplate(template.id);
                    }}
                    aria-label="编辑"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(template);
                    }}
                    aria-label="删除"
                  >
                    <DeleteIcon />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* 删除确认对话框 */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        templateName={templateToDelete?.name || ''}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* 默认模板设置对话框 */}
      <DefaultTemplateSettingsDialog
        open={settingsDialogOpen}
        onClose={handleCloseSettings}
      />
    </Container>
  );
}


